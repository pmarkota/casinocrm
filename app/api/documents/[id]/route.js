import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/documents/[id] - Get a single document by ID
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
    
    // Get document with client info
    const { data: document, error } = await supabase
      .from('document')
      .select('*, client:client_id(id, firstname, lastname)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      throw error;
    }
    
    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/documents/[id] - Update a document
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the document to update
    const { data: existingDocument, error: fetchError } = await supabase
      .from('document')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      throw fetchError;
    }
    
    let updateData = {};
    
    // Handle file upload if present
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (file) {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${existingDocument.client_id}_${timestamp}.${fileExt}`;
      const filePath = `${existingDocument.client_id}/${fileName}`;
      
      // Upload the new file
      const { error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Delete old file if it exists
      if (existingDocument.file_path) {
        await supabase.storage.from('documents').remove([existingDocument.file_path]);
      }
      
      updateData.file_path = filePath;
    }
    
    // Update other metadata
    const fields = ['type', 'valid_until', 'id_number', 'status', 'notes'];
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        updateData[field] = value || null;
      }
    });
    
    // Update the document
    const { data: updatedDocument, error } = await supabase
      .from('document')
      .update(updateData)
      .eq('id', id)
      .select('*, client:client_id(firstname, lastname)')
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the document to delete
    const { data: document, error: fetchError } = await supabase
      .from('document')
      .select('file_path')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      throw fetchError;
    }
    
    // Delete the file from storage if it exists
    if (document.file_path) {
      await supabase.storage.from('documents').remove([document.file_path]);
    }
    
    // Delete the document record
    const { error } = await supabase
      .from('document')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
