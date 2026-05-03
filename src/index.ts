import express from "express";
import cors from "cors";
import userController from "./Controllers/UserController";
import fileController from "./Controllers/FileController";

const app = express();

// Swagger UI (lazy require to avoid dev-time issues)
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('../docs/openapi.json');


// Middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userController);
app.use("/api/files", fileController);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Reset Pixel Art Tool API is running" });
});

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));



export default app;