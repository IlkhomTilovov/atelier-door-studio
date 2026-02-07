import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LeftPanel() {
  const { state, walls, filteredDoors, selectDoor, selectWall } = useShowroom();
  const enabledWalls = walls.filter(w => w.enabled);
  const [collapsed, setCollapsed] = useState(false);

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
          <div
            className="w-12 h-px mx-auto mt-3"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(40 60% 55% / 0.5), transparent)' }}
          />
        </div>

        {/* Room Styles (Primary) */}
        <p className="text-[10px] uppercase tracking-[0.25em] font-body mb-4" style={{ color: 'hsl(40 30% 50%)' }}>
          Xona uslubi
        </p>
        <div className="space-y-1.5 mb-6">
          {enabledWalls.map(wall => {
            const active = state.selectedWall === wall.id;
            return (
              <button
                key={wall.id}
                onClick={() => selectWall(wall.id)}
                className="w-full flex items-center gap-3 text-left px-3 py-3 rounded-xl font-body text-sm tracking-wide transition-all duration-500"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, hsl(40 50% 55% / 0.15) 0%, hsl(40 45% 50% / 0.05) 100%)'
                    : 'transparent',
                  color: active ? 'hsl(40 55% 72%)' : 'hsl(40 15% 60%)',
                  boxShadow: active
                    ? '0 0 0 1px hsl(40 60% 55% / 0.3), 0 0 20px hsl(40 60% 55% / 0.08)'
                    : 'none',
                }}
              >
                {wall.image ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ boxShadow: active ? '0 0 0 1px hsl(40 60% 55% / 0.4)' : '0 1px 4px rgba(0,0,0,0.3)' }}>
                    <img src={wall.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: wall.color, boxShadow: active ? '0 0 0 1px hsl(40 60% 55% / 0.4)' : '0 1px 4px rgba(0,0,0,0.3)' }}
                  />
                )}
                <span className="truncate">{wall.name}</span>
              </button>
            );
          })}
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
