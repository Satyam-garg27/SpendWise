
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Initialize Express FIRST
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

// API Routes
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to SpendWise API",
        status: "Running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Start server after database connection
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`SpendWise server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
