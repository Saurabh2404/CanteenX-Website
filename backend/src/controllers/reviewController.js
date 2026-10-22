import { getGoogleReviews } from "../services/reviewService.js";
export async function listReviews(_req, res) {
  res.json(await getGoogleReviews());
}
