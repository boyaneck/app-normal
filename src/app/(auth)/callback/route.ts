import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
export async function GET(request: Request) {
  const requestURL = new URL(request.url);
  const code = requestURL.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  console.log("브라우저 요청 확인하기 ");
  return NextResponse.redirect(requestURL.origin);
}
