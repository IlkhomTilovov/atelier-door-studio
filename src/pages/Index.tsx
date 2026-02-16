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
      <div className="absolute top-0 left-0 z-10 flex items-stretch" style={{ height: '100vh', width: '52%', minWidth: '50%', maxWidth: '55%' }}>
        <LeftPanel />
      </div>
      <div className="absolute top-0 right-0 z-10 flex items-stretch" style={{ height: '100vh', width: '42%', minWidth: '40%', maxWidth: '45%' }}>
        <RightPanel />
      </div>
    </div>
  );
};

export default Index;
