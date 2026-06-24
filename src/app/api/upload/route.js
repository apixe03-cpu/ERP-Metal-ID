import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { Helper } from 'dxf';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const workOrderId = formData.get('workOrderId');
    const templateId = formData.get('templateId');

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar el archivo original
    const uniqueName = `${Date.now()}-${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, uniqueName);
    await writeFile(filepath, buffer);

    const fileExt = file.name.split('.').pop().toLowerCase();
    let fileType = "IMAGE";
    if (fileExt === 'pdf') fileType = "PDF";
    if (fileExt === 'dxf') fileType = "DXF";

    // Magia de DXF -> SVG
    if (fileType === "DXF") {
      try {
        const dxfString = buffer.toString('utf-8');
        const helper = new Helper(dxfString);
        const svg = helper.toSVG();
        
        // Guardar la miniatura generada
        const svgName = `${uniqueName}.svg`;
        const svgPath = join(uploadDir, svgName);
        await writeFile(svgPath, svg);
        // Podríamos guardar esta URL del SVG en un nuevo campo de miniatura, pero para simplificar,
        // cuando es DXF, el Frontend puede inferir que existe la miniatura sumando '.svg' al final del nombre.
      } catch (e) {
        console.error("Error parsing DXF:", e);
      }
    }

    // Crear el registro en Prisma
    const attachment = await prisma.fileAttachment.create({
      data: {
        name: file.name,
        type: fileType,
        url: `/uploads/${uniqueName}`, // La url original
        workOrderId: workOrderId || null,
        templateId: templateId || null,
      }
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
