import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ShowroomState, DoorCollection, DoorModel, DoorColor, WallStyle, FloorMaterial, RoomDoor, RoomFloor, DoorModelColor } from '@/types/showroom';
import { useShowroomData } from '@/hooks/useShowroomData';

interface ShowroomContextType {
  state: ShowroomState;
  // All data (for admin)
  allDoors: DoorModel[];
  allColors: DoorColor[];
  allWalls: WallStyle[];
  allFloors: FloorMaterial[];
  roomDoors: RoomDoor[];
  roomFloors: RoomFloor[];
  doorModelColors: DoorModelColor[];
  // Filtered data (for showroom)
  filteredDoors: DoorModel[];
  filteredColors: DoorColor[];
  filteredFloors: FloorMaterial[];
  walls: WallStyle[];
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
  const { doors, colors, walls, floors, roomDoors, roomFloors, doorModelColors, loading, refetch } = useShowroomData();

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

  // Doors filtered by selected wall (room style)
  const filteredDoors = useMemo(() => {
    if (!state.selectedWall) return doors.filter(d => d.enabled);
    const doorIds = new Set(roomDoors.filter(rd => rd.wall_id === state.selectedWall).map(rd => rd.door_id));
    // If no assignments yet, show all doors (backward compat)
    if (doorIds.size === 0) return doors.filter(d => d.enabled);
    return doors.filter(d => d.enabled && doorIds.has(d.id));
  }, [state.selectedWall, doors, roomDoors]);

  // Colors filtered by selected door
  const filteredColors = useMemo(() => {
    if (!state.selectedDoor) return colors.filter(c => c.enabled);
    const colorIds = new Set(doorModelColors.filter(dmc => dmc.door_id === state.selectedDoor).map(dmc => dmc.color_id));
    // If no assignments yet, show all colors (backward compat)
    if (colorIds.size === 0) return colors.filter(c => c.enabled);
    return colors.filter(c => c.enabled && colorIds.has(c.id));
  }, [state.selectedDoor, colors, doorModelColors]);

  // Floors filtered by selected wall (room style)
  const filteredFloors = useMemo(() => {
    if (!state.selectedWall) return floors.filter(f => f.enabled);
    const floorIds = new Set(roomFloors.filter(rf => rf.wall_id === state.selectedWall).map(rf => rf.floor_id));
    // If no assignments yet, show all floors (backward compat)
    if (floorIds.size === 0) return floors.filter(f => f.enabled);
    return floors.filter(f => f.enabled && floorIds.has(f.id));
  }, [state.selectedWall, floors, roomFloors]);

  // Auto-select first enabled items when data loads or selection changes
  React.useEffect(() => {
    if (loading) return;
    setState(s => {
      const newState = { ...s };
      // Auto-select wall if none selected
      if (!newState.selectedWall || !walls.find(w => w.id === newState.selectedWall && w.enabled)) {
        newState.selectedWall = walls.find(w => w.enabled)?.id || '';
      }
      return newState;
    });
  }, [loading, walls]);

  // Auto-select door when wall changes
  React.useEffect(() => {
    if (loading || !state.selectedWall) return;
    setState(s => {
      const currentDoorValid = filteredDoors.find(d => d.id === s.selectedDoor);
      if (currentDoorValid) return s;
      return { ...s, selectedDoor: filteredDoors[0]?.id || '' };
    });
  }, [loading, state.selectedWall, filteredDoors]);

  // Auto-select color when door changes
  React.useEffect(() => {
    if (loading || !state.selectedDoor) return;
    setState(s => {
      const currentColorValid = filteredColors.find(c => c.id === s.selectedDoorColor);
      if (currentColorValid) return s;
      return { ...s, selectedDoorColor: filteredColors[0]?.id || '' };
    });
  }, [loading, state.selectedDoor, filteredColors]);

  // Auto-select floor when wall changes
  React.useEffect(() => {
    if (loading || !state.selectedWall) return;
    setState(s => {
      const currentFloorValid = filteredFloors.find(f => f.id === s.selectedFloor);
      if (currentFloorValid) return s;
      return { ...s, selectedFloor: filteredFloors[0]?.id || '' };
    });
  }, [loading, state.selectedWall, filteredFloors]);

  // Persist selection to localStorage
  React.useEffect(() => {
    if (state.selectedWall) {
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
      state,
      allDoors: doors, allColors: colors, allWalls: walls, allFloors: floors,
      roomDoors, roomFloors, doorModelColors,
      filteredDoors, filteredColors, filteredFloors,
      walls,
      loading, refetch,
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
