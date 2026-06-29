import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const filename = params.filename;
    
    // Ruta absoluta al archivo en el disco
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    const buffer = await readFile(filepath);
    
    // Determinar el Content-Type correcto
    let contentType = 'application/octet-stream';
    const lowerName = filename.toLowerCase();
    
    if (lowerName.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (lowerName.endsWith('.pdf')) contentType = 'application/pdf';
    else if (lowerName.endsWith('.png')) contentType = 'image/png';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lowerName.endsWith('.dxf')) contentType = 'application/dxf';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        // Añadir cabecera para que DXF se descargue en vez de intentar abrirse como texto en algunos navegadores
        ...(contentType === 'application/dxf' && { 'Content-Disposition': `attachment; filename="${filename}"` })
      },
    });
  } catch (error) {
    console.error("Error sirviendo archivo:", error);
    return new NextResponse('Archivo no encontrado', { status: 404 });
  }
}
