export function readOnly(req, res, next) {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method))
    return res
      .status(405)
      .set("Allow", "GET, HEAD, OPTIONS")
      .json({ error: "This website API is read-only." });
  res.set("Cache-Control", "no-store");
  next();
}
