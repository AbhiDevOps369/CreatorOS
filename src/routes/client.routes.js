
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createClient,getAllClients,getProjectsByClientId,getClientById,updateClient,deleteClient}
from "../controllers/client.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createClientValidator,updateClientValidator} from "../validators/client.validator.js";
import { requireAgencyOwner } from "../middlewares/requireAgencyOwner.js";
const router=Router({ mergeParams: true });

//public



//protected


router.get("/",verifyJwt(),requireAgencyOwner,getAllClients); //✅
router.get("/:clientId",verifyJwt(),requireAgencyOwner,getClientById); //✅
router.get("/:clientId/projects", verifyJwt(), requireRole("owner","manager"), getProjectsByClientId);

router.post("/", verifyJwt(),requireAgencyOwner, createClientValidator(), validate, createClient); //✅
router.delete("/:clientId",verifyJwt(),requireAgencyOwner,deleteClient); //✅
router.patch("/:clientId",verifyJwt(),requireAgencyOwner,updateClientValidator(),validate,updateClient); //✅


export default router;
/*
7.3 Clients — /api/v1/clients

Method & path
 Purpose
 Guard

GET /
 List clients
 owner/manager

POST /
 Create client
 owner/manager

GET /:clientId
 Get one client
 owner/manager

PATCH /:clientId
 Update client
 owner/manager

DELETE /:clientId
 Remove client
 owner only

GET /:clientId/projects
 Projects for a client
 owner/manag
*/