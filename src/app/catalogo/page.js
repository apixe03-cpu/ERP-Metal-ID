import prisma from "@/lib/prisma";
import CatalogClient from "./CatalogClient";
import "./Catalogo.css";

export default async function CatalogoPage() {
  const templates = await prisma.productTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { files: true }
  });

  const materials = await prisma.materialThickness.findMany({
    orderBy: [{ material: 'asc' }, { thickness: 'asc' }]
  });

  const workCenters = await prisma.workCenter.findMany({
    orderBy: { name: 'asc' }
  });

  // Pasamos los datos a un componente cliente para manejar interacciones (modales, crear, producir)
  return (
    <main className="dashboard-container">
      <CatalogClient initialTemplates={templates} materialsConfig={materials} workCenters={workCenters} />
    </main>
  );
}
