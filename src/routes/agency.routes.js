import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createAgency} from "../controllers/agency.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createAgencyValidator} from "../validators/agency.validator.js";
const router=Router({ mergeParams: true });

router.post("/",verifyJwt(),createAgencyValidator(),validate,createAgency); //✅

export default router;