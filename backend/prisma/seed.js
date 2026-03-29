import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting the seeding process... Let's plant some data!");

  // Step 1: Clean up old data if desired (Wait, skipping to prevent foreign key issues, let's just make new boards!)
  // Or we can delete all existing boards first to keep it clean:
  // Step 1: Clean up old data 
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.member.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  console.log("🧹 Cleared old database records.");

  // Create Sample Members
  const user1 = await prisma.member.create({ data: { name: "Shashank", avatarUrl: "https://ui-avatars.com/api/?name=Shashank&background=random" } });
  const user2 = await prisma.member.create({ data: { name: "Aman", avatarUrl: "https://ui-avatars.com/api/?name=Aman&background=random" } });
  console.log("👥 Created sample members.");

  const boardNames = ["Work Projects", "Personal Tasks", "Study Goals"];

  for (let i = 0; i < boardNames.length; i++) {
    // Create Board
    const board = await prisma.board.create({
      data: {
        title: boardNames[i],
      },
    });
    console.log(`✅ Created board: ${board.title}`);

    // Create labels for board
    const labelRed = await prisma.label.create({ data: { title: "Urgent", color: "bg-red-500", boardId: board.id }});
    const labelBlue = await prisma.label.create({ data: { title: "Design", color: "bg-blue-500", boardId: board.id }});
    const labelGreen = await prisma.label.create({ data: { title: "Completed", color: "bg-green-500", boardId: board.id }});

    // Create 3 standard lists: To Do, Doing, Done
    const todoList = await prisma.list.create({
      data: { title: "To Do", order: 1, boardId: board.id },
    });
    const doingList = await prisma.list.create({
      data: { title: "Doing", order: 2, boardId: board.id },
    });
    const doneList = await prisma.list.create({
      data: { title: "Done", order: 3, boardId: board.id },
    });
    console.log(`✅ Created Lists for ${board.title}`);

    // Seed some example tasks/cards into the lists based on board
    if (i === 0) { // Work
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      
      const c1 = await prisma.card.create({ data: { title: "Deploy to production", description: "Server migration", listId: todoList.id, order: 1, coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop", dueDate: dueDate } });
      const c2 = await prisma.card.create({ data: { title: "Fix API bug", description: "In the user route", listId: doingList.id, order: 1 } });
      
      // Add relations (Members, attachments, comments, labels)
      await prisma.cardMember.create({ data: { cardId: c1.id, memberId: user1.id } });
      await prisma.comment.create({ data: { content: "Looking into the deploy config...", cardId: c1.id, authorId: user2.id } });
      await prisma.attachment.create({ data: { fileName: "schema.pdf", fileUrl: "#", cardId: c1.id } });
      await prisma.cardLabel.create({ data: { cardId: c1.id, labelId: labelRed.id } });
      
      // Add Checklist
      const check = await prisma.checklist.create({ data: { title: "Pre-deployment Steps", cardId: c1.id }});
      await prisma.checklistItem.create({ data: { title: "Run tests", isCompleted: true, checklistId: check.id }});
      await prisma.checklistItem.create({ data: { title: "Setup DNS", isCompleted: false, checklistId: check.id }});

    } else if (i === 1) { // Personal
      const c3 = await prisma.card.create({ data: { title: "Buy groceries", description: "Milk, eggs, coffee", listId: todoList.id, order: 1, coverUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" } });
      await prisma.card.create({ data: { title: "Pay electricity bill", description: "Due tomorrow", listId: todoList.id, order: 2 } });
      await prisma.cardMember.create({ data: { cardId: c3.id, memberId: user2.id } });
      await prisma.cardLabel.create({ data: { cardId: c3.id, labelId: labelBlue.id } });

    } else if (i === 2) { // Study
      await prisma.card.create({ data: { title: "Read Chapter 4", description: "Biology 101", listId: todoList.id, order: 1 } });
      const c4 = await prisma.card.create({ data: { title: "Finish math assignment", description: "Calculus", listId: doneList.id, order: 1 } });
      await prisma.comment.create({ data: { content: "Done! It was hard.", cardId: c4.id, authorId: user1.id } });
      await prisma.cardLabel.create({ data: { cardId: c4.id, labelId: labelGreen.id } });
    }
  }

  console.log("🎉 Seeding finished successfully! Your database is ready to go.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed!");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // We disconnect from the database after finishing the seeding
    await prisma.$disconnect();
  });
