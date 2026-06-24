import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // El frontend puede enviar opcionalmente buenas y malas y el PIN
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const { goodQuantity = 0, badQuantity = 0, pin } = body;
    const goodQty = parseInt(goodQuantity);
    const badQty = parseInt(badQuantity);

    // Validar PIN de empleado
    if (!pin) return NextResponse.json({ error: 'PIN requerido' }, { status: 400 });
    const employee = await prisma.employee.findFirst({ where: { pin } });
    if (!employee) return NextResponse.json({ error: 'PIN incorrecto' }, { status: 403 });

    // Obtener los procesos ordenados
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        processes: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!workOrder) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Buscar el primer proceso que no esté TERMINADO
    const currentProcess = workOrder.processes.find(p => p.status !== 'TERMINADO');
    const nextProcess = workOrder.processes.find(p => p.orderIndex === (currentProcess?.orderIndex || 0) + 1);

    if (!currentProcess) {
      return NextResponse.json({ message: 'El trabajo ya está completamente terminado' }, { status: 400 });
    }

    // Determinar si es el último proceso
    const isLastProcess = workOrder.processes[workOrder.processes.length - 1].id === currentProcess.id;

    // Actualizar el paso actual a TERMINADO
    await prisma.workOrderProcess.update({
      where: { id: currentProcess.id },
      data: { 
        status: 'TERMINADO',
        employeeId: employee.id,
        finishedAt: new Date(),
        goodQuantity: isLastProcess ? goodQty : currentProcess.goodQuantity,
        badQuantity: isLastProcess ? badQty : currentProcess.badQuantity
      }
    });

    // Si hay un siguiente paso, pasarlo a EN_CURSO
    if (nextProcess) {
      await prisma.workOrderProcess.update({
        where: { id: nextProcess.id },
        data: { status: 'EN_CURSO' }
      });
    } else {
      // Si era el ÚLTIMO paso: Mermas matemáticas + Terminar
      const totalProducido = goodQty + badQty;
      const extraGastado = totalProducido - workOrder.expectedQuantity;

      // Descontar la chapa extra gastada si hay exceso
      if (extraGastado > 0 && workOrder.thickness && workOrder.widthMm && workOrder.heightMm) {
        const sqMetersPerPiece = (workOrder.widthMm * workOrder.heightMm) / 1000000;
        const extraSqMeters = extraGastado * sqMetersPerPiece;
        
        const inventoryItem = await prisma.inventory.findFirst({
          where: { thickness: workOrder.thickness }
        });
        
        if (inventoryItem) {
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantitySqM: { decrement: extraSqMeters } }
          });
        }
      }

      // El trabajo ya está completado en base a sus procesos.
      // (Aquí se podría actualizar el stock de productos terminados si corresponde)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error avanzando el trabajo' }, { status: 500 });
  }
}
