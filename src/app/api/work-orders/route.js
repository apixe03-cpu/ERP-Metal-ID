import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        processes: {
          orderBy: { orderIndex: 'asc' },
          include: { employee: true }
        },
        files: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching work orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, priority, material, thickness, expectedQuantity, widthMm, heightMm, processes, templateFiles, fileIds, templateId } = body;
    
    // Si tenemos dimensiones y espesor, intentamos descontar del inventario
    if (thickness && widthMm && heightMm && processes.includes('CORTE_LASER')) {
      // Area en metros cuadrados para la cantidad esperada de piezas
      // (Ancho x Alto en mm) / 1,000,000 = m² por pieza
      const sqMetersPerPiece = (widthMm * heightMm) / 1000000;
      const totalSqMeters = sqMetersPerPiece * expectedQuantity;
      
      const inventoryItem = await prisma.inventory.findFirst({
        where: { thickness: thickness }
      });
      
      if (inventoryItem) {
        // Descontamos si hay un registro en inventario para este espesor
        await prisma.inventory.update({
          where: { id: inventoryItem.id },
          data: {
            quantitySqM: { decrement: totalSqMeters }
          }
        });
      } else {
        // Si no existe, lo creamos con saldo negativo (así saben que deben comprar/ajustar)
        await prisma.inventory.create({
          data: {
            material: 'Acero al Carbono',
            thickness: thickness,
            quantitySqM: -totalSqMeters
          }
        });
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        title,
        description,
        priority: priority || 'NORMAL',
        material: material || null,
        thickness: thickness || null,
        expectedQuantity: expectedQuantity || 1,
        widthMm: widthMm || null,
        heightMm: heightMm || null,
        templateId: templateId || null,
        processes: {
          create: processes.map((proc, index) => ({
            processName: proc,
            orderIndex: index + 1,
            status: index === 0 ? 'PENDIENTE' : 'EN_CURSO' 
            // Inicialmente los demás pueden estar en EN_CURSO o PENDIENTE.
            // Para que la UI no se confunda, mejor ponerlos en PENDIENTE todos, y la UI filtra por el primero que no esté TERMINADO.
          }))
        },
        files: templateFiles && templateFiles.length > 0 ? {
          create: templateFiles.map(f => ({
            name: f.name,
            url: f.url,
            type: f.type
          }))
        } : undefined
      },
      include: {
        processes: true,
        files: true
      }
    });

    // Corrección para que solo el primer paso esté PENDIENTE si queremos mantener lógica estricta,
    // o simplemente los guardamos todos como PENDIENTE y la UI busca el primero.
    // Lo guardé como EN_CURSO el resto en el código viejo, pero mejor los pongo a todos PENDIENTE:
    await prisma.workOrderProcess.updateMany({
      where: { workOrderId: workOrder.id },
      data: { status: 'PENDIENTE' }
    });

    if (fileIds && fileIds.length > 0) {
      await prisma.fileAttachment.updateMany({
        where: { id: { in: fileIds } },
        data: { workOrderId: workOrder.id }
      });
    }
    
    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating work order' }, { status: 500 });
  }
}
