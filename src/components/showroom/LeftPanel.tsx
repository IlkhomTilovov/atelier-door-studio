import { useShowroom } from '@/context/ShowroomContext';
import { collectionNames } from '@/data/showroom-data';
import { DoorCollection } from '@/types/showroom';

const collections: DoorCollection[] = ['classic', 'neo-classic', 'luxury'];

export default function LeftPanel() {
  const { state, doors, selectDoor, setCollection } = useShowroom();
  const filteredDoors = doors.filter(d => d.collection === state.activeCollection && d.enabled);

  return (
    <div className="h-full flex flex-col py-6 px-4 bg-panel border-r border-gold" style={{ width: '260px' }}>
      {/* Logo area */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl text-gold tracking-widest">SHOWROOM</h1>
        <div className="w-16 h-px bg-gold-light mx-auto mt-2 opacity-50" />
      </div>

      {/* Collection tabs */}
      <div className="space-y-2 mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-3">Kolleksiyalar</p>
        {collections.map(c => (
          <button
            key={c}
            onClick={() => setCollection(c)}
            className={`w-full text-left px-4 py-3 rounded-sm font-display text-lg tracking-wide transition-showroom ${
              state.activeCollection === c
                ? 'bg-primary/20 text-gold border border-gold-strong shadow-gold-glow'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50 border border-transparent'
            }`}
          >
            {collectionNames[c]}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-border my-2" />

      {/* Door models */}
      <div className="flex-1 mt-4 space-y-1 overflow-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-3">Modellar</p>
        {filteredDoors.map(door => (
          <button
            key={door.id}
            onClick={() => selectDoor(door.id)}
            className={`w-full text-left px-4 py-3 rounded-sm font-body text-sm tracking-wide transition-showroom ${
              state.selectedDoor === door.id
                ? 'bg-primary/15 text-gold border-l-2 border-gold'
                : 'text-foreground/60 hover:text-foreground/90 hover:bg-secondary/30 border-l-2 border-transparent'
            }`}
          >
            {door.name}
          </button>
        ))}
      </div>
    </div>
  );
}
