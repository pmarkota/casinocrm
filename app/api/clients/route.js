import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/clients - Get all clients with optional filters
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'lastname';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const agentId = searchParams.get('agentId');
    
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
      .from('client')
      .select('*, agent:agent_id(firstname, lastname)', { count: 'exact' });
    
    // Apply search if provided
    if (search) {
      query = query.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email_address.ilike.%${search}%`);
    }
    
    // Apply agent filter if provided
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    
    // Apply sorting and pagination
    const { data: clients, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: clients,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/clients - Create a new client
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const clientData = await request.json();
    
    // Basic validation
    if (!clientData.firstname || !clientData.lastname) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    
    if (clientData.email_address) {
      // Check for duplicate email
      const { data: existingClient } = await supabase
        .from('client')
        .select('id')
        .eq('email_address', clientData.email_address)
        .single();
      
      if (existingClient) {
        return NextResponse.json({ error: 'A client with this email already exists' }, { status: 400 });
      }
    }
    
    // Insert the client
    const { data: newClient, error } = await supabase
      .from('client')
      .insert(clientData)
      .select('*, agent:agent_id(firstname, lastname)')
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
