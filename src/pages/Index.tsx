import { lazy, Suspense } from 'react';
import CenterScene from '@/components/showroom/CenterScene';
import ImagePreloader from '@/components/showroom/ImagePreloader';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';

// Code splitting: lazy load sidebar components
const LeftPanel = lazy(() => import('@/components/showroom/LeftPanel'));
const RightPanel = lazy(() => import('@/components/showroom/RightPanel'));
const MobileBottomNav = lazy(() => import('@/components/showroom/MobileBottomNav'));
const TabletRightDrawer = lazy(() => import('@/components/showroom/TabletRightDrawer'));

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
        <ImagePreloader />
        <div className="absolute inset-0" style={{ bottom: '70px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <CenterScene />
        </div>
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>
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
        <ImagePreloader />
        {/* Left sidebar */}
        <div
          className="h-full overflow-y-auto glass-scrollbar"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,20,0.85), rgba(20,20,20,0.65))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRight: '1px solid hsl(40 60% 55% / 0.1)',
          }}
        >
          <Suspense fallback={null}>
            <LeftPanel />
          </Suspense>
        </div>

        {/* Center scene */}
        <div className="relative h-full overflow-hidden">
          <CenterScene />
          <Suspense fallback={null}>
            <TabletRightDrawer />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      <ImagePreloader />
      <CenterScene />
      <div className="absolute top-0 left-0 z-10 flex items-stretch" style={{ height: '100vh', width: '22%', minWidth: '20%', maxWidth: '25%' }}>
        <Suspense fallback={null}>
          <LeftPanel />
        </Suspense>
      </div>
      <div className="absolute top-0 right-0 z-10 flex items-stretch justify-end" style={{ height: '100vh', width: '22%', minWidth: '20%', maxWidth: '25%' }}>
        <Suspense fallback={null}>
          <RightPanel />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
