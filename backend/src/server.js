import "./config/env.js";
import app from "./app.js";
import mongoose from "mongoose";
const port = Number(process.env.PORT || 5001);
const server = app.listen(port, "127.0.0.1", () =>
  console.log(`Website API ready at http://127.0.0.1:${port}`),
);
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Backend port ${port} is already in use. Stop the existing backend with Ctrl+C before restarting.`,
    );
  } else
    console.error(`Backend could not start: ${error.code || "unknown error"}`);
  process.exit(1);
});
async function shutdown() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
