import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createAgency,inviteMember,acceptMember} from "../controllers/agency.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createAgencyValidator} from "../validators/agency.validator.js";
import { requireAgencyOwner } from "../middlewares/requireAgencyOwner.js";
const router=Router({ mergeParams: true });

router.post("/",verifyJwt(),createAgencyValidator(),validate,createAgency); //✅

router.post("/invite-member", verifyJwt(),requireAgencyOwner,inviteMember);//✅

router.get("/accept-invite/:unHashedToken", acceptMember);//✅

export default router;