import { getStore } from "@netlify/blobs";

const VALID_SITES = ["house_surgeon", "crentoon_studios"];
const MAX_NAME_LENGTH = 50;
const MAX_COMMENT_LENGTH = 300;
const RATE_LIMIT_MS = 60000;

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { site, name, rating, comment, website_url } = body;

  // Honeypot — bots fill this hidden field; humans never see it.
  // Return fake success so the bot doesn't retry.
  if (website_url) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Validation ---

  if (!VALID_SITES.includes(site)) {
    return new Response(JSON.stringify({ error: "Invalid site" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.length > MAX_NAME_LENGTH
  ) {
    return new Response(
      JSON.stringify({ error: "Name is required (max 50 characters)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return new Response(JSON.stringify({ error: "Rating must be 1-5" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const trimmedComment = comment ? String(comment).trim() : "";
  if (trimmedComment.length > MAX_COMMENT_LENGTH) {
    return new Response(
      JSON.stringify({
        error: `Comment must be ${MAX_COMMENT_LENGTH} characters or less`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (ratingNum === 1 && trimmedComment.length === 0) {
    return new Response(
      JSON.stringify({ error: "A comment is required for 1-star ratings" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- Rate limiting (per IP, 1 minute cooldown) ---

  const ip =
    context.ip ||
    req.headers.get("x-nf-client-connection-ip") ||
    "unknown";
  const rateLimitStore = getStore("rate-limits");

  try {
    const lastSubmit = await rateLimitStore.get(ip, { type: "json" });
    if (lastSubmit && Date.now() - lastSubmit.timestamp < RATE_LIMIT_MS) {
      return new Response(
        JSON.stringify({
          error: "Please wait a minute before submitting another review.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch {
    // If rate-limit lookup fails, allow the request through
  }

  // --- Store the review ---

  const reviewStore = getStore("reviews");
  const reviewId =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const newReview = {
    id: reviewId,
    name: name.trim(),
    rating: ratingNum,
    comment: trimmedComment,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = await reviewStore.get(site, { type: "json" });
    const reviews = Array.isArray(existing) ? existing : [];
    reviews.unshift(newReview); // newest first
    await reviewStore.setJSON(site, reviews);
  } catch {
    await reviewStore.setJSON(site, [newReview]);
  }

  // Update rate-limit timestamp
  try {
    await rateLimitStore.setJSON(ip, { timestamp: Date.now() });
  } catch {
    // non-critical
  }

  return new Response(
    JSON.stringify({ success: true, review: newReview }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};

export const config = {
  path: "/api/reviews/submit",
};
