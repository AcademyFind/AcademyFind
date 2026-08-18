import { NextRequest, NextResponse } from "next/server";
import { getTagBySlug } from "@/lib/User/user/blog/gettag";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const tag = await getTagBySlug(slug);

    if (!tag) {
      return NextResponse.json({ success: false, error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
