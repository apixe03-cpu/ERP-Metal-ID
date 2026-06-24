import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: 'metal_session',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
