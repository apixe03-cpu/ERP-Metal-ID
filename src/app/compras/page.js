import prisma from "@/lib/prisma";
import ComprasClient from "./ComprasClient";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const materials = await prisma.materialThickness.findMany({
    orderBy: { material: 'asc' }
  });

  const purchases = await prisma.sheetPurchase.findMany({
    orderBy: { purchasedAt: 'desc' }
  });

  return (
    <main className="dashboard-container">
      <header className="header glass">
        <div>
          <h1>Compras de Chapa</h1>
          <p>Registro de material entrante e historial de facturas</p>
        </div>
      </header>
      <ComprasClient materials={materials} initialPurchases={purchases} />
    </main>
  );
}
