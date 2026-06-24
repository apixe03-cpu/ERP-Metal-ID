import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { resolutionDescription } = body;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { processes: { orderBy: { orderIndex: 'asc' } } }
    });

    if (!workOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const pausedProcess = workOrder.processes.find(p => p.status === 'PAUSADO');
    
    if (!pausedProcess) {
      return NextResponse.json({ error: 'No hay procesos pausados en esta orden' }, { status: 400 });
    }

    await prisma.workOrderProcess.update({
      where: { id: pausedProcess.id },
      data: {
        status: 'EN_CURSO',
        resolutionDescription: resolutionDescription || "Resuelto desde administración."
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al reanudar la orden' }, { status: 500 });
  }
}
