import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createProject,getAllProjects, updateProject,deleteProject, getProjectById,approveProject,allocateTeam,deliverProject}
from "../controllers/project.controller.js";
import membershipRouter from "../routes/membership.routes.js";
import notesRouter from "../routes/notes.routes.js";
const router=Router({ mergeParams: true });


//public


//protected
router.get("/",verifyJwt,getAllProjects);
router.get("/:projectId",verifyJwt,getProjectById);

router.post("/",verifyJwt,requireRole("owner","manager"),createProject);
router.patch("/:projectId",verifyJwt,requireRole("owner","manager"),updateProject);
router.delete("/:projectId",verifyJwt,requireRole("owner"),deleteProject);

router.patch("/:projectId/approve",verifyJwt,requireRole("owner"),approveProject);
router.post("/:projectId/allocate-team",verifyJwt,requireRole("owner","manager"),allocateTeam);
router.post("/:projectId/deliver",verifyJwt,requireRole("owner","manager"),deliverProject);

router.use("/:projectId/members", membershipRouter)
router.use("/:projectId/notes", notesRouter)
export default router;
