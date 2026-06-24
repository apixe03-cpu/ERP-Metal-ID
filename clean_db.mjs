import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando limpieza de base de datos...");

  // Borrar en orden para evitar problemas de Foreign Keys
  await prisma.auditLog.deleteMany({});
  await prisma.fileAttachment.deleteMany({});
  await prisma.workOrderProcess.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.sheetPurchase.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.finishedProductInventory.deleteMany({});
  await prisma.productTemplate.deleteMany({});

  console.log("¡Base de datos limpiada con éxito! (Se conservó la configuración)");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
