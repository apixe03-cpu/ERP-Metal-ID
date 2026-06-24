import prisma from "@/lib/prisma";
import "./Inventario.css";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";


export default async function InventarioPage() {
  const inventory = await prisma.inventory.findMany({
    orderBy: { thickness: 'asc' }
  });

  const materials = await prisma.materialThickness.findMany({
    orderBy: [{ material: 'asc' }, { thickness: 'asc' }]
  });

  return (
    <main className="dashboard-container">
      <InventoryClient initialInventory={inventory} materialsConfig={materials} />
    </main>
  );
}
