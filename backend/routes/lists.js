import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// POST /api/lists
// Create a new list inside a specific board
router.post("/", async (req, res) => {
  try {
    const { title, boardId } = req.body;

    // First, let's figure out what order number this new list should get.
    // We want it to be at the very end. 
    // We search the database for the highest order number in this board.
    const lastList = await prisma.list.findFirst({
      where: { boardId: boardId },
      orderBy: { order: "desc" }
    });
    
    // If a list already exists, take its order and add 1.
    // If no lists exist, this is the first list, so we give it order 0.
    const nextOrder = lastList ? lastList.order + 1 : 0;

    // Now tell Prisma to save the new List
    const newList = await prisma.list.create({
      data: {
        title: title,
        boardId: boardId,
        order: nextOrder
      }
    });

    // Send the brand new list back to the frontend
    res.status(201).json(newList);
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ error: "Failed to create list" });
  }
});

// PUT /api/lists/reorder
// Bulk update the order of multiple lists
router.put("/reorder", async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    
    // Update all lists in a single transaction
    const updates = items.map((item) => 
      prisma.list.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );
    
    await prisma.$transaction(updates);
    res.json({ message: "Lists reordered successfully" });
  } catch (error) {
    console.error("Error reordering lists:", error);
    res.status(500).json({ error: "Failed to reorder lists" });
  }
});

// PUT /api/lists/:id
// Rename a list
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) return res.status(400).json({ error: "Title is required" });

    const updatedList = await prisma.list.update({
      where: { id: id },
      data: { title: title }
    });
    res.json(updatedList);
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).json({ error: "Failed to update list" });
  }
});

// DELETE /api/lists/:id
// Remove a list and all cards inside it
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prisma automatically handles cascading deletes.
    // If we delete a List, any connected Cards disappear too!
    await prisma.list.delete({
      where: { id: id }
    });

    res.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Error deleting list:", error);
    res.status(500).json({ error: "Failed to delete list" });
  }
});

export default router;
