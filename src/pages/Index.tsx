import LeftPanel from '@/components/showroom/LeftPanel';
import CenterScene from '@/components/showroom/CenterScene';
import RightPanel from '@/components/showroom/RightPanel';
import MobileBottomNav from '@/components/showroom/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className="relative w-screen overflow-hidden select-none"
        style={{
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: '0px',
        }}
      >
        {/* Scene area — leaves room for bottom nav */}
        <div className="absolute inset-0" style={{ bottom: '70px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <CenterScene />
        </div>
        {/* Mobile bottom nav + sheets */}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      {/* Full-bleed scene behind everything */}
      <CenterScene />

      {/* Overlay glass sidebars */}
      <div className="absolute top-0 left-0 z-10 flex items-stretch" style={{ height: '100vh', width: '22%', minWidth: '20%', maxWidth: '25%' }}>
        <LeftPanel />
      </div>
      <div className="absolute top-0 right-0 z-10 flex items-stretch justify-end" style={{ height: '100vh', width: '22%', minWidth: '20%', maxWidth: '25%' }}>
        <RightPanel />
      </div>
    </div>
  );
};

export default Index;
