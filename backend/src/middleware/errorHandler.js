export function errorHandler(_error, _req, res, _next) {
  if (res.headersSent) return;
  // Never return DB connection strings, provider responses or customer data.
  res
    .status(503)
    .json({ error: "The requested information is temporarily unavailable." });
}
