import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const storagePath = formData.get('storage_path') as string;

  if (!id || !storagePath) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  
  try {
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('products')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete the record from the database
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
