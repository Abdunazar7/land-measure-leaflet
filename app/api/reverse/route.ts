import { NextRequest, NextResponse } from "next/server";
import {
  NOMINATIM_BASE,
  NOMINATIM_HEADERS,
  acceptLanguage,
  toGeoPlace,
  type NominatimPlace,
} from "@/lib/nominatim";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "18");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        ...NOMINATIM_HEADERS,
        "Accept-Language": acceptLanguage(params.get("lang")),
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    const data = (await res.json()) as NominatimPlace & { error?: string };
    if (data.error) return NextResponse.json({ result: null });

    return NextResponse.json({ result: toGeoPlace(data) });
  } catch {
    return NextResponse.json({ result: null }, { status: 200 });
  }
}
