import LeftPanel from '@/components/showroom/LeftPanel';
import CenterScene from '@/components/showroom/CenterScene';
import RightPanel from '@/components/showroom/RightPanel';
import MobileBottomNav from '@/components/showroom/MobileBottomNav';
import TabletRightDrawer from '@/components/showroom/TabletRightDrawer';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

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
        <div className="absolute inset-0" style={{ bottom: '70px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <CenterScene />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div
        className="select-none overflow-hidden"
        style={{
          height: '100dvh',
          display: 'grid',
          gridTemplateColumns: '28% 72%',
        }}
      >
        {/* Left sidebar */}
        <div
          className="h-full overflow-y-auto glass-scrollbar"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,20,0.85), rgba(20,20,20,0.65))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid hsl(40 60% 55% / 0.1)',
          }}
        >
          <LeftPanel />
        </div>

        {/* Center scene */}
        <div className="relative h-full overflow-hidden">
          <CenterScene />
          {/* Floating drawer for right panel */}
          <TabletRightDrawer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      <CenterScene />
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
