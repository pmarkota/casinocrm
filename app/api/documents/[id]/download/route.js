import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/documents/[id]/download - Get a signed URL for downloading the document
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get document to get file path
    const { data: document, error: docError } = await supabase
      .from('document')
      .select('file_path, type')
      .eq('id', id)
      .single();
    
    if (docError) {
      if (docError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      throw docError;
    }
    
    if (!document.file_path) {
      return NextResponse.json({ error: 'No file associated with this document' }, { status: 400 });
    }
    
    // Create a signed URL for the file with download flag
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(document.file_path, 60 * 5, {
        download: document.type || 'document'
      });
    
    if (urlError) {
      throw urlError;
    }
    
    return NextResponse.json({ url: urlData.signedUrl });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
