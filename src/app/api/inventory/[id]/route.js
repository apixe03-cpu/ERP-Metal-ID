import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.inventory.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting inventory' }, { status: 500 });
  }
}
