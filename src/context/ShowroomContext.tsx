import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ShowroomState, DoorCollection, DoorModel, DoorColor, WallStyle, FloorMaterial } from '@/types/showroom';
import { doorModels, doorColors, wallStyles, floorMaterials } from '@/data/showroom-data';

interface ShowroomContextType {
  state: ShowroomState;
  doors: DoorModel[];
  colors: DoorColor[];
  walls: WallStyle[];
  floors: FloorMaterial[];
  setDoors: React.Dispatch<React.SetStateAction<DoorModel[]>>;
  setColors: React.Dispatch<React.SetStateAction<DoorColor[]>>;
  setWalls: React.Dispatch<React.SetStateAction<WallStyle[]>>;
  setFloors: React.Dispatch<React.SetStateAction<FloorMaterial[]>>;
  selectDoor: (id: string) => void;
  selectDoorColor: (id: string) => void;
  selectWall: (id: string) => void;
  selectFloor: (id: string) => void;
  setCollection: (c: DoorCollection) => void;
  getSelectedDoor: () => DoorModel | undefined;
  getSelectedDoorColor: () => DoorColor | undefined;
  getSelectedWall: () => WallStyle | undefined;
  getSelectedFloor: () => FloorMaterial | undefined;
}

const ShowroomContext = createContext<ShowroomContextType | null>(null);

export function ShowroomProvider({ children }: { children: ReactNode }) {
  const [doors, setDoors] = useState<DoorModel[]>(doorModels);
  const [colors, setColors] = useState<DoorColor[]>(doorColors);
  const [walls, setWalls] = useState<WallStyle[]>(wallStyles);
  const [floors, setFloors] = useState<FloorMaterial[]>(floorMaterials);

  const [state, setState] = useState<ShowroomState>({
    selectedDoor: 'classic-1',
    selectedDoorColor: 'ivory',
    selectedWall: 'wall-1',
    selectedFloor: 'floor-1',
    activeCollection: 'classic',
  });

  const selectDoor = (id: string) => setState(s => ({ ...s, selectedDoor: id }));
  const selectDoorColor = (id: string) => setState(s => ({ ...s, selectedDoorColor: id }));
  const selectWall = (id: string) => setState(s => ({ ...s, selectedWall: id }));
  const selectFloor = (id: string) => setState(s => ({ ...s, selectedFloor: id }));
  const setCollection = (c: DoorCollection) => setState(s => ({ ...s, activeCollection: c }));

  const getSelectedDoor = () => doors.find(d => d.id === state.selectedDoor);
  const getSelectedDoorColor = () => colors.find(c => c.id === state.selectedDoorColor);
  const getSelectedWall = () => walls.find(w => w.id === state.selectedWall);
  const getSelectedFloor = () => floors.find(f => f.id === state.selectedFloor);

  return (
    <ShowroomContext.Provider value={{
      state, doors, colors, walls, floors,
      setDoors, setColors, setWalls, setFloors,
      selectDoor, selectDoorColor, selectWall, selectFloor, setCollection,
      getSelectedDoor, getSelectedDoorColor, getSelectedWall, getSelectedFloor,
    }}>
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  const ctx = useContext(ShowroomContext);
  if (!ctx) throw new Error('useShowroom must be used within ShowroomProvider');
  return ctx;
}
