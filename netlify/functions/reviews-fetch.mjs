import { getStore } from "@netlify/blobs";

const VALID_SITES = ["house_surgeon", "crentoon_studios"];

export default async (req) => {
  const url = new URL(req.url);
  const site = url.searchParams.get("site");

  if (!VALID_SITES.includes(site)) {
    return new Response(
      JSON.stringify({ error: "Invalid site parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const store = getStore("reviews");

  try {
    const reviews = await store.get(site, { type: "json" });
    return new Response(
      JSON.stringify({ reviews: Array.isArray(reviews) ? reviews : [] }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch {
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/reviews",
};
