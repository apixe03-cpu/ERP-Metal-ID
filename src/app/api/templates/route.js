import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";


export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, material, thickness, widthMm, heightMm, processes, fileIds } = body;
    
    const template = await prisma.productTemplate.create({
      data: {
        title,
        description,
        material,
        thickness,
        widthMm: parseFloat(widthMm),
        heightMm: parseFloat(heightMm),
        processesJson: JSON.stringify(processes)
      }
    });

    if (fileIds && fileIds.length > 0) {
      await prisma.fileAttachment.updateMany({
        where: { id: { in: fileIds } },
        data: { templateId: template.id }
      });
    }
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating template' }, { status: 500 });
  }
}
