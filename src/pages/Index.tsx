import LeftPanel from '@/components/showroom/LeftPanel';
import CenterScene from '@/components/showroom/CenterScene';
import RightPanel from '@/components/showroom/RightPanel';

const Index = () => {
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
