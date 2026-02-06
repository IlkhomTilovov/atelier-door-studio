import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection } from '@/types/showroom';
import { collectionNames } from '@/data/showroom-data';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, X, AlertTriangle } from 'lucide-react';
import AssetModal, { AssetModalData } from '@/components/admin/AssetModal';

type AdminTab = 'doors' | 'walls' | 'floors';

/* ── Design tokens ── */
const cardCls = "group relative bg-card/60 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-card/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 border border-border/40";
const inputCls = "w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-200";
const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2";
const btnPrimary = "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm tracking-wide bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.2)] hover:shadow-[0_6px_24px_rgba(180,160,100,0.3)] hover:-translate-y-0.5 transition-all duration-300";
const btnCancel = "px-5 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200";
const iconBtn = "p-2 rounded-lg transition-all duration-200 hover:scale-110";

/* ── Status Badge ── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-body font-medium transition-all duration-300 ${
      active
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-muted/30 text-muted-foreground/60 border border-border/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
      {active ? 'Faol' : 'Yashirin'}
    </span>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        checked ? 'bg-gold/80 shadow-[0_0_12px_rgba(180,160,100,0.3)]' : 'bg-muted/50'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground shadow-md transition-all duration-300 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-scale-in p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-display text-lg text-foreground mb-2">O'chirishni tasdiqlang</h3>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="text-foreground font-medium">"{name}"</span> ni o'chirmoqchimisiz?
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className={btnCancel}>Bekor qilish</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2.5 rounded-lg font-body text-sm bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all duration-200">
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Color Swatch ── */
function Swatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return (
    <div
      className={`${s} rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.25)] flex-shrink-0`}
      style={{ backgroundColor: color }}
    />
  );
}

/* ═══════════════════════ Main ═══════════════════════ */

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('doors');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-8 py-5 flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-all duration-200 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="font-body text-sm">Showroom</span>
        </Link>
        <div className="w-px h-5 bg-border/40" />
        <h1 className="font-display text-2xl text-gold tracking-wider">Admin Panel</h1>
      </header>

      {/* Tabs */}
      <div className="px-8 flex gap-6 border-b border-border/30">
        {(['doors', 'walls', 'floors'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-1 py-4 font-body text-sm tracking-wide transition-all duration-300 ${
              tab === t ? 'text-gold' : 'text-muted-foreground/60 hover:text-foreground/80'
            }`}
          >
            {t === 'doors' ? 'Eshiklar' : t === 'walls' ? 'Devorlar' : 'Pollar'}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 max-w-5xl mx-auto admin-scroll">
        {tab === 'doors' && <DoorsAdmin />}
        {tab === 'walls' && <WallsAdmin />}
        {tab === 'floors' && <FloorsAdmin />}
      </div>
    </div>
  );
}

/* ═══════════════════════ Doors ═══════════════════════ */

function DoorsAdmin() {
  const { doors, setDoors, colors, setColors } = useShowroom();
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'door' | 'color' } | null>(null);

  const addDoor = (data: AssetModalData) => {
    setDoors(prev => [...prev, {
      id: `door-${Date.now()}`, name: data.name, collection: data.collection ?? 'classic',
      moldingStyle: data.moldingStyle ?? 'simple', panelCount: data.panelCount ?? 2, enabled: true,
      image: data.image,
    }]);
    setShowDoorModal(false);
  };

  const addColor = (data: AssetModalData) => {
    setColors(prev => [...prev, { id: `color-${Date.now()}`, name: data.name, hex: data.color, enabled: true }]);
    setShowColorModal(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'door') setDoors(prev => prev.filter(d => d.id !== deleteTarget.id));
    else setColors(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Door Models */}
      <SectionHeader title="Eshik modellari" count={doors.length} onAdd={() => setShowDoorModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {doors.map(door => (
          <div key={door.id} className={cardCls}>
            <div className="flex items-center gap-4">
              {door.image ? (
                <img src={door.image} alt="" className="w-12 h-16 rounded-lg flex-shrink-0 object-cover" style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)' }} />
              ) : (
                <div className="w-12 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: colors.find(c => c.enabled)?.hex ?? '#E8E4DE', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)' }}>
                  <div className="w-8 h-12 rounded-sm border border-black/10" style={{ backgroundColor: colors.find(c => c.enabled)?.hex ?? '#E8E4DE', boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{door.name}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{collectionNames[door.collection]} · {door.panelCount} panel</p>
              </div>
              <StatusBadge active={door.enabled} />
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={door.enabled} onChange={() => setDoors(prev => prev.map(d => d.id === door.id ? { ...d, enabled: !d.enabled } : d))} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget({ id: door.id, name: door.name, type: 'door' })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Door Colors */}
      <SectionHeader title="Eshik ranglari" count={colors.length} onAdd={() => setShowColorModal(true)} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map(color => (
          <div key={color.id} className={cardCls + " text-center"}>
            <Swatch color={color.hex} size="lg" />
            <p className="font-body text-sm text-foreground mt-3 mb-1">{color.name}</p>
            <p className="text-[10px] text-muted-foreground/50 font-mono mb-3">{color.hex}</p>
            <StatusBadge active={color.enabled} />
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={color.enabled} onChange={() => setColors(prev => prev.map(c => c.id === color.id ? { ...c, enabled: !c.enabled } : c))} />
              <button onClick={() => setDeleteTarget({ id: color.id, name: color.name, type: 'color' })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Door Modal */}
      <AssetModal open={showDoorModal} onClose={() => setShowDoorModal(false)} onSave={addDoor} type="door" title="Yangi eshik modeli" />

      {/* Add Color Modal */}
      <AssetModal open={showColorModal} onClose={() => setShowColorModal(false)} onSave={addColor} type="color" title="Yangi rang" />

      {/* Delete Confirm */}
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name ?? ''} />
    </>
  );
}

/* ═══════════════════════ Walls ═══════════════════════ */

function WallsAdmin() {
  const { walls, setWalls } = useShowroom();
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const addWall = (data: AssetModalData) => {
    setWalls(prev => [...prev, { id: `wall-${Date.now()}`, name: data.name, color: data.color, moldingType: data.moldingType ?? 'classic', enabled: true, image: data.image }]);
    setShowModal(false);
  };

  return (
    <>
      <SectionHeader title="Devor uslublari" count={walls.length} onAdd={() => setShowModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {walls.map(wall => (
          <div key={wall.id} className={cardCls}>
            <div className="flex items-start gap-4">
              {wall.image ? (
                <img src={wall.image} alt="" className="w-14 h-14 rounded-lg flex-shrink-0 object-cover shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.25)]" />
              ) : (
                <Swatch color={wall.color} size="lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{wall.name}</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5 capitalize">{wall.moldingType === 'classic' ? 'Klassik' : wall.moldingType === 'modern' ? 'Zamonaviy' : 'Bezakli'}</p>
                <div className="mt-2">
                  <StatusBadge active={wall.enabled} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={wall.enabled} onChange={() => setWalls(prev => prev.map(w => w.id === wall.id ? { ...w, enabled: !w.enabled } : w))} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget({ id: wall.id, name: wall.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AssetModal open={showModal} onClose={() => setShowModal(false)} onSave={addWall} type="wall" title="Yangi devor uslubi" />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) { setWalls(prev => prev.filter(w => w.id !== deleteTarget.id)); setDeleteTarget(null); } }} name={deleteTarget?.name ?? ''} />
    </>
  );
}

/* ═══════════════════════ Floors ═══════════════════════ */

function FloorsAdmin() {
  const { floors, setFloors } = useShowroom();
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const addFloor = (data: AssetModalData) => {
    setFloors(prev => [...prev, { id: `floor-${Date.now()}`, name: data.name, color: data.color, pattern: data.pattern ?? 'marble', enabled: true, image: data.image }]);
    setShowModal(false);
  };

  const patternLabels = { marble: 'Marmar', wood: "Yog'och", tile: 'Plitka' };

  return (
    <>
      <SectionHeader title="Pol materiallari" count={floors.length} onAdd={() => setShowModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {floors.map(floor => (
          <div key={floor.id} className={cardCls}>
            <div className="flex items-start gap-4">
              {floor.image ? (
                <img src={floor.image} alt="" className="w-14 h-14 rounded-lg flex-shrink-0 object-cover shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.25)]" />
              ) : (
                <Swatch color={floor.color} size="lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{floor.name}</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">{patternLabels[floor.pattern]}</p>
                <div className="mt-2">
                  <StatusBadge active={floor.enabled} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={floor.enabled} onChange={() => setFloors(prev => prev.map(f => f.id === floor.id ? { ...f, enabled: !f.enabled } : f))} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget({ id: floor.id, name: floor.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AssetModal open={showModal} onClose={() => setShowModal(false)} onSave={addFloor} type="floor" title="Yangi pol materiali" />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) { setFloors(prev => prev.filter(f => f.id !== deleteTarget.id)); setDeleteTarget(null); } }} name={deleteTarget?.name ?? ''} />
    </>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground/50 bg-muted/20 px-2.5 py-1 rounded-full font-mono">{count}</span>
      </div>
      <button onClick={onAdd} className={btnPrimary}>
        <Plus className="w-4 h-4" /> Qo'shish
      </button>
    </div>
  );
}
