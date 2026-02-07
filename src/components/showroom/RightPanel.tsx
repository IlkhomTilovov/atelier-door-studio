import { useShowroom } from '@/context/ShowroomContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RightPanel() {
  const { state, filteredColors, filteredFloors, selectDoorColor, selectFloor } = useShowroom();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="glass-panel glass-scrollbar h-full flex flex-col py-6 px-5 rounded-2xl overflow-auto"
        style={{ width: '280px' }}
      >
        {/* ── Door Color (filtered by selected door) ── */}
        <GlassSectionHeader label="Eshik rangi" />
        <div className="flex flex-wrap gap-3 mb-2">
          {filteredColors.length === 0 && (
            <p className="text-xs w-full text-center py-2" style={{ color: 'hsl(40 10% 40%)' }}>
              Rang tayinlanmagan
            </p>
          )}
          {filteredColors.map(color => {
            const active = state.selectedDoorColor === color.id;
            return (
              <Tooltip key={color.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectDoorColor(color.id)}
                    className="group flex flex-col items-center gap-1.5 transition-all duration-500"
                  >
                    <div
                      className="w-11 h-11 rounded-xl transition-all duration-500"
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: active
                          ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.25)'
                          : 'inset 0 1px 2px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)',
                        transform: active ? 'scale(1.12)' : undefined,
                      }}
                    />
                    <span
                      className="text-[9px] tracking-wider font-body transition-all duration-500"
                      style={{ color: active ? 'hsl(40 55% 72%)' : 'hsl(40 10% 42%)' }}
                    >
                      {color.name}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card/90 backdrop-blur-sm border-border/50 text-xs">
                  {color.name} — {color.hex}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <GlassDivider />

        {/* ── Floor Material (filtered by room style) ── */}
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
      </div>
    </TooltipProvider>
  );
}

function GlassSectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-4">
      <p
        className="text-[10px] uppercase tracking-[0.25em] font-body font-medium"
        style={{ color: 'hsl(40 35% 55%)' }}
      >
        {label}
      </p>
      <div
        className="mt-2 h-px"
        style={{ background: 'linear-gradient(90deg, hsl(40 60% 55% / 0.3), transparent 70%)' }}
      />
    </div>
  );
}

function GlassDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.1)' }} />
      <div className="w-1 h-1 rounded-full" style={{ background: 'hsl(40 60% 55% / 0.25)' }} />
      <div className="flex-1 h-px" style={{ background: 'hsl(40 60% 55% / 0.1)' }} />
    </div>
  );
}
