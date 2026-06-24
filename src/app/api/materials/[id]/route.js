import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { material, thickness, sheetWidthMm, sheetHeightMm } = await request.json();
    
    const mat = await prisma.materialThickness.update({
      where: { id },
      data: { 
        material, 
        thickness,
        sheetWidthMm: sheetWidthMm ? parseFloat(sheetWidthMm) : null,
        sheetHeightMm: sheetHeightMm ? parseFloat(sheetHeightMm) : null
      }
    });
    return NextResponse.json(mat);
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Ese material con ese espesor ya existe' }, { status: 400 });
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.materialThickness.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
