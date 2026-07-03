import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createAgency} from "../controllers/agency.controller.js";

const router=Router({ mergeParams: true });

router.post("/",verifyJwt,createAgency);

export default router;