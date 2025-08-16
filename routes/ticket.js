import express from "express";
import { createTicket, getTickets, getTicket } from "../controllers/ticket.js";
import { authenticate } from "../middlewares/auth.js";


const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);

export default router;
