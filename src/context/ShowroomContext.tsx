import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ShowroomState, DoorCollection, DoorModel, DoorColor, WallStyle, FloorMaterial, RoomDoor, RoomFloor, DoorModelColor, RoomCategory, DoorCategory, DoorFrame } from '@/types/showroom';
import { useShowroomData } from '@/hooks/useShowroomData';

interface ShowroomContextType {
  state: ShowroomState;
  // All data (for admin)
  allDoors: DoorModel[];
  allColors: DoorColor[];
  allWalls: WallStyle[];
  allFloors: FloorMaterial[];
  allCategories: RoomCategory[];
  allFrames: DoorFrame[];
  roomDoors: RoomDoor[];
  roomFloors: RoomFloor[];
  doorModelColors: DoorModelColor[];
  doorCategories: DoorCategory[];
  // Filtered data (for showroom)
  filteredWalls: WallStyle[];
  filteredDoors: DoorModel[];
  filteredColors: DoorColor[];
  filteredFloors: FloorMaterial[];
  filteredFrames: DoorFrame[];
  walls: WallStyle[];
  loading: boolean;
  refetch: () => Promise<void>;
  selectCategory: (id: string) => void;
  selectDoor: (id: string) => void;
  selectDoorColor: (id: string) => void;
  selectWall: (id: string) => void;
  selectFloor: (id: string) => void;
  selectFrame: (id: string) => void;
  setCollection: (c: DoorCollection) => void;
  getSelectedDoor: () => DoorModel | undefined;
  getSelectedDoorColor: () => DoorColor | undefined;
  getSelectedWall: () => WallStyle | undefined;
  getSelectedFloor: () => FloorMaterial | undefined;
  getSelectedCategory: () => RoomCategory | undefined;
  getSelectedFrame: () => DoorFrame | undefined;
}

const ShowroomContext = createContext<ShowroomContextType | null>(null);

export function ShowroomProvider({ children }: { children: ReactNode }) {
  const { categories, doors, colors, walls, floors, frames, roomDoors, roomFloors, doorModelColors, doorCategories, loading, refetch } = useShowroomData();

  const [state, setState] = useState<ShowroomState>(() => {
    try {
      const saved = localStorage.getItem('showroom-selection');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, selectedCategory: parsed.selectedCategory || '', selectedFrame: parsed.selectedFrame || '' };
      }
    } catch {
      // ignore parse errors
    }
    return {
      selectedDoor: '',
      selectedDoorColor: '',
      selectedWall: '',
      selectedFloor: '',
      selectedCategory: '',
      selectedFrame: '',
      activeCollection: 'classic',
    };
  });

  // Walls filtered by selected category
  const filteredWalls = useMemo(() => {
    if (!state.selectedCategory) return walls.filter(w => w.enabled);
    return walls.filter(w => w.enabled && w.category_id === state.selectedCategory);
  }, [state.selectedCategory, walls]);

  // Doors filtered by selected category (via doorCategories junction) and wall (via roomDoors)
  const filteredDoors = useMemo(() => {
    let result = doors.filter(d => d.enabled);
    // Filter by category
    if (state.selectedCategory) {
      const catDoorIds = new Set(doorCategories.filter(dc => dc.category_id === state.selectedCategory).map(dc => dc.door_id));
      if (catDoorIds.size > 0) result = result.filter(d => catDoorIds.has(d.id));
    }
    // Further filter by wall (room style)
    if (state.selectedWall) {
      const wallDoorIds = new Set(roomDoors.filter(rd => rd.wall_id === state.selectedWall).map(rd => rd.door_id));
      if (wallDoorIds.size > 0) result = result.filter(d => wallDoorIds.has(d.id));
    }
    return result;
  }, [state.selectedCategory, state.selectedWall, doors, doorCategories, roomDoors]);

  // Colors filtered by selected door
  const filteredColors = useMemo(() => {
    if (!state.selectedDoor) return colors.filter(c => c.enabled);
    const colorIds = new Set(doorModelColors.filter(dmc => dmc.door_id === state.selectedDoor).map(dmc => dmc.color_id));
    if (colorIds.size === 0) return colors.filter(c => c.enabled);
    return colors.filter(c => c.enabled && colorIds.has(c.id));
  }, [state.selectedDoor, colors, doorModelColors]);

  // Floors filtered by selected wall (room style)
  const filteredFloors = useMemo(() => {
    if (!state.selectedWall) return floors.filter(f => f.enabled);
    const floorIds = new Set(roomFloors.filter(rf => rf.wall_id === state.selectedWall).map(rf => rf.floor_id));
    if (floorIds.size === 0) return floors.filter(f => f.enabled);
    return floors.filter(f => f.enabled && floorIds.has(f.id));
  }, [state.selectedWall, floors, roomFloors]);

  // Frames are independent — any enabled frame can be applied to any door
  const filteredFrames = useMemo(() => frames.filter(fr => fr.enabled), [frames]);

  // Auto-select category
  React.useEffect(() => {
    if (loading) return;
    setState(s => {
      const enabledCats = categories.filter(c => c.enabled);
      if (!s.selectedCategory || !enabledCats.find(c => c.id === s.selectedCategory)) {
        return { ...s, selectedCategory: enabledCats[0]?.id || '' };
      }
      return s;
    });
  }, [loading, categories]);

  // Auto-select wall when category changes
  React.useEffect(() => {
    if (loading) return;
    setState(s => {
      const currentWallValid = filteredWalls.find(w => w.id === s.selectedWall);
      if (currentWallValid) return s;
      return { ...s, selectedWall: filteredWalls[0]?.id || '' };
    });
  }, [loading, state.selectedCategory, filteredWalls]);

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
    if (state.selectedCategory) {
      localStorage.setItem('showroom-selection', JSON.stringify(state));
    }
  }, [state]);

  const selectCategory = (id: string) => setState(s => ({ ...s, selectedCategory: id }));
  const selectDoor = (id: string) => setState(s => ({ ...s, selectedDoor: id }));
  const selectDoorColor = (id: string) => setState(s => ({ ...s, selectedDoorColor: id }));
  const selectWall = (id: string) => setState(s => ({ ...s, selectedWall: id }));
  const selectFloor = (id: string) => setState(s => ({ ...s, selectedFloor: id }));
  const selectFrame = (id: string) => setState(s => ({ ...s, selectedFrame: id }));
  const setCollection = (c: DoorCollection) => setState(s => ({ ...s, activeCollection: c }));

  const getSelectedDoor = () => doors.find(d => d.id === state.selectedDoor);
  const getSelectedDoorColor = () => colors.find(c => c.id === state.selectedDoorColor);
  const getSelectedWall = () => walls.find(w => w.id === state.selectedWall);
  const getSelectedFloor = () => floors.find(f => f.id === state.selectedFloor);
  const getSelectedCategory = () => categories.find(c => c.id === state.selectedCategory);
  const getSelectedFrame = () => frames.find(fr => fr.id === state.selectedFrame);

  return (
    <ShowroomContext.Provider value={{
      state,
      allDoors: doors, allColors: colors, allWalls: walls, allFloors: floors, allCategories: categories, allFrames: frames,
      roomDoors, roomFloors, doorModelColors, doorCategories,
      filteredWalls, filteredDoors, filteredColors, filteredFloors, filteredFrames,
      walls,
      loading, refetch,
      selectCategory, selectDoor, selectDoorColor, selectWall, selectFloor, selectFrame, setCollection,
      getSelectedDoor, getSelectedDoorColor, getSelectedWall, getSelectedFloor, getSelectedCategory, getSelectedFrame,
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
