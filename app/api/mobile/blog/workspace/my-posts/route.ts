import { NextRequest, NextResponse } from "next/server";
import { getMyPosts } from "@/lib/User/user/blog/getmyposts";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { BlogStatus } from "@/app/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as BlogStatus | undefined;

    const data = await getMyPosts({ userId: session.user.id, page, limit, status });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
