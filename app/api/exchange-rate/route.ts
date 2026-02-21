import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  // Defense-in-depth: require authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch latest JPY to VND rate from a free API
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/JPY",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) {
      throw new Error("Failed to fetch exchange rate");
    }

    const data = await res.json();
    const vndRate = data.rates?.VND;

    if (!vndRate) {
      throw new Error("VND rate not available");
    }

    return NextResponse.json({
      rate: vndRate,
      base: "JPY",
      target: "VND",
      date: data.date || new Date().toISOString().split("T")[0],
    });
  } catch {
    // Fallback rate (approximate) if API fails
    return NextResponse.json({
      rate: 185,
      base: "JPY",
      target: "VND",
      date: new Date().toISOString().split("T")[0],
      fallback: true,
    });
  }
}
