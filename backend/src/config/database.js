import mongoose from "mongoose";
// Reuse the same client across compiled modules and warm invocations.
const state = (globalThis.__canteenWebsiteMongo ??= {
  promise: null,
  retryAfter: 0,
});
export async function connectDatabase() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (state.retryAfter > Date.now()) {
    const error = new Error(
      "Database connection is cooling down after a failed login or network request.",
    );
    error.name = "DatabaseCooldownError";
    throw error;
  }
  state.promise ??= mongoose
    .connect(process.env.MONGO_URI, {
      autoIndex: false,
      autoCreate: false,
      maxPoolSize: 1,
      minPoolSize: 0,
      maxConnecting: 1,
      maxIdleTimeMS: 10000,
      waitQueueTimeoutMS: 5000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryReads: true,
      appName: "CanteenX-Website-ReadOnly",
    })
    .catch((error) => {
      state.promise = null;
      state.retryAfter = Date.now() + 60000;
      throw error;
    });
  await state.promise;
  return mongoose.connection;
}
