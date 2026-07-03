import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createSubtask,getSubtaskById,getSubtasks,updateSubtask,deleteSubtask} from 
"../controllers/subtask.controller.js";

const router=Router({ mergeParams: true });



//protected : /api/v1/projects/:projectId/tasks/:taskId/subtasks

router.get("/",verifyJwt,getSubtasks);
router.get("/:subtaskId",verifyJwt,getSubtaskById);

router.post("/",verifyJwt,requireRole("owner","manager","reviewer"),createSubtask);
router.delete("/:subtaskId",verifyJwt,requireRole("owner","manager","reviewer"),deleteSubtask);
router.patch("/:subtaskId",verifyJwt,updateSubtask);

export default router;