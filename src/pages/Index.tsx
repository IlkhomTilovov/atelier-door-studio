import LeftPanel from '@/components/showroom/LeftPanel';
import CenterScene from '@/components/showroom/CenterScene';
import RightPanel from '@/components/showroom/RightPanel';

const Index = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden select-none">
      <LeftPanel />
      <CenterScene />
      <RightPanel />
    </div>
  );
};

export default Index;
