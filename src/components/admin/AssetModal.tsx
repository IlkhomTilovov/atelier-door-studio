import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Trash2, ChevronDown, Check } from 'lucide-react';
import { DoorCollection } from '@/types/showroom';
import { useShowroom } from '@/context/ShowroomContext';
import { toast } from 'sonner';

const ACCEPTED_IMAGE_TYPES = /^image\/(png|jpeg|jpg|svg\+xml|webp)$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const inputCls = "w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-300";
const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2";
const selectCls = inputCls + " appearance-none cursor-pointer";

export type AssetType = 'door' | 'wall' | 'floor' | 'color' | 'frame';

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
  categoryIds?: string[];
  frameScale?: number;
  frameOffsetY?: number;
}

export interface AssetModalInitial {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string | null;
  collection?: DoorCollection;
  moldingStyle?: 'simple' | 'ornate' | 'minimal';
  panelCount?: 2 | 3 | 4;
  moldingType?: 'classic' | 'modern' | 'ornate';
  pattern?: 'marble' | 'wood' | 'tile';
  textureScale?: 'small' | 'medium' | 'large';
  textureOrientation?: 'horizontal' | 'vertical';
  categoryId?: string;
  categoryIds?: string[];
  frameScale?: number | null;
  frameOffsetY?: number | null;
}

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AssetModalData) => void;
  type: AssetType;
  title: string;
  saving?: boolean;
  initial?: AssetModalInitial | null;
}

export default function AssetModal({ open, onClose, onSave, type, title, saving, initial }: AssetModalProps) {
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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const [frameScale, setFrameScale] = useState<number>(1.15);
  const [frameOffsetY, setFrameOffsetY] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setColor(initial.color || (type === 'floor' ? '#6B6B6B' : '#C4B8A8'));
      setImageFile(null);
      setImagePreview(initial.imageUrl || null);
      setCollection(initial.collection || 'classic');
      setMoldingStyle(initial.moldingStyle || 'simple');
      setPanelCount(initial.panelCount || 2);
      setMoldingType(initial.moldingType || 'classic');
      setPattern(initial.pattern || 'marble');
      setTextureScale(initial.textureScale || 'medium');
      setTextureOrientation(initial.textureOrientation || 'horizontal');
      setCategoryId(initial.categoryId || '');
      setCategoryIds(initial.categoryIds || []);
      setFrameScale(initial.frameScale ?? 1.15);
      setFrameOffsetY(initial.frameOffsetY ?? 0);
    } else {
      setName(''); setColor(type === 'floor' ? '#6B6B6B' : '#C4B8A8');
      setImageFile(null); setImagePreview(null);
      setCollection('classic'); setMoldingStyle('simple'); setPanelCount(2);
      setMoldingType('classic'); setPattern('marble');
      setTextureScale('medium'); setTextureOrientation('horizontal');
      setCategoryId(allCategories[0]?.id || '');
      setCategoryIds([]);
      setFrameScale(1.15);
      setFrameOffsetY(0);
    }
  }, [open, type, allCategories, initial]);

  // Close category dropdown on click outside
  useEffect(() => {
    if (!catDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [catDropdownOpen]);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.test(file.type)) {
      toast.error(`Rasm formati qo'llab-quvvatlanmaydi: ${file.type || 'noma\'lum'}. PNG, JPG, SVG yoki WEBP bo'lishi kerak.`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`Fayl juda katta: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maksimal hajm: 8 MB.`);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.onerror = () => toast.error('Rasmni o\'qib bo\'lmadi.');
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = useCallback(() => {
    if (!name.trim() || saving) return;
    const data: AssetModalData = { name: name.trim(), color, imageFile, imagePreview };
    if (type === 'door') {
      data.collection = collection;
      data.panelCount = panelCount;
      data.categoryIds = categoryIds;
    }
    if (type === 'wall') { data.categoryId = categoryId || undefined; }
    if (type === 'floor') { data.pattern = pattern; data.textureScale = textureScale; data.textureOrientation = 'horizontal'; }
    if (type === 'frame') { data.frameScale = frameScale; data.frameOffsetY = frameOffsetY; }
    onSave(data);
  }, [name, saving, color, imageFile, imagePreview, type, collection, panelCount, categoryIds, categoryId, pattern, textureScale, onSave, frameScale, frameOffsetY]);

  const handler = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { if (catDropdownOpen) { setCatDropdownOpen(false); return; } onClose(); }
    if (e.key === 'Enter' && name.trim() && !saving && !catDropdownOpen) handleSave();
  }, [catDropdownOpen, onClose, name, saving, handleSave]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handler]);

  const isValid = name.trim().length > 0;
  const isEditMode = !!initial;
  if (!open) return null;

  const isWallModal = type === 'wall';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-[560px] md:max-w-[680px] max-h-[92vh] bg-card/95 backdrop-blur-2xl border border-border/30 rounded-2xl shadow-[0_32px_100px_rgba(0,0,0,0.6)] animate-scale-in overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-border/15 flex-shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-body mb-1">
              {type === 'door' ? 'Eshik' : type === 'wall' ? 'Xona dizayni' : type === 'floor' ? 'Pol' : type === 'frame' ? 'Ramka' : 'Rang'}
            </p>
            <h3 className="font-display text-lg sm:text-xl text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-secondary/50 transition-all duration-200 group">
            <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:min-h-[360px] overflow-y-auto">
          {/* LEFT — Image */}
          {type !== 'color' && (
            <div className="w-full md:w-[260px] p-5 md:p-6 border-b md:border-b-0 md:border-r border-border/10 flex flex-col flex-shrink-0">
              <label className={labelCls}>Rasm yuklash</label>
              {!imagePreview ? (
                <label
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`md:flex-1 h-32 md:h-auto rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 md:gap-3 transition-all duration-300 ${
                    dragOver ? 'border-gold/60 bg-gold/5 shadow-[0_0_24px_rgba(180,160,100,0.1)]' : 'border-border/25 hover:border-gold/40 hover:bg-secondary/15 hover:shadow-[0_0_20px_rgba(180,160,100,0.05)]'
                  }`}
                >
                  <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-gold/15 text-gold' : 'bg-secondary/30 text-muted-foreground/40'}`}>
                    <Upload className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-body text-xs text-foreground/70 mb-0.5 md:mb-1">Rasmni tashlang yoki bosing</p>
                    <p className="text-[10px] text-muted-foreground/35">PNG, JPG, SVG, WEBP</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              ) : (
                <div className="md:flex-1 h-40 md:h-auto rounded-xl overflow-hidden relative group/img bg-secondary/15">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-3" />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-all duration-200">
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-body text-foreground hover:bg-background transition-all">Almashtirish</button>
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-3 py-2 rounded-lg bg-destructive/20 backdrop-blur-sm text-xs text-destructive hover:bg-destructive/30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* RIGHT — Form */}
          <div className="flex-1 p-5 md:p-6 flex flex-col">
            <div className="space-y-4 md:space-y-5 flex-1">
              <div>
                <label className={labelCls}>Nomi <span className="text-destructive/60">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Firenze" className={inputCls} maxLength={50} autoFocus />
              </div>

              {(type === 'floor' || type === 'color') && (
                <div>
                  <label className={labelCls}>Rang</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-xl border-2 border-border/40 cursor-pointer bg-transparent flex-shrink-0" />
                    <input value={color} onChange={e => setColor(e.target.value)} className={inputCls + " flex-1 font-mono"} maxLength={7} />
                  </div>
                </div>
              )}

              {type === 'door' && (
                <>
                  <div>
                    <label className={labelCls}>Kategoriyalar</label>
                    {/* Selected tags */}
                    {categoryIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {categoryIds.map(cid => {
                          const cat = allCategories.find(c => c.id === cid);
                          if (!cat) return null;
                          return (
                            <span key={cid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-body bg-gold/15 text-gold border border-gold/25">
                              {cat.name}
                              <button onClick={() => setCategoryIds(ids => ids.filter(id => id !== cid))} className="hover:text-foreground transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Dropdown trigger */}
                    <div ref={catDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setCatDropdownOpen(o => !o)}
                        className={inputCls + " flex items-center justify-between cursor-pointer text-left"}
                      >
                        <span className="text-muted-foreground/50">
                          {categoryIds.length === 0 ? 'Kategoriya tanlang...' : `${categoryIds.length} ta tanlangan`}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {catDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl overflow-hidden py-1 bg-card/95 backdrop-blur-xl border border-border/40 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-fade-in max-h-48 overflow-y-auto">
                          {allCategories.filter(c => c.enabled).map(cat => {
                            const selected = categoryIds.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setCategoryIds(ids => selected ? ids.filter(id => id !== cat.id) : [...ids, cat.id]);
                                }}
                                className="w-full flex items-center gap-3 text-left px-3.5 py-2.5 font-body text-sm tracking-wide transition-all duration-200 hover:bg-secondary/30"
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                  selected ? 'bg-gold/80 border-gold/60' : 'border-border/50'
                                }`}>
                                  {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span className={selected ? 'text-gold' : 'text-foreground/70'}>{cat.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
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

              {type === 'frame' && (
                <>
                  <div>
                    <label className={labelCls}>
                      Ramka o'lchami (eshikga nisbatan)
                      <span className="ml-2 text-gold/70 font-mono normal-case tracking-normal">{Math.round(frameScale * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min={1.0}
                      max={1.5}
                      step={0.01}
                      value={frameScale}
                      onChange={e => setFrameScale(Number(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1 font-mono">
                      <span>100%</span>
                      <span>110%</span>
                      <span>120%</span>
                      <span>130%</span>
                      <span>150%</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>
                      Vertikal joylashuv
                      <span className="ml-2 text-gold/70 font-mono normal-case tracking-normal">{frameOffsetY > 0 ? '+' : ''}{frameOffsetY.toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={frameOffsetY}
                      onChange={e => setFrameOffsetY(Number(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1 font-mono">
                      <span>-30 (yuqoriga)</span>
                      <span>0</span>
                      <span>+30 (pastga)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                    Ramka shaffof fonli (transparent) PNG bo'lishi tavsiya etiladi. Agar kornish (yuqori bezak) eshikdan baland turgan bo'lsa, "Vertikal joylashuv"ni musbat tomonga (pastga) suring.
                  </p>
                </>
              )}

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
                </>
              )}

              {type === 'floor' && (
                <>
                  <div>
                    <label className={labelCls}>Material turi</label>
                    <select value={pattern} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPattern(e.target.value as 'marble' | 'wood' | 'tile')} className={selectCls}>
                      <option value="marble">Marmar</option>
                      <option value="wood">Yog'och</option>
                      <option value="tile">Plitka</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tekstura o'lchami</label>
                    <select value={textureScale} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTextureScale(e.target.value as 'small' | 'medium' | 'large')} className={selectCls}>
                      <option value="small">Kichik</option>
                      <option value="medium">O'rta</option>
                      <option value="large">Katta</option>
                    </select>
                  </div>
                </>
              )}
            </div>

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
                {saving ? 'Saqlanmoqda...' : isEditMode ? 'Yangilash' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
