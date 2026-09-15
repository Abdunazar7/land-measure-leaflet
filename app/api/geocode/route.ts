import { NextRequest, NextResponse } from "next/server";
import {
  NOMINATIM_BASE,
  NOMINATIM_HEADERS,
  acceptLanguage,
  toGeoPlace,
  type NominatimPlace,
} from "@/lib/nominatim";

const MAX_LIMIT = 10;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query = params.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const limit = Math.min(
    Math.max(Number(params.get("limit")) || 6, 1),
    MAX_LIMIT,
  );

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("addressdetails", "0");

  // Bias (but do not restrict) results towards what the user is looking at.
  const viewbox = params.get("viewbox");
  if (viewbox) {
    url.searchParams.set("viewbox", viewbox);
    url.searchParams.set("bounded", "0");
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        ...NOMINATIM_HEADERS,
        "Accept-Language": acceptLanguage(params.get("lang")),
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }

    const data = (await res.json()) as NominatimPlace[];
    const results = data
      .map((place, index) => toGeoPlace(place, index))
      .filter((place): place is NonNullable<typeof place> => place !== null);

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
