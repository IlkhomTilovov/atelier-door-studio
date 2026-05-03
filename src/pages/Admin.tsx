import { useState, useEffect, useMemo } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { collectionNames } from '@/data/showroom-data';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, AlertTriangle, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadAssetImage } from '@/hooks/useShowroomData';
import AssetModal, { AssetModalData, AssetModalInitial } from '@/components/admin/AssetModal';
import { toast } from 'sonner';

import TelegramSettings from '@/components/admin/TelegramSettings';
import OrdersAdmin from '@/components/admin/OrdersAdmin';

type AdminTab = 'dashboard' | 'categories' | 'rooms' | 'doors' | 'frames' | 'materials' | 'orders' | 'settings';

function describeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object') {
    const obj = e as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts: string[] = [];
    if (typeof obj.message === 'string') parts.push(obj.message);
    if (typeof obj.details === 'string' && obj.details) parts.push(obj.details);
    if (typeof obj.hint === 'string' && obj.hint) parts.push(`(${obj.hint})`);
    if (typeof obj.code === 'string' && obj.code) parts.push(`[${obj.code}]`);
    if (parts.length) return parts.join(' ');
  }
  if (typeof e === 'string') return e;
  try { return JSON.stringify(e); } catch { return 'Unknown error'; }
}

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
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg font-body text-sm bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all duration-200">O'chirish</button>
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

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="mb-6">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background/80 border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-200"
      />
    </div>
  );
}

function SummaryCard({ title, value, description, onAction }: { title: string; value: string; description: string; onAction?: () => void }) {
  return (
    <div className="group border border-border/40 bg-card/70 backdrop-blur-sm rounded-3xl p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_18px_60px_rgba(255,215,135,0.12)]">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">{title}</p>
      <p className="font-display text-3xl text-foreground mb-3">{value}</p>
      <p className="text-sm text-muted-foreground/70 leading-6">{description}</p>
      {onAction && (
        <button onClick={onAction} className="mt-5 inline-flex items-center gap-2 text-xs text-gold font-medium hover:text-gold-dark transition-colors duration-200">
          Boshqarishga o'tish
        </button>
      )}
    </div>
  );
}

function DashboardAdmin() {
  const { allCategories, allWalls, allDoors, allFloors } = useShowroom();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    supabase.from('orders').select('id', { count: 'exact' }).then(result => {
      if (!mounted) return;
      if (result.count !== null) setOrderCount(result.count);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Kategoriyalar" value={`${allCategories.length}`} description="Katalogdagi xona va eshik kategoriyalari." />
        <SummaryCard title="Xona dizaynlari" value={`${allWalls.length}`} description="Yaratilgan xona dizaynlarining umumiy soni." />
        <SummaryCard title="Eshiklar" value={`${allDoors.length}`} description="Barcha eshik modellari va holati." />
        <SummaryCard title="Pol materiallari" value={`${allFloors.length}`} description="Saqlangan pol teksturalari va parametrlar." />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="border border-border/40 rounded-3xl bg-card/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Buyurtmalar</p>
          <p className="text-3xl text-foreground font-display mb-3">{orderCount}</p>
          <p className="text-sm text-muted-foreground/70 leading-6">Joriy buyurtmalar soni va ularning holatini kuzatib boring.</p>
        </div>
        <div className="border border-border/40 rounded-3xl bg-card/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Live preview</p>
          <p className="text-3xl text-foreground font-display mb-3">Instant visualization</p>
          <p className="text-sm text-muted-foreground/70 leading-6">Yangi elementlarni saqlashdan oldin 3 ta asosiy materialni sinab ko'ring: eshik, xona va pol.</p>
        </div>
      </div>
    </div>
  );
}

// Simple inline edit modal for categories
function CategoryModal({ open, onClose, onSave, saving, initial }: {
  open: boolean; onClose: () => void; onSave: (name: string) => void; saving: boolean; initial?: string;
}) {
  const [name, setName] = useState(initial || '');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-scale-in p-6">
        <h3 className="font-display text-xl text-foreground mb-4">{initial ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
        <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2">Nomi <span className="text-destructive/60">*</span></label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Masalan: Klassik"
          className="w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-200 mb-6"
          maxLength={50}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()); }}
        />
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">Bekor qilish</button>
          <button
            onClick={() => { if (name.trim()) onSave(name.trim()); }}
            disabled={!name.trim() || saving}
            className={`px-6 py-2.5 rounded-lg font-body text-sm tracking-wide transition-all duration-300 ${
              name.trim() && !saving
                ? 'bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.25)] hover:shadow-[0_6px_24px_rgba(180,160,100,0.35)] hover:-translate-y-0.5'
                : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ Main ═══════════════════════

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const tabLabels: Record<AdminTab, string> = {
    dashboard: 'Dashboard',
    categories: 'Kategoriyalar',
    rooms: 'Xonalar',
    doors: 'Eshiklar',
    frames: 'Ramkalar',
    materials: 'Materiallar',
    orders: '📦 Buyurtmalar',
    settings: '⚙️ Sozlamalar',
  };

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
        {(Object.keys(tabLabels) as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`relative px-1 py-4 font-body text-sm tracking-wide transition-all duration-300 ${tab === t ? 'text-gold' : 'text-muted-foreground/60 hover:text-foreground/80'}`}>
            {tabLabels[t]}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-full" />}
          </button>
        ))}
      </div>
      <div className="p-8 max-w-5xl mx-auto admin-scroll">
        {tab === 'dashboard' && <DashboardAdmin />}
        {tab === 'categories' && <CategoriesAdmin />}
        {tab === 'rooms' && <RoomsAdmin />}
        {tab === 'doors' && <DoorsAdmin />}
        {tab === 'frames' && <FramesAdmin />}
        {tab === 'materials' && <MaterialsAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'settings' && <TelegramSettings />}
      </div>
    </div>
  );
}

// ═══════════════════════ Categories ═══════════════════════

function CategoriesAdmin() {
  const { allCategories: categories, allWalls: walls } = useShowroom();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return localCategories
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .filter(cat => cat.name.toLowerCase().includes(query));
  }, [localCategories, search]);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...localCategories];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setLocalCategories(next.map((item, i) => ({ ...item, sort_order: i + 1 })));

    try {
      await Promise.all(next.map((item, idx) =>
        supabase.from('room_categories').update({ sort_order: idx + 1 }).eq('id', item.id)
      ));
      toast.success('Kategoriyalar tartibi yangilandi');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const addCategory = async (name: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('room_categories').insert({ name, sort_order: categories.length + 1 });
      if (error) throw error;
      toast.success('Kategoriya qo\'shildi');
      setShowModal(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }
    setSaving(false);
  };

  const updateCategory = async (name: string) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('room_categories').update({ name }).eq('id', editTarget.id);
      if (error) throw error;
      toast.success('Kategoriya yangilandi');
      setEditTarget(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }
    setSaving(false);
  };

  const toggleCategory = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from('room_categories').update({ enabled: !enabled }).eq('id', id);
    if (error) toast.error(error.message);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Unlink walls and door_categories from this category first
      await supabase.from('walls').update({ category_id: null }).eq('category_id', deleteTarget.id);
      await supabase.from('door_categories').delete().eq('category_id', deleteTarget.id);
      const { error } = await supabase.from('room_categories').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      toast.success('O\'chirildi');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const getDesignCount = (catId: string) => walls.filter(w => w.category_id === catId).length;

  return (
    <>
      <SectionHeader title="Xona kategoriyalari" count={categories.length} onAdd={() => setShowModal(true)} />
      <SearchBar value={search} onChange={setSearch} placeholder="Kategoriya nomi bo'yicha qidirish..." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat, index) => (
          <div
            key={cat.id}
            className={cardCls}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{getDesignCount(cat.id)} ta dizayn</p>
                <div className="mt-2"><StatusBadge active={cat.enabled} /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={cat.enabled} onChange={() => toggleCategory(cat.id, cat.enabled)} />
              <button onClick={() => setEditTarget({ id: cat.id, name: cat.name })} className={`${iconBtn} hover:bg-secondary/50 text-muted-foreground/50 hover:text-foreground`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <CategoryModal open={showModal} onClose={() => setShowModal(false)} onSave={addCategory} saving={saving} />
      <CategoryModal open={!!editTarget} onClose={() => setEditTarget(null)} onSave={updateCategory} saving={saving} initial={editTarget?.name} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name ?? ''} />
    </>
  );
}

// ═══════════════════════ Doors ═══════════════════════

function DoorsAdmin() {
  const { allDoors: doors, doorCategories } = useShowroom();
  const [search, setSearch] = useState('');
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<typeof doors[0] | null>(null);

  const filteredDoors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doors.filter(door => door.name.toLowerCase().includes(query));
  }, [doors, search]);

  const addDoor = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = editTarget?.image || null;
      if (data.imageFile) imageUrl = await uploadAssetImage(data.imageFile, 'doors');
      else if (!data.imagePreview) imageUrl = null;

      if (editTarget) {
        const { error } = await supabase.from('doors').update({
          name: data.name, panel_count: data.panelCount ?? 2, image_url: imageUrl,
        }).eq('id', editTarget.id);
        if (error) throw error;
        // Update junction: delete old, insert new
        await supabase.from('door_categories').delete().eq('door_id', editTarget.id);
        if (data.categoryIds && data.categoryIds.length > 0) {
          await supabase.from('door_categories').insert(
            data.categoryIds.map(cid => ({ door_id: editTarget.id, category_id: cid }))
          );
        }
        toast.success('Eshik yangilandi');
        setEditTarget(null);
      } else {
        const { data: inserted, error } = await supabase.from('doors').insert({
          name: data.name, collection: data.collection ?? 'classic',
          molding_style: 'simple', panel_count: data.panelCount ?? 2,
          image_url: imageUrl, sort_order: doors.length + 1,
        }).select('id').single();
        if (error) throw error;
        // Insert junction records
        if (data.categoryIds && data.categoryIds.length > 0 && inserted) {
          await supabase.from('door_categories').insert(
            data.categoryIds.map(cid => ({ door_id: inserted.id, category_id: cid }))
          );
        }
        toast.success('Eshik qo\'shildi');
      }
      setShowDoorModal(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }
    setSaving(false);
  };


  const toggleDoor = async (id: string, enabled: boolean) => {
    await supabase.from('doors').update({ enabled: !enabled }).eq('id', id);
  };


  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('doors').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    toast.success('O\'chirildi');
  };

  const getDoorCatNames = (doorId: string) => {
    const catIds = doorCategories.filter(dc => dc.door_id === doorId).map(dc => dc.category_id);
    return catIds.map(cid => allCategories.find(c => c.id === cid)?.name).filter(Boolean);
  };

  const openEdit = (door: typeof doors[0]) => {
    setEditTarget(door);
    setShowDoorModal(true);
  };

  const closeModal = () => {
    setShowDoorModal(false);
    setEditTarget(null);
  };

  const editInitial = editTarget ? {
    id: editTarget.id,
    name: editTarget.name,
    imageUrl: editTarget.image,
    panelCount: editTarget.panelCount,
    categoryIds: doorCategories.filter(dc => dc.door_id === editTarget.id).map(dc => dc.category_id),
  } : null;

  const { allCategories } = useShowroom();

  return (
    <>
      <SectionHeader title="Eshik modellari" count={doors.length} onAdd={() => { setEditTarget(null); setShowDoorModal(true); }} />
      <SearchBar value={search} onChange={setSearch} placeholder="Eshik nomi bo'yicha qidirish..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {filteredDoors.map(door => {
          const catNames = getDoorCatNames(door.id);
          return (
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
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{door.panelCount} panel</p>
                  {catNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {catNames.map(n => (
                        <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/70 border border-gold/15">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
                <StatusBadge active={door.enabled} />
              </div>
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
                <ToggleSwitch checked={door.enabled} onChange={() => toggleDoor(door.id, door.enabled)} />
                <button onClick={() => openEdit(door)} className={`${iconBtn} hover:bg-gold/10 text-muted-foreground/50 hover:text-gold border border-transparent hover:border-gold/30`}><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteTarget({ id: door.id, name: door.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>


      <AssetModal open={showDoorModal} onClose={closeModal} onSave={addDoor} type="door" title={editTarget ? 'Eshik modelini tahrirlash' : 'Yangi eshik modeli'} saving={saving} initial={editInitial} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name ?? ''} />
    </>
  );
}

// ═══════════════════════ Rooms (Room Designs) ═══════════════════════

function RoomsAdmin() {
  const { allWalls: walls, allCategories: categories, allDoors: doors, allFloors: floors } = useShowroom();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editTarget, setEditTarget] = useState<typeof walls[0] | null>(null);
  const [previewWall, setPreviewWall] = useState<string | null>(walls[0]?.id || null);
  const [previewDoor, setPreviewDoor] = useState<string | null>(doors[0]?.id || null);
  const [previewFloor, setPreviewFloor] = useState<string | null>(floors[0]?.id || null);

  useEffect(() => {
    if (!previewWall && walls[0]) setPreviewWall(walls[0].id);
    if (!previewDoor && doors[0]) setPreviewDoor(doors[0].id);
    if (!previewFloor && floors[0]) setPreviewFloor(floors[0].id);
  }, [walls, doors, floors, previewWall, previewDoor, previewFloor]);

  const filteredWalls = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = filterCategory === 'all'
      ? walls
      : filterCategory === 'none'
        ? walls.filter(w => !w.category_id)
        : walls.filter(w => w.category_id === filterCategory);
    return source.filter(w => w.name.toLowerCase().includes(query));
  }, [walls, filterCategory, search]);

  const getCategoryName = (catId?: string | null) => {
    if (!catId) return 'Kategoriyasiz';
    return categories.find(c => c.id === catId)?.name || 'Noma\'lum';
  };

  const saveWall = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = editTarget?.image || null;
      if (data.imageFile) {
        imageUrl = await uploadAssetImage(data.imageFile, 'walls');
      } else if (!data.imagePreview) {
        imageUrl = null;
      }

      if (editTarget) {
        // UPDATE existing
        const { error } = await supabase.from('walls').update({
          name: data.name, molding_type: data.moldingType ?? 'classic',
          image_url: imageUrl, category_id: data.categoryId || null,
        }).eq('id', editTarget.id);
        if (error) throw error;
        toast.success('Xona dizayni yangilandi');
        setEditTarget(null);
      } else {
        // CREATE new
        const { error } = await supabase.from('walls').insert({
          name: data.name, color: data.color, molding_type: data.moldingType ?? 'classic',
          image_url: imageUrl, sort_order: walls.length + 1,
          category_id: data.categoryId || null,
        });
        if (error) throw error;
        toast.success('Xona dizayni qo\'shildi');
      }
      setShowModal(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }
    setSaving(false);
  };

  const openEdit = (wall: typeof walls[0]) => {
    setEditTarget(wall);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  const toggleWall = async (id: string, enabled: boolean) => {
    await supabase.from('walls').update({ enabled: !enabled }).eq('id', id);
  };

  const editInitial = editTarget ? {
    id: editTarget.id,
    name: editTarget.name,
    color: editTarget.color,
    imageUrl: editTarget.image,
    moldingType: editTarget.moldingType as 'classic' | 'modern' | 'ornate',
    categoryId: editTarget.category_id || undefined,
  } : null;

  return (
    <>
      <SectionHeader title="Xona dizaynlari" count={walls.length} onAdd={() => { setEditTarget(null); setShowModal(true); }} />
      <SearchBar value={search} onChange={setSearch} placeholder="Xona nomi bo'yicha qidirish..." />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] mb-6">
        <div className="border border-border/40 rounded-3xl bg-card/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Live preview</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={previewWall ?? ''} onChange={e => setPreviewWall(e.target.value)} className="bg-background/80 border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all duration-200">
              {walls.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={previewDoor ?? ''} onChange={e => setPreviewDoor(e.target.value)} className="bg-background/80 border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all duration-200">
              {doors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={previewFloor ?? ''} onChange={e => setPreviewFloor(e.target.value)} className="bg-background/80 border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all duration-200">
              {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 mt-5">
            <div className="rounded-3xl overflow-hidden border border-border/20 bg-background/70 p-4">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.18em] mb-2">Xona</p>
              {walls.find(w => w.id === previewWall)?.image ? (
                <img src={walls.find(w => w.id === previewWall)?.image || ''} alt="Wall preview" className="w-full h-32 object-cover rounded-2xl" />
              ) : (
                <div className="h-32 rounded-2xl bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Rasm mavjud emas</div>
              )}
            </div>
            <div className="rounded-3xl overflow-hidden border border-border/20 bg-background/70 p-4">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.18em] mb-2">Eshik</p>
              {doors.find(d => d.id === previewDoor)?.image ? (
                <img src={doors.find(d => d.id === previewDoor)?.image || ''} alt="Door preview" className="w-full h-32 object-contain rounded-2xl bg-background/80" />
              ) : (
                <div className="h-32 rounded-2xl bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Rasm mavjud emas</div>
              )}
            </div>
            <div className="rounded-3xl overflow-hidden border border-border/20 bg-background/70 p-4">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.18em] mb-2">Pol</p>
              <div className="h-32 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(180deg,_rgba(0,0,0,0.04),_rgba(0,0,0,0.1))] flex items-center justify-center text-sm text-muted-foreground" style={{ backgroundColor: floors.find(f => f.id === previewFloor)?.color || '#6b6b6b' }}>
                {floors.find(f => f.id === previewFloor)?.name || 'Tanlanmagan'}
              </div>
            </div>
          </div>
        </div>
        <div className="border border-border/40 rounded-3xl bg-card/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Qisqacha ko'rinish</p>
          <p className="text-sm text-muted-foreground/70 leading-6">Tanlangan xona, eshik va pol kombinatsiyasini darhol ko'ring. Bu sizga admin panelda materiallarni tezroq moslashtirishga yordam beradi.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-2 rounded-lg font-body text-xs transition-all duration-300 ${
            filterCategory === 'all' ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card/40 text-muted-foreground border border-border/30 hover:bg-card/60'
          }`}
        >
          Barchasi
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3.5 py-2 rounded-lg font-body text-xs transition-all duration-300 ${
              filterCategory === cat.id ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card/40 text-muted-foreground border border-border/30 hover:bg-card/60'
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setFilterCategory('none')}
          className={`px-3.5 py-2 rounded-lg font-body text-xs transition-all duration-300 ${
            filterCategory === 'none' ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card/40 text-muted-foreground border border-border/30 hover:bg-card/60'
          }`}
        >
          Kategoriyasiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWalls.map(wall => (
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
                <p className="text-xs text-gold/60 mt-0.5">{getCategoryName(wall.category_id)}</p>
                <div className="mt-2"><StatusBadge active={wall.enabled} /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={wall.enabled} onChange={() => toggleWall(wall.id, wall.enabled)} />
              <button onClick={() => openEdit(wall)} className={`${iconBtn} hover:bg-gold/10 text-muted-foreground/50 hover:text-gold border border-transparent hover:border-gold/30`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: wall.id, name: wall.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <AssetModal
        open={showModal}
        onClose={closeModal}
        onSave={saveWall}
        type="wall"
        title={editTarget ? 'Xona dizaynini tahrirlash' : 'Yangi xona dizayni'}
        saving={saving}
        initial={editInitial}
      />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await supabase.from('walls').delete().eq('id', deleteTarget.id); setDeleteTarget(null); toast.success('O\'chirildi'); } }} name={deleteTarget?.name ?? ''} />
    </>
  );
}

// ═══════════════════════ Materials ═══════════════════════

function MaterialsAdmin() {
  const { allFloors: floors } = useShowroom();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const patternLabels: Record<string, string> = { marble: 'Marmar', wood: "Yog'och", tile: 'Plitka' };

  const filteredFloors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return floors.filter(floor => floor.name.toLowerCase().includes(query));
  }, [floors, search]);

  const addFloor = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (data.imageFile) imageUrl = await uploadAssetImage(data.imageFile, 'floors');
      const { error } = await supabase.from('floors').insert({
        name: data.name, color: data.color, pattern: data.pattern ?? 'marble',
        image_url: imageUrl, sort_order: floors.length + 1,
        texture_scale: data.textureScale ?? 'medium',
        texture_orientation: data.textureOrientation ?? 'horizontal',
      });
      if (error) throw error;
      toast.success('Pol qo\'shildi');
      setShowModal(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }
    setSaving(false);
  };

  const toggleFloor = async (id: string, enabled: boolean) => {
    await supabase.from('floors').update({ enabled: !enabled }).eq('id', id);
  };

  return (
    <>
      <SectionHeader title="Pol materiallari" count={floors.length} onAdd={() => setShowModal(true)} />
      <SearchBar value={search} onChange={setSearch} placeholder="Material nomi bo'yicha qidirish..." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFloors.map(floor => (
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

// ═══════════════════════ Frames ═══════════════════════

function FramesAdmin() {
  const { allFrames: frames } = useShowroom();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<typeof frames[0] | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return frames.filter(f => f.name.toLowerCase().includes(q));
  }, [frames, search]);

  const saveFrame = async (data: AssetModalData) => {
    setSaving(true);
    try {
      let imageUrl: string | null = editTarget?.image ?? null;
      if (data.imageFile) {
        const uploaded = await uploadAssetImage(data.imageFile, 'door-frames');
        if (!uploaded) throw new Error('Rasmni yuklab bo\'lmadi (storage). Bucket sozlamalarini tekshiring.');
        imageUrl = uploaded;
      } else if (!data.imagePreview) {
        imageUrl = null;
      }

      const scale = data.frameScale ?? 1.15;
      const offset_y = data.frameOffsetY ?? 0;

      if (editTarget) {
        const { error } = await supabase.from('door_frames').update({
          name: data.name, image_url: imageUrl, scale, offset_y,
        }).eq('id', editTarget.id);
        if (error) throw error;
        toast.success('Ramka yangilandi');
        setEditTarget(null);
      } else {
        const { error } = await supabase.from('door_frames').insert({
          name: data.name, image_url: imageUrl, scale, offset_y, sort_order: frames.length + 1,
        });
        if (error) throw error;
        toast.success('Ramka qo\'shildi');
      }
      setShowModal(false);
    } catch (e: unknown) { toast.error(describeError(e)); }
    setSaving(false);
  };

  const toggleFrame = async (id: string, enabled: boolean) => {
    await supabase.from('door_frames').update({ enabled: !enabled }).eq('id', id);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('door_frames').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    toast.success('O\'chirildi');
  };

  const openEdit = (frame: typeof frames[0]) => {
    setEditTarget(frame);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  const editInitial = editTarget ? {
    id: editTarget.id,
    name: editTarget.name,
    imageUrl: editTarget.image,
    frameScale: editTarget.scale,
    frameOffsetY: editTarget.offsetY,
  } : null;

  return (
    <>
      <SectionHeader title="Ramka modellari" count={frames.length} onAdd={() => { setEditTarget(null); setShowModal(true); }} />
      <SearchBar value={search} onChange={setSearch} placeholder="Ramka nomi bo'yicha qidirish..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {filtered.map(frame => (
          <div key={frame.id} className={cardCls}>
            {frame.image && (
              <div className="mb-3 -mx-1 -mt-1 rounded-lg overflow-hidden">
                <img src={frame.image} alt="" className="w-full h-32 object-contain bg-secondary/20" />
              </div>
            )}
            <div className="flex items-center gap-4">
              {!frame.image && (
                <div className="w-12 h-16 rounded-lg flex-shrink-0 border border-border/40 bg-secondary/20" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground font-medium truncate">{frame.name}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {Math.round(frame.scale * 100)}% o'lcham
                  {frame.offsetY ? <span className="ml-2">· offset {frame.offsetY > 0 ? '+' : ''}{frame.offsetY.toFixed(0)}%</span> : null}
                </p>
              </div>
              <StatusBadge active={frame.enabled} />
            </div>
            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border/20">
              <ToggleSwitch checked={frame.enabled} onChange={() => toggleFrame(frame.id, frame.enabled)} />
              <button onClick={() => openEdit(frame)} className={`${iconBtn} hover:bg-gold/10 text-muted-foreground/50 hover:text-gold border border-transparent hover:border-gold/30`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteTarget({ id: frame.id, name: frame.name })} className={`${iconBtn} hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <AssetModal open={showModal} onClose={closeModal} onSave={saveFrame} type="frame" title={editTarget ? 'Ramkani tahrirlash' : 'Yangi ramka'} saving={saving} initial={editInitial} />
      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name ?? ''} />
    </>
  );
}

