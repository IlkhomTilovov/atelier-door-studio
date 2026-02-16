import { useState, useRef, useEffect } from 'react';
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
  const [wallOpen, setWallOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  useClickOutside(catRef as React.RefObject<HTMLElement>, () => setCatOpen(false));
  useClickOutside(wallRef as React.RefObject<HTMLElement>, () => setWallOpen(false));

  const selectedCat = enabledCategories.find(c => c.id === state.selectedCategory);
  const selectedWall = filteredWalls.find(w => w.id === state.selectedWall);

  // Keyboard nav for category
  const handleCatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setCatOpen(false);
    if (!catOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return setCatOpen(true); }
    if (!catOpen) return;
    const idx = enabledCategories.findIndex(c => c.id === state.selectedCategory);
    if (e.key === 'ArrowDown') { e.preventDefault(); const next = enabledCategories[(idx + 1) % enabledCategories.length]; selectCategory(next.id); }
    if (e.key === 'ArrowUp') { e.preventDefault(); const prev = enabledCategories[(idx - 1 + enabledCategories.length) % enabledCategories.length]; selectCategory(prev.id); }
    if (e.key === 'Enter') setCatOpen(false);
  };

  // Keyboard nav for wall
  const handleWallKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setWallOpen(false);
    if (!wallOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return setWallOpen(true); }
    if (!wallOpen) return;
    const idx = filteredWalls.findIndex(w => w.id === state.selectedWall);
    if (e.key === 'ArrowDown') { e.preventDefault(); const next = filteredWalls[(idx + 1) % filteredWalls.length]; selectWall(next.id); }
    if (e.key === 'ArrowUp') { e.preventDefault(); const prev = filteredWalls[(idx - 1 + filteredWalls.length) % filteredWalls.length]; selectWall(prev.id); }
    if (e.key === 'Enter') setWallOpen(false);
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

        {/* Room Design Dropdown */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mb-2" style={{ color: 'hsl(40 30% 50%)' }}>
          Xona dizayni
        </p>
        <div ref={wallRef} className="relative mb-6" onKeyDown={handleWallKey} tabIndex={0}>
          <button
            onClick={() => { if (state.selectedCategory && filteredWalls.length > 0) setWallOpen(o => !o); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm tracking-wide transition-all duration-300 outline-none"
            style={{
              ...triggerStyle,
              opacity: !state.selectedCategory || filteredWalls.length === 0 ? 0.4 : 1,
              cursor: !state.selectedCategory || filteredWalls.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: wallOpen ? '0 0 0 1px hsl(40 60% 55% / 0.35), 0 0 16px hsl(40 60% 55% / 0.08)' : 'none',
            }}
          >
            {selectedWall ? (
              <>
                {selectedWall.image ? (
                  <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                    <img src={selectedWall.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: selectedWall.color, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                )}
                <span className="truncate flex-1 text-left">{selectedWall.name}</span>
              </>
            ) : (
              <span className="truncate flex-1 text-left" style={{ color: 'hsl(40 15% 45%)' }}>
                {!state.selectedCategory ? 'Avval kategoriya tanlang' : filteredWalls.length === 0 ? 'Dizayn topilmadi' : 'Tanlang...'}
              </span>
            )}
            <ChevronDown
              className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
              style={{ color: 'hsl(40 40% 60%)', transform: wallOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>
          {wallOpen && filteredWalls.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden overflow-y-auto py-1 animate-fade-in"
              style={{ ...dropdownStyle, maxHeight: '220px' }}
            >
              {filteredWalls.map(wall => {
                const active = state.selectedWall === wall.id;
                return (
                  <button
                    key={wall.id}
                    onClick={() => { selectWall(wall.id); setWallOpen(false); }}
                    className="w-full flex items-center gap-3 text-left px-3 py-2.5 font-body text-sm tracking-wide transition-all duration-200"
                    style={{
                      background: active ? 'linear-gradient(90deg, hsl(40 50% 55% / 0.15), transparent)' : 'transparent',
                      color: active ? 'hsl(40 55% 72%)' : 'hsl(40 15% 58%)',
                      borderLeft: active ? '2px solid hsl(40 60% 55% / 0.6)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.background = 'hsl(40 50% 55% / 0.06)'; }}
                    onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.background = 'transparent'; }}
                  >
                    {wall.image ? (
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                        <img src={wall.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: wall.color, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    )}
                    <span className="truncate">{wall.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
