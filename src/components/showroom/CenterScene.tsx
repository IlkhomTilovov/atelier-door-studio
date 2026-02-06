import { useShowroom } from '@/context/ShowroomContext';
import chandelierImg from '@/assets/chandelier.png';
import vaseImg from '@/assets/decor-vase.png';

export default function CenterScene() {
  const { getSelectedDoor, getSelectedDoorColor, getSelectedWall, getSelectedFloor } = useShowroom();

  const door = getSelectedDoor();
  const doorColor = getSelectedDoorColor();
  const wall = getSelectedWall();
  const floor = getSelectedFloor();

  const wallColor = wall?.color ?? '#A8A09A';
  const floorColor = floor?.color ?? '#2A2A2E';
  const doorHex = doorColor?.hex ?? '#E8E4DE';
  const moldingStyle = door?.moldingStyle ?? 'simple';
  const panelCount = door?.panelCount ?? 2;

  const wallLight = adjustBrightness(wallColor, 15);
  const wallDark = adjustBrightness(wallColor, -10);
  const doorLight = adjustBrightness(doorHex, 8);
  const doorDark = adjustBrightness(doorHex, -12);

  return (
    <div className="flex-1 h-full flex items-end justify-center relative overflow-hidden bg-scene">
      {/* Wall layer — image or color */}
      {wall?.image ? (
        <img
          src={wall.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-showroom"
        />
      ) : (
        <div
          className="absolute inset-0 transition-showroom"
          style={{ backgroundColor: wallColor }}
        />
      )}

      {/* Wall moldings (only when no wall image) */}
      {!wall?.image && (
        <>
          <WallMoldingPanel side="left" wallColor={wallColor} wallLight={wallLight} wallDark={wallDark} moldingType={wall?.moldingType ?? 'classic'} />
          <WallMoldingPanel side="right" wallColor={wallColor} wallLight={wallLight} wallDark={wallDark} moldingType={wall?.moldingType ?? 'classic'} />
        </>
      )}

      {/* Chandelier */}
      <img
        src={chandelierImg}
        alt=""
        className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-auto opacity-60 pointer-events-none z-10"
      />

      {/* Door layer — image or generated */}
      <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 z-20 transition-showroom">
        {door?.image ? (
          <img
            src={door.image}
            alt=""
            className="h-[380px] w-auto object-contain transition-showroom animate-scale-in"
          />
        ) : (
          <DoorComponent
            doorColor={doorHex}
            doorLight={doorLight}
            doorDark={doorDark}
            moldingStyle={moldingStyle}
            panelCount={panelCount}
          />
        )}
      </div>

      {/* Decorative vases */}
      <img
        src={vaseImg}
        alt=""
        className="absolute bottom-[14%] left-[12%] w-20 h-auto opacity-50 pointer-events-none z-10"
      />
      <img
        src={vaseImg}
        alt=""
        className="absolute bottom-[14%] right-[12%] w-20 h-auto opacity-50 pointer-events-none z-10 scale-x-[-1]"
      />

      {/* Floor layer — image or generated */}
      {floor?.image ? (
        <div className="absolute bottom-0 left-0 right-0 transition-showroom" style={{ height: '14%' }}>
          <img
            src={floor.image}
            alt=""
            className="w-full h-full object-cover transition-showroom"
          />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'hsl(40, 60%, 55%)' }} />
        </div>
      ) : (
        <div
          className="absolute bottom-0 left-0 right-0 transition-showroom"
          style={{
            height: '14%',
            backgroundColor: floorColor,
            backgroundImage: floor?.pattern === 'marble'
              ? `linear-gradient(135deg, ${adjustBrightness(floorColor, 5)} 25%, transparent 25%), linear-gradient(225deg, ${adjustBrightness(floorColor, 8)} 25%, transparent 25%)`
              : floor?.pattern === 'wood'
              ? `repeating-linear-gradient(90deg, ${floorColor} 0px, ${adjustBrightness(floorColor, 5)} 3px, ${floorColor} 6px)`
              : undefined,
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'hsl(40, 60%, 55%)' }} />
        </div>
      )}

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}

function WallMoldingPanel({ side, wallColor, wallLight, wallDark, moldingType }: {
  side: 'left' | 'right';
  wallColor: string;
  wallLight: string;
  wallDark: string;
  moldingType: string;
}) {
  const isOrnate = moldingType === 'ornate';
  const pos = side === 'left' ? 'left-[3%]' : 'right-[3%]';

  return (
    <div className={`absolute ${pos} top-[8%] bottom-[18%] w-[18%] z-10 transition-showroom`}>
      <div
        className="absolute inset-0 rounded-sm transition-showroom"
        style={{
          border: `3px solid ${wallDark}`,
          boxShadow: `inset 0 0 0 1px ${wallLight}, 0 2px 8px rgba(0,0,0,0.15)`,
        }}
      />
      <div
        className="absolute inset-[12px] rounded-sm transition-showroom"
        style={{
          border: `2px solid ${wallDark}`,
          boxShadow: `inset 0 0 0 1px ${wallLight}`,
        }}
      />
      {isOrnate && (
        <div
          className="absolute bottom-[35%] left-[12px] right-[12px] h-[20px] transition-showroom"
          style={{
            borderTop: `2px solid ${wallDark}`,
            borderBottom: `2px solid ${wallDark}`,
            backgroundImage: `repeating-linear-gradient(90deg, ${wallDark} 0px, ${wallDark} 2px, transparent 2px, transparent 8px)`,
          }}
        />
      )}
      {isOrnate && (
        <>
          <CornerOrnament position="top-left" color={wallDark} />
          <CornerOrnament position="top-right" color={wallDark} />
          <CornerOrnament position="bottom-left" color={wallDark} />
          <CornerOrnament position="bottom-right" color={wallDark} />
        </>
      )}
    </div>
  );
}

function CornerOrnament({ position, color }: { position: string; color: string }) {
  const posClasses: Record<string, string> = {
    'top-left': 'top-[6px] left-[6px]',
    'top-right': 'top-[6px] right-[6px]',
    'bottom-left': 'bottom-[6px] left-[6px]',
    'bottom-right': 'bottom-[6px] right-[6px]',
  };
  return (
    <div
      className={`absolute ${posClasses[position]} w-3 h-3 transition-showroom`}
      style={{
        border: `2px solid ${color}`,
        borderRadius: '1px',
      }}
    />
  );
}

function DoorComponent({ doorColor, doorLight, doorDark, moldingStyle, panelCount }: {
  doorColor: string;
  doorLight: string;
  doorDark: string;
  moldingStyle: string;
  panelCount: number;
}) {
  const isOrnate = moldingStyle === 'ornate';
  const panelGap = panelCount > 2 ? 'gap-2' : 'gap-3';

  return (
    <div
      className="relative transition-showroom animate-scale-in"
      style={{ width: '180px', height: '380px' }}
    >
      <div
        className="absolute -inset-3 rounded-sm transition-showroom"
        style={{
          backgroundColor: doorDark,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 ${doorLight}`,
        }}
      />
      <div
        className="absolute inset-0 rounded-sm transition-showroom"
        style={{
          backgroundColor: doorColor,
          boxShadow: `inset 2px 2px 4px ${doorLight}, inset -2px -2px 4px ${doorDark}`,
        }}
      >
        <div className={`flex flex-col ${panelGap} p-4 h-full`}>
          {Array.from({ length: panelCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-showroom"
              style={{
                border: `2px solid ${doorDark}`,
                boxShadow: `inset 1px 1px 3px ${doorLight}, inset -1px -1px 3px ${doorDark}`,
                backgroundColor: adjustBrightness(doorColor, -3),
              }}
            >
              {isOrnate && (
                <div
                  className="m-2 h-[calc(100%-16px)] rounded-sm transition-showroom"
                  style={{
                    border: `1px solid ${doorDark}`,
                    boxShadow: `inset 0.5px 0.5px 2px ${doorLight}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-showroom" style={{ zIndex: 5 }}>
          <div
            className="w-2 h-8 rounded-full"
            style={{
              background: `linear-gradient(180deg, #C4A86C 0%, #8B7340 50%, #C4A86C 100%)`,
              boxShadow: '1px 1px 3px rgba(0,0,0,0.4)',
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"
            style={{ background: `linear-gradient(180deg, #C4A86C, #8B7340)` }}
          />
        </div>
      </div>
    </div>
  );
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
