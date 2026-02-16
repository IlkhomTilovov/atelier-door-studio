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
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Full-width scene — never shrunk */}
      <CenterScene />

      {/* Sidebars overlay on top */}
      <div className="absolute top-0 left-0 h-full z-10 flex items-stretch py-4 pl-4" style={{ width: '320px' }}>
        <LeftPanel />
      </div>
      <div className="absolute top-0 right-0 h-full z-10 flex items-stretch py-4 pr-4" style={{ width: '320px' }}>
        <RightPanel />
      </div>
    </div>
  );
};

export default Index;
