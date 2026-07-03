import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {addMember,getMember,updateMemberRole,deleteMember} from "../controllers/membership.controller.js";

const router=Router({ mergeParams: true });

//public 


//protected
router.get("/",verifyJwt,getMember);
router.post("/",verifyJwt,requireRole("owner","manager"),addMember);
router.patch("/:userId",verifyJwt,requireRole("owner","manager"),updateMemberRole);
router.delete("/:userId",verifyJwt,requireRole("owner","manager"),deleteMember);

export default router;
