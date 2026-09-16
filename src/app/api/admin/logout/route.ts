import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  await destroySession();
  // A relative Location avoids rebuilding an absolute URL from req.url, which
  // behind a proxy reports the internal host rather than the public one.
  return new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } });
}
