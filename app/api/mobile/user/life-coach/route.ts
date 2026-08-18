import { NextRequest, NextResponse } from "next/server";
import { submitLifeCoachRequest } from "@/lib/User/user/life-coach";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await submitLifeCoachRequest(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
