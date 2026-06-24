import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function POST(request) {
  try {
    const body = await request.json();
    const { orderIds, clientName, remitoNumber, deliveryType, address } = body;

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json({ error: 'No hay trabajos seleccionados' }, { status: 400 });
    }

    // Buscamos las órdenes con sus procesos
    const orders = await prisma.workOrder.findMany({
      where: { id: { in: orderIds } },
      include: { processes: { orderBy: { orderIndex: 'desc' }, take: 1 } }
    });

    // Procesamos en una transacción
    await prisma.$transaction(async (tx) => {
      for (const order of orders) {
        // Generar el delivery
        await tx.delivery.create({
          data: {
            workOrderId: order.id,
            clientName,
            remitoNumber,
            deliveryType,
            address: deliveryType === 'ENVIO' ? address : null
          }
        });

        // Marcar como entregado
        await tx.workOrder.update({
          where: { id: order.id },
          data: { isDelivered: true }
        });

        // Si es ALTA_STOCK, sumar al inventario de productos terminados
        if (deliveryType === 'ALTA_STOCK') {
          const lastProcess = order.processes[0];
          const qtyToAdd = lastProcess ? lastProcess.goodQuantity : order.expectedQuantity;

          await tx.finishedProductInventory.upsert({
            where: { productName: order.title },
            update: { quantity: { increment: qtyToAdd } },
            create: { productName: order.title, quantity: qtyToAdd, templateId: order.templateId }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error bulk delivering:", error);
    return NextResponse.json({ error: 'Error procesando la entrega múltiple' }, { status: 500 });
  }
}
