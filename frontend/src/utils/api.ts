export async function apiFetch<T>(path: string): Promise<T> {
  if (typeof window === "undefined") {
    const { getPageData } = await import("@canteenx/website-backend");
    return (await getPageData(path)) as T;
  }
  const response = await fetch(`/api${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error("Canteen information is temporarily unavailable.");
  return response.json() as Promise<T>;
}
