import LeftPanel from '@/components/showroom/LeftPanel';
import CenterScene from '@/components/showroom/CenterScene';
import RightPanel from '@/components/showroom/RightPanel';
import MobileBottomNav from '@/components/showroom/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="relative h-screen w-screen overflow-hidden select-none">
        {/* Full-bleed scene */}
        <CenterScene />
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
      <div className="absolute top-0 left-0 z-10 flex items-stretch pl-4 py-4" style={{ height: '100vh', width: '32%', minWidth: '30%', maxWidth: '35%' }}>
        <LeftPanel />
      </div>
      <div className="absolute top-0 right-0 z-10 flex items-stretch pr-4 py-4" style={{ height: '100vh', width: '32%', minWidth: '30%', maxWidth: '35%' }}>
        <RightPanel />
      </div>
    </div>
  );
};

export default Index;
