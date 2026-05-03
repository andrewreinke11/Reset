import app from "./index";
import { connectDatabase } from "./config/mongo";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB only in production or if explicitly configured
    const useMongoDb = process.env.USE_MONGODB === "true" || process.env.NODE_ENV === "production";
    if (useMongoDb) {
      await connectDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Reset Pixel Art Tool API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();