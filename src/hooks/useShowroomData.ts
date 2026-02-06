import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DoorModel, DoorColor, WallStyle, FloorMaterial, DoorCollection } from '@/types/showroom';

function mapDoor(row: any): DoorModel {
  return {
    id: row.id,
    name: row.name,
    collection: row.collection as DoorCollection,
    moldingStyle: row.molding_style as DoorModel['moldingStyle'],
    panelCount: row.panel_count as DoorModel['panelCount'],
    enabled: row.enabled,
    image: row.image_url,
  };
}

function mapColor(row: any): DoorColor {
  return { id: row.id, name: row.name, hex: row.hex, enabled: row.enabled };
}

function mapWall(row: any): WallStyle {
  return {
    id: row.id, name: row.name, color: row.color,
    moldingType: row.molding_type as WallStyle['moldingType'],
    enabled: row.enabled, image: row.image_url,
  };
}

function mapFloor(row: any): FloorMaterial {
  return {
    id: row.id, name: row.name, color: row.color,
    pattern: row.pattern as FloorMaterial['pattern'],
    enabled: row.enabled, image: row.image_url,
  };
}

export function useShowroomData() {
  const [doors, setDoors] = useState<DoorModel[]>([]);
  const [colors, setColors] = useState<DoorColor[]>([]);
  const [walls, setWalls] = useState<WallStyle[]>([]);
  const [floors, setFloors] = useState<FloorMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [d, c, w, f] = await Promise.all([
      supabase.from('doors').select('*').order('sort_order'),
      supabase.from('door_colors').select('*').order('sort_order'),
      supabase.from('walls').select('*').order('sort_order'),
      supabase.from('floors').select('*').order('sort_order'),
    ]);
    if (d.data) setDoors(d.data.map(mapDoor));
    if (c.data) setColors(c.data.map(mapColor));
    if (w.data) setWalls(w.data.map(mapWall));
    if (f.data) setFloors(f.data.map(mapFloor));
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('showroom-realtime')
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
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { doors, colors, walls, floors, setDoors, setColors, setWalls, setFloors, loading, refetch: fetchAll };
}

export async function uploadAssetImage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('showroom-assets').upload(path, file);
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from('showroom-assets').getPublicUrl(path);
  return data.publicUrl;
}
