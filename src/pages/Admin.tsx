import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { collectionNames } from '@/data/showroom-data';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadAssetImage } from '@/hooks/useShowroomData';
import AssetModal, { AssetModalData } from '@/components/admin/AssetModal';
import { toast } from 'sonner';

type AdminTab = 'doors' | 'walls' | 'floors';

const cardCls = "group relative bg-card/60 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-card/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 border border-border/40";
const iconBtn = "p-2 rounded-lg transition-all duration-200 hover:scale-110";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-body font-medium transition-all duration-300 ${
      active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted/30 text-muted-foreground/60 border border-border/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
      {active ? 'Faol' : 'Yashirin'}
    </span>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-gold/80 shadow-[0_0_12px_rgba(180,160,100,0.3)]' : 'bg-muted/50'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground shadow-md transition-all duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

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
        <p className="text-sm text-muted-foreground mb-6"><span className="text-foreground font-medium">"{name}"</span> ni o'chirmoqchimisiz?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">Bekor qilish</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2.5 rounded-lg font-body text-sm bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all duration-200">O'chirish</button>
        </div>
      </div>
    </div>
  );
}

function Swatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return <div className={`${s} rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.25)] flex-shrink-0`} style={{ backgroundColor: color }} />;
}

function SectionHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground/50 bg-muted/20 px-2.5 py-1 rounded-full font-mono">{count}</span>
      </div>
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm tracking-wide bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.2)] hover:shadow-[0_6px_24px_rgba(180,160,100,0.3)] hover:-translate-y-0.5 transition-all duration-300">
        <Plus className="w-4 h-4" /> Qo'shish
      </button>
    </div>
  );
}

// ═══════════════════════ Main ═══════════════════════

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('doors');

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-5 flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-all duration-200 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="font-body text-sm">Showroom</span>
        </Link>
        <div className="w-px h-5 bg-border/40" />
        <h1 className="font-display text-2xl text-gold tracking-wider">Admin Panel</h1>
      </header>
      <div className="px-8 flex gap-6 border-b border-border/30">
        {(['doors', 'walls', 'floors'] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`relative px-1 py-4 font-body text-sm tracking-wide transition-all duration-300 ${tab === t ? 'text-gold' : 'text-muted-foreground/60 hover:text-foreground/80'}`}>
            {t === 'doors' ? 'Eshiklar' : t === 'walls' ? 'Devorlar' : 'Pollar'}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-full" />}
          </button>
        ))}
      </div>
      <div className="p-8 max-w-5xl mx-auto admin-scroll">
        {tab === 'doors' && <DoorsAdmin />}
        {tab === 'walls' && <WallsAdmin />}
        {tab === 'floors' && <FloorsAdmin />}
      </div>
    </div>
  );
}

// ═══════════════════════ Doors ═══════════════════════

function DoorsAdmin() {
  const { doors, colors } = useShowroom();
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'door' | 'color' } | null>(null);

  const addDoor = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (data.imageFile) imageUrl = await uploadAssetImage(data.imageFile, 'doors');
      const { error } = await supabase.from('doors').insert({
        name: data.name, collection: data.collection ?? 'classic',
        molding_style: data.moldingStyle ?? 'simple', panel_count: data.panelCount ?? 2,
        image_url: imageUrl, sort_order: doors.length + 1,
      });
      if (error) throw error;
      toast.success('Eshik qo\'shildi');
      setShowDoorModal(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const addColor = async (data: AssetModalData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('door_colors').insert({
        name: data.name, hex: data.color, sort_order: colors.length + 1,
      });
      if (error) throw error;
      toast.success('Rang qo\'shildi');
      setShowColorModal(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const toggleDoor = async (id: string, enabled: boolean) => {
    await supabase.from('doors').update({ enabled: !enabled }).eq('id', id);
  };

  const toggleColor = async (id: string, enabled: boolean) => {
    await supabase.from('door_colors').update({ enabled: !enabled }).eq('id', id);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'door') await supabase.from('doors').delete().eq('id', deleteTarget.id);
    else await supabase.from('door_colors').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    toast.success('O\'chirildi');
  };

  return (
    <>
      <SectionHeader title="Eshik modellari" count={doors.length} onAdd={() => setShowDoorModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {doors.map(door => (
          <div key={door.id} className={cardCls}>
            {door.image && (
              <div className="mb-3 -mx-1 -mt-1 rounded-lg overflow-hidden">
                <img src={door.image} alt="" className="w-full h-32 object-contain bg-secondary/20" />
              </div>
            )}
            <div className="flex items-center gap-4">
              {!door.image && (
                <div className="w-12 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#E8E4DE', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)' }}>
                  <div className="w-8 h-12 rounded-sm border border-black/10" style={{ backgroundColor: '#E8E4DE' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{door.name}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{collectionNames[door.collection]} · {door.panelCount} panel</p>
              </div>
              <StatusBadge active={door.enabled} />
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={door.enabled} onChange={() => toggleDoor(door.id, door.enabled)} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: door.id, name: door.name, type: 'door' })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Eshik ranglari" count={colors.length} onAdd={() => setShowColorModal(true)} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map(color => (
          <div key={color.id} className={cardCls + " text-center"}>
            <Swatch color={color.hex} size="lg" />
            <p className="font-body text-sm text-foreground mt-3 mb-1">{color.name}</p>
            <p className="text-[10px] text-muted-foreground/50 font-mono mb-3">{color.hex}</p>
            <StatusBadge active={color.enabled} />
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={color.enabled} onChange={() => toggleColor(color.id, color.enabled)} />
              <button onClick={() => setDeleteTarget({ id: color.id, name: color.name, type: 'color' })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <AssetModal open={showDoorModal} onClose={() => setShowDoorModal(false)} onSave={addDoor} type="door" title="Yangi eshik modeli" saving={saving} />
      <AssetModal open={showColorModal} onClose={() => setShowColorModal(false)} onSave={addColor} type="color" title="Yangi rang" saving={saving} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name ?? ''} />
    </>
  );
}

// ═══════════════════════ Walls ═══════════════════════

function WallsAdmin() {
  const { walls } = useShowroom();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const addWall = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (data.imageFile) imageUrl = await uploadAssetImage(data.imageFile, 'walls');
      const { error } = await supabase.from('walls').insert({
        name: data.name, color: data.color, molding_type: data.moldingType ?? 'classic',
        image_url: imageUrl, sort_order: walls.length + 1,
      });
      if (error) throw error;
      toast.success('Devor qo\'shildi');
      setShowModal(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const toggleWall = async (id: string, enabled: boolean) => {
    await supabase.from('walls').update({ enabled: !enabled }).eq('id', id);
  };

  return (
    <>
      <SectionHeader title="Devor uslublari" count={walls.length} onAdd={() => setShowModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {walls.map(wall => (
          <div key={wall.id} className={cardCls}>
            {wall.image && (
              <div className="mb-3 -mx-1 -mt-1 rounded-lg overflow-hidden">
                <img src={wall.image} alt="" className="w-full h-28 object-cover" />
              </div>
            )}
            <div className="flex items-start gap-4">
              {!wall.image && <Swatch color={wall.color} size="lg" />}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{wall.name}</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5 capitalize">{wall.moldingType === 'classic' ? 'Klassik' : wall.moldingType === 'modern' ? 'Zamonaviy' : 'Bezakli'}</p>
                <div className="mt-2"><StatusBadge active={wall.enabled} /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={wall.enabled} onChange={() => toggleWall(wall.id, wall.enabled)} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: wall.id, name: wall.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <AssetModal open={showModal} onClose={() => setShowModal(false)} onSave={addWall} type="wall" title="Yangi devor uslubi" saving={saving} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await supabase.from('walls').delete().eq('id', deleteTarget.id); setDeleteTarget(null); toast.success('O\'chirildi'); } }} name={deleteTarget?.name ?? ''} />
    </>
  );
}

// ═══════════════════════ Floors ═══════════════════════

function FloorsAdmin() {
  const { floors } = useShowroom();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const patternLabels: Record<string, string> = { marble: 'Marmar', wood: "Yog'och", tile: 'Plitka' };

  const addFloor = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (data.imageFile) imageUrl = await uploadAssetImage(data.imageFile, 'floors');
      const { error } = await supabase.from('floors').insert({
        name: data.name, color: data.color, pattern: data.pattern ?? 'marble',
        image_url: imageUrl, sort_order: floors.length + 1,
      });
      if (error) throw error;
      toast.success('Pol qo\'shildi');
      setShowModal(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const toggleFloor = async (id: string, enabled: boolean) => {
    await supabase.from('floors').update({ enabled: !enabled }).eq('id', id);
  };

  return (
    <>
      <SectionHeader title="Pol materiallari" count={floors.length} onAdd={() => setShowModal(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {floors.map(floor => (
          <div key={floor.id} className={cardCls}>
            {floor.image && (
              <div className="mb-3 -mx-1 -mt-1 rounded-lg overflow-hidden">
                <img src={floor.image} alt="" className="w-full h-24 object-cover" />
              </div>
            )}
            <div className="flex items-start gap-4">
              {!floor.image && <Swatch color={floor.color} size="lg" />}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{floor.name}</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">{patternLabels[floor.pattern]}</p>
                <div className="mt-2"><StatusBadge active={floor.enabled} /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={floor.enabled} onChange={() => toggleFloor(floor.id, floor.enabled)} />
              <button className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: floor.id, name: floor.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <AssetModal open={showModal} onClose={() => setShowModal(false)} onSave={addFloor} type="floor" title="Yangi pol materiali" saving={saving} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await supabase.from('floors').delete().eq('id', deleteTarget.id); setDeleteTarget(null); toast.success('O\'chirildi'); } }} name={deleteTarget?.name ?? ''} />
    </>
  );
}
