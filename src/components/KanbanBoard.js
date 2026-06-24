"use client";
import { useState, useEffect } from "react";
import NewWorkOrderModal from "./NewWorkOrderModal";
import WorkOrderDetailModal from "./WorkOrderDetailModal";
import DeliverOrderModal from "./DeliverOrderModal";
import BulkDeliverOrderModal from "./BulkDeliverOrderModal";
import { PlusCircle, Layers, CheckSquare, Square } from "lucide-react";
import "./Kanban.css";

import "./Kanban.css";

export default function KanbanBoard({ materialsConfig = [], employees = [], workCenters = [] }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedFinishedOrder, setSelectedFinishedOrder] = useState(null);
  
  // Multi-select state
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch("/api/work-orders");
      const data = await res.json();
      setWorkOrders(data);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para encontrar en qué proceso está actualmente un trabajo
  const getActiveProcess = (order) => {
    if (!order.processes || order.processes.length === 0) return null;
    
    // Busca el primer proceso que no esté terminado
    const active = order.processes.find(p => p.status === 'PENDIENTE' || p.status === 'EN_CURSO' || p.status === 'PAUSADO');
    
    // Si todos están terminados, retornamos un pseudo-estado "TERMINADO"
    if (!active) {
      return { processName: "TERMINADO", status: "TERMINADO" };
    }
    return active;
  };

  const getOrdersByColumn = (columnName) => {
    let filtered = workOrders.filter(order => {
      const activeProcess = getActiveProcess(order);
      return activeProcess && activeProcess.processName === columnName;
    });

    const priorityWeight = { 'ALTA': 3, 'NORMAL': 2, 'BAJA': 1 };

    filtered.sort((a, b) => {
      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;

      // 1. Ordenar por prioridad primero (mayor a menor)
      if (pA !== pB) {
        return pB - pA;
      }

      // 2. Si es CORTE_LASER y tienen misma prioridad, ordenar por espesor
      if (columnName === "CORTE_LASER") {
        if (!a.thickness) return 1;
        if (!b.thickness) return -1;
        return a.thickness.localeCompare(b.thickness);
      }

      // 3. Para misma prioridad en otros centros, el orden de llegada (createdAt)
      // ya viene por defecto desde la base de datos (más nuevos primero).
      return 0; 
    });

    return filtered;
  };

  // Para mostrar los terminados, filtrando solo los que no están isDelivered
  const finishedOrders = workOrders.filter(order => !order.isDelivered && getActiveProcess(order)?.processName === "TERMINADO");

  if (loading) return <div className="kanban-loading">Cargando tablero...</div>;

  return (
    <div className="kanban-container-full">
      <div className="kanban-actions">
        <button className="btn btn-primary btn-icon" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          <span>Nuevo Trabajo</span>
        </button>
      </div>
      
      <div className="kanban-wrapper">
        {workCenters.map(center => (
          <div key={center.name} className="kanban-column glass">
            <h2 className="kanban-column-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{center.name}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                {getOrdersByColumn(center.name).length}
              </span>
            </h2>
            <div className="kanban-column-content">
              {getOrdersByColumn(center.name).map(order => {
                const isActivePaused = getActiveProcess(order)?.status === "PAUSADO";
                return (
                <div key={order.id} className="kanban-card glass-card" style={{ border: isActivePaused ? '2px solid var(--danger-color)' : '' }} onClick={() => setSelectedOrder(order)}>
                  <div className="card-header">
                    <h3 style={{ color: isActivePaused ? 'var(--danger-color)' : 'inherit' }}>
                      {order.title}
                      {isActivePaused && " ⚠️"}
                    </h3>
                    <span className={`badge ${order.priority.toLowerCase()}`}>
                      {order.priority}
                    </span>
                  </div>

                  {/* Renderizar miniatura si existe un archivo DXF */}
                  {(() => {
                    if (!order.files) return null;
                    const thumbFile = order.files.find(f => f.isThumbnail) || order.files.find(f => f.type === "DXF");
                    if (!thumbFile) return null;
                    return (
                      <div className="card-thumbnail" style={{ background: 'white', borderRadius: '4px', padding: '0.5rem', marginBottom: '0.5rem' }}>
                        <img 
                          src={`${thumbFile.url}.svg`} 
                          alt="Plano DXF" 
                          style={{ width: '100%', height: '80px', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    );
                  })()}
                  
                  {/* Agrupación visual y métricas */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span className="badge badge-qty" style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', fontWeight: 'bold' }}>
                      {order.expectedQuantity} uds
                    </span>
                    {order.thickness && (
                      <span className="badge badge-thickness" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {order.material ? `${order.material} - ` : ''}{order.thickness}
                      </span>
                    )}
                  </div>

                  <div className="progress-info">
                    {order.processes && order.processes.length > 0 && (
                      <span className="step-count">
                        Paso {order.processes.findIndex(p => p.status !== 'TERMINADO') + 1} de {order.processes.length}
                      </span>
                    )}
                  </div>
                </div>
              )})}
              {getOrdersByColumn(center.name).length === 0 && (
                <p className="empty-state">Sin trabajos</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Columna especial de Terminados */}
        <div key="TERMINADO" className="kanban-column glass finished-column">
          <h2 className="kanban-column-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>TERMINADO</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                {finishedOrders.length}
              </span>
            </div>
            {finishedOrders.length > 0 && (
              <button 
                className={`btn ${isMultiSelect ? 'btn-primary' : 'btn-secondary'} btn-icon`} 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', margin: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMultiSelect(!isMultiSelect);
                  setSelectedForBulk([]);
                }}
              >
                <CheckSquare size={14} />
                <span>{isMultiSelect ? "Cancelar" : "Multiselección"}</span>
              </button>
            )}
          </h2>
          <div className="kanban-column-content">
            {finishedOrders.map(order => {
              const isSelected = selectedForBulk.includes(order);
              return (
                <div 
                  key={order.id} 
                  className={`kanban-card glass-card success-card ${isSelected ? 'selected-bulk' : ''}`} 
                  onClick={() => {
                    if (isMultiSelect) {
                      if (isSelected) {
                        setSelectedForBulk(selectedForBulk.filter(o => o.id !== order.id));
                      } else {
                        setSelectedForBulk([...selectedForBulk, order]);
                      }
                    } else {
                      setSelectedFinishedOrder(order);
                    }
                  }}
                  style={{ cursor: 'pointer', border: isSelected ? '2px solid var(--accent-color)' : '' }}
                >
                  {isMultiSelect && (
                    <div style={{ float: 'right', color: isSelected ? 'var(--accent-color)' : 'gray' }}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  )}
                  <h3 style={{ width: isMultiSelect ? '80%' : '100%' }}>{order.title}</h3>
                  <span className="badge baja">Completado</span>
                </div>
              );
            })}
            {finishedOrders.length === 0 && <p className="empty-state">Sin trabajos</p>}
            
            {isMultiSelect && selectedForBulk.length > 0 && (
              <button 
                className="btn btn-primary w-100 mt-2" 
                onClick={() => setIsBulkModalOpen(true)}
              >
                Entregar Seleccionados ({selectedForBulk.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <NewWorkOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchWorkOrders} 
        materialsConfig={materialsConfig}
      />

      <WorkOrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        employees={employees}
        onUpdated={() => {
          fetchWorkOrders();
          setSelectedOrder(null);
        }}
      />

      <DeliverOrderModal
        order={selectedFinishedOrder}
        isOpen={!!selectedFinishedOrder}
        onClose={() => setSelectedFinishedOrder(null)}
        onDelivered={() => {
          fetchWorkOrders();
          setSelectedFinishedOrder(null);
        }}
      />

      <BulkDeliverOrderModal
        orders={selectedForBulk}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onDelivered={() => {
          fetchWorkOrders();
          setIsBulkModalOpen(false);
          setIsMultiSelect(false);
          setSelectedForBulk([]);
        }}
      />
    </div>
  );
}
