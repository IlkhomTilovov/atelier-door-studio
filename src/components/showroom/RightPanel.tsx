import { useShowroom } from '@/context/ShowroomContext';

export default function RightPanel() {
  const { state, colors, walls, floors, selectDoorColor, selectWall, selectFloor } = useShowroom();
  const enabledColors = colors.filter(c => c.enabled);
  const enabledWalls = walls.filter(w => w.enabled);
  const enabledFloors = floors.filter(f => f.enabled);

  return (
    <div className="h-full flex flex-col py-6 px-5 bg-panel border-l border-gold overflow-auto" style={{ width: '280px' }}>
      {/* Door Color */}
      <Section title="Eshik rangi">
        <div className="grid grid-cols-4 gap-3">
          {enabledColors.map(color => (
            <button
              key={color.id}
              onClick={() => selectDoorColor(color.id)}
              className={`group flex flex-col items-center gap-1.5 transition-showroom`}
              title={color.name}
            >
              <div
                className={`w-11 h-11 rounded-sm shadow-luxury transition-showroom ${
                  state.selectedDoorColor === color.id
                    ? 'ring-2 ring-gold scale-110'
                    : 'ring-1 ring-border hover:ring-gold/50 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-showroom">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* Wall Style */}
      <Section title="Devor uslubi">
        <div className="space-y-2">
          {enabledWalls.map(wall => (
            <button
              key={wall.id}
              onClick={() => selectWall(wall.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-sm transition-showroom ${
                state.selectedWall === wall.id
                  ? 'bg-primary/15 border border-gold-strong shadow-gold-glow'
                  : 'border border-transparent hover:bg-secondary/40 hover:border-border'
              }`}
            >
              <div
                className="w-10 h-10 rounded-sm shadow-luxury flex-shrink-0"
                style={{ backgroundColor: wall.color }}
              />
              <span className="font-body text-sm text-foreground/80">{wall.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* Floor Material */}
      <Section title="Pol materiali">
        <div className="space-y-2">
          {enabledFloors.map(floor => (
            <button
              key={floor.id}
              onClick={() => selectFloor(floor.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-sm transition-showroom ${
                state.selectedFloor === floor.id
                  ? 'bg-primary/15 border border-gold-strong shadow-gold-glow'
                  : 'border border-transparent hover:bg-secondary/40 hover:border-border'
              }`}
            >
              <div
                className="w-10 h-10 rounded-sm shadow-luxury flex-shrink-0"
                style={{ backgroundColor: floor.color }}
              />
              <span className="font-body text-sm text-foreground/80">{floor.name}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-4">{title}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px bg-border my-5" />;
}
