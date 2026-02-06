import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { DoorCollection } from '@/types/showroom';

/* ── Design tokens ── */
const inputCls = "w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-200";
const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2";
const selectCls = inputCls + " appearance-none cursor-pointer";

export type AssetType = 'door' | 'wall' | 'floor' | 'color';

export interface AssetModalData {
  name: string;
  color: string;
  image: string | null;
  // Door
  collection?: DoorCollection;
  moldingStyle?: 'simple' | 'ornate' | 'minimal';
  panelCount?: 2 | 3 | 4;
  handleType?: 'classic' | 'modern' | 'minimal';
  // Wall
  moldingType?: 'classic' | 'modern' | 'ornate';
  textureScale?: 'small' | 'medium' | 'large';
  // Floor
  pattern?: 'marble' | 'wood' | 'tile';
  patternDirection?: 'horizontal' | 'vertical';
}

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AssetModalData) => void;
  type: AssetType;
  title: string;
}

const typeLabels: Record<AssetType, string> = {
  door: 'Eshik',
  wall: 'Devor',
  floor: 'Pol',
  color: 'Rang',
};

export default function AssetModal({ open, onClose, onSave, type, title }: AssetModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(type === 'floor' ? '#6B6B6B' : '#C4B8A8');
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Door fields
  const [collection, setCollection] = useState<DoorCollection>('classic');
  const [moldingStyle, setMoldingStyle] = useState<'simple' | 'ornate' | 'minimal'>('simple');
  const [panelCount, setPanelCount] = useState<2 | 3 | 4>(2);
  const [handleType, setHandleType] = useState<'classic' | 'modern' | 'minimal'>('classic');

  // Wall fields
  const [moldingType, setMoldingType] = useState<'classic' | 'modern' | 'ornate'>('classic');
  const [textureScale, setTextureScale] = useState<'small' | 'medium' | 'large'>('medium');

  // Floor fields
  const [pattern, setPattern] = useState<'marble' | 'wood' | 'tile'>('marble');
  const [patternDirection, setPatternDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  // Reset on open
  useEffect(() => {
    if (open) {
      setName('');
      setColor(type === 'floor' ? '#6B6B6B' : '#C4B8A8');
      setImage(null);
      setCollection('classic');
      setMoldingStyle('simple');
      setPanelCount(2);
      setHandleType('classic');
      setMoldingType('classic');
      setTextureScale('medium');
      setPattern('marble');
      setPatternDirection('horizontal');
    }
  }, [open, type]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && name.trim()) handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, name]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = () => {
    if (!name.trim()) return;
    const data: AssetModalData = { name: name.trim(), color, image };
    if (type === 'door') {
      data.collection = collection;
      data.moldingStyle = moldingStyle;
      data.panelCount = panelCount;
      data.handleType = handleType;
    }
    if (type === 'wall') {
      data.moldingType = moldingType;
      data.textureScale = textureScale;
    }
    if (type === 'floor') {
      data.pattern = pattern;
      data.patternDirection = patternDirection;
    }
    onSave(data);
  };

  const isValid = name.trim().length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[720px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-[0_32px_100px_rgba(0,0,0,0.6)] animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border/20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-body mb-1">{typeLabels[type]}</p>
            <h3 className="font-display text-xl text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-secondary/50 transition-all duration-200 group">
            <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex min-h-[360px]">

          {/* LEFT — Image Upload */}
          {type !== 'color' && (
            <div className="w-[280px] p-6 border-r border-border/15 flex flex-col">
              <label className={labelCls}>Rasm yuklash</label>

              {!image ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex-1 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    dragOver
                      ? 'border-gold/60 bg-gold/5 shadow-[inset_0_0_30px_rgba(180,160,100,0.05)]'
                      : 'border-border/30 hover:border-gold/40 hover:bg-secondary/20'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    dragOver ? 'bg-gold/15 text-gold' : 'bg-secondary/40 text-muted-foreground/50'
                  }`}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-body text-xs text-foreground/80 mb-1">Rasmni tashlang yoki bosing</p>
                    <p className="text-[10px] text-muted-foreground/40">PNG, JPG, SVG</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-xl overflow-hidden relative group/img bg-secondary/20">
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-3" />
                  {/* Live color tint overlay */}
                  <div
                    className="absolute inset-0 mix-blend-multiply opacity-20 pointer-events-none rounded-xl"
                    style={{ backgroundColor: color }}
                  />
                  {/* Actions */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-1 group-hover/img:opacity-100 group-hover/img:translate-y-0 transition-all duration-200">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-body text-foreground hover:bg-background transition-all"
                    >
                      Almashtirish
                    </button>
                    <button
                      onClick={() => setImage(null)}
                      className="px-3 py-2 rounded-lg bg-destructive/20 backdrop-blur-sm text-xs text-destructive hover:bg-destructive/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />

              {/* Color live preview */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.25)] flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground/50 font-body">Ko'rinish</p>
                  <p className="text-xs font-mono text-foreground/70 mt-0.5">{color}</p>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT — Form */}
          <div className={`flex-1 p-6 flex flex-col ${type === 'color' ? '' : ''}`}>
            <div className="space-y-4 flex-1">

              {/* Name */}
              <div>
                <label className={labelCls}>Nomi <span className="text-destructive/60">*</span></label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={`Masalan: ${type === 'door' ? 'Firenze' : type === 'wall' ? 'Marmar oq' : type === 'floor' ? 'Tik yog\'och' : 'Oltin'}`}
                  className={inputCls}
                  maxLength={50}
                  autoFocus
                />
              </div>

              {/* Color */}
              <div>
                <label className={labelCls}>Rang</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-12 h-12 rounded-xl border-2 border-border/40 cursor-pointer bg-transparent flex-shrink-0"
                  />
                  <input
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className={inputCls + " flex-1 font-mono"}
                    maxLength={7}
                  />
                </div>
              </div>

              {/* ── Conditional: DOOR ── */}
              {type === 'door' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Kategoriya</label>
                      <select value={collection} onChange={e => setCollection(e.target.value as DoorCollection)} className={selectCls}>
                        <option value="classic">Klassik</option>
                        <option value="neo-classic">Neo-Klassik</option>
                        <option value="luxury">Lyuks</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Molding</label>
                      <select value={moldingStyle} onChange={e => setMoldingStyle(e.target.value as any)} className={selectCls}>
                        <option value="simple">Oddiy</option>
                        <option value="ornate">Bezakli</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Panellar soni</label>
                      <select value={panelCount} onChange={e => setPanelCount(Number(e.target.value) as 2 | 3 | 4)} className={selectCls}>
                        <option value={2}>2 ta panel</option>
                        <option value={3}>3 ta panel</option>
                        <option value={4}>4 ta panel</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tutqich turi</label>
                      <select value={handleType} onChange={e => setHandleType(e.target.value as any)} className={selectCls}>
                        <option value="classic">Klassik</option>
                        <option value="modern">Zamonaviy</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ── Conditional: WALL ── */}
              {type === 'wall' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Molding turi</label>
                    <select value={moldingType} onChange={e => setMoldingType(e.target.value as any)} className={selectCls}>
                      <option value="classic">Klassik</option>
                      <option value="modern">Zamonaviy</option>
                      <option value="ornate">Bezakli</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tekstura o'lchami</label>
                    <select value={textureScale} onChange={e => setTextureScale(e.target.value as any)} className={selectCls}>
                      <option value="small">Kichik</option>
                      <option value="medium">O'rta</option>
                      <option value="large">Katta</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Conditional: FLOOR ── */}
              {type === 'floor' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Material turi</label>
                    <select value={pattern} onChange={e => setPattern(e.target.value as any)} className={selectCls}>
                      <option value="marble">Marmar</option>
                      <option value="wood">Yog'och</option>
                      <option value="tile">Plitka</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Naqsh yo'nalishi</label>
                    <select value={patternDirection} onChange={e => setPatternDirection(e.target.value as any)} className={selectCls}>
                      <option value="horizontal">Gorizontal</option>
                      <option value="vertical">Vertikal</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border/15">
              <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-body text-sm tracking-wide transition-all duration-300 ${
                  isValid
                    ? 'bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.25)] hover:shadow-[0_6px_24px_rgba(180,160,100,0.35)] hover:-translate-y-0.5'
                    : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
