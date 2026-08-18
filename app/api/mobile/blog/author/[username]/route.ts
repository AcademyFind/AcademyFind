import { NextRequest, NextResponse } from "next/server";
import { getAuthorByUsername } from "@/lib/User/user/blog/getauthor";

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const author = await getAuthorByUsername(username);

    if (!author) {
      return NextResponse.json({ success: false, error: 'Author not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: author });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
