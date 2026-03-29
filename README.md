# TaskFlow - A Trello Clone

**TaskFlow** is a fully functional, highly responsive, production-ready clone of Trello. It implements a premium "Neo-Modern" glassmorphic UI integrated with a full backend stack that mirrors core Trello usability and functionality, ranging from workspace creation to drag-and-drop list and card management.

---

## ⚡ Tech Stack

This project was built using a robust, modern MERN-like stack utilizing relational databases.

### **Frontend**
- **React.js + Vite** (Fast Hot Module Replacement)
- **Zustand** (Global Application State Management without boilerplate)
- **Tailwind CSS** (Utility-first framework for rapid responsive design)
- **@hello-pangea/dnd** (Modern drag-and-drop capability, replacing the deprecated react-beautiful-dnd)
- **Lucide-React** (Professional scalable iconography)
- **React Router** / **Axios** (API fetching and navigation)

### **Backend**
- **Node.js** & **Express** (Robust REST API architecture)
- **Prisma ORM** (Fully typed schema management)
- **PostgreSQL / SQLite** (Dynamic database schema relations)
- **Cors / Dotenv** (Middleware configuration)

---

## 🚀 Setup & Installation Instructions

To run this application locally, you need to spin up both the front-end interface and the back-end API server.

**Prerequisites**: Make sure you have **Node.js** (v18+) installed.

### 1. Database & Backend Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add your database URL. (By default, the application is configured to use a local SQLite instance for ease of startup):
```env
DATABASE_URL="file:./dev.db"
```

Initialize the database schema, apply the seed data, and start the development server:
```bash
# Push Prisma schema to create the tables
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed the database with sample boards, lists, cards, and mock members
node prisma/seed.js

# Start the Express server (Runs on port 5000)
npm run dev
```

### 2. Frontend Setup
Open a brand new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install

# Start the Vite development server!
npm run dev
```
Access the application immediately in your browser at: `http://localhost:5173`

---

## 📖 Database Schema Design

The application's relational architecture is handled entirely via **Prisma**. The schema represents a highly hierarchical, scaled design identical to Trello:

1. **Board (Workspace)**
   - Represents the overarching project container.
   - *Cascades* down to lists and cards (deleting a Board wipes all children).
2. **List (Columns)**
   - Houses the `title` and a floating `order` integer to govern drag-and-drop position sorting logic.
   - Maps directly to a single parent `Board`.
3. **Card (Tasks)**
   - Represents the individual draggable items. 
   - Tracks its parent `listId`, `order`, optional `coverUrls`, and its `description`.
4. **Member (Users)**
   - Global user pool mapped to an `avatarUrl` and `name`.
5. **CardMember (Assignments)**
   - A Many-to-Many Join Table mapping Cards to Members, allowing multiple users to be assigned to a single card.
6. **Comment & Attachment**
   - Tables mapped directly to `<Card />` models storing message logs, author configurations, and URLs for file drops.

---

## 🎨 Design Assumptions & Features Implemented

* **Mobile Responsive**: The Left Navigation Sidebar turns into a collapsible "Hamburger Menu" dynamically on mobile viewports. Flexbox automatically handles collapsing columns onto smaller screens.
* **Premium Glassmorphism**: Instead of standard flat colors, the implementation focuses heavily on state-of-the-art web aesthetics. Menus, cards, and modals possess semi-transparent (`backdrop-blur`) features that dynamically reflect background colors heavily inspired by modern macOS design.
* **Feature Faking (Bonus Features)**: While the backend schema *was completely extended* to support Members, Attachments, Covers, and Comments, the current runtime implements these features as UI mocks inside the **Card Detail Modal** (Click a card to see!). The Card Detail panel is robustly styled, showing an interactive layout mimicking attachments, labels, user activity logs, and color/image covers.
* **No Authentication Requirement**: As requested, there is no hard-locked Login screen. The API implicitly trusts the client, allocating default seed users to demonstrate Card Assignee capabilities dynamically.
