import prisma from "@/lib/prisma";
import EntregadosClient from "./EntregadosClient";
import "./Entregados.css";

export const dynamic = "force-dynamic";


export default async function EntregadosPage() {
  const deliveries = await prisma.delivery.findMany({
    where: { deliveryType: { not: 'ALTA_STOCK' } },
    orderBy: { deliveredAt: 'desc' },
    include: {
      workOrder: {
        include: {
          processes: {
            orderBy: { orderIndex: 'asc' },
            include: { employee: true }
          },
          files: true
        }
      }
    }
  });

  const stockPropio = await prisma.finishedProductInventory.findMany({
    orderBy: { productName: 'asc' }
  });

  const stockHistory = await prisma.delivery.findMany({
    where: { deliveryType: 'ALTA_STOCK' },
    include: {
      workOrder: {
        include: {
          processes: {
            orderBy: { orderIndex: 'asc' },
            include: { employee: true }
          },
          files: true
        }
      }
    },
    orderBy: { deliveredAt: 'desc' }
  });

  const templates = await prisma.productTemplate.findMany({
    include: { files: true }
  });

  const stockWithTemplates = stockPropio.map(s => {
    let t = s.templateId ? templates.find(temp => temp.id === s.templateId) : null;
    if (!t) {
      t = templates.find(temp => temp.title.trim() === s.productName.trim());
    }
    return {
      ...s,
      template: t || null
    };
  });

  return (
    <main className="dashboard-container">
      <header className="header glass">
        <div>
          <h1>Trabajos Finalizados e Inventario</h1>
          <p>Gestión de entregas a clientes y stock propio de la empresa</p>
        </div>
      </header>
      <EntregadosClient 
        initialDeliveries={deliveries} 
        initialStock={stockWithTemplates} 
        stockHistory={stockHistory} 
      />
    </main>
  );
}
