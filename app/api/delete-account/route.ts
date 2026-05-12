import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Delete storage files
  const { data: files } = await supabase.storage.from('closet-images').list(userId);
  if (files && files.length > 0) {
    const paths = files.map(f => `${userId}/${f.name}`);
    await supabase.storage.from('closet-images').remove(paths);
  }

  // Delete DB rows
  await supabase.from('closet_items').delete().eq('user_id', userId);

  // Delete Clerk account
  const client = await clerkClient();
  await client.users.deleteUser(userId);

  return NextResponse.json({ ok: true });
}
