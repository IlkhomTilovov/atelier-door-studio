import { useState, useRef, useEffect, useCallback } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/* ── Single-item swipe carousel ── */
function RoomDesignSwiper({
  walls,
  selectedId,
  onSelect,
}: {
  walls: { id: string; name: string; color: string; image?: string | null }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const idx = Math.max(0, walls.findIndex(w => w.id === selectedId));
  const dragRef = useRef({ startX: 0, dragging: false });

  const go = useCallback(
    (dir: number) => {
      const next = idx + dir;
      if (next >= 0 && next < walls.length) onSelect(walls[next].id);
    },
    [idx, walls, onSelect],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const diff = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(diff) > 30) go(diff < 0 ? 1 : -1);
  };

  if (walls.length === 0) {
    return (
      <p className="text-xs text-center py-3" style={{ color: 'hsl(40 10% 40%)' }}>
        Dizayn topilmadi
      </p>
    );
  }

  const wall = walls[idx];

  return (
    <div
      className="select-none touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ cursor: 'grab' }}
    >
      {/* Card */}
      <div
        key={wall.id}
        className="mx-auto flex flex-col items-center gap-2 rounded-2xl overflow-hidden transition-all duration-400 animate-fade-in"
        style={{
          width: '160px',
          background: 'linear-gradient(135deg, hsl(40 50% 55% / 0.1), hsl(40 45% 50% / 0.03))',
          border: '1.5px solid hsl(40 60% 55% / 0.4)',
          boxShadow: '0 0 20px hsl(40 60% 55% / 0.1), 0 6px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div
          className="w-full overflow-hidden"
          style={{ height: '120px' }}
        >
          {wall.image ? (
            <img src={wall.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: wall.color }} />
          )}
        </div>
        <span className="text-xs font-body tracking-wide pb-2.5" style={{ color: 'hsl(40 55% 72%)' }}>
          {wall.name}
        </span>
      </div>

      {/* Dots */}
      {walls.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {walls.map((w, i) => (
            <button
              key={w.id}
              onClick={(e) => { e.stopPropagation(); onSelect(w.id); }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? '14px' : '5px',
                height: '5px',
                background: i === idx ? 'hsl(40 60% 58%)' : 'hsl(40 20% 35% / 0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Door Model Carousel ── */
function DoorCarousel({
  doors,
  selectedId,
  onSelect,
}: {
  doors: { id: string; name: string; image?: string | null; panelCount?: number }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, dragging: false });

  const scrollToItem = useCallback((id: string) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const idx = doors.findIndex(d => d.id === id);
    if (idx < 0) return;
    const itemWidth = 140;
    const gap = 12;
    const center = container.clientWidth / 2 - itemWidth / 2;
    container.scrollTo({ left: idx * (itemWidth + gap) - center + (itemWidth + gap) / 2 - itemWidth / 2, behavior: 'smooth' });
  }, [doors]);

  // Scroll to selected on mount & selection change
  useEffect(() => {
    if (selectedId) setTimeout(() => scrollToItem(selectedId), 50);
  }, [selectedId, scrollToItem]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    dragState.current = { startX: e.clientX, scrollLeft: scrollRef.current.scrollLeft, dragging: true };
    scrollRef.current.style.cursor = 'grabbing';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging || !scrollRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragState.current.dragging = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  if (doors.length === 0) {
    return (
      <p className="text-xs text-center py-4" style={{ color: 'hsl(40 10% 40%)' }}>
        Bu xona uchun eshik tayinlanmagan
      </p>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory select-none touch-pan-x"
        style={{ cursor: 'grab', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {/* Left spacer for centering */}
        <div className="flex-shrink-0" style={{ width: 'calc(50% - 70px)' }} />
        {doors.map(door => {
          const active = selectedId === door.id;
          return (
            <button
              key={door.id}
              onClick={() => { onSelect(door.id); scrollToItem(door.id); }}
              className="flex-shrink-0 snap-center flex flex-col items-center rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                width: '140px',
                transform: active ? 'scale(1.05)' : 'scale(0.92)',
                opacity: active ? 1 : 0.65,
                background: active
                  ? 'linear-gradient(135deg, hsl(40 50% 55% / 0.12), hsl(40 45% 50% / 0.04))'
                  : 'hsl(220 15% 16% / 0.4)',
                border: active
                  ? '1.5px solid hsl(40 60% 55% / 0.5)'
                  : '1px solid hsl(40 60% 55% / 0.08)',
                boxShadow: active
                  ? '0 0 24px hsl(40 60% 55% / 0.15), 0 8px 24px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Image */}
              <div className="w-full overflow-hidden" style={{ height: '100px' }}>
                {door.image ? (
                  <img src={door.image} alt={door.name} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsl(220 15% 20%)' }}>
                    <span className="font-display text-2xl" style={{ color: 'hsl(40 30% 40%)' }}>⊞</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="w-full px-2.5 py-2 text-center">
                <p className="font-body text-xs font-medium tracking-wide truncate" style={{ color: active ? 'hsl(40 55% 72%)' : 'hsl(40 15% 55%)' }}>
                  {door.name}
                </p>
                {door.panelCount && (
                  <p className="font-body text-[9px] mt-0.5" style={{ color: 'hsl(40 15% 42%)' }}>
                    {door.panelCount} panel
                  </p>
                )}
              </div>
            </button>
          );
        })}
        {/* Right spacer for centering */}
        <div className="flex-shrink-0" style={{ width: 'calc(50% - 70px)' }} />
      </div>

      {/* Dots indicator */}
      {doors.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-1">
          {doors.map(d => {
            const active = selectedId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => { onSelect(d.id); scrollToItem(d.id); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? '14px' : '5px',
                  height: '5px',
                  background: active ? 'hsl(40 60% 58%)' : 'hsl(40 20% 35% / 0.5)',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeftPanel() {
  const { state, allCategories, filteredWalls, filteredDoors, selectCategory, selectDoor, selectWall } = useShowroom();
  const enabledCategories = allCategories.filter(c => c.enabled);
  const [collapsed, setCollapsed] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useClickOutside(catRef as React.RefObject<HTMLElement>, () => setCatOpen(false));

  const selectedCat = enabledCategories.find(c => c.id === state.selectedCategory);

  const handleCatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setCatOpen(false);
    if (!catOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return setCatOpen(true); }
    if (!catOpen) return;
    const i = enabledCategories.findIndex(c => c.id === state.selectedCategory);
    if (e.key === 'ArrowDown') { e.preventDefault(); selectCategory(enabledCategories[(i + 1) % enabledCategories.length].id); }
    if (e.key === 'ArrowUp') { e.preventDefault(); selectCategory(enabledCategories[(i - 1 + enabledCategories.length) % enabledCategories.length].id); }
    if (e.key === 'Enter') setCatOpen(false);
  };

  const triggerStyle = {
    background: 'hsl(220 15% 16% / 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid hsl(40 60% 55% / 0.15)',
    color: 'hsl(40 40% 75%)',
  };

  const dropdownStyle: React.CSSProperties = {
    background: 'hsl(220 18% 14% / 0.92)',
    backdropFilter: 'blur(20px)',
    border: '1px solid hsl(40 60% 55% / 0.12)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px hsl(40 60% 55% / 0.06)',
  };

  return (
    <div className="relative flex items-stretch">
      <div
        className={`glass-panel glass-scrollbar h-full flex flex-col py-6 rounded-2xl overflow-hidden transition-all duration-500 ${collapsed ? 'w-0 px-0 opacity-0 pointer-events-none' : 'px-5 opacity-100'}`}
        style={{ width: collapsed ? '0px' : '240px' }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl tracking-[0.3em]" style={{ color: 'hsl(40 55% 68%)' }}>
            SHOWROOM
          </h1>
          <div className="w-12 h-px mx-auto mt-3" style={{ background: 'linear-gradient(90deg, transparent, hsl(40 60% 55% / 0.5), transparent)' }} />
        </div>

        {/* Category Dropdown */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mb-2" style={{ color: 'hsl(40 30% 50%)' }}>
          Kategoriya
        </p>
        <div ref={catRef} className="relative mb-5" onKeyDown={handleCatKey} tabIndex={0}>
          <button
            onClick={() => setCatOpen(o => !o)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-body text-sm tracking-wide transition-all duration-300 outline-none"
            style={{
              ...triggerStyle,
              boxShadow: catOpen ? '0 0 0 1px hsl(40 60% 55% / 0.35), 0 0 16px hsl(40 60% 55% / 0.08)' : 'none',
            }}
          >
            <span className="truncate">{selectedCat?.name || 'Tanlang...'}</span>
            <ChevronDown
              className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
              style={{ color: 'hsl(40 40% 60%)', transform: catOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>
          {catOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden py-1 animate-fade-in" style={dropdownStyle}>
              {enabledCategories.map(cat => {
                const active = state.selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { selectCategory(cat.id); setCatOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 font-body text-sm tracking-wide transition-all duration-200"
                    style={{
                      background: active ? 'linear-gradient(90deg, hsl(40 50% 55% / 0.15), transparent)' : 'transparent',
                      color: active ? 'hsl(40 55% 72%)' : 'hsl(40 15% 58%)',
                      borderLeft: active ? '2px solid hsl(40 60% 55% / 0.6)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.background = 'hsl(40 50% 55% / 0.06)'; }}
                    onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.background = 'transparent'; }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'hsl(40 60% 55% / 0.3)' }} />
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
        </div>

        {/* Room Design Swiper */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mb-3" style={{ color: 'hsl(40 30% 50%)' }}>
          Xona dizayni
        </p>

        {!state.selectedCategory ? (
          <p className="text-xs text-center py-3 mb-4" style={{ color: 'hsl(40 10% 40%)' }}>Avval kategoriya tanlang</p>
        ) : (
          <div className="mb-5">
            <RoomDesignSwiper walls={filteredWalls} selectedId={state.selectedWall} onSelect={selectWall} />
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'hsl(40 60% 55% / 0.3)' }} />
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
        </div>

        {/* Door Models Carousel */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mt-4 mb-3" style={{ color: 'hsl(40 30% 50%)' }}>
          Eshik modellari
        </p>
        <DoorCarousel doors={filteredDoors} selectedId={state.selectedDoor} onSelect={selectDoor} />
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute top-1/2 -translate-y-1/2 z-40 w-6 h-12 rounded-r-md flex items-center justify-center transition-all duration-500 hover:opacity-100"
        style={{
          left: collapsed ? '0px' : '240px',
          background: 'hsl(220 15% 15% / 0.35)',
          backdropFilter: 'blur(8px)',
          border: '1px solid hsl(0 0% 100% / 0.06)',
          borderLeft: 'none',
          color: 'hsl(30 30% 60% / 0.7)',
          opacity: 0.6,
        }}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
