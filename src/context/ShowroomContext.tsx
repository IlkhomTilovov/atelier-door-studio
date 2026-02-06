import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ShowroomState, DoorCollection, DoorModel, DoorColor, WallStyle, FloorMaterial } from '@/types/showroom';
import { useShowroomData } from '@/hooks/useShowroomData';

interface ShowroomContextType {
  state: ShowroomState;
  doors: DoorModel[];
  colors: DoorColor[];
  walls: WallStyle[];
  floors: FloorMaterial[];
  loading: boolean;
  refetch: () => Promise<void>;
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
  const { doors, colors, walls, floors, loading, refetch } = useShowroomData();

  const [state, setState] = useState<ShowroomState>(() => {
    try {
      const saved = localStorage.getItem('showroom-selection');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      selectedDoor: '',
      selectedDoorColor: '',
      selectedWall: '',
      selectedFloor: '',
      activeCollection: 'classic',
    };
  });

  // Auto-select first enabled items when data loads
  React.useEffect(() => {
    if (loading) return;
    setState(s => ({
      ...s,
      selectedDoor: s.selectedDoor || doors.find(d => d.enabled)?.id || '',
      selectedDoorColor: s.selectedDoorColor || colors.find(c => c.enabled)?.id || '',
      selectedWall: s.selectedWall || walls.find(w => w.enabled)?.id || '',
      selectedFloor: s.selectedFloor || floors.find(f => f.enabled)?.id || '',
    }));
  }, [loading, doors, colors, walls, floors]);

  // Persist selection to localStorage
  React.useEffect(() => {
    if (state.selectedDoor) {
      localStorage.setItem('showroom-selection', JSON.stringify(state));
    }
  }, [state]);

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
      state, doors, colors, walls, floors, loading, refetch,
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
