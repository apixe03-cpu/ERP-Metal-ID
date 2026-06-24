import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const dynamic = "force-dynamic";


export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const attachment = await prisma.fileAttachment.findUnique({ where: { id } });
    if (!attachment) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Borrar de base de datos
    await prisma.fileAttachment.delete({ where: { id } });

    // Borrar del disco (original y svg si existe)
    try {
      const uploadDir = join(process.cwd(), 'public');
      const filename = attachment.url.replace('/uploads/', '');
      const filepath = join(uploadDir, 'uploads', filename);
      await unlink(filepath);

      if (attachment.type === 'DXF') {
        const svgPath = join(uploadDir, 'uploads', `${filename}.svg`);
        await unlink(svgPath).catch(() => {}); // Ignorar si no existe el SVG
      }
    } catch (fsError) {
      console.error("Error deleting file from disk:", fsError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
}
