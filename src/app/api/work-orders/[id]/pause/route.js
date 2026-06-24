import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { pin, issueDescription } = body;

    if (!pin) return NextResponse.json({ error: 'PIN requerido' }, { status: 400 });
    if (!issueDescription) return NextResponse.json({ error: 'Motivo requerido' }, { status: 400 });

    const employee = await prisma.employee.findFirst({ where: { pin } });
    if (!employee) return NextResponse.json({ error: 'PIN incorrecto' }, { status: 403 });

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { processes: { orderBy: { orderIndex: 'asc' } } }
    });

    if (!workOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const currentProcess = workOrder.processes.find(p => p.status === 'EN_CURSO' || p.status === 'PENDIENTE');
    
    if (!currentProcess) {
      return NextResponse.json({ error: 'No hay procesos activos para pausar' }, { status: 400 });
    }

    await prisma.workOrderProcess.update({
      where: { id: currentProcess.id },
      data: {
        status: 'PAUSADO',
        issueDescription,
        reportedByEmployeeId: employee.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al pausar la orden' }, { status: 500 });
  }
}
