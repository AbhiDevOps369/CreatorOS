import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createProject,getAllProjects, updateProject,deleteProject, getProjectById,approveProject,allocateTeam,deliverProject}
from "../controllers/project.controller.js";
import membershipRouter from "../routes/membership.routes.js";
import notesRouter from "../routes/notes.routes.js";
import { requireAgencyOwner } from "../middlewares/requireAgencyOwner.js";
import { createProjectValidator,updateProjectValidator} from "../validators/project.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
const router=Router({ mergeParams: true });


//public


//protected
router.get("/",verifyJwt(),getAllProjects);
router.get("/:projectId",verifyJwt(),getProjectById);
router.post("/", verifyJwt(), requireAgencyOwner, createProjectValidator(), validate, createProject)
router.patch("/:projectId",verifyJwt(),requireRole("owner","manager"),  updateProjectValidator(),validate,updateProject);
router.delete("/:projectId",verifyJwt(),requireRole("owner"),deleteProject);

router.patch("/:projectId/approve",verifyJwt(),requireRole("owner"),approveProject);
router.post("/:projectId/allocate-team",verifyJwt(),requireRole("owner","manager"),allocateTeam);
router.post("/:projectId/deliver",verifyJwt(),requireRole("owner","manager"),deliverProject);

router.use("/:projectId/members", membershipRouter)
router.use("/:projectId/notes", notesRouter)
export default router;
