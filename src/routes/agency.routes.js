import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createAgency} from "../controllers/agency.controller.js";

const router=Router();

router.post("/",verifyJwt,createAgency);

export default router;