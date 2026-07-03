import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {submitFootage,approveFootage,rejectFootage,createTask,getAllTasks,getTaskById,updateTask,deleteTask,submitEdit,approveEdit,rejectEdit} from 
"../controllers/task.controller.js";
import subtaskRouter from "./subtask.routes.js"

const router=Router({ mergeParams: true });


//public


//protected : /api/v1/projects/:projectId/task

router.get("/",verifyJwt,getAllTasks);
router.get("/:taskId",verifyJwt,getTaskById);

router.post("/",verifyJwt,requireRole("owner","manager","reviewer"),createTask);
router.post("/:taskId/submit-footage",verifyJwt,requireRole("contributor"),submitFootage);
router.post("/:taskId/approve-footage",verifyJwt,requireRole("reviewer"),approveFootage);
router.post("/:taskId/reject-footage",verifyJwt,requireRole("reviewer"),rejectFootage);
router.post("/:taskId/submit-edit",verifyJwt,requireRole("contributor"),submitEdit);
router.post("/:taskId/approve-edit",verifyJwt,requireRole("reviewer"),approveEdit);
router.post("/:taskId/request-changes",verifyJwt,requireRole("reviewer"),rejectEdit);


router.patch("/:taskId",verifyJwt,requireRole("owner","manager","contributor"),updateTask);
router.delete("/:taskId",verifyJwt,requireRole("owner","manager"),deleteTask);

router.use("/:taskId/subtasks", subtaskRouter)
export default router;