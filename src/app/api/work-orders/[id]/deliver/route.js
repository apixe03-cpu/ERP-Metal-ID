import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { destination, clientName, remitoNumber, deliveryType, address } = body;

    // Obtenemos el último proceso completado (orderIndex desc)
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { processes: { orderBy: { orderIndex: 'desc' } } }
    });

    if (!workOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // finalGoodQty es la cantidad de buenas del último proceso que fue TERMINADO
    const lastProcess = workOrder.processes.find(p => p.status === 'TERMINADO');
    const finalGoodQty = lastProcess ? lastProcess.goodQuantity : workOrder.expectedQuantity;

    // Transacción para marcar como entregado y registrar el destino
    await prisma.$transaction(async (tx) => {
      // 1. Marcar como entregado
      await tx.workOrder.update({
        where: { id },
        data: { isDelivered: true }
      });

      // 2. Dependiendo del destino, creamos la entrega o el stock
      if (destination === 'CLIENTE') {
        await tx.delivery.create({
          data: {
            workOrderId: id,
            clientName: clientName,
            remitoNumber: remitoNumber || 'S/N',
            deliveryType: deliveryType || 'RETIRO',
            address: address || null
          }
        });
      } else if (destination === 'STOCK_INTERNO') {
        // Buscamos si ya existe ese producto en stock, sino lo creamos
        const productName = workOrder.title.replace('Lote: ', '').trim();
        const existingStock = await tx.finishedProductInventory.findUnique({
          where: { productName }
        });

        if (existingStock) {
          await tx.finishedProductInventory.update({
            where: { id: existingStock.id },
            data: { 
              quantity: existingStock.quantity + finalGoodQty,
              templateId: workOrder.templateId || existingStock.templateId
            }
          });
        } else {
          await tx.finishedProductInventory.create({
            data: {
              productName,
              quantity: finalGoodQty,
              templateId: workOrder.templateId || null
            }
          });
        }

        // Crear registro en Delivery para historial de fabricaciones
        await tx.delivery.create({
          data: {
            workOrderId: id,
            clientName: "STOCK PROPIO",
            remitoNumber: `PROD-${id.substring(0, 5).toUpperCase()}`,
            deliveryType: "ALTA_STOCK"
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delivery:', error);
    return NextResponse.json({ error: 'Error processing delivery' }, { status: 500 });
  }
}
