"use client";
import { useState } from "react";
import { PlusCircle, Play, Package } from "lucide-react";
import NewTemplateModal from "./NewTemplateModal";
import ProduceTemplateModal from "./ProduceTemplateModal";

export default function CatalogClient({ initialTemplates, materialsConfig, workCenters = [] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [producingTemplate, setProducingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const refreshTemplates = async () => {
    // Si queremos actualizar por fetch, o por ahora recargamos la página simple
    window.location.reload();
  };

  return (
    <>
      <header className="header glass">
        <div>
          <h1>Catálogo de Productos</h1>
          <p>Plantillas guardadas para envío rápido a producción</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTemplate(null); setIsNewModalOpen(true); }}>
          <PlusCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
          Nueva Plantilla
        </button>
      </header>

      <div className="catalog-grid">
        {templates.map(tpl => (
          <div key={tpl.id} className="catalog-card glass-card">
              
              {/* Miniatura si hay un DXF guardado en la plantilla */}
              {tpl.files && tpl.files.find(f => f.type === "DXF") && (
                <div style={{ background: 'white', borderRadius: '8px 8px 0 0', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <img 
                    src={`${tpl.files.find(f => f.type === "DXF").url}.svg`} 
                    alt="Plano DXF" 
                    style={{ width: '100%', height: '120px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{tpl.title}</h3>
                  <p className="text-muted">{tpl.widthMm}x{tpl.heightMm}mm - {tpl.thickness}</p>
                </div>
                <button 
                  className="btn-icon" 
                  onClick={() => { setEditingTemplate(tpl); setIsNewModalOpen(true); }}
                  title="Editar Plantilla"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </div>
            <div className="catalog-details">
              {tpl.description && <p className="text-muted">{tpl.description}</p>}
              <div className="catalog-meta">
                {tpl.thickness && <span className="badge">Espesor: {tpl.thickness}</span>}
                {tpl.widthMm && tpl.heightMm && (
                  <span className="badge">Medida: {tpl.widthMm}x{tpl.heightMm}mm</span>
                )}
              </div>
              <div className="catalog-processes" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-color)' }}>
                <strong>Ruta: </strong> 
                {(() => {
                  try {
                    const procs = JSON.parse(tpl.processesJson);
                    return procs.map(p => p.replace("_", " ")).join(" ➔ ");
                  } catch (e) { return "Sin ruta definida"; }
                })()}
              </div>
            </div>
            <button 
              className="btn btn-primary btn-produce"
              onClick={() => setProducingTemplate(tpl)}
            >
              <Play size={18} /> Producir
            </button>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="empty-state">No hay plantillas guardadas. Crea una para empezar.</div>
        )}
      </div>

      <NewTemplateModal 
        isOpen={isNewModalOpen}
        onClose={() => { setIsNewModalOpen(false); setEditingTemplate(null); }}
        onSaved={refreshTemplates}
        materialsConfig={materialsConfig}
        initialData={editingTemplate}
        workCenters={workCenters}
      />

      <ProduceTemplateModal
        template={producingTemplate}
        isOpen={!!producingTemplate}
        onClose={() => setProducingTemplate(null)}
        onProduced={() => {
          alert("¡Orden enviada a producción exitosamente!");
          setProducingTemplate(null);
        }}
        workCenters={workCenters}
      />
    </>
  );
}
