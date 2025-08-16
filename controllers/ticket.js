import { inngest } from "../inngest/client";
import Ticket from "../models/ticket";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "on-ticket-created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTickets = async (req, res) => {
        try {
               const user = req.user;
               let tickets = [];
               if(user.role !== "user"){
                tickets = await Ticket.find({}).populate("assignedTo", ["email", "_id"])
                .sort({ createdAt: -1 });
               }else {
                tickets = await Ticket.find({ createdBy: user._id })
                .populate("assignedTo", ["email", "_id"])
                .select("title description status createdAt")
                .sort({ createdAt: -1 });
               }
               return res.status(200).json({
                message: "Tickets retrieved successfully",
                tickets
               });
        } catch (error) {
               console.error("Error retrieving tickets:", error);
               return res.status(500).json({ message: "Internal server error" });
        }
}
