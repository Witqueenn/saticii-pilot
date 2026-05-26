import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    ts: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  });
}
