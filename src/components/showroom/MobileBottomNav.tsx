import { useState, useRef, useEffect, useCallback } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { ChevronDown } from 'lucide-react';

type Tab = 'kategoriya' | 'xona' | 'eshik' | 'devor' | 'pol';

/* ── Bottom Sheet ── */
function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          background: 'rgba(0,0,0,0.35)',
        }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-400 ease-out"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '60vh',
          borderRadius: '24px 24px 0 0',
          background: 'linear-gradient(180deg, hsl(220 20% 13% / 0.97) 0%, hsl(220 18% 10% / 0.99) 100%)',
          border: '1px solid hsl(40 60% 55% / 0.1)',
          borderBottom: 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Handle + title */}
        <div className="flex flex-col items-center pt-3 pb-2 px-5">
          <div
            className="w-10 h-1 rounded-full mb-3"
            style={{ background: 'hsl(40 30% 50% / 0.3)' }}
          />
          <div className="w-full flex items-center justify-between">
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-body"
              style={{ color: 'hsl(40 35% 55%)' }}
            >
              {title}
            </p>
            <button onClick={onClose} className="p-1">
              <ChevronDown className="w-4 h-4" style={{ color: 'hsl(40 30% 50%)' }} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div
          className="px-5 pb-8 overflow-y-auto"
          style={{ maxHeight: 'calc(60vh - 60px)', scrollbarWidth: 'none' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

/* ── Category Picker ── */
function CategoryPicker() {
  const { state, allCategories, selectCategory } = useShowroom();
  const enabledCategories = allCategories.filter(c => c.enabled);

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-body mb-3" style={{ color: 'hsl(40 30% 48%)' }}>
        Kategoriya
      </p>
      <div className="flex flex-wrap gap-2">
        {enabledCategories.map(cat => {
          const active = state.selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="px-4 py-2.5 rounded-full font-body text-xs tracking-wide transition-all duration-300"
              style={{
                background: active ? 'hsl(40 50% 55% / 0.15)' : 'hsl(220 15% 18% / 0.6)',
                border: active ? '1px solid hsl(40 60% 55% / 0.4)' : '1px solid hsl(40 60% 55% / 0.08)',
                color: active ? '#D4AF37' : 'hsl(40 15% 55%)',
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Room Design Picker ── */
function RoomDesignPicker() {
  const { state, filteredWalls, selectWall } = useShowroom();

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-body mb-3" style={{ color: 'hsl(40 30% 48%)' }}>
        Xona dizayni
      </p>
      <div className="grid grid-cols-4 gap-3">
        {filteredWalls.length === 0 && (
          <p className="text-xs col-span-4" style={{ color: 'hsl(40 10% 40%)' }}>Dizayn topilmadi</p>
        )}
        {filteredWalls.map(wall => {
          const active = state.selectedWall === wall.id;
          return (
            <button
              key={wall.id}
              onClick={() => selectWall(wall.id)}
              className="flex flex-col items-center gap-1.5 transition-all duration-300"
            >
              <div
                className="w-full aspect-square rounded-xl overflow-hidden"
                style={{
                  boxShadow: active
                    ? '0 0 0 2px #D4AF37, 0 0 12px hsl(40 60% 55% / 0.2)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  transform: active ? 'scale(1.05)' : undefined,
                }}
              >
                {wall.image ? (
                  <img src={wall.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: wall.color }} />
                )}
              </div>
              <span
                className="text-[9px] font-body tracking-wide text-center"
                style={{ color: active ? '#D4AF37' : 'hsl(40 10% 42%)' }}
              >
                {wall.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Door Picker (only door models) ── */
function DoorPicker() {
  const { state, filteredDoors, selectDoor } = useShowroom();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-body mb-3" style={{ color: 'hsl(40 30% 48%)' }}>
        Eshik modellari
      </p>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {filteredDoors.map(door => {
          const active = state.selectedDoor === door.id;
          return (
            <button
              key={door.id}
              onClick={() => selectDoor(door.id)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300"
            >
              <div
                className="w-14 h-20 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  background: 'transparent',
                  boxShadow: active ? '0 0 0 1.5px #D4AF37' : 'none',
                  transform: active ? 'scale(1.05)' : undefined,
                }}
              >
                {door.image ? (
                  <img src={door.image} alt={door.name} className="h-full w-auto object-contain" />
                ) : (
                  <span className="font-display text-lg" style={{ color: 'hsl(40 30% 40%)' }}>⊞</span>
                )}
              </div>
              <span
                className="text-[9px] font-body tracking-wide max-w-[56px] truncate"
                style={{ color: active ? '#D4AF37' : 'hsl(40 10% 42%)' }}
              >
                {door.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Color Picker ── */
function ColorPicker() {
  const { state, filteredColors, selectDoorColor } = useShowroom();

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-body mb-3" style={{ color: 'hsl(40 30% 48%)' }}>
        Eshik rangi
      </p>
      <div className="flex flex-wrap gap-4">
        {filteredColors.length === 0 && (
          <p className="text-xs" style={{ color: 'hsl(40 10% 40%)' }}>Rang tayinlanmagan</p>
        )}
        {filteredColors.map(color => {
          const active = state.selectedDoorColor === color.id;
          return (
            <button
              key={color.id}
              onClick={() => selectDoorColor(color.id)}
              className="flex flex-col items-center gap-1.5 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl"
                style={{
                  backgroundColor: color.hex,
                  boxShadow: active
                    ? '0 0 0 2px #D4AF37, 0 0 14px hsl(40 60% 55% / 0.25)'
                    : 'inset 0 1px 2px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)',
                  transform: active ? 'scale(1.1)' : undefined,
                }}
              />
              <span
                className="text-[9px] font-body tracking-wide"
                style={{ color: active ? '#D4AF37' : 'hsl(40 10% 42%)' }}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Floor Picker ── */
function FloorPicker() {
  const { state, filteredFloors, selectFloor } = useShowroom();

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-body mb-3" style={{ color: 'hsl(40 30% 48%)' }}>
        Pol materiali
      </p>
      <div className="grid grid-cols-4 gap-3">
        {filteredFloors.length === 0 && (
          <p className="text-xs col-span-4" style={{ color: 'hsl(40 10% 40%)' }}>Pol tayinlanmagan</p>
        )}
        {filteredFloors.map(floor => {
          const active = state.selectedFloor === floor.id;
          return (
            <button
              key={floor.id}
              onClick={() => selectFloor(floor.id)}
              className="flex flex-col items-center gap-1.5 transition-all duration-300"
            >
              <div
                className="w-full aspect-square rounded-xl overflow-hidden"
                style={{
                  boxShadow: active
                    ? '0 0 0 2px #D4AF37, 0 0 12px hsl(40 60% 55% / 0.2)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  transform: active ? 'scale(1.05)' : undefined,
                }}
              >
                {floor.image ? (
                  <img src={floor.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: floor.color }} />
                )}
              </div>
              <span
                className="text-[9px] font-body tracking-wide text-center"
                style={{ color: active ? '#D4AF37' : 'hsl(40 10% 42%)' }}
              >
                {floor.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tab icon components ── */
function CategoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : 'hsl(40,15%,50%)'} strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function RoomIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : 'hsl(40,15%,50%)'} strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="1" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="8" y1="4" x2="8" y2="12" />
      <line x1="16" y1="4" x2="16" y2="12" />
      <line x1="12" y1="12" x2="12" y2="20" />
    </svg>
  );
}

function DoorIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : 'hsl(40,15%,50%)'} strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <circle cx="16" cy="12" r="1" fill={active ? '#D4AF37' : 'hsl(40,15%,50%)'} />
    </svg>
  );
}

function WallIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : 'hsl(40,15%,50%)'} strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 C12 3 7 8 7 12 C7 16 12 21 12 21 C12 21 17 16 17 12 C17 8 12 3 12 3Z" />
    </svg>
  );
}

function FloorIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : 'hsl(40,15%,50%)'} strokeWidth="1.5">
      <path d="M2 20 L12 4 L22 20 Z" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

/* ── Main Mobile Bottom Nav ── */
export default function MobileBottomNav() {
  const [activeSheet, setActiveSheet] = useState<Tab | null>(null);

  const tabs: { key: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: 'kategoriya', label: 'Kategoriya', Icon: CategoryIcon },
    { key: 'xona', label: 'Xona', Icon: RoomIcon },
    { key: 'eshik', label: 'Eshik', Icon: DoorIcon },
    { key: 'devor', label: 'Rang', Icon: WallIcon },
    { key: 'pol', label: 'Pol', Icon: FloorIcon },
  ];

  const sheetTitle: Record<Tab, string> = {
    kategoriya: 'Kategoriya tanlash',
    xona: 'Xona dizayni',
    eshik: 'Eshik tanlash',
    devor: 'Eshik rangi',
    pol: 'Pol materiali',
  };

  const toggleSheet = useCallback((tab: Tab) => {
    setActiveSheet(prev => (prev === tab ? null : tab));
  }, []);

  return (
    <>
      {/* Bottom sheets */}
      <BottomSheet
        open={activeSheet === 'kategoriya'}
        onClose={() => setActiveSheet(null)}
        title={sheetTitle.kategoriya}
      >
        <CategoryPicker />
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'xona'}
        onClose={() => setActiveSheet(null)}
        title={sheetTitle.xona}
      >
        <RoomDesignPicker />
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'eshik'}
        onClose={() => setActiveSheet(null)}
        title={sheetTitle.eshik}
      >
        <DoorPicker />
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'devor'}
        onClose={() => setActiveSheet(null)}
        title={sheetTitle.devor}
      >
        <ColorPicker />
      </BottomSheet>

      <BottomSheet
        open={activeSheet === 'pol'}
        onClose={() => setActiveSheet(null)}
        title={sheetTitle.pol}
      >
        <FloorPicker />
      </BottomSheet>

      {/* Fixed bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          height: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'linear-gradient(180deg, hsl(220 20% 11% / 0.92) 0%, hsl(220 18% 8% / 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid hsl(40 60% 55% / 0.08)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {tabs.map(({ key, label, Icon }) => {
          const active = activeSheet === key;
          return (
            <button
              key={key}
              onClick={() => toggleSheet(key)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 transition-all duration-300"
              style={{ opacity: active ? 1 : 0.6 }}
            >
              <Icon active={active} />
              <span
                className="font-body text-[9px] tracking-wider"
                style={{
                  color: active ? '#D4AF37' : 'hsl(40 15% 50%)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

