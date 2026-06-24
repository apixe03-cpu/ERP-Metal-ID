import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updated = await prisma.productTemplate.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        material: body.material,
        thickness: body.thickness,
        widthMm: body.widthMm,
        heightMm: body.heightMm,
        processesJson: JSON.stringify(body.processes)
      }
    });

    // Sincronizar WorkOrders activas (no terminadas)
    const activeOrders = await prisma.workOrder.findMany({
      where: { templateId: id, isDelivered: false },
      include: { processes: true }
    });

    for (let order of activeOrders) {
      const isFinished = order.processes.length > 0 && order.processes.every(p => p.status === 'TERMINADO');
      if (!isFinished) {
        await prisma.workOrder.update({
          where: { id: order.id },
          data: {
            title: `Lote: ${body.title}`,
            description: body.description,
            material: body.material,
            thickness: body.thickness,
            widthMm: body.widthMm,
            heightMm: body.heightMm
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating template' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.productTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting template' }, { status: 500 });
  }
}
