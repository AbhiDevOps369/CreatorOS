import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {getClientProjectById,getClientProjects} from "../controllers/portal.controller.js";


const router=Router({ mergeParams: true });


//protected : /api/v1/portal

router.get("/projects/:projectId",verifyJwt("client"),getClientProjectById);
router.get("/projects",verifyJwt("client"),getClientProjects);

export default router;

