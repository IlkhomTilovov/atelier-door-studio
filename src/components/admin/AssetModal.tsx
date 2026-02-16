import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { DoorCollection } from '@/types/showroom';
import { useShowroom } from '@/context/ShowroomContext';

const inputCls = "w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-300";
const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2";
const selectCls = inputCls + " appearance-none cursor-pointer";

export type AssetType = 'door' | 'wall' | 'floor' | 'color';

export interface AssetModalData {
  name: string;
  color: string;
  imageFile: File | null;
  imagePreview: string | null;
  collection?: DoorCollection;
  moldingStyle?: 'simple' | 'ornate' | 'minimal';
  panelCount?: 2 | 3 | 4;
  moldingType?: 'classic' | 'modern' | 'ornate';
  pattern?: 'marble' | 'wood' | 'tile';
  textureScale?: 'small' | 'medium' | 'large';
  textureOrientation?: 'horizontal' | 'vertical';
  categoryId?: string;
}

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AssetModalData) => void;
  type: AssetType;
  title: string;
  saving?: boolean;
}

export default function AssetModal({ open, onClose, onSave, type, title, saving }: AssetModalProps) {
  const { allCategories } = useShowroom();
  const [name, setName] = useState('');
  const [color, setColor] = useState(type === 'floor' ? '#6B6B6B' : '#C4B8A8');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [collection, setCollection] = useState<DoorCollection>('classic');
  const [moldingStyle, setMoldingStyle] = useState<'simple' | 'ornate' | 'minimal'>('simple');
  const [panelCount, setPanelCount] = useState<2 | 3 | 4>(2);
  const [moldingType, setMoldingType] = useState<'classic' | 'modern' | 'ornate'>('classic');
  const [pattern, setPattern] = useState<'marble' | 'wood' | 'tile'>('marble');
  const [textureScale, setTextureScale] = useState<'small' | 'medium' | 'large'>('medium');
  const [textureOrientation, setTextureOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    if (open) {
      setName(''); setColor(type === 'floor' ? '#6B6B6B' : '#C4B8A8');
      setImageFile(null); setImagePreview(null);
      setCollection('classic'); setMoldingStyle('simple'); setPanelCount(2);
      setMoldingType('classic'); setPattern('marble');
      setTextureScale('medium'); setTextureOrientation('horizontal');
      setCategoryId(allCategories[0]?.id || '');
    }
  }, [open, type, allCategories]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && name.trim() && !saving) handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, name, saving]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml)/)) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = () => {
    if (!name.trim() || saving) return;
    const data: AssetModalData = { name: name.trim(), color, imageFile, imagePreview };
    if (type === 'door') { data.collection = collection; data.moldingStyle = moldingStyle; data.panelCount = panelCount; }
    if (type === 'wall') { data.moldingType = moldingType; data.categoryId = categoryId || undefined; }
    if (type === 'floor') { data.pattern = pattern; data.textureScale = textureScale; data.textureOrientation = 'horizontal'; }
    onSave(data);
  };

  const isValid = name.trim().length > 0;
  if (!open) return null;

  // Determine if this is the wall/room design modal — uses the premium layout
  const isWallModal = type === 'wall';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-[720px] bg-card/95 backdrop-blur-2xl border border-border/30 rounded-2xl shadow-[0_32px_100px_rgba(0,0,0,0.6)] animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border/15">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-body mb-1">
              {type === 'door' ? 'Eshik' : type === 'wall' ? 'Xona dizayni' : type === 'floor' ? 'Pol' : 'Rang'}
            </p>
            <h3 className="font-display text-xl text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-secondary/50 transition-all duration-200 group">
            <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <div className="flex min-h-[360px]">
          {/* LEFT — Image (not for color type) */}
          {type !== 'color' && (
            <div className="w-[280px] p-6 border-r border-border/10 flex flex-col">
              <label className={labelCls}>Rasm yuklash</label>
              {!imagePreview ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex-1 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    dragOver ? 'border-gold/60 bg-gold/5 shadow-[0_0_24px_rgba(180,160,100,0.1)]' : 'border-border/25 hover:border-gold/40 hover:bg-secondary/15 hover:shadow-[0_0_20px_rgba(180,160,100,0.05)]'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-gold/15 text-gold' : 'bg-secondary/30 text-muted-foreground/40'}`}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-body text-xs text-foreground/70 mb-1">Rasmni tashlang yoki bosing</p>
                    <p className="text-[10px] text-muted-foreground/35">PNG, JPG, SVG</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-xl overflow-hidden relative group/img bg-secondary/15">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-3" />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-all duration-200">
                    <button onClick={() => fileRef.current?.click()} className="flex-1 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-body text-foreground hover:bg-background transition-all">Almashtirish</button>
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-3 py-2 rounded-lg bg-destructive/20 backdrop-blur-sm text-xs text-destructive hover:bg-destructive/30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {/* RIGHT — Form */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="space-y-5 flex-1">
              {/* Name — always shown */}
              <div>
                <label className={labelCls}>Nomi <span className="text-destructive/60">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Firenze" className={inputCls} maxLength={50} autoFocus />
              </div>

              {/* Color — only for non-wall types that need it */}
              {type !== 'wall' && (
                <div>
                  <label className={labelCls}>Rang</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-xl border-2 border-border/40 cursor-pointer bg-transparent flex-shrink-0" />
                    <input value={color} onChange={e => setColor(e.target.value)} className={inputCls + " flex-1 font-mono"} maxLength={7} />
                  </div>
                </div>
              )}

              {/* Door-specific fields */}
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
                  <div>
                    <label className={labelCls}>Panellar soni</label>
                    <select value={panelCount} onChange={e => setPanelCount(Number(e.target.value) as 2 | 3 | 4)} className={selectCls}>
                      <option value={2}>2 ta panel</option>
                      <option value={3}>3 ta panel</option>
                      <option value={4}>4 ta panel</option>
                    </select>
                  </div>
                </>
              )}

              {/* Wall/Room Design — clean premium layout, NO color */}
              {isWallModal && (
                <>
                  <div>
                    <label className={labelCls}>Kategoriya</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={selectCls}>
                      <option value="">Kategoriyasiz</option>
                      {allCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Molding turi</label>
                    <select value={moldingType} onChange={e => setMoldingType(e.target.value as any)} className={selectCls}>
                      <option value="classic">Klassik</option>
                      <option value="modern">Zamonaviy</option>
                      <option value="ornate">Bezakli</option>
                    </select>
                  </div>
                </>
              )}

              {/* Floor-specific fields */}
              {type === 'floor' && (
                <>
                  <div>
                    <label className={labelCls}>Material turi</label>
                    <select value={pattern} onChange={e => setPattern(e.target.value as any)} className={selectCls}>
                      <option value="marble">Marmar</option>
                      <option value="wood">Yog'och</option>
                      <option value="tile">Plitka</option>
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
                </>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border/10">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200">Bekor qilish</button>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-body text-sm tracking-wide transition-all duration-300 ${
                  isValid && !saving
                    ? 'bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.25)] hover:shadow-[0_8px_28px_rgba(180,160,100,0.4)] hover:-translate-y-0.5'
                    : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
