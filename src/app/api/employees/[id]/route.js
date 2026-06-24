import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await prisma.employee.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting employee' }, { status: 500 });
  }
}
