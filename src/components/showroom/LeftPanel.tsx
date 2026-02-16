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

export default function LeftPanel() {
  const { state, allCategories, filteredWalls, filteredDoors, selectCategory, selectDoor, selectWall } = useShowroom();
  const enabledCategories = allCategories.filter(c => c.enabled);
  const [collapsed, setCollapsed] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useClickOutside(catRef as React.RefObject<HTMLElement>, () => setCatOpen(false));

  const selectedCat = enabledCategories.find(c => c.id === state.selectedCategory);
  const selectedWall = filteredWalls.find(w => w.id === state.selectedWall);

  // Scroll active carousel item into view
  useEffect(() => {
    if (!carouselRef.current || !state.selectedWall) return;
    const active = carouselRef.current.querySelector(`[data-wall-id="${state.selectedWall}"]`) as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [state.selectedWall, filteredWalls]);

  const scrollCarousel = useCallback((dir: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 100, behavior: 'smooth' });
  }, []);

  // Category keyboard nav
  const handleCatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setCatOpen(false);
    if (!catOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return setCatOpen(true); }
    if (!catOpen) return;
    const idx = enabledCategories.findIndex(c => c.id === state.selectedCategory);
    if (e.key === 'ArrowDown') { e.preventDefault(); selectCategory(enabledCategories[(idx + 1) % enabledCategories.length].id); }
    if (e.key === 'ArrowUp') { e.preventDefault(); selectCategory(enabledCategories[(idx - 1 + enabledCategories.length) % enabledCategories.length].id); }
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
            <div
              className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden py-1 animate-fade-in"
              style={dropdownStyle}
            >
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

        {/* Room Design Carousel */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mb-3" style={{ color: 'hsl(40 30% 50%)' }}>
          Xona dizayni
        </p>

        {filteredWalls.length === 0 ? (
          <p className="text-xs text-center py-3 mb-4" style={{ color: 'hsl(40 10% 40%)' }}>
            {!state.selectedCategory ? 'Avval kategoriya tanlang' : 'Bu kategoriyada dizayn yo\'q'}
          </p>
        ) : (
          <div className="relative mb-5">
            {/* Arrows */}
            {filteredWalls.length > 2 && (
              <>
                <button
                  onClick={() => scrollCarousel(-1)}
                  className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'hsl(220 15% 16% / 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid hsl(40 60% 55% / 0.15)',
                    color: 'hsl(40 40% 65%)',
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel(1)}
                  className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'hsl(220 15% 16% / 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid hsl(40 60% 55% / 0.15)',
                    color: 'hsl(40 40% 65%)',
                  }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Carousel track */}
            <div
              ref={carouselRef}
              className="flex gap-2.5 overflow-x-auto px-1 py-2 snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <style>{`div[data-carousel-track]::-webkit-scrollbar { display: none; }`}</style>
              {filteredWalls.map(wall => {
                const active = state.selectedWall === wall.id;
                return (
                  <button
                    key={wall.id}
                    data-wall-id={wall.id}
                    onClick={() => selectWall(wall.id)}
                    className="flex-shrink-0 snap-center flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-400 outline-none"
                    style={{
                      width: '72px',
                      background: active
                        ? 'linear-gradient(135deg, hsl(40 50% 55% / 0.12), hsl(40 45% 50% / 0.04))'
                        : 'hsl(220 15% 18% / 0.3)',
                      border: active
                        ? '1.5px solid hsl(40 60% 55% / 0.45)'
                        : '1.5px solid hsl(0 0% 100% / 0.04)',
                      boxShadow: active
                        ? '0 0 16px hsl(40 60% 55% / 0.12), 0 4px 12px rgba(0,0,0,0.2)'
                        : '0 2px 6px rgba(0,0,0,0.15)',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        boxShadow: active
                          ? '0 0 0 1px hsl(40 60% 55% / 0.3), 0 2px 8px rgba(0,0,0,0.3)'
                          : '0 1px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {wall.image ? (
                        <img src={wall.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: wall.color }} />
                      )}
                    </div>
                    {/* Name */}
                    <span
                      className="text-[10px] font-body tracking-wide truncate w-full text-center"
                      style={{
                        color: active ? 'hsl(40 55% 72%)' : 'hsl(40 15% 50%)',
                      }}
                    >
                      {wall.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'hsl(40 60% 55% / 0.3)' }} />
          <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.12)' }} />
        </div>

        {/* Door Models */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mt-4 mb-4" style={{ color: 'hsl(40 30% 50%)' }}>
          Eshik modellari
        </p>
        <div className="flex-1 space-y-1 overflow-auto glass-scrollbar">
          {filteredDoors.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'hsl(40 10% 40%)' }}>
              Bu xona uchun eshik tayinlanmagan
            </p>
          )}
          {filteredDoors.map(door => {
            const active = state.selectedDoor === door.id;
            return (
              <button
                key={door.id}
                onClick={() => selectDoor(door.id)}
                className="w-full text-left px-4 py-3 rounded-lg font-body text-sm tracking-wide transition-all duration-500"
                style={{
                  background: active ? 'hsl(40 50% 55% / 0.1)' : 'transparent',
                  color: active ? 'hsl(40 50% 75%)' : 'hsl(40 10% 55%)',
                  borderLeft: active ? '2px solid hsl(40 60% 55% / 0.6)' : '2px solid transparent',
                  boxShadow: active ? '0 0 12px hsl(40 60% 55% / 0.06)' : 'none',
                }}
              >
                {door.name}
              </button>
            );
          })}
        </div>
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
          color: 'hsl(40 30% 60% / 0.7)',
          opacity: 0.6,
        }}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
