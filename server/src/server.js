import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { seedCoreData } from "./services/seedService.js";
import { app } from "./app.js";

async function startServer() {
  try {
    await connectDb();
    await seedCoreData();

    app.listen(env.port, () => {
      console.log(`Server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
