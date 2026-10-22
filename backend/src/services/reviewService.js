function safeUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}
export async function getGoogleReviews() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  const empty = {
    reviews: [],
    url: safeUrl(process.env.GOOGLE_MAPS_URL),
    attributions: [],
  };
  if (!key || !id) return { status: "not-configured", ...empty };
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews,attributions",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return { status: "unavailable", ...empty };
    const place = await response.json();
    if (
      !/ardh\s*sainik|अर्ध.*सैनिक/i.test(place.displayName?.text || "") ||
      !/kanti|कांटी|कांती/i.test(place.formattedAddress || "")
    )
      return { status: "unavailable", ...empty };
    return {
      status: "ready",
      source: "google-api",
      rating: place.rating,
      count: place.userRatingCount,
      url: safeUrl(place.googleMapsUri),
      reviews: (Array.isArray(place.reviews) ? place.reviews : []).map(
        (r, i) => ({
          id: r.name || String(i),
          author: r.authorAttribution?.displayName || "Google user",
          authorUrl: safeUrl(r.authorAttribution?.uri),
          photo: safeUrl(r.authorAttribution?.photoUri),
          rating: Math.max(0, Math.min(5, r.rating || 0)),
          text: r.originalText?.text || r.text?.text || "",
          relativeTime: r.relativePublishTimeDescription || "",
          url: safeUrl(r.googleMapsUri) || safeUrl(place.googleMapsUri),
        }),
      ),
      attributions: (Array.isArray(place.attributions)
        ? place.attributions
        : []
      ).map((a) => ({ name: a.provider || "", url: safeUrl(a.providerUri) })),
    };
  } catch {
    return { status: "unavailable", ...empty };
  }
}
