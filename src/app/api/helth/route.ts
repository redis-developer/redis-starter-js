import getClient from "@/lib/redis/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
    const redis = await getClient();

    const now = Date.now();
    const pong = await redis.ping();

        return NextResponse.json({
            ping: pong,
            ms: Date.now() - now,
        }, {
            status: 200,
        });
    } catch (e) {
        return NextResponse.json({
            error: e,
        }, { status: 500 });
    }
}
