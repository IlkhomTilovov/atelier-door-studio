import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import OrderModal from './OrderModal';

export default function RightPanel() {
  const { state, filteredFloors, selectFloor, getSelectedDoor } = useShowroom();
  const [collapsed, setCollapsed] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const door = getSelectedDoor();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative flex items-stretch w-full overflow-hidden">
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -translate-y-1/2 z-40 w-6 h-12 rounded-l-md flex items-center justify-center transition-all duration-500 hover:opacity-100"
          style={{
            right: collapsed ? '0px' : '100%',
            background: 'hsl(220 15% 15% / 0.35)',
            backdropFilter: 'blur(8px)',
            border: '1px solid hsl(0 0% 100% / 0.06)',
            borderRight: 'none',
            color: 'hsl(40 30% 60% / 0.7)',
            opacity: 0.6,
          }}
        >
          {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <div
          className={`glass-panel glass-scrollbar h-full flex flex-col py-6 rounded-2xl overflow-auto transition-all duration-500 ${collapsed ? 'w-0 px-0 opacity-0 pointer-events-none' : 'w-full px-5 opacity-100'}`}
        >
          {/* ── Floor Material ── */}
          <GlassSectionHeader label="Pol materiali" />
          <div className="grid grid-cols-3 gap-2.5">
            {filteredFloors.length === 0 && (
              <p className="text-xs col-span-3 text-center py-2" style={{ color: 'hsl(40 10% 40%)' }}>
                Pol tayinlanmagan
              </p>
            )}
            {filteredFloors.map(floor => {
              const active = state.selectedFloor === floor.id;
              return (
                <Tooltip key={floor.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => selectFloor(floor.id)}
                      className="group flex flex-col items-center gap-1.5 transition-all duration-500"
                    >
                      {floor.image ? (
                        <div
                          className="w-full aspect-square rounded-xl overflow-hidden transition-all duration-500"
                          style={{
                            boxShadow: active
                              ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.2)'
                              : '0 2px 8px rgba(0,0,0,0.3)',
                            transform: active ? 'scale(1.06)' : undefined,
                          }}
                        >
                          <img src={floor.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-full aspect-square rounded-xl transition-all duration-500"
                          style={{
                            backgroundColor: floor.color,
                            boxShadow: active
                              ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.2)'
                              : '0 2px 8px rgba(0,0,0,0.3)',
                            transform: active ? 'scale(1.06)' : undefined,
                          }}
                        />
                      )}
                      <span
                        className="text-[9px] tracking-wide font-body text-center leading-tight transition-all duration-500"
                        style={{ color: active ? 'hsl(40 50% 72%)' : 'hsl(40 10% 40%)' }}
                      >
                        {floor.name}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card/90 backdrop-blur-sm border-border/50 text-xs">
                    {floor.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* ── Order Button (bottom) ── */}
          {door && (
            <>
              <GlassDivider />
              <button
                onClick={() => setOrderOpen(true)}
                className="w-full py-3 rounded-xl font-body text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 mt-auto"
                style={{
                  background: 'linear-gradient(135deg, hsl(40 55% 42%), hsl(40 65% 55%))',
                  color: 'hsl(220 20% 10%)',
                  boxShadow: '0 4px 20px hsl(40 60% 50% / 0.3), 0 0 0 1px hsl(40 60% 55% / 0.1)',
                  fontWeight: 500,
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                Buyurtma berish
              </button>
            </>
          )}
        </div>
      </div>

      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
    </TooltipProvider>
  );
}

function GlassSectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-[0.25em] font-body font-medium" style={{ color: 'hsl(40 35% 55%)' }}>
        {label}
      </p>
      <div className="mt-2 h-px" style={{ background: 'linear-gradient(90deg, hsl(40 60% 55% / 0.3), transparent 70%)' }} />
    </div>
  );
}

function GlassDivider() {
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.1)' }} />
      <div className="w-1 h-1 rounded-full" style={{ background: 'hsl(40 60% 55% / 0.25)' }} />
      <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.1)' }} />
    </div>
  );
}
