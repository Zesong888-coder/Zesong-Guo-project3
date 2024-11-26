import express from "express";
import authRoutes from "./routes/auth.routes.js";

import dotenv from "dotenv";

import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware to parse req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cookieParser());

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})