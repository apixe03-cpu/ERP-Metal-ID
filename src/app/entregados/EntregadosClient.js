"use client";
import { useState } from "react";
import { Truck, Package, Search, RotateCcw, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import EditDeliveryModal from "@/components/EditDeliveryModal";
import AdjustStockPropioModal from "@/components/AdjustStockPropioModal";
import DeliveredDetailModal from "@/components/DeliveredDetailModal";

export default function EntregadosClient({ initialDeliveries, initialStock, stockHistory = [] }) {
  const [activeTab, setActiveTab] = useState("CLIENTES");
  const [search, setSearch] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const router = useRouter();

  const filteredDeliveries = initialDeliveries.filter(d => 
    d.clientName.toLowerCase().includes(search.toLowerCase()) || 
    d.workOrder.title.toLowerCase().includes(search.toLowerCase()) ||
    d.remitoNumber.includes(search)
  );

  const filteredStock = initialStock.filter(s => 
    s.productName.toLowerCase().includes(search.toLowerCase())
  );

  const handleRepeatJob = async (order) => {
    if (!confirm(`¿Crear una copia exacta del trabajo: ${order.title}?`)) return;
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${order.title} (Copia)`,
          priority: order.priority,
          thickness: order.thickness,
          expectedQuantity: order.expectedQuantity,
          widthMm: order.widthMm,
          heightMm: order.heightMm,
          processes: ["CORTE_LASER", "PLEGADO", "SOLDADURA", "PINTURA"]
        })
      });
      if (res.ok) {
        alert("Trabajo copiado al Tablero de Producción.");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="tabs-container glass">
        <button 
          className={`tab-btn ${activeTab === 'CLIENTES' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLIENTES')}
        >
          <Truck size={18} /> Entregas a Clientes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'STOCK' ? 'active' : ''}`}
          onClick={() => setActiveTab('STOCK')}
        >
          <Package size={18} /> Inventario de Stock Propio
        </button>
      </div>

      <div className="search-bar glass mb-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
        <Search size={20} className="text-muted" />
        <input 
          type="text" 
          placeholder="Buscar por cliente, producto o remito..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'white' }}
        />
      </div>

      {activeTab === 'CLIENTES' && (
        <div className="deliveries-list">
          <table className="data-table glass">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Remito</th>
                <th>Producto (Trabajo)</th>
                <th>Cantidad</th>
                <th>Modalidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery.id}>
                  <td>{new Date(delivery.deliveredAt).toLocaleDateString()}</td>
                  <td><strong>{delivery.clientName}</strong></td>
                  <td>{delivery.remitoNumber}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => setSelectedWorkOrder(delivery.workOrder)}
                    >
                      <Eye size={14} style={{ marginRight: '0.2rem' }}/> Ver Detalle
                    </button>
                    <div style={{ marginTop: '0.2rem' }}>
                      <strong>{delivery.workOrder.title}</strong>
                    </div>
                  </td>
                  <td>{delivery.workOrder.expectedQuantity} uds</td>
                  <td>{delivery.deliveryType}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-icon" 
                        title="Modificar Entrega"
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Fabricar de nuevo"
                        onClick={() => handleRepeatJob(delivery.workOrder)}
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">No se encontraron entregas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'STOCK' && (
        <div className="inventory-grid">
          {filteredStock.map(item => (
            <div 
              key={item.id} 
              className="inventory-card glass clickable" 
              onClick={() => setSelectedStock(item)}
            >
              <div className="inv-header">
                <h3>{item.productName}</h3>
                <Package size={24} className="inv-icon" />
              </div>
              <div className="inv-body">
                <span className="material-name">Unidades Terminadas</span>
                <div className="inv-quantity">
                  <span className="amount">{item.quantity}</span>
                  <span className="unit">uds</span>
                </div>
              </div>
            </div>
          ))}
          {filteredStock.length === 0 && (
            <div className="empty-state glass">No hay stock propio registrado.</div>
          )}
        </div>
      )}

      <EditDeliveryModal
        delivery={selectedDelivery}
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onUpdated={() => {
          setSelectedDelivery(null);
          window.location.reload();
        }}
      />

      <AdjustStockPropioModal
        stockItem={selectedStock}
        history={selectedStock ? stockHistory.filter(h => {
          // El title es "Lote: Nombre", remito "PROD-..."
          return h.workOrder?.title?.includes(selectedStock.productName);
        }) : []}
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        onUpdated={() => {
          setSelectedStock(null);
          window.location.reload();
        }}
      />

      <DeliveredDetailModal
        isOpen={selectedWorkOrder !== null}
        onClose={() => setSelectedWorkOrder(null)}
        order={selectedWorkOrder}
      />
    </>
  );
}
