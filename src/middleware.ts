import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const publicRoutes = ['/login', '/signup'];
const protectedRoutes = ['/dashboard'];
const bookingRoutes = ['/booking', 'my-tickets'];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isProtectedRoute = protectedRoutes.some((route) => path.includes(route));
    const isbookingRoute = bookingRoutes.some((route) => path.includes(route));

    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (isPublicRoute && session?.id) return NextResponse.redirect(new URL('/', req.nextUrl));

    if ((isbookingRoute && !session?.id) || (isProtectedRoute && (!session?.id || session.role !== 'ADMIN'))) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    if (path === '/dashboard') return NextResponse.redirect(new URL('/dashboard/matches', req.nextUrl));

    return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'] };
