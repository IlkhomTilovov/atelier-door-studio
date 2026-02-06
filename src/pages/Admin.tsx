import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection } from '@/types/showroom';
import { collectionNames } from '@/data/showroom-data';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, X } from 'lucide-react';

type AdminTab = 'doors' | 'walls' | 'floors';

/* ── Shared form styles ── */
const inputCls = "w-full bg-input border border-border rounded-sm px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 transition-colors";
const labelCls = "block text-xs uppercase tracking-[0.15em] text-muted-foreground font-body mb-1.5";
const btnPrimary = "px-5 py-2.5 rounded-sm font-body text-sm tracking-wide bg-primary/20 text-gold border border-gold-strong hover:bg-primary/30 transition-colors";
const btnCancel = "px-5 py-2.5 rounded-sm font-body text-sm tracking-wide text-muted-foreground border border-border hover:bg-secondary/40 transition-colors";

function FormCard({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="bg-card border border-border rounded-sm p-5 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base text-foreground">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-sm transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ────────────────────── Main ────────────────────── */

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('doors');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body text-sm">Showroom</span>
        </Link>
        <div className="w-px h-6 bg-border" />
        <h1 className="font-display text-xl text-gold tracking-wider">Admin Panel</h1>
      </header>

      <div className="border-b border-border px-6 flex gap-1">
        {(['doors', 'walls', 'floors'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 font-body text-sm tracking-wide border-b-2 transition-colors ${
              tab === t ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'doors' ? 'Eshiklar' : t === 'walls' ? 'Devorlar' : 'Pollar'}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto admin-scroll">
        {tab === 'doors' && <DoorsAdmin />}
        {tab === 'walls' && <WallsAdmin />}
        {tab === 'floors' && <FloorsAdmin />}
      </div>
    </div>
  );
}

/* ────────────────────── Doors ────────────────────── */

function DoorsAdmin() {
  const { doors, setDoors, colors, setColors } = useShowroom();
  const [showDoorForm, setShowDoorForm] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);

  // Door form state
  const [doorName, setDoorName] = useState('');
  const [doorCollection, setDoorCollection] = useState<DoorCollection>('classic');
  const [doorMolding, setDoorMolding] = useState<'simple' | 'ornate' | 'minimal'>('simple');
  const [doorPanels, setDoorPanels] = useState<2 | 3 | 4>(2);

  // Color form state
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#C4B8A8');

  const addDoor = () => {
    if (!doorName.trim()) return;
    const id = `door-${Date.now()}`;
    const newDoor: DoorModel = {
      id, name: doorName.trim(), collection: doorCollection,
      moldingStyle: doorMolding, panelCount: doorPanels, enabled: true,
    };
    setDoors(prev => [...prev, newDoor]);
    setDoorName('');
    setShowDoorForm(false);
  };

  const addColor = () => {
    if (!colorName.trim()) return;
    const id = `color-${Date.now()}`;
    const newColor: DoorColor = { id, name: colorName.trim(), hex: colorHex, enabled: true };
    setColors(prev => [...prev, newColor]);
    setColorName('');
    setColorHex('#C4B8A8');
    setShowColorForm(false);
  };

  const toggleDoor = (id: string) => setDoors(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
  const removeDoor = (id: string) => setDoors(prev => prev.filter(d => d.id !== id));
  const toggleColor = (id: string) => setColors(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  const removeColor = (id: string) => setColors(prev => prev.filter(c => c.id !== id));

  return (
    <div className="space-y-8">
      {/* Door models */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">Eshik modellari</h2>
          <button onClick={() => setShowDoorForm(true)} className={btnPrimary + " flex items-center gap-2"}>
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>

        <FormCard open={showDoorForm} onClose={() => setShowDoorForm(false)} title="Yangi eshik modeli">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Nomi</label>
              <input value={doorName} onChange={e => setDoorName(e.target.value)} placeholder="Masalan: Firenze" className={inputCls} maxLength={50} />
            </div>
            <div>
              <label className={labelCls}>Kolleksiya</label>
              <select value={doorCollection} onChange={e => setDoorCollection(e.target.value as DoorCollection)} className={inputCls}>
                <option value="classic">Klassik</option>
                <option value="neo-classic">Neo-Klassik</option>
                <option value="luxury">Lyuks</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Molding uslubi</label>
              <select value={doorMolding} onChange={e => setDoorMolding(e.target.value as any)} className={inputCls}>
                <option value="simple">Oddiy</option>
                <option value="ornate">Bezakli</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Panellar soni</label>
              <select value={doorPanels} onChange={e => setDoorPanels(Number(e.target.value) as 2 | 3 | 4)} className={inputCls}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowDoorForm(false)} className={btnCancel}>Bekor qilish</button>
            <button onClick={addDoor} className={btnPrimary}>Saqlash</button>
          </div>
        </FormCard>

        <div className="space-y-2">
          {doors.map(door => (
            <div key={door.id} className="flex items-center justify-between bg-card px-4 py-3 rounded-sm border border-border">
              <div>
                <span className="font-body text-sm text-foreground">{door.name}</span>
                <span className="ml-3 text-xs text-muted-foreground">{collectionNames[door.collection]}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleDoor(door.id)} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                  {door.enabled ? <Eye className="w-4 h-4 text-gold" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => removeDoor(door.id)} className="p-2 hover:bg-destructive/20 rounded-sm transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Door colors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">Eshik ranglari</h2>
          <button onClick={() => setShowColorForm(true)} className={btnPrimary + " flex items-center gap-2"}>
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>

        <FormCard open={showColorForm} onClose={() => setShowColorForm(false)} title="Yangi rang">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Nomi</label>
              <input value={colorName} onChange={e => setColorName(e.target.value)} placeholder="Masalan: Oltin" className={inputCls} maxLength={30} />
            </div>
            <div>
              <label className={labelCls}>Rang</label>
              <div className="flex items-center gap-3">
                <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer bg-transparent" />
                <input value={colorHex} onChange={e => setColorHex(e.target.value)} className={inputCls + " flex-1"} maxLength={7} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowColorForm(false)} className={btnCancel}>Bekor qilish</button>
            <button onClick={addColor} className={btnPrimary}>Saqlash</button>
          </div>
        </FormCard>

        <div className="grid grid-cols-2 gap-2">
          {colors.map(color => (
            <div key={color.id} className="flex items-center justify-between bg-card px-4 py-3 rounded-sm border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm border border-border" style={{ backgroundColor: color.hex }} />
                <span className="font-body text-sm">{color.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleColor(color.id)} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                  {color.enabled ? <Eye className="w-4 h-4 text-gold" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => removeColor(color.id)} className="p-2 hover:bg-destructive/20 rounded-sm transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── Walls ────────────────────── */

function WallsAdmin() {
  const { walls, setWalls } = useShowroom();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#C4B8A8');
  const [moldingType, setMoldingType] = useState<'classic' | 'modern' | 'ornate'>('classic');

  const addWall = () => {
    if (!name.trim()) return;
    const newWall: WallStyle = {
      id: `wall-${Date.now()}`, name: name.trim(), color, moldingType, enabled: true,
    };
    setWalls(prev => [...prev, newWall]);
    setName(''); setColor('#C4B8A8');
    setShowForm(false);
  };

  const toggleWall = (id: string) => setWalls(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  const removeWall = (id: string) => setWalls(prev => prev.filter(w => w.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-foreground">Devor uslublari</h2>
        <button onClick={() => setShowForm(true)} className={btnPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      <FormCard open={showForm} onClose={() => setShowForm(false)} title="Yangi devor uslubi">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelCls}>Nomi</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Marmar oq" className={inputCls} maxLength={40} />
          </div>
          <div>
            <label className={labelCls}>Rang</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer bg-transparent" />
              <input value={color} onChange={e => setColor(e.target.value)} className={inputCls + " flex-1"} maxLength={7} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Molding turi</label>
            <select value={moldingType} onChange={e => setMoldingType(e.target.value as any)} className={inputCls}>
              <option value="classic">Klassik</option>
              <option value="modern">Zamonaviy</option>
              <option value="ornate">Bezakli</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowForm(false)} className={btnCancel}>Bekor qilish</button>
          <button onClick={addWall} className={btnPrimary}>Saqlash</button>
        </div>
      </FormCard>

      <div className="space-y-2">
        {walls.map(wall => (
          <div key={wall.id} className="flex items-center justify-between bg-card px-4 py-3 rounded-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm border border-border" style={{ backgroundColor: wall.color }} />
              <span className="font-body text-sm">{wall.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleWall(wall.id)} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                {wall.enabled ? <Eye className="w-4 h-4 text-gold" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => removeWall(wall.id)} className="p-2 hover:bg-destructive/20 rounded-sm transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── Floors ────────────────────── */

function FloorsAdmin() {
  const { floors, setFloors } = useShowroom();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B6B6B');
  const [pattern, setPattern] = useState<'marble' | 'wood' | 'tile'>('marble');

  const addFloor = () => {
    if (!name.trim()) return;
    const newFloor: FloorMaterial = {
      id: `floor-${Date.now()}`, name: name.trim(), color, pattern, enabled: true,
    };
    setFloors(prev => [...prev, newFloor]);
    setName(''); setColor('#6B6B6B');
    setShowForm(false);
  };

  const toggleFloor = (id: string) => setFloors(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  const removeFloor = (id: string) => setFloors(prev => prev.filter(f => f.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-foreground">Pol materiallari</h2>
        <button onClick={() => setShowForm(true)} className={btnPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      <FormCard open={showForm} onClose={() => setShowForm(false)} title="Yangi pol materiali">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelCls}>Nomi</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Tik yog'och" className={inputCls} maxLength={40} />
          </div>
          <div>
            <label className={labelCls}>Rang</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer bg-transparent" />
              <input value={color} onChange={e => setColor(e.target.value)} className={inputCls + " flex-1"} maxLength={7} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Naqsh turi</label>
            <select value={pattern} onChange={e => setPattern(e.target.value as any)} className={inputCls}>
              <option value="marble">Marmar</option>
              <option value="wood">Yog'och</option>
              <option value="tile">Plitka</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowForm(false)} className={btnCancel}>Bekor qilish</button>
          <button onClick={addFloor} className={btnPrimary}>Saqlash</button>
        </div>
      </FormCard>

      <div className="space-y-2">
        {floors.map(floor => (
          <div key={floor.id} className="flex items-center justify-between bg-card px-4 py-3 rounded-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm border border-border" style={{ backgroundColor: floor.color }} />
              <span className="font-body text-sm">{floor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleFloor(floor.id)} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                {floor.enabled ? <Eye className="w-4 h-4 text-gold" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => removeFloor(floor.id)} className="p-2 hover:bg-destructive/20 rounded-sm transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
