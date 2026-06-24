import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { thickness, quantitySqM } = await request.json();
    
    // Buscar si ya existe ese espesor
    const existing = await prisma.inventory.findFirst({
      where: { thickness }
    });

    if (existing) {
      const updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantitySqM: existing.quantitySqM + parseFloat(quantitySqM) }
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.inventory.create({
        data: {
          material: 'Acero al Carbono',
          thickness,
          quantitySqM: parseFloat(quantitySqM)
        }
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error adjusting inventory' }, { status: 500 });
  }
}
