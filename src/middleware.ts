import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard routes (admin only)
  if (pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('admin-token');
      return response;
    }
  }

  // Protect moderator dashboard routes (moderator or admin)
  if (pathname.startsWith('/moderator/dashboard')) {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/moderator', request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'moderator' && payload.role !== 'admin')) {
      const response = NextResponse.redirect(new URL('/moderator', request.url));
      response.cookies.delete('admin-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/moderator/dashboard/:path*'],
};
