import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { ShoppingBag, X, Layers } from 'lucide-react';
import OrderModal from './OrderModal';

export default function TabletRightDrawer() {
  const [open, setOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const { state, filteredFloors, selectFloor, getSelectedDoor } = useShowroom();
  const door = getSelectedDoor();

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-body text-xs tracking-wide transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, hsl(220 20% 14% / 0.85), hsl(220 18% 10% / 0.9))',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(40 60% 55% / 0.15)',
          color: 'hsl(40 50% 70%)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        <Layers className="w-4 h-4" />
        Materiallar
      </button>

      {/* Order floating button */}
      {door && (
        <button
          onClick={() => setOrderOpen(true)}
          className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 rounded-2xl font-body text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, hsl(40 55% 42%), hsl(40 65% 55%))',
            color: 'hsl(220 20% 10%)',
            boxShadow: '0 4px 16px hsl(40 60% 50% / 0.25)',
            fontWeight: 500,
          }}
        >
          <ShoppingBag className="w-4 h-4" />
          Buyurtma berish
        </button>
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40 transition-opacity duration-400"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          background: 'rgba(0,0,0,0.3)',
        }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className="absolute top-0 bottom-0 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out"
        style={{
          width: '340px',
          right: open ? '0' : '-340px',
          background: 'linear-gradient(180deg, hsl(220 20% 13% / 0.97), hsl(220 18% 10% / 0.99))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid hsl(40 60% 55% / 0.1)',
          boxShadow: open ? '-4px 0 24px rgba(0,0,0,0.4)' : 'none',
          borderRadius: '24px 0 0 24px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-body"
            style={{ color: 'hsl(40 35% 55%)' }}
          >
            Pol materiali
          </p>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors duration-200"
            style={{ color: 'hsl(40 30% 50%)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px mx-6" style={{ background: 'linear-gradient(90deg, hsl(40 60% 55% / 0.2), transparent 80%)' }} />

        {/* Floor grid */}
        <div className="flex-1 overflow-y-auto glass-scrollbar px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            {filteredFloors.length === 0 && (
              <p className="text-xs col-span-3 text-center py-2" style={{ color: 'hsl(40 10% 40%)' }}>
                Pol tayinlanmagan
              </p>
            )}
            {filteredFloors.map(floor => {
              const active = state.selectedFloor === floor.id;
              return (
                <button
                  key={floor.id}
                  onClick={() => selectFloor(floor.id)}
                  className="group flex flex-col items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div
                    className="w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      boxShadow: active
                        ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.2)'
                        : '0 2px 8px rgba(0,0,0,0.25)',
                      transform: active ? 'scale(1.04)' : undefined,
                    }}
                  >
                    {floor.image ? (
                      <img src={floor.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: floor.color }} />
                    )}
                  </div>
                  <span
                    className="text-[10px] tracking-wide font-body text-center leading-tight transition-all duration-300"
                    style={{ color: active ? 'hsl(40 50% 72%)' : 'hsl(40 10% 40%)' }}
                  >
                    {floor.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
    </>
  );
}
