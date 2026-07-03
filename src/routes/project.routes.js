import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createProject,getAllProjects, updateProject,deleteProject, getProjectById}
from "../controllers/project.controller.js";

const router=Router({ mergeParams: true });


//public


//protected
router.get("/",verifyJwt,getAllProjects);
router.get("/:projectId",verifyJwt,getProjectById);

router.post("/",verifyJwt,requireRole("owner","manager"),createProject);
router.patch("/:projectId",verifyJwt,requireRole("owner","manager"),updateProject);
router.delete("/:projectId",verifyJwt,requireRole("owner"),deleteProject);

router.patch("/:projectId/approve",verifyJwt,requireRole("owner"),);
router.post("/:projectId/allocate-team",verifyJwt,requireRole("owner","manager"),);
router.post("/:projectId/deliver",verifyJwt,requireRole("owner","manager"),);

export default router;
