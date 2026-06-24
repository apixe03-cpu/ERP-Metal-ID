"use client";
import { useState } from "react";
import { Layers, Trash2 } from "lucide-react";
import AdjustStockModal from "./AdjustStockModal";

export default function InventoryClient({ initialInventory, materialsConfig = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Evitar abrir el modal de edición
    if (!confirm("¿Seguro que deseas eliminar este registro de inventario?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="header glass">
        <div>
          <h1>Inventario de Materiales</h1>
          <p>Control de stock de chapas (Metros Cuadrados)</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
          Ajustar Stock Manual
        </button>
      </header>

      <section className="inventory-grid">
        {initialInventory.map((item) => (
          <div 
            key={item.id} 
            className={`inventory-card glass clickable ${item.quantitySqM < 0 ? 'alert' : ''}`}
            onClick={() => handleOpenModal(item)}
          >
            <div className="inv-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={24} className="inv-icon" />
                <h3>{item.thickness}</h3>
              </div>
              <button 
                className="btn-icon-danger" 
                onClick={(e) => handleDelete(e, item.id)}
                title="Eliminar registro"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="inv-body">
              <span className="material-name">{item.material}</span>
              <div className="inv-quantity">
                <span className="amount">{item.quantitySqM.toFixed(2)}</span>
                <span className="unit">m²</span>
              </div>
              
              {(() => {
                const config = materialsConfig.find(m => m.material === item.material && m.thickness === item.thickness);
                if (config && config.sheetWidthMm && config.sheetHeightMm) {
                  const sheetSqM = (config.sheetWidthMm * config.sheetHeightMm) / 1000000;
                  if (sheetSqM > 0) {
                    const planchas = item.quantitySqM / sheetSqM;
                    return (
                      <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginTop: '0.2rem', textAlign: 'center' }}>
                        ~ {planchas.toFixed(1)} planchas
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
            {item.quantitySqM < 0 && (
              <div className="inv-footer danger">
                ⚠️ Stock negativo. Registre una compra.
              </div>
            )}
          </div>
        ))}
        {initialInventory.length === 0 && (
          <div className="empty-inventory glass">
            No hay registros de inventario aún. Crea un trabajo de corte para inicializar el espesor o agrega stock manualmente.
          </div>
        )}
      </section>

      <AdjustStockModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }} 
        onUpdated={() => window.location.reload()} 
        materialsConfig={materialsConfig}
        defaultItem={selectedItem}
      />
    </>
  );
}
