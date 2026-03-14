import { Router, type IRouter } from "express";
import healthRouter from "./health";
import threadRouter from "./thread";

const router: IRouter = Router();

router.use(healthRouter);
router.use(threadRouter);

export default router;
