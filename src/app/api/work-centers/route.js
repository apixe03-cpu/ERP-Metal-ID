import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Falta nombre' }, { status: 400 });

    const center = await prisma.workCenter.create({
      data: { name: name.toUpperCase() }
    });
    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Centro de trabajo ya existe' }, { status: 400 });
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
