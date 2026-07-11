import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {getClientProjectById,getClientProjects,loginClient,logoutClient,getCurrentClient} from "../controllers/portal.controller.js";


const router=Router({ mergeParams: true });

//public : /api/v1/portal

router.post("/login",loginClient);

//protected : /api/v1/portal

router.post("/logout",verifyJwt("client"),logoutClient);
router.get("/current-client",verifyJwt("client"),getCurrentClient);
router.get("/projects/:projectId",verifyJwt("client"),getClientProjectById);
router.get("/projects",verifyJwt("client"),getClientProjects);

export default router;

