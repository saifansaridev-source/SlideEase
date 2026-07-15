import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('slidex_session');
    
    return NextResponse.json({ success: true, message: 'Logged out successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('slidex_session');
    
    // Redirect to login page after signing out
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
