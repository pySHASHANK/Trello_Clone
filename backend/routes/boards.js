import express from "express";
import prisma from "../prisma/client.js"; // This is how we interact with PostgreSQL

const router = express.Router(); // A mini-app to group all /api/boards routes together

// GET /api/boards
// Fetch all boards
router.get("/", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" } 
    });
    res.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

// POST /api/boards
// Create a new board
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const newBoard = await prisma.board.create({
      data: { title }
    });
    // Create default lists
    await prisma.list.createMany({
       data: [
         { title: "To Do", order: 1, boardId: newBoard.id },
         { title: "Doing", order: 2, boardId: newBoard.id },
         { title: "Done", order: 3, boardId: newBoard.id }
       ]
    });
    res.status(201).json(newBoard);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

// GET /api/boards/:id
// Fetch a single board, AND include all of its lists and cards
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the id from the URL

    // We use findUnique because we look for a specific board ID
    const board = await prisma.board.findUnique({
      where: { id: id },
      // This part is the "magic" of relational databases
      // It tells Prisma to fetch the Lists connected to this Board,
      // and for each List, fetch the Cards inside it.
      include: {
        labels: true,
        lists: {
          orderBy: { order: "asc" }, // Order lists as they appear left-to-right
          include: {
            cards: {
              orderBy: { order: "asc" }, // Order cards top-to-bottom
              include: {
                comments: true,
                attachments: true,
                checklists: { include: { items: true } },
                labels: { include: { label: true } },
                members: { include: { member: true } }
              }
            }
          }
        }
      }
    });

    if (!board) {
      // 404 means Not Found
      return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ error: "Failed to fetch board details" });
  }
});

// POST /api/boards
// Create a completely new board
router.post("/", async (req, res) => {
  try {
    const { title } = req.body; // Expect the new board's title to be sent

    // Tell Prisma to create a new row in the Board table
    const newBoard = await prisma.board.create({
      data: {
        title: title
      }
    });
    
    // 201 means "Created successfully"
    res.status(201).json(newBoard);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

// DELETE /api/boards/:id
// Delete a board and all its lists+cards (Cascade configured in schema)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.board.delete({
      where: { id: id }
    });
    // 200 means OK
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ error: "Failed to delete board" });
  }
});

export default router;
