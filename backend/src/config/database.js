import mongoose from "mongoose";
let connection;
export async function connectDatabase() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  connection ??= mongoose
    .connect(process.env.MONGO_URI, {
      autoIndex: false,
      autoCreate: false,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      maxIdleTimeMS: 10000,
      maxConnecting: 1,
      retryReads: true,
      maxPoolSize: 3,
      appName: "CanteenX-Website-ReadOnly",
    })
    .catch((error) => {
      connection = undefined;
      throw error;
    });
  await connection;
  return mongoose.connection;
}
