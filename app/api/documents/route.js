import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/documents - Get all documents with optional filters
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Build the query
    let query = supabase
      .from('document')
      .select('*, client:client_id(firstname, lastname)', { count: 'exact' });
    
    // Apply search if provided
    if (search) {
      query = query.or(`type.ilike.%${search}%,id_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }
    
    // Apply client filter if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    // Apply type filter if provided
    if (type) {
      query = query.eq('type', type);
    }
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply sorting and pagination
    const { data: documents, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: documents,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/documents - Create a new document
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const client_id = formData.get('client_id');
    const type = formData.get('type');
    const valid_until = formData.get('valid_until') || null;
    const id_number = formData.get('id_number') || null;
    const status = formData.get('status') || 'valid';
    const notes = formData.get('notes') || null;
    
    // Basic validation
    if (!file || !client_id || !type) {
      return NextResponse.json({ 
        error: 'File, client_id, and type are required' 
      }, { status: 400 });
    }
    
    // Check if client exists
    const { data: client, error: clientError } = await supabase
      .from('client')
      .select('id')
      .eq('id', client_id)
      .single();
    
    if (clientError || !client) {
      return NextResponse.json({ 
        error: 'Client not found' 
      }, { status: 400 });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${client_id}_${timestamp}.${fileExt}`;
    const filePath = `${client_id}/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Create document record in the database
    const { data: document, error } = await supabase
      .from('document')
      .insert({
        client_id,
        type,
        valid_until,
        id_number,
        status,
        notes,
        file_path: filePath
      })
      .select('*, client:client_id(firstname, lastname)')
      .single();
    
    if (error) {
      // Try to delete the uploaded file if the database insert fails
      await supabase.storage.from('documents').remove([filePath]);
      throw error;
    }
    
    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
