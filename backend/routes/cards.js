import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// POST /api/cards
// Add a new task (card) to a specific list
router.post("/", async (req, res) => {
  try {
    const { title, listId } = req.body;

    // Like lists, we need to put this card at the bottom of the column.
    // We fetch the card with the highest order number in this specific list.
    const lastCard = await prisma.card.findFirst({
      where: { listId: listId },
      orderBy: { order: "desc" }
    });

    const nextOrder = lastCard ? lastCard.order + 1 : 0;

    const newCard = await prisma.card.create({
      data: {
        title: title,
        listId: listId,
        order: nextOrder
      }
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

// PUT /api/cards/reorder
// Bulk update the position/list of multiple cards
router.put("/reorder", async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order, listId }
    
    const updates = items.map((item) => 
      prisma.card.update({
        where: { id: item.id },
        data: { 
          order: item.order,
          listId: item.listId // It might have moved to a new list
        }
      })
    );
    
    await prisma.$transaction(updates);
    res.json({ message: "Cards reordered successfully" });
  } catch (error) {
    console.error("Error reordering cards:", error);
    res.status(500).json({ error: "Failed to reorder cards" });
  }
});

// PATCH /api/cards/:id
// Update a card (change its title or description)
// PATCH means we only update the fields we send, leaving everything else intact
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    // Only update fields that were provided by the frontend
    const updatedCard = await prisma.card.update({
      where: { id: id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        dueDate: dueDate !== undefined ? new Date(dueDate) : undefined
      }
    });

    res.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// DELETE /api/cards/:id
// Remove a single card permanently
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id: id }
    });

    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// POST /api/cards/:id/labels
// Add or remove a label 
router.post("/:id/labels", async (req, res) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;
    
    // Check if it already exists
    const existing = await prisma.cardLabel.findUnique({
      where: { cardId_labelId: { cardId: id, labelId } }
    });

    if (existing) {
      await prisma.cardLabel.delete({ where: { cardId_labelId: { cardId: id, labelId } } });
      res.json({ message: "Label removed", attached: false });
    } else {
      await prisma.cardLabel.create({ data: { cardId: id, labelId } });
      res.json({ message: "Label added", attached: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle label" });
  }
});

// POST /api/cards/:id/members
// Add or remove a member
router.post("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    
    const existing = await prisma.cardMember.findUnique({
      where: { cardId_memberId: { cardId: id, memberId } }
    });

    if (existing) {
      await prisma.cardMember.delete({ where: { cardId_memberId: { cardId: id, memberId } } });
      res.json({ message: "Member removed", attached: false });
    } else {
      await prisma.cardMember.create({ data: { cardId: id, memberId } });
      res.json({ message: "Member added", attached: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle member" });
  }
});

// POST /api/cards/:id/checklists
// Create a new checklist item
router.post("/:id/checklists", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    let checklist = await prisma.checklist.findFirst({ where: { cardId: id } });
    if (!checklist) {
       checklist = await prisma.checklist.create({ data: { cardId: id, title: "To Do" } });
    }

    const item = await prisma.checklistItem.create({
      data: { title, checklistId: checklist.id }
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create checklist item" });
  }
});

// PATCH /api/cards/checklist-items/:itemId
router.patch("/checklist-items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isCompleted } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle item" });
  }
});

export default router;
