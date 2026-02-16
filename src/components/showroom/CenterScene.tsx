import { useShowroom } from '@/context/ShowroomContext';
import { TextureScale } from '@/types/showroom';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { getOptimizedUrl, getSrcSet, IMAGE_SIZES, gpuAccelStyle } from '@/lib/image-utils';

export default function CenterScene() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
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

  // Responsive image size
  const imgSize = isMobile ? IMAGE_SIZES.mobile : isTablet ? IMAGE_SIZES.tablet : IMAGE_SIZES.desktop;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Scene container */}
      <div
        className="absolute inset-0"
        style={{
          ...gpuAccelStyle,
          transition: 'all 0.2s ease',
          ...(isMobile ? { top: '5%', bottom: '0' } : undefined),
        }}
      >
        {/* Wall layer */}
        <div
          className="absolute inset-0"
          style={{
            bottom: '18%',
            ...gpuAccelStyle,
            transition: 'all 0.2s ease',
          }}
        >
          {wall?.image ? (
            <img
              src={getOptimizedUrl(wall.image, imgSize)}
              srcSet={getSrcSet(wall.image) || undefined}
              sizes="100vw"
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full"
              style={{
                objectFit: 'contain',
                objectPosition: 'center bottom',
                ...gpuAccelStyle,
                transition: 'all 0.2s ease',
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: wallColor,
                transition: 'background-color 0.2s ease',
              }}
            />
          )}
        </div>

      {/* Wall moldings (only when no wall image) */}
      {!wall?.image && !isMobile && (
        <>
          <WallMoldingPanel side="left" wallColor={wallColor} wallLight={wallLight} wallDark={wallDark} moldingType={wall?.moldingType ?? 'classic'} />
          <WallMoldingPanel side="right" wallColor={wallColor} wallLight={wallLight} wallDark={wallDark} moldingType={wall?.moldingType ?? 'classic'} />
        </>
      )}

      {/* Door layer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          bottom: '18%',
          height: isMobile ? '27%' : isTablet ? '35%' : '62%',
          maxWidth: isTablet ? '420px' : undefined,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          ...gpuAccelStyle,
          transition: 'all 0.2s ease',
        }}
      >
        {door?.image ? (
          <img
            src={getOptimizedUrl(door.image, imgSize)}
            srcSet={getSrcSet(door.image) || undefined}
            sizes={isMobile ? '50vw' : '30vw'}
            alt=""
            loading="eager"
            decoding="async"
            className="h-full w-auto"
            style={{
              objectFit: 'contain',
              ...gpuAccelStyle,
              transition: 'all 0.2s ease',
            }}
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

      {/* Floor layer */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{
          height: '18%',
          perspective: '450px',
          perspectiveOrigin: 'center top',
          ...gpuAccelStyle,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(45deg)',
            transformOrigin: 'center top',
            backgroundColor: floorColor,
            transition: 'all 0.2s ease',
            ...(floor?.image
              ? {
                  backgroundImage: `url(${getOptimizedUrl(floor.image, imgSize)})`,
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'center top',
                  backgroundSize: getFloorTextureSize(floor.pattern, floor.textureScale, isMobile),
                }
              : {
                  backgroundImage: floor?.pattern === 'marble'
                    ? `linear-gradient(135deg, ${adjustBrightness(floorColor, 5)} 25%, transparent 25%), linear-gradient(225deg, ${adjustBrightness(floorColor, 8)} 25%, transparent 25%)`
                    : floor?.pattern === 'wood'
                    ? `repeating-linear-gradient(90deg, ${floorColor} 0px, ${adjustBrightness(floorColor, 5)} 3px, ${floorColor} 6px)`
                    : undefined,
                }),
          }}
        />
        {/* Depth gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)',
          }}
        />
      </div>
      </div>

      {/* Subtle vignette — lighter for performance */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)',
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
    <div className={`absolute ${pos} top-[8%] bottom-[20%] w-[18%] z-10`} style={{ transition: 'all 0.2s ease' }}>
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          border: `3px solid ${wallDark}`,
          boxShadow: `inset 0 0 0 1px ${wallLight}, 0 2px 6px rgba(0,0,0,0.12)`,
          transition: 'all 0.2s ease',
        }}
      />
      <div
        className="absolute inset-[12px] rounded-sm"
        style={{
          border: `2px solid ${wallDark}`,
          boxShadow: `inset 0 0 0 1px ${wallLight}`,
          transition: 'all 0.2s ease',
        }}
      />
      {isOrnate && (
        <div
          className="absolute bottom-[35%] left-[12px] right-[12px] h-[20px]"
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
      className={`absolute ${posClasses[position]} w-3 h-3`}
      style={{
        border: `2px solid ${color}`,
        borderRadius: '1px',
      }}
    />
  );
}

function LeafDecor({ side }: { side: 'left' | 'right' }) {
  const flip = side === 'right' ? 'scaleX(-1)' : 'none';
  return (
    <div className="relative" style={{ width: '80px', height: '160px', transform: flip }}>
      <svg viewBox="0 0 80 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <path d="M40 155 Q40 80 40 10" stroke="rgba(180,165,130,0.6)" strokeWidth="1.5" fill="none" />
        <path d="M40 25 Q20 15 12 30 Q22 35 40 25" fill="rgba(195,180,145,0.25)" stroke="rgba(180,165,130,0.4)" strokeWidth="0.8" />
        <path d="M40 25 Q60 15 68 30 Q58 35 40 25" fill="rgba(195,180,145,0.25)" stroke="rgba(180,165,130,0.4)" strokeWidth="0.8" />
        <path d="M40 45 Q15 30 8 50 Q20 55 40 45" fill="rgba(195,180,145,0.3)" stroke="rgba(180,165,130,0.45)" strokeWidth="0.8" />
        <path d="M40 45 Q65 30 72 50 Q60 55 40 45" fill="rgba(195,180,145,0.3)" stroke="rgba(180,165,130,0.45)" strokeWidth="0.8" />
        <path d="M40 70 Q10 50 5 75 Q18 82 40 70" fill="rgba(195,180,145,0.3)" stroke="rgba(180,165,130,0.5)" strokeWidth="0.8" />
        <path d="M40 70 Q70 50 75 75 Q62 82 40 70" fill="rgba(195,180,145,0.3)" stroke="rgba(180,165,130,0.5)" strokeWidth="0.8" />
        <path d="M40 95 Q12 78 6 100 Q20 107 40 95" fill="rgba(195,180,145,0.25)" stroke="rgba(180,165,130,0.45)" strokeWidth="0.8" />
        <path d="M40 95 Q68 78 74 100 Q60 107 40 95" fill="rgba(195,180,145,0.25)" stroke="rgba(180,165,130,0.45)" strokeWidth="0.8" />
        <path d="M40 120 Q18 108 10 125 Q24 130 40 120" fill="rgba(195,180,145,0.2)" stroke="rgba(180,165,130,0.4)" strokeWidth="0.8" />
        <path d="M40 120 Q62 108 70 125 Q56 130 40 120" fill="rgba(195,180,145,0.2)" stroke="rgba(180,165,130,0.4)" strokeWidth="0.8" />
        <ellipse cx="40" cy="8" rx="4" ry="6" fill="rgba(195,180,145,0.35)" stroke="rgba(180,165,130,0.5)" strokeWidth="0.8" />
        <circle cx="25" cy="48" r="1.5" fill="rgba(230,220,190,0.4)" />
        <circle cx="55" cy="48" r="1.5" fill="rgba(230,220,190,0.4)" />
        <circle cx="20" cy="75" r="2" fill="rgba(230,220,190,0.35)" />
        <circle cx="60" cy="75" r="2" fill="rgba(230,220,190,0.35)" />
        <circle cx="22" cy="100" r="1.5" fill="rgba(230,220,190,0.3)" />
        <circle cx="58" cy="100" r="1.5" fill="rgba(230,220,190,0.3)" />
      </svg>
    </div>
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
      className="relative"
      style={{ height: '100%', aspectRatio: '180 / 380', ...gpuAccelStyle, transition: 'all 0.2s ease' }}
    >
      <div
        className="absolute -inset-3 rounded-sm"
        style={{
          backgroundColor: doorDark,
          boxShadow: `0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 ${doorLight}`,
        }}
      />
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: doorColor,
          boxShadow: `inset 2px 2px 4px ${doorLight}, inset -2px -2px 4px ${doorDark}`,
        }}
      >
        <div className={`flex flex-col ${panelGap} p-4 h-full`}>
          {Array.from({ length: panelCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                border: `2px solid ${doorDark}`,
                boxShadow: `inset 1px 1px 3px ${doorLight}, inset -1px -1px 3px ${doorDark}`,
                backgroundColor: adjustBrightness(doorColor, -3),
              }}
            >
              {isOrnate && (
                <div
                  className="m-2 h-[calc(100%-16px)] rounded-sm"
                  style={{
                    border: `1px solid ${doorDark}`,
                    boxShadow: `inset 0.5px 0.5px 2px ${doorLight}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ zIndex: 5 }}>
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

function getFloorTextureSize(
  pattern: string,
  scale: TextureScale = 'medium',
  mobile: boolean = false,
): string {
  const scaleMultipliers: Record<TextureScale, number> = {
    small: 0.4,
    medium: 0.65,
    large: 1,
  };
  const m = scaleMultipliers[scale] * (mobile ? 0.5 : 1);
  const w = pattern === 'wood' ? 120 * m : 200 * m;
  const h = pattern === 'wood' ? 800 * m : 200 * m;
  return `${w}px ${h}px`;
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
