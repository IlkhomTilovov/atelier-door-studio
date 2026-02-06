import { useShowroom } from '@/context/ShowroomContext';
import { collectionNames } from '@/data/showroom-data';
import { DoorCollection } from '@/types/showroom';

const collections: DoorCollection[] = ['classic', 'neo-classic', 'luxury'];

export default function LeftPanel() {
  const { state, doors, selectDoor, setCollection } = useShowroom();
  const filteredDoors = doors.filter(d => d.collection === state.activeCollection && d.enabled);

  return (
    <div
      className="glass-panel glass-scrollbar h-full flex flex-col py-6 px-5 rounded-2xl overflow-hidden"
      style={{ width: '240px' }}
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

      {/* Collections */}
      <p
        className="text-[10px] uppercase tracking-[0.25em] font-body mb-4"
        style={{ color: 'hsl(40 30% 50%)' }}
      >
        Kolleksiyalar
      </p>
      <div className="space-y-1.5 mb-6">
        {collections.map(c => {
          const active = state.activeCollection === c;
          return (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className="w-full text-left px-4 py-3 rounded-xl font-display text-base tracking-wide transition-all duration-500"
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
              {collectionNames[c]}
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

      {/* Models */}
      <p
        className="text-[10px] uppercase tracking-[0.25em] font-body mt-4 mb-4"
        style={{ color: 'hsl(40 30% 50%)' }}
      >
        Modellar
      </p>
      <div className="flex-1 space-y-1 overflow-auto glass-scrollbar">
        {filteredDoors.map(door => {
          const active = state.selectedDoor === door.id;
          return (
            <button
              key={door.id}
              onClick={() => selectDoor(door.id)}
              className="w-full text-left px-4 py-3 rounded-lg font-body text-sm tracking-wide transition-all duration-500"
              style={{
                background: active
                  ? 'hsl(40 50% 55% / 0.1)'
                  : 'transparent',
                color: active ? 'hsl(40 50% 75%)' : 'hsl(40 10% 55%)',
                borderLeft: active
                  ? '2px solid hsl(40 60% 55% / 0.6)'
                  : '2px solid transparent',
                boxShadow: active
                  ? '0 0 12px hsl(40 60% 55% / 0.06)'
                  : 'none',
              }}
            >
              {door.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
