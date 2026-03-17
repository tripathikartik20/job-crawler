import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumeRouter from "./resume";
import jobsRouter from "./jobs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resumeRouter);
router.use(jobsRouter);

export default router;
