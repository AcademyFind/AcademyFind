import { NextRequest, NextResponse } from "next/server";
import { addInstitute } from "@/lib/User/user/create-institute";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Parse categories from formData (can be JSON array or comma separated string)
    let categories: string[] = [];
    const catsString = formData.get('categories') as string;
    if (catsString) {
      try {
        categories = JSON.parse(catsString);
      } catch (e) {
        categories = catsString.split(',');
      }
    }

    const result = await addInstitute(session.user.id, formData, categories);
    
    if (result.success) {
      return NextResponse.json({ success: true, data: { id: result.id, slug: result.slug } });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
