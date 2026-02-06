import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection } from '@/types/showroom';
import { collectionNames } from '@/data/showroom-data';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

type AdminTab = 'doors' | 'walls' | 'floors';

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('doors');
  const ctx = useShowroom();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body text-sm">Showroom</span>
        </Link>
        <div className="w-px h-6 bg-border" />
        <h1 className="font-display text-xl text-gold tracking-wider">Admin Panel</h1>
      </header>

      {/* Tabs */}
      <div className="border-b border-border px-6 flex gap-1">
        {(['doors', 'walls', 'floors'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 font-body text-sm tracking-wide border-b-2 transition-colors ${
              tab === t
                ? 'border-gold text-gold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'doors' ? 'Eshiklar' : t === 'walls' ? 'Devorlar' : 'Pollar'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {tab === 'doors' && <DoorsAdmin />}
        {tab === 'walls' && <WallsAdmin />}
        {tab === 'floors' && <FloorsAdmin />}
      </div>
    </div>
  );
}

function DoorsAdmin() {
  const { doors, setDoors, colors, setColors } = useShowroom();

  const toggleDoor = (id: string) => {
    setDoors(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };

  const removeDoor = (id: string) => {
    setDoors(prev => prev.filter(d => d.id !== id));
  };

  const toggleColor = (id: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg text-foreground mb-4">Eshik modellari</h2>
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

      <div>
        <h2 className="font-display text-lg text-foreground mb-4">Eshik ranglari</h2>
        <div className="grid grid-cols-2 gap-2">
          {colors.map(color => (
            <div key={color.id} className="flex items-center justify-between bg-card px-4 py-3 rounded-sm border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm border border-border" style={{ backgroundColor: color.hex }} />
                <span className="font-body text-sm">{color.name}</span>
              </div>
              <button onClick={() => toggleColor(color.id)} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                {color.enabled ? <Eye className="w-4 h-4 text-gold" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WallsAdmin() {
  const { walls, setWalls } = useShowroom();

  const toggleWall = (id: string) => {
    setWalls(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const removeWall = (id: string) => {
    setWalls(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div>
      <h2 className="font-display text-lg text-foreground mb-4">Devor uslublari</h2>
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

function FloorsAdmin() {
  const { floors, setFloors } = useShowroom();

  const toggleFloor = (id: string) => {
    setFloors(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const removeFloor = (id: string) => {
    setFloors(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div>
      <h2 className="font-display text-lg text-foreground mb-4">Pol materiallari</h2>
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
