export interface DoorColor {
  id: string;
  name: string;
  hex: string;
  enabled: boolean;
}

export interface DoorModel {
  id: string;
  name: string;
  collection: DoorCollection;
  moldingStyle: 'simple' | 'ornate' | 'minimal';
  panelCount: 2 | 3 | 4;
  enabled: boolean;
  image?: string | null;
}

export type DoorCollection = 'classic' | 'neo-classic' | 'luxury';

export interface WallStyle {
  id: string;
  name: string;
  color: string;
  moldingType: 'classic' | 'modern' | 'ornate';
  enabled: boolean;
  image?: string | null;
}

export interface FloorMaterial {
  id: string;
  name: string;
  color: string;
  pattern: 'marble' | 'wood' | 'tile';
  enabled: boolean;
  image?: string | null;
}

export interface ShowroomState {
  selectedDoor: string;
  selectedDoorColor: string;
  selectedWall: string;
  selectedFloor: string;
  activeCollection: DoorCollection;
}
