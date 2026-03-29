import express from "express"; // Import Express, the framework handling API requests
import cors from "cors";       // Import CORS, which allows our frontend to talk to our backend
import dotenv from "dotenv";   // Import dotenv to automatically load .env environment variables

// Import our individual route files where we defined the logics for boards, lists, and cards
import boardsRouter from "./routes/boards.js";
import listsRouter from "./routes/lists.js";
import cardsRouter from "./routes/cards.js";
import uploadsRouter from "./routes/uploads.js";

// Load the environment variables from the .env file
dotenv.config();

// Create the main backend application
const app = express();

// Set up middleware
// Think of middleware like bouncers at a club checking requests before they reach your logic
app.use(cors({
  origin: true, // This dynamically reflects the request origin, allowing connections from anywhere while supporting credentials
  credentials: true
}));
app.use(express.json()); // Allow our app to read JSON data sent in the request body

// Define our routes!
// This tells Express: "If someone visits /api/boards, pass the request to the boardsRouter"
app.use("/api/boards", boardsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/uploads", uploadsRouter);

// Serve the 'uploads' directory statically at /uploads
app.use("/uploads", express.static("uploads"));

// A simple test route to ensure the server is running
app.get("/", (req, res) => {
  res.send("Hello! The Trello Clone backend is running successfully.");
});

// The port our server will listen to. Uses the PORT from .env, or defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the server and listen for connections!
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
