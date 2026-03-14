import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { ParseThreadBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are a Cognitive Compass — an AI that reconstructs human thought threads from scattered fragments. Users capture their thoughts as text notes and screenshots when they're mid-task, overwhelmed, or about to be interrupted. Your job is to stitch these fragments into a coherent "cognitive playlist" that tells them exactly where they were and what to do next.

You may receive:
- Text fragments: typed notes, voice memo transcripts, or stream-of-consciousness dumps
- Image fragments: screenshots of their screen, photos of whiteboards, or snapshots of documents

Analyze ALL provided fragments together — text and images — to reconstruct the user's train of thought.

Return ONLY valid JSON with this exact structure, nothing else:
{
  "thread_title": "concise title for this thought thread",
  "goal": "the overarching goal or objective",
  "current_step": "what the person is currently doing or was doing when interrupted",
  "important_context": "key context reconstructed from all fragments that helps resume work",
  "next_actions": ["action 1", "action 2", "action 3"],
  "priority": "low" | "medium" | "high",
  "location": "physical location, address, or venue name if detected, or null"
}

Rules:
- thread_title: 3-7 words, clear and specific
- goal: one sentence describing the end state
- current_step: what they were doing right now, inferred from all fragments
- important_context: synthesize background info from text AND visual content in images
- next_actions: 2-4 concrete, actionable next steps — tell them exactly what to do when they return
- priority: infer from urgency/importance signals across all fragments
- If images contain code, documents, or UI, extract relevant details into the context
- location: if any physical location, address, venue name, business name, or place is mentioned in the fragments, extract it here. If no location is detected, set to null.
- Return ONLY the JSON object, no markdown, no explanation
- Keep language productivity-focused. Never give medical or therapeutic advice.`;

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_FRAGMENTS = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const data = match[2];
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) return null;
  const approxBytes = (data.length * 3) / 4;
  if (approxBytes > MAX_IMAGE_BYTES) return null;
  return { mimeType, data };
}

router.post("/thread/parse", async (req, res) => {
  const parsed = ParseThreadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { fragments } = parsed.data;

  if (!fragments || fragments.length === 0) {
    res.status(400).json({ error: "At least one fragment is required" });
    return;
  }

  const imageCount = fragments.filter((f) => f.type === "image").length;
  if (imageCount > MAX_IMAGE_FRAGMENTS) {
    res.status(400).json({ error: `Maximum ${MAX_IMAGE_FRAGMENTS} images allowed` });
    return;
  }

  const hasContent = fragments.some((f) => {
    if (f.type === "text") return f.content.trim().length > 0;
    if (f.type === "image") return parseDataUrl(f.content) !== null;
    return false;
  });
  if (!hasContent) {
    res.status(400).json({ error: "At least one valid fragment is required" });
    return;
  }

  try {
    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [{ text: SYSTEM_PROMPT }];

    for (const fragment of fragments) {
      if (fragment.type === "text" && fragment.content.trim().length > 0) {
        parts.push({ text: fragment.content });
      } else if (fragment.type === "image") {
        const imageData = parseDataUrl(fragment.content);
        if (!imageData) {
          res.status(400).json({ error: "Invalid image fragment: unsupported format, bad data URL, or exceeds 5MB limit" });
          return;
        }
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;

    if (!rawText) {
      res.status(422).json({ error: "AI returned empty response" });
      return;
    }

    let threadData: {
      thread_title: string;
      goal: string;
      current_step: string;
      important_context: string;
      next_actions: string[];
      priority: "low" | "medium" | "high";
      location?: string | null;
    };

    try {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      threadData = JSON.parse(cleaned);
    } catch {
      res.status(422).json({ error: "Failed to parse AI response as JSON" });
      return;
    }

    if (
      !threadData.thread_title ||
      !threadData.goal ||
      !threadData.current_step ||
      !threadData.important_context ||
      !Array.isArray(threadData.next_actions) ||
      !["low", "medium", "high"].includes(threadData.priority)
    ) {
      res.status(422).json({ error: "AI response missing required fields" });
      return;
    }

    if (
      threadData.location !== undefined &&
      threadData.location !== null &&
      typeof threadData.location !== "string"
    ) {
      threadData.location = null;
    }

    if (typeof threadData.location === "string" && threadData.location.trim() === "") {
      threadData.location = null;
    }

    const responseData: Record<string, unknown> = { ...threadData };
    if (!threadData.location) {
      delete responseData.location;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Thread parse error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
