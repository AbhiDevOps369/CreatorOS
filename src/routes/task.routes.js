import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {submitFootage,approveFootage,rejectFootage,createTask,getAllTasks,getTaskById,updateTask,deleteTask,submitEdit,approveEdit,rejectEdit,deliverProject} from 
"../controllers/task.controller.js";
import subtaskRouter from "./subtask.routes.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTaskValidator,updateTaskValidator,submitDeliverableValidator} from 
"../validators/task.validator.js";

const router=Router({ mergeParams: true });


//public


//protected : /api/v1/projects/:projectId/task

router.get("/",verifyJwt(),getAllTasks); //✅
router.get("/:taskId",verifyJwt(),getTaskById); //✅

router.post("/",verifyJwt(),requireRole("owner","manager","reviewer"),createTaskValidator(),validate,createTask); //✅

router.post("/:taskId/submit-footage",verifyJwt(),requireRole("contributor"),submitDeliverableValidator(),validate,submitFootage); //✅
router.post("/:taskId/approve-footage",verifyJwt(),requireRole("reviewer"),approveFootage); //✅
router.post("/:taskId/reject-footage",verifyJwt(),requireRole("reviewer"),rejectFootage); //✅
router.post("/:taskId/submit-edit",verifyJwt(),requireRole("contributor"),submitDeliverableValidator(),validate,submitEdit); //✅ 
router.post("/:taskId/approve-edit",verifyJwt(),requireRole("reviewer"),approveEdit); //✅
router.post("/:taskId/request-changes",verifyJwt(),requireRole("reviewer"),rejectEdit); //✅
router.post("/:projectId/deliver", verifyJwt(), requireRole("owner","manager"), deliverProject); //✅

router.patch("/:taskId",verifyJwt(),requireRole("owner","manager","contributor"),updateTaskValidator(),validate,updateTask);
router.delete("/:taskId",verifyJwt(),requireRole("owner","manager"),deleteTask);

router.use("/:taskId/subtasks", subtaskRouter)
export default router;