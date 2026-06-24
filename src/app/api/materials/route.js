import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.materialThickness.findMany({
      orderBy: [
        { material: 'asc' },
        { thickness: 'asc' }
      ]
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching materials' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { material, thickness, sheetWidthMm, sheetHeightMm } = await request.json();
    
    const newMaterial = await prisma.materialThickness.create({
      data: {
        material: material.trim(),
        thickness: thickness.trim(),
        sheetWidthMm: sheetWidthMm ? parseFloat(sheetWidthMm) : null,
        sheetHeightMm: sheetHeightMm ? parseFloat(sheetHeightMm) : null
      }
    });
    
    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Este material y espesor ya existen.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating material' }, { status: 500 });
  }
}
