import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Permitimos cambiar campos libremente (por ahora prioridad y status)
    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ success: true, workOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error actualizando trabajo' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { pin } = body;

    if (!pin) return NextResponse.json({ error: 'Se requiere PIN para esta acción' }, { status: 400 });

    const employee = await prisma.employee.findFirst({ where: { pin } });
    if (!employee) return NextResponse.json({ error: 'PIN inválido' }, { status: 401 });

    const workOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'WorkOrder',
        entityId: id,
        details: `Eliminó el trabajo: ${workOrder.title}`,
        employeeId: employee.id
      }
    });

    await prisma.workOrder.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
