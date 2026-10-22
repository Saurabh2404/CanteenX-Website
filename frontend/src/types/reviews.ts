export type GoogleReview = {
  id: string;
  author: string;
  authorUrl: string;
  photo: string;
  rating: number;
  text: string;
  relativeTime: string;
  url: string;
};
export type GoogleReviews = {
  status: "ready" | "not-configured" | "unavailable";
  source?: "google-api";
  reviews: GoogleReview[];
  rating?: number;
  count?: number;
  url: string;
  attributions: { name: string; url: string }[];
};
