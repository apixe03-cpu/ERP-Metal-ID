"use client";
import { useState } from "react";
import { PlusCircle, Trash2, Layers, Users, Edit, Save, Settings, Eye, EyeOff } from "lucide-react";

export default function ConfigClient({ initialMaterials, initialEmployees = [], initialWorkCenters = [] }) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [employees, setEmployees] = useState(initialEmployees);
  const [workCenters, setWorkCenters] = useState(initialWorkCenters);
  
  const [newMaterial, setNewMaterial] = useState("");
  const [newThickness, setNewThickness] = useState("");
  const [newSheetWidthMm, setNewSheetWidthMm] = useState("");
  const [newSheetHeightMm, setNewSheetHeightMm] = useState("");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpPin, setNewEmpPin] = useState("");
  const [newCenterName, setNewCenterName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPins, setShowPins] = useState({});
  
  // Estados de edición
  const [editMatId, setEditMatId] = useState(null);
  const [editMat, setEditMat] = useState({ material: "", thickness: "", sheetWidthMm: "", sheetHeightMm: "" });
  const [editCenterId, setEditCenterId] = useState(null);
  const [editCenterName, setEditCenterName] = useState("");

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial || !newThickness) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          material: newMaterial, 
          thickness: newThickness,
          sheetWidthMm: newSheetWidthMm || null,
          sheetHeightMm: newSheetHeightMm || null
        })
      });
      
      if (res.ok) {
        const added = await res.json();
        setMaterials([...materials, added].sort((a, b) => a.material.localeCompare(b.material) || a.thickness.localeCompare(b.thickness)));
        setNewThickness("");
        setNewSheetWidthMm("");
        setNewSheetHeightMm("");
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este material?")) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) setMaterials(materials.filter(m => m.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleUpdateMaterial = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMat)
      });
      if (res.ok) {
        const updated = await res.json();
        setMaterials(materials.map(m => m.id === id ? updated : m).sort((a, b) => a.material.localeCompare(b.material)));
        setEditMatId(null);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPin) return;
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEmpName, pin: newEmpPin, role: "OPERATOR" })
      });
      if (res.ok) {
        const added = await res.json();
        setEmployees([...employees, added].sort((a, b) => a.name.localeCompare(b.name)));
        setNewEmpName(""); setNewEmpPin("");
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este empleado? No podrá registrar avances.")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) setEmployees(employees.filter(e => e.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleAddCenter = async (e) => {
    e.preventDefault();
    if (!newCenterName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/work-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCenterName })
      });
      if (res.ok) {
        const added = await res.json();
        setWorkCenters([...workCenters, added].sort((a,b) => a.name.localeCompare(b.name)));
        setNewCenterName("");
      } else {
        const err = await res.json(); alert(err.error);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteCenter = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este centro de trabajo?")) return;
    try {
      const res = await fetch(`/api/work-centers/${id}`, { method: "DELETE" });
      if (res.ok) setWorkCenters(workCenters.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleUpdateCenter = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/work-centers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCenterName })
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkCenters(workCenters.map(c => c.id === id ? updated : c).sort((a,b) => a.name.localeCompare(b.name)));
        setEditCenterId(null);
      } else {
        const err = await res.json(); alert(err.error);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="config-grid">
      <div className="config-card glass">
        <div className="config-header">
          <Layers className="config-icon" size={24} />
          <h2>Materiales y Espesores</h2>
        </div>
        <p className="text-muted mb-4">
          Estos son los espesores que aparecerán en los formularios de Nuevo Trabajo y Catálogo.
        </p>

        <form className="add-material-form form-group" onSubmit={handleAddMaterial}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Material (ej: Acero Inox)" 
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              required 
              style={{ flex: 2, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <input 
              type="text" 
              placeholder="Espesor (ej: 1.2mm)" 
              value={newThickness}
              onChange={(e) => setNewThickness(e.target.value)}
              required 
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <input 
              type="number" 
              placeholder="Ancho plancha mm (opcional)" 
              value={newSheetWidthMm}
              onChange={(e) => setNewSheetWidthMm(e.target.value)}
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <input 
              type="number" 
              placeholder="Alto plancha mm (opcional)" 
              value={newSheetHeightMm}
              onChange={(e) => setNewSheetHeightMm(e.target.value)}
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={18} /> Agregar
            </button>
          </div>
        </form>

        <div className="materials-list">
          {materials.map(m => (
            <div key={m.id} className="material-item">
              {editMatId === m.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                  <input type="text" value={editMat.material} onChange={e => setEditMat({...editMat, material: e.target.value})} style={{ flex: 2, background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px' }} />
                  <input type="text" value={editMat.thickness} onChange={e => setEditMat({...editMat, thickness: e.target.value})} style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px' }} />
                  <input type="number" placeholder="Ancho (mm)" value={editMat.sheetWidthMm || ""} onChange={e => setEditMat({...editMat, sheetWidthMm: e.target.value})} style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px' }} />
                  <input type="number" placeholder="Alto (mm)" value={editMat.sheetHeightMm || ""} onChange={e => setEditMat({...editMat, sheetHeightMm: e.target.value})} style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px' }} />
                </div>
              ) : (
                <div className="material-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <strong>{m.material}</strong>
                    <span className="badge">{m.thickness}</span>
                  </div>
                  {(m.sheetWidthMm && m.sheetHeightMm) ? (
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Plancha: {m.sheetWidthMm}x{m.sheetHeightMm} mm</span>
                  ) : null}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editMatId === m.id ? (
                  <button className="btn-icon" onClick={() => handleUpdateMaterial(m.id)}><Save size={18} color="var(--success-color)" /></button>
                ) : (
                  <button className="btn-icon" onClick={() => { setEditMatId(m.id); setEditMat({material: m.material, thickness: m.thickness, sheetWidthMm: m.sheetWidthMm || "", sheetHeightMm: m.sheetHeightMm || ""}); }}><Edit size={18} /></button>
                )}
                <button className="btn-icon-danger" onClick={() => handleDeleteMaterial(m.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="text-muted text-center p-4">No hay materiales configurados.</div>
          )}
        </div>
      </div>
      
      {/* Gestión de Empleados */}
      <div className="config-card glass">
        <div className="config-header">
          <Users className="config-icon" size={24} />
          <h2>Gestión de Operarios</h2>
        </div>
        <p className="text-muted mb-4">
          Crea empleados y asígnales un PIN de 4 dígitos para que registren su producción.
        </p>

        <form className="add-material-form form-group" onSubmit={handleAddEmployee}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Nombre del operario" 
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              required 
              style={{ flex: 2, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <input 
              type="text" 
              placeholder="PIN secreto (ej: 1234)" 
              value={newEmpPin}
              onChange={(e) => setNewEmpPin(e.target.value)}
              maxLength={6}
              required 
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={18} /> Agregar
            </button>
          </div>
        </form>

        <div className="materials-list">
          {employees.map(e => (
            <div key={e.id} className="material-item">
              <div className="material-info">
                <strong>{e.name}</strong>
                <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  PIN: {showPins[e.id] ? e.pin : e.pin.replace(/./g, '*')}
                  <button className="btn-icon" onClick={() => setShowPins({ ...showPins, [e.id]: !showPins[e.id] })} style={{ padding: '0', color: 'inherit' }}>
                    {showPins[e.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </span>
              </div>
              <button className="btn-icon-danger" onClick={() => handleDeleteEmployee(e.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="text-muted text-center p-4">No hay empleados registrados.</div>
          )}
        </div>
      </div>

      {/* Gestión de Centros de Trabajo */}
      <div className="config-card glass mt-4">
        <div className="config-header">
          <Settings className="config-icon" size={24} />
          <h2>Centros de Trabajo (Procesos)</h2>
        </div>
        <p className="text-muted mb-4">
          Define las columnas del tablero y los pasos que siguen los productos.
        </p>

        <form className="add-material-form form-group" onSubmit={handleAddCenter}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Ej: CORTE_LASER, PINTURA" 
              value={newCenterName}
              onChange={(e) => setNewCenterName(e.target.value.toUpperCase())}
              required 
              style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem', color: 'white', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={18} /> Agregar
            </button>
          </div>
        </form>

        <div className="materials-list">
          {workCenters.map(c => (
            <div key={c.id} className="material-item">
              {editCenterId === c.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <input type="text" value={editCenterName} onChange={e => setEditCenterName(e.target.value.toUpperCase())} style={{ background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px', width: '100%' }} />
                </div>
              ) : (
                <div className="material-info">
                  <strong>{c.name}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {c.name === "CORTE_LASER" ? (
                  <span className="badge" style={{ background: 'var(--text-secondary)', color: 'var(--bg-dark)' }}>Por Defecto</span>
                ) : (
                  <>
                    {editCenterId === c.id ? (
                      <button className="btn-icon" onClick={() => handleUpdateCenter(c.id)}><Save size={18} color="var(--success-color)" /></button>
                    ) : (
                      <button className="btn-icon" onClick={() => { setEditCenterId(c.id); setEditCenterName(c.name); }}><Edit size={18} /></button>
                    )}
                    <button className="btn-icon-danger" onClick={() => handleDeleteCenter(c.id)}>
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {workCenters.length === 0 && (
            <div className="text-muted text-center p-4">No hay centros de trabajo.</div>
          )}
        </div>
      </div>
    </div>
  );
}
