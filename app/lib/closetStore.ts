import { supabase } from './supabase';

export interface ClosetItem {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
  last_recommended_at: string | null;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function getItems(userId: string): Promise<ClosetItem[]> {
  const { data, error } = await supabase
    .from('closet_items')
    .select('id, name, image_url, created_at, last_recommended_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addItem(
  userId: string,
  imageDataUrl: string,
  name: string,
): Promise<ClosetItem> {
  const blob = dataUrlToBlob(imageDataUrl);
  const path = `${userId}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('closet-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('closet-images')
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from('closet_items')
    .insert({ user_id: userId, name, image_url: publicUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('closet_items')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('closet_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function markRecommended(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from('closet_items')
    .update({ last_recommended_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
}

// Returns items, deprioritising recently recommended ones (within 3 days)
export function sortForRecommendation(items: ClosetItem[]): ClosetItem[] {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const fresh = items.filter(
    i => !i.last_recommended_at || new Date(i.last_recommended_at).getTime() < threeDaysAgo,
  );
  const recent = items.filter(
    i => i.last_recommended_at && new Date(i.last_recommended_at).getTime() >= threeDaysAgo,
  );
  // Use fresh items first; only include recent ones if we have fewer than 4 fresh
  return fresh.length >= 4 ? fresh : [...fresh, ...recent];
}
