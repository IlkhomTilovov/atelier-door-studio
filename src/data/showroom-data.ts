import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection } from '@/types/showroom';

export const doorColors: DoorColor[] = [
  { id: 'white', name: 'Oq', hex: '#E8E4DE', enabled: true },
  { id: 'ivory', name: 'Fil suyagi', hex: '#F5F0E8', enabled: true },
  { id: 'champagne', name: 'Shampan', hex: '#D4C5A9', enabled: true },
  { id: 'gray', name: 'Kulrang', hex: '#9B9590', enabled: true },
  { id: 'walnut', name: 'Yong\'oq', hex: '#6B4E3D', enabled: true },
  { id: 'black', name: 'Qora', hex: '#2C2C2C', enabled: true },
  { id: 'blue', name: 'Ko\'k', hex: '#4A6B8A', enabled: true },
  { id: 'green', name: 'Yashil', hex: '#5B7A5E', enabled: true },
];

export const doorModels: DoorModel[] = [
  { id: 'classic-1', name: 'Milano', collection: 'classic', moldingStyle: 'simple', panelCount: 2, enabled: true },
  { id: 'classic-2', name: 'Roma', collection: 'classic', moldingStyle: 'simple', panelCount: 3, enabled: true },
  { id: 'classic-3', name: 'Venezia', collection: 'classic', moldingStyle: 'ornate', panelCount: 2, enabled: true },
  { id: 'neo-1', name: 'Aurora', collection: 'neo-classic', moldingStyle: 'ornate', panelCount: 2, enabled: true },
  { id: 'neo-2', name: 'Stella', collection: 'neo-classic', moldingStyle: 'ornate', panelCount: 3, enabled: true },
  { id: 'neo-3', name: 'Luna', collection: 'neo-classic', moldingStyle: 'simple', panelCount: 4, enabled: true },
  { id: 'lux-1', name: 'Imperial', collection: 'luxury', moldingStyle: 'ornate', panelCount: 2, enabled: true },
  { id: 'lux-2', name: 'Royal', collection: 'luxury', moldingStyle: 'ornate', panelCount: 3, enabled: true },
  { id: 'lux-3', name: 'Grand', collection: 'luxury', moldingStyle: 'ornate', panelCount: 4, enabled: true },
];

export const wallStyles: WallStyle[] = [
  { id: 'wall-1', name: 'Klassik kulrang', color: '#A8A09A', moldingType: 'classic', enabled: true },
  { id: 'wall-2', name: 'Iliq beige', color: '#C4B8A8', moldingType: 'classic', enabled: true },
  { id: 'wall-3', name: 'Zamonaviy oq', color: '#D8D4CE', moldingType: 'modern', enabled: true },
  { id: 'wall-4', name: 'Hashamatli krem', color: '#D4CBB8', moldingType: 'ornate', enabled: true },
  { id: 'wall-5', name: 'Quyuq charcoal', color: '#3A3A3E', moldingType: 'classic', enabled: true },
];

export const floorMaterials: FloorMaterial[] = [
  { id: 'floor-1', name: 'Qora marmar', color: '#2A2A2E', pattern: 'marble', enabled: true, textureScale: 'medium', textureOrientation: 'horizontal' },
  { id: 'floor-2', name: 'Oq marmar', color: '#D8D2C8', pattern: 'marble', enabled: true, textureScale: 'medium', textureOrientation: 'horizontal' },
  { id: 'floor-3', name: 'Eman parket', color: '#8B6B4A', pattern: 'wood', enabled: true, textureScale: 'medium', textureOrientation: 'horizontal' },
  { id: 'floor-4', name: 'Yong\'oq parket', color: '#5C4033', pattern: 'wood', enabled: true, textureScale: 'medium', textureOrientation: 'horizontal' },
  { id: 'floor-5', name: 'Kulrang granit', color: '#6B6B6B', pattern: 'tile', enabled: true, textureScale: 'medium', textureOrientation: 'horizontal' },
];

export const collectionNames: Record<DoorCollection, string> = {
  'classic': 'Klassik',
  'neo-classic': 'Neo-Klassik',
  'luxury': 'Lyuks',
};
