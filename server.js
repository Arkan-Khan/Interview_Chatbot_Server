import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS
import connectDB from "./config/db.js";

console.log("1. Starting server initialization");

try {
    console.log("2. Configuring dotenv");
    dotenv.config();
    
    console.log("3. Creating Express app");
    const app = express();
    
    console.log("4. Enabling CORS");
    app.use(cors()); // General CORS config

    console.log("5. Enabling JSON parsing");
    app.use(express.json());

    console.log("6. Connecting to database");
    await connectDB();
    
    console.log("7. Importing routes");
    const authRoutes = await import("./routes/authRoutes.js");
    const uploadRoutes = await import("./routes/uploadRoutes.js");
    
    console.log("8. Setting up routes");
    app.use("/auth", authRoutes.default);
    app.use("/pdf", uploadRoutes.default);
    
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
        console.log("9. Server successfully started");
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
}
