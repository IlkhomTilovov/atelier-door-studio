import { useShowroom } from '@/context/ShowroomContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RightPanel() {
  const { state, colors, walls, floors, selectDoorColor, selectWall, selectFloor } = useShowroom();
  const enabledColors = colors.filter(c => c.enabled);
  const enabledWalls = walls.filter(w => w.enabled);
  const enabledFloors = floors.filter(f => f.enabled);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="h-full flex flex-col py-8 px-6 overflow-auto"
        style={{
          width: '300px',
          background: 'linear-gradient(180deg, hsl(220 20% 13%) 0%, hsl(220 18% 11%) 100%)',
          boxShadow: 'inset 2px 0 12px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Door Color ── */}
        <SectionHeader label="Eshik rangi" />
        <div className="flex flex-wrap gap-3 mb-2">
          {enabledColors.map(color => {
            const active = state.selectedDoorColor === color.id;
            return (
              <Tooltip key={color.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectDoorColor(color.id)}
                    className="group relative flex flex-col items-center gap-1.5 transition-all duration-500"
                  >
                    <div
                      className="w-12 h-12 rounded-lg transition-all duration-500"
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: active
                          ? '0 0 0 2px hsl(40 60% 55%), 0 0 14px hsl(40 60% 55% / 0.3), inset 0 1px 2px rgba(255,255,255,0.15)'
                          : 'inset 0 1px 2px rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.3)',
                        transform: active ? 'scale(1.1)' : undefined,
                      }}
                    />
                    <span
                      className="text-[10px] tracking-wide font-body transition-all duration-500"
                      style={{
                        color: active ? 'hsl(40 60% 72%)' : 'hsl(40 10% 45%)',
                      }}
                    >
                      {color.name}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs">
                  {color.name} — {color.hex}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <SectionDivider />

        {/* ── Wall Style ── */}
        <SectionHeader label="Devor uslubi" />
        <div className="space-y-2.5 mb-2">
          {enabledWalls.map(wall => {
            const active = state.selectedWall === wall.id;
            return (
              <button
                key={wall.id}
                onClick={() => selectWall(wall.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-500 group"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, hsl(40 45% 65% / 0.12) 0%, hsl(40 50% 55% / 0.06) 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 0 0 1px hsl(40 60% 55% / 0.4), 0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 hsl(40 60% 55% / 0.08)'
                    : 'none',
                }}
              >
                {wall.image ? (
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-500"
                    style={{
                      boxShadow: active
                        ? '0 0 0 1.5px hsl(40 60% 55% / 0.5), 0 2px 8px rgba(0,0,0,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
                      transform: active ? 'scale(1.05)' : undefined,
                    }}
                  >
                    <img src={wall.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex-shrink-0 transition-all duration-500"
                    style={{
                      backgroundColor: wall.color,
                      boxShadow: active
                        ? '0 0 0 1.5px hsl(40 60% 55% / 0.5), 0 2px 8px rgba(0,0,0,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
                      transform: active ? 'scale(1.05)' : undefined,
                    }}
                  />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p
                    className="font-body text-sm tracking-wide truncate transition-all duration-500"
                    style={{ color: active ? 'hsl(40 50% 78%)' : 'hsl(40 15% 65%)' }}
                  >
                    {wall.name}
                  </p>
                  <p
                    className="text-[10px] mt-0.5 tracking-wider uppercase transition-all duration-500"
                    style={{ color: active ? 'hsl(40 30% 55%)' : 'hsl(220 10% 38%)' }}
                  >
                    {wall.moldingType === 'classic' ? 'Klassik' : wall.moldingType === 'modern' ? 'Zamonaviy' : 'Bezakli'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <SectionDivider />

        {/* ── Floor Material ── */}
        <SectionHeader label="Pol materiali" />
        <div className="grid grid-cols-3 gap-3">
          {enabledFloors.map(floor => {
            const active = state.selectedFloor === floor.id;
            return (
              <Tooltip key={floor.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectFloor(floor.id)}
                    className="group flex flex-col items-center gap-2 transition-all duration-500"
                  >
                    {floor.image ? (
                      <div
                        className="w-full aspect-square rounded-xl overflow-hidden transition-all duration-500"
                        style={{
                          boxShadow: active
                            ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.25), 0 4px 12px rgba(0,0,0,0.3)'
                            : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
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
                            ? '0 0 0 2px hsl(40 60% 55%), 0 0 16px hsl(40 60% 55% / 0.25), 0 4px 12px rgba(0,0,0,0.3)'
                            : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                          transform: active ? 'scale(1.06)' : undefined,
                        }}
                      />
                    )}
                    <span
                      className="text-[10px] tracking-wide font-body text-center leading-tight transition-all duration-500"
                      style={{ color: active ? 'hsl(40 50% 72%)' : 'hsl(40 10% 42%)' }}
                    >
                      {floor.name}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border-border text-xs">
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

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-5">
      <p
        className="text-[11px] uppercase tracking-[0.25em] font-body font-medium"
        style={{ color: 'hsl(40 40% 58%)' }}
      >
        {label}
      </p>
      <div
        className="mt-2 h-px"
        style={{
          background: 'linear-gradient(90deg, hsl(40 60% 55% / 0.4) 0%, transparent 80%)',
        }}
      />
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: 'hsl(220 15% 20%)' }} />
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: 'hsl(40 60% 55% / 0.3)' }}
      />
      <div className="flex-1 h-px" style={{ background: 'hsl(220 15% 20%)' }} />
    </div>
  );
}
