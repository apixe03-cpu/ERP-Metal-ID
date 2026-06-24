import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        clientName: body.clientName,
        remitoNumber: body.remitoNumber,
        deliveryType: body.deliveryType,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating delivery' }, { status: 500 });
  }
}
