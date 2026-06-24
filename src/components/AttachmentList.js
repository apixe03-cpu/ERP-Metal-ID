"use client";
import { FileText, Image as ImageIcon, Box, Trash2, Star, Eye } from "lucide-react";

export default function AttachmentList({ files, onRemove, onUpdateFiles, onSystemUpdate }) {
  if (!files || files.length === 0) return null;

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este archivo?")) return;
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (onUpdateFiles) onUpdateFiles(files.filter(f => f.id !== id));
        if (onSystemUpdate) onSystemUpdate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetThumbnail = async (id) => {
    try {
      const res = await fetch(`/api/files/${id}/thumbnail`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        if (onUpdateFiles) {
          onUpdateFiles(files.map(f => ({
            ...f,
            isThumbnail: f.id === id
          })));
        }
        if (onSystemUpdate) onSystemUpdate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
      {files.map(f => (
        <div key={f.id} className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {f.type === "DXF" && <Box size={18} color="var(--primary-color)" />}
          {f.type === "PDF" && <FileText size={18} color="var(--danger-color)" />}
          {f.type === "IMAGE" && <ImageIcon size={18} color="var(--success-color)" />}
          
          <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
            {f.name}
          </a>

          {/* Botones */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {f.type === "DXF" && (
              <>
                <a 
                  href={`${f.url}.svg`} 
                  target="_blank" 
                  rel="noreferrer" 
                  title="Ver miniatura a pantalla completa"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
                >
                  <Eye size={16} />
                </a>
                <button 
                  type="button"
                  title="Fijar como miniatura principal"
                  onClick={() => handleSetThumbnail(f.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: f.isThumbnail ? 'var(--accent-color)' : 'gray' }}
                >
                  <Star size={16} fill={f.isThumbnail ? 'var(--accent-color)' : 'none'} color={f.isThumbnail ? 'var(--accent-color)' : 'currentColor'} />
                </button>
              </>
            )}
            
            <button 
              type="button"
              title="Eliminar archivo"
              onClick={() => handleDelete(f.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
