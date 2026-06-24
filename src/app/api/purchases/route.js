import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { materialId, widthMm, heightMm, quantity, providerName, receiptNumber } = body;

    const mat = await prisma.materialThickness.findUnique({ where: { id: materialId } });
    if (!mat) return NextResponse.json({ error: 'Material no válido' }, { status: 400 });

    const widthM = widthMm / 1000;
    const heightM = heightMm / 1000;
    const calculatedSqM = (widthM * heightM) * quantity;

    // Registrar la compra
    const purchase = await prisma.sheetPurchase.create({
      data: {
        material: mat.material,
        thickness: mat.thickness,
        widthMm,
        heightMm,
        quantity,
        providerName,
        receiptNumber,
        calculatedSqM
      }
    });

    // Sumar al inventario
    const inventoryItem = await prisma.inventory.findFirst({
      where: { material: mat.material, thickness: mat.thickness }
    });

    if (inventoryItem) {
      await prisma.inventory.update({
        where: { id: inventoryItem.id },
        data: { quantitySqM: { increment: calculatedSqM } }
      });
    } else {
      await prisma.inventory.create({
        data: {
          material: mat.material,
          thickness: mat.thickness,
          quantitySqM: calculatedSqM
        }
      });
    }

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error registrando compra' }, { status: 500 });
  }
}
