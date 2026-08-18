import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/User/user/blog/getcategory";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
