import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { ParseThreadBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an AI that reconstructs human thought threads. Given a short text or speech transcript, infer the thread title, goal, current step, important context, next actions, and priority.

Return ONLY valid JSON with this exact structure, nothing else:
{
  "thread_title": "concise title for this thought thread",
  "goal": "the overarching goal or objective",
  "current_step": "what the person is currently doing",
  "important_context": "key context that helps understand the situation",
  "next_actions": ["action 1", "action 2", "action 3"],
  "priority": "low" | "medium" | "high"
}

Rules:
- thread_title: 3-7 words, clear and specific
- goal: one sentence describing the end state
- current_step: what they were doing right now
- important_context: background info that matters
- next_actions: 2-4 concrete, actionable next steps
- priority: infer from urgency/importance signals in the text
- Return ONLY the JSON object, no markdown, no explanation
- Keep language productivity-focused. Never give medical or therapeutic advice.`;

router.post("/thread/parse", async (req, res) => {
  const parsed = ParseThreadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { text } = parsed.data;

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: "Text cannot be empty" });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser input: ${text}` }],
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
    };

    try {
      // Strip markdown code blocks if present
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      threadData = JSON.parse(cleaned);
    } catch {
      res.status(422).json({ error: "Failed to parse AI response as JSON" });
      return;
    }

    // Validate required fields
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

    res.json(threadData);
  } catch (error) {
    console.error("Thread parse error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
