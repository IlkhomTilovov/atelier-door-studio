import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection, RoomDoor, RoomFloor, DoorModelColor, RoomCategory, DoorCategory, DoorFrame } from '@/types/showroom';

interface CategoryRow {
  id: string;
  name: string;
  enabled: boolean;
  sort_order: number;
}

interface DoorRow {
  id: string;
  name: string;
  collection: string;
  molding_style: string;
  panel_count: number;
  enabled: boolean;
  image_url?: string | null;
}

interface DoorFrameRow {
  id: string;
  name: string;
  image_url?: string | null;
  scale?: number | string | null;
  enabled: boolean;
}

interface ColorRow {
  id: string;
  name: string;
  hex: string;
  enabled: boolean;
}

interface WallRow {
  id: string;
  name: string;
  color: string;
  molding_type: string;
  enabled: boolean;
  image_url?: string | null;
  category_id?: string | null;
}

interface FloorRow {
  id: string;
  name: string;
  color: string;
  pattern: string;
  enabled: boolean;
  image_url?: string | null;
  texture_scale?: string | null;
  texture_orientation?: string | null;
}

function mapCategory(row: CategoryRow): RoomCategory {
  return { id: row.id, name: row.name, enabled: row.enabled, sort_order: row.sort_order };
}

function mapDoor(row: DoorRow): DoorModel {
  return {
    id: row.id, name: row.name,
    collection: row.collection as DoorCollection,
    moldingStyle: row.molding_style as DoorModel['moldingStyle'],
    panelCount: row.panel_count as DoorModel['panelCount'],
    enabled: row.enabled, image: row.image_url,
  };
}

function mapFrame(row: DoorFrameRow): DoorFrame {
  return {
    id: row.id,
    name: row.name,
    image: row.image_url ?? null,
    scale: row.scale != null ? Number(row.scale) : 1.15,
    enabled: row.enabled,
  };
}

function mapColor(row: ColorRow): DoorColor {
  return { id: row.id, name: row.name, hex: row.hex, enabled: row.enabled };
}

function mapWall(row: WallRow): WallStyle {
  return {
    id: row.id, name: row.name, color: row.color,
    moldingType: row.molding_type as WallStyle['moldingType'],
    enabled: row.enabled, image: row.image_url,
    category_id: row.category_id,
  };
}

function mapFloor(row: FloorRow): FloorMaterial {
  return {
    id: row.id, name: row.name, color: row.color,
    pattern: row.pattern as FloorMaterial['pattern'],
    enabled: row.enabled, image: row.image_url,
    textureScale: (row.texture_scale ?? 'medium') as FloorMaterial['textureScale'],
    textureOrientation: (row.texture_orientation ?? 'horizontal') as FloorMaterial['textureOrientation'],
  };
}

export function useShowroomData() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [doors, setDoors] = useState<DoorModel[]>([]);
  const [colors, setColors] = useState<DoorColor[]>([]);
  const [walls, setWalls] = useState<WallStyle[]>([]);
  const [floors, setFloors] = useState<FloorMaterial[]>([]);
  const [roomDoors, setRoomDoors] = useState<RoomDoor[]>([]);
  const [roomFloors, setRoomFloors] = useState<RoomFloor[]>([]);
  const [doorModelColors, setDoorModelColors] = useState<DoorModelColor[]>([]);
  const [doorCategories, setDoorCategories] = useState<DoorCategory[]>([]);
  const [frames, setFrames] = useState<DoorFrame[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [cat, d, c, w, f, rd, rf, dmc, dc, fr] = await Promise.all([
      supabase.from('room_categories').select('*').order('sort_order'),
      supabase.from('doors').select('*').order('sort_order'),
      supabase.from('door_colors').select('*').order('sort_order'),
      supabase.from('walls').select('*').order('sort_order'),
      supabase.from('floors').select('*').order('sort_order'),
      supabase.from('room_doors').select('wall_id, door_id'),
      supabase.from('room_floors').select('wall_id, floor_id'),
      supabase.from('door_model_colors').select('door_id, color_id'),
      supabase.from('door_categories').select('door_id, category_id'),
      supabase.from('door_frames').select('*').order('sort_order'),
    ]);
    if (cat.data) setCategories(cat.data.map(mapCategory));
    if (d.data) setDoors(d.data.map(mapDoor));
    if (c.data) setColors(c.data.map(mapColor));
    if (w.data) setWalls(w.data.map(mapWall));
    if (f.data) setFloors(f.data.map(mapFloor));
    if (rd.data) setRoomDoors(rd.data);
    if (rf.data) setRoomFloors(rf.data);
    if (dmc.data) setDoorModelColors(dmc.data);
    if (dc.data) setDoorCategories(dc.data);
    if (fr.data) setFrames(fr.data.map(mapFrame));
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('showroom-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_categories' }, () => {
        supabase.from('room_categories').select('*').order('sort_order').then(({ data }) => {
          if (data) setCategories(data.map(mapCategory));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doors' }, () => {
        supabase.from('doors').select('*').order('sort_order').then(({ data }) => {
          if (data) setDoors(data.map(mapDoor));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'door_colors' }, () => {
        supabase.from('door_colors').select('*').order('sort_order').then(({ data }) => {
          if (data) setColors(data.map(mapColor));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'walls' }, () => {
        supabase.from('walls').select('*').order('sort_order').then(({ data }) => {
          if (data) setWalls(data.map(mapWall));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'floors' }, () => {
        supabase.from('floors').select('*').order('sort_order').then(({ data }) => {
          if (data) setFloors(data.map(mapFloor));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_doors' }, () => {
        supabase.from('room_doors').select('wall_id, door_id').then(({ data }) => {
          if (data) setRoomDoors(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_floors' }, () => {
        supabase.from('room_floors').select('wall_id, floor_id').then(({ data }) => {
          if (data) setRoomFloors(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'door_model_colors' }, () => {
        supabase.from('door_model_colors').select('door_id, color_id').then(({ data }) => {
          if (data) setDoorModelColors(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'door_categories' }, () => {
        supabase.from('door_categories').select('door_id, category_id').then(({ data }) => {
          if (data) setDoorCategories(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'door_frames' }, () => {
        supabase.from('door_frames').select('*').order('sort_order').then(({ data }) => {
          if (data) setFrames(data.map(mapFrame));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return {
    categories, doors, colors, walls, floors, frames,
    roomDoors, roomFloors, doorModelColors, doorCategories,
    setDoors, setColors, setWalls, setFloors,
    loading, refetch: fetchAll,
  };
}

export async function uploadAssetImage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('showroom-assets').upload(path, file);
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from('showroom-assets').getPublicUrl(path);
  return data.publicUrl;
}
