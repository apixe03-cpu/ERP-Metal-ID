import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    const attachment = await prisma.fileAttachment.findUnique({ where: { id } });
    if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Desmarcar todos los de esta misma orden o plantilla
    if (attachment.workOrderId) {
      await prisma.fileAttachment.updateMany({
        where: { workOrderId: attachment.workOrderId },
        data: { isThumbnail: false }
      });
    } else if (attachment.templateId) {
      await prisma.fileAttachment.updateMany({
        where: { templateId: attachment.templateId },
        data: { isThumbnail: false }
      });
    }

    // Marcar el seleccionado
    const updated = await prisma.fileAttachment.update({
      where: { id },
      data: { isThumbnail: true }
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error setting thumbnail' }, { status: 500 });
  }
}
