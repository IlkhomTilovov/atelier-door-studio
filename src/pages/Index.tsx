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

      {/* Floating glass sidebars */}
      <div className="absolute inset-y-0 left-0 z-30 flex items-stretch py-4 pl-4">
        <LeftPanel />
      </div>
      <div className="absolute inset-y-0 right-0 z-30 flex items-stretch py-4 pr-4">
        <RightPanel />
      </div>
    </div>
  );
};

export default Index;
