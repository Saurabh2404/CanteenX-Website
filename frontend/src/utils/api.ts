// Server-side page loaders use the private API origin; browsers use Next's /api proxy.
export async function apiFetch<T>(path: string): Promise<T> {
  const origin =
    typeof window === "undefined"
      ? process.env.BACKEND_URL || "http://127.0.0.1:5001"
      : "";
  const response = await fetch(`${origin}/api${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error("Canteen information is temporarily unavailable.");
  return response.json() as Promise<T>;
}
