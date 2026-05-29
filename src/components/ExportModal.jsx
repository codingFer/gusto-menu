import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TemplateClasico, TemplatePromo, TemplateModerno } from './MenuTemplates';

const TEMPLATES = [
  { id: 'clasico',  label: 'Clásico',     desc: 'Estilo rústico cálido', emoji: '🪵' },
  { id: 'promo',    label: 'Promocional', desc: 'Vibrante y llamativo',   emoji: '🔥' },
  { id: 'moderno',  label: 'Moderno',     desc: 'Dark mode minimalista',  emoji: '✨' },
];

const TEMPLATE_MAP = {
  clasico:  TemplateClasico,
  promo:    TemplatePromo,
  moderno:  TemplateModerno,
};

export default function ExportModal({ data, onClose }) {
  const [selected, setSelected] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const [zoomScale, setZoomScale] = useState(0.8);
  const touchStartRef = useRef({ distance: 0, zoom: 0.8 });

  useEffect(() => {
    if (window.innerWidth < 600) {
      setZoomScale(0.55);
    }
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = { distance, zoom: zoomScale };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const start = touchStartRef.current;
      if (start.distance > 0) {
        const factor = distance / start.distance;
        const newZoom = Math.min(2.0, Math.max(0.3, start.zoom * factor));
        setZoomScale(newZoom);
      }
    }
  };

  const TemplateComponent = TEMPLATE_MAP[TEMPLATES[selected].id];

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          // Reset positioning of the hidden container in the cloned doc
          const container = clonedDoc.getElementById('hidden-export-container');
          if (container) {
            container.style.position = 'relative';
            container.style.left = '0';
            container.style.top = '0';
          }
          // Copy loaded fonts into the cloned context to fix Georgia/serif sizing mismatch
          document.fonts.forEach(font => {
            clonedDoc.fonts.add(font);
          });
        }
      });
      const link = document.createElement('a');
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
      link.download = `menu-${(data.name||'restaurante').replace(/\s+/g,'-').toLowerCase()}-${dateStr}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Error al exportar. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const prev = () => setSelected(s => (s - 1 + TEMPLATES.length) % TEMPLATES.length);
  const next = () => setSelected(s => (s + 1) % TEMPLATES.length);

  return (
    <>
      <style>{`
        .export-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; overflow-y: auto;
        }
        .export-modal-content {
          background: var(--surface, #1a1a1a);
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border: 1px solid var(--outline-variant, #333);
          max-height: 90vh;
          overflow-y: auto;
        }
        .preview-container {
          width: 100%;
          overflow: auto;
          border-radius: 12px;
          border: 1px solid var(--outline-variant, #333);
          background: #111;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 16px 0;
          max-height: 400px;
          touch-action: none;
        }
        @media (max-width: 600px) {
          .export-modal-overlay {
            align-items: flex-start;
          }
          .export-modal-content {
            padding: 16px;
            max-height: none;
            margin-bottom: 40px;
          }
        }
      `}</style>
      <div className="export-modal-overlay" onClick={onClose}>
        <div className="export-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '22px' }}>📤 Exportar Menú</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.6 }}>Elige un template y descarga como imagen PNG</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface, #fff)', padding: '8px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Template Selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setSelected(i)}
              style={{
                flex: 1, minWidth: '120px',
                padding: '10px 12px',
                border: selected === i ? '2px solid var(--primary, #ff6b35)' : '2px solid var(--outline-variant, #333)',
                borderRadius: '12px',
                background: selected === i ? 'var(--primary-container, rgba(255,107,53,0.15))' : 'var(--surface-container, #222)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: selected === i ? 'var(--primary, #ff6b35)' : 'var(--on-surface, #fff)' }}>{t.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Preview Area */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={prev}
              style={{ background: 'var(--surface-container, #222)', border: '1px solid var(--outline-variant, #333)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--on-surface, #fff)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: 700, opacity: 0.7 }}>
              {TEMPLATES[selected].emoji} {TEMPLATES[selected].label} · Vista previa
            </span>
            <button
              onClick={next}
              style={{ background: 'var(--surface-container, #222)', border: '1px solid var(--outline-variant, #333)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--on-surface, #fff)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Scale wrapper */}
          <div
            className="preview-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div
              style={{
                width: `${540 * zoomScale}px`,
                height: `${675 * zoomScale}px`,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left',
                  width: '540px',
                  height: '675px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <TemplateComponent data={data} />
              </div>
            </div>
          </div>

          {/* Hidden copy for exporting to ensure 1x scale, correct fonts, and no distortions */}
          <div
            id="hidden-export-container"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '0',
              width: '540px',
              height: '675px',
              overflow: 'hidden',
            }}
          >
            <TemplateComponent ref={previewRef} data={data} />
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={() => setZoomScale(z => Math.max(0.3, z - 0.1))}
              style={{
                background: 'var(--surface-container, #222)',
                border: '1px solid var(--outline-variant, #333)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--on-surface, #fff)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Reducir zoom"
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface, #fff)', minWidth: '48px', textAlign: 'center' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(z => Math.min(2.0, z + 0.1))}
              style={{
                background: 'var(--surface-container, #222)',
                border: '1px solid var(--outline-variant, #333)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--on-surface, #fff)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Aumentar zoom"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomScale(window.innerWidth < 600 ? 0.55 : 0.8)}
              style={{
                background: 'var(--surface-container, #222)',
                border: '1px solid var(--outline-variant, #333)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--on-surface, #fff)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Restablecer zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: 'var(--surface-container, #222)',
              border: '1px solid var(--outline-variant, #333)', borderRadius: '12px',
              cursor: 'pointer', color: 'var(--on-surface, #fff)', fontWeight: 600
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            style={{
              flex: 2, padding: '12px',
              background: isExporting ? '#555' : 'linear-gradient(135deg, var(--primary, #ff6b35), #f7931e)',
              border: 'none', borderRadius: '12px', cursor: isExporting ? 'not-allowed' : 'pointer',
              color: '#fff', fontWeight: 900, fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'opacity 0.2s'
            }}
          >
            {isExporting ? (
              <>⏳ Generando PNG...</>
            ) : (
              <><Download size={20} /> Descargar PNG</>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
