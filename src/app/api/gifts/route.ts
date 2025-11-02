import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const gifts = await prisma.gift.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: gifts });
  } catch (error: unknown) {
    console.error("Error fetching gifts:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
