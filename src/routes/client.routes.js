
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createClient,getAllClients,getProjectsByClientId,getClientById,updateClient,deleteClient}
from "../controllers/client.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createClientValidator,updateClientValidator} from "../validators/client.validator.js";

const router=Router({ mergeParams: true });

//public



//protected

router.get("/",verifyJwt,requireRole("owner","manager"),getAllClients);
router.get("/:clientId",verifyJwt,requireRole("owner","manager"),getClientById);
router.get("/:clientId/projects", verifyJwt, requireRole("owner","manager"), getProjectsByClientId);
router.post("/",verifyJwt,requireRole("owner","manager"),createClientValidator(),validate,createClient);
router.delete("/:clientId",verifyJwt,requireRole("owner"),deleteClient);
router.patch("/:clientId",verifyJwt,requireRole("owner","manager"),updateClientValidator(),validate,updateClient);


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