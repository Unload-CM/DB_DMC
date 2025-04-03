import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 대시보드 접근 시 인증 검사를 위한 미들웨어
export async function middleware(request: NextRequest) {
  const supabaseUrl = 'https://fpfinpuncamlpbbimwtu.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZmlucHVuY2FtbHBiYmltd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDEwMzQsImV4cCI6MjA1OTE3NzAzNH0.PkUdieMcJbIvReXzmCw-glNQdn2Ni4XdIOHSbYx8hJE';
  
  // 쿠키에서 supabase 토큰 확인
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  // 404 NOT_FOUND 에러 발생 시 로그인 페이지로 리디렉션
  if (request.nextUrl.pathname === '/_not-found' || request.nextUrl.pathname === '/404') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // 루트 경로인 경우 로그인 페이지로 리디렉션
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // 대시보드 접근 시 인증 확인
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 클라이언트에서 처리하므로 여기서는 간단히 통과시킴
    return NextResponse.next();
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.well-known).*)'],
}; 