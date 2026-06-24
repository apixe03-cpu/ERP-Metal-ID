import KanbanBoard from "@/components/KanbanBoard";
import prisma from "@/lib/prisma";

export default async function Home() {
  const materials = await prisma.materialThickness.findMany({
    orderBy: [{ material: 'asc' }, { thickness: 'asc' }]
  });

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' }
  });

  const workCenters = await prisma.workCenter.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="dashboard-container">
      <section className="kanban-section">
        <KanbanBoard materialsConfig={materials} employees={employees} workCenters={workCenters} />
      </section>
    </main>
  );
}
