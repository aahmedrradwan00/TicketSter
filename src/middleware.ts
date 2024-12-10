import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const publicRoutes = ['/login', '/signup'];
const protectedRoutes = ['/dashboard'];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isProtectedRoute = protectedRoutes.includes(path);

    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (isPublicRoute && session?.id) return NextResponse.redirect(new URL('/', req.nextUrl));

    if (isProtectedRoute && (!session?.id || session.role !== 'ADMIN')) return NextResponse.redirect(new URL('/login', req.nextUrl));

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
