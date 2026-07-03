import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {requireRole} from "../middlewares/requireRole.middleware.js";
import {createNote, getNotes, getNoteById, updateNote, deleteNote, acknowledgeNote} from "../controllers/note.controller.js";

const router=Router({ mergeParams: true });

//protected :/api/v1/projects/:projectId/note

router.get("/",verifyJwt,getNotes);
router.get("/:noteId",verifyJwt,getNoteById);

router.post("/",verifyJwt,requireRole("owner","manager","reviewer"),createNote);
router.patch("/:noteId",verifyJwt,updateNote); //ownership and role checked in cntrller

router.delete("/:noteId",verifyJwt,requireRole("owner","manager","reviewer"),deleteNote);

router.post("/:noteId/acknowledge",verifyJwt,requireRole("contributor"),acknowledgeNote); //why post here get can also work right?

export default router;