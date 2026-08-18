import { NextRequest, NextResponse } from "next/server";
import { submitGeneralResume } from "@/lib/User/user/general-resume";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await submitGeneralResume(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Resume submitted successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
