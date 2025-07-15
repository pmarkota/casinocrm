import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/clients/[id] - Get a single client by ID
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
    
    // Get client with agent information
    const { data: client, error } = await supabase
      .from('client')
      .select(`
        *, 
        agent:agent_id(id, firstname, lastname, is_active),
        contact_moments:client_contact_moment!client_id(id, date, notes, user_id)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      throw error;
    }
    
    // Get client documents
    const { data: documents } = await supabase
      .from('document')
      .select('*')
      .eq('client_id', id)
      .order('upload_date', { ascending: false });
    
    // Get client casino accounts
    const { data: casinoAccounts } = await supabase
      .from('casino_client')
      .select('*, casino:casino_id(id, casino_name, website)')
      .eq('client_id', id);
    
    // Get client bank accounts
    const { data: bankAccounts } = await supabase
      .from('bank_client')
      .select('*, bank:bank_id(id, name, website)')
      .eq('client_id', id);
    
    return NextResponse.json({
      data: {
        ...client,
        documents: documents || [],
        casino_accounts: casinoAccounts || [],
        bank_accounts: bankAccounts || []
      }
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/clients/[id] - Update a client
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
    
    const updates = await request.json();
    
    // Check if the client exists
    const { data: existingClient, error: checkError } = await supabase
      .from('client')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      throw checkError;
    }
    
    // If email is being updated, check for duplicates
    if (updates.email_address) {
      const { data: duplicateEmail } = await supabase
        .from('client')
        .select('id')
        .eq('email_address', updates.email_address)
        .neq('id', id)
        .single();
      
      if (duplicateEmail) {
        return NextResponse.json({ error: 'A client with this email already exists' }, { status: 400 });
      }
    }
    
    // Update the client
    const { data: updatedClient, error } = await supabase
      .from('client')
      .update(updates)
      .eq('id', id)
      .select('*, agent:agent_id(firstname, lastname)')
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/clients/[id] - Delete a client
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
    
    // Check for related records before deletion
    const { data: relatedDocuments } = await supabase
      .from('document')
      .select('count')
      .eq('client_id', id);
      
    const { data: relatedCasinoAccounts } = await supabase
      .from('casino_client')
      .select('count')
      .eq('client_id', id);
      
    const { data: relatedBankAccounts } = await supabase
      .from('bank_client')
      .select('count')
      .eq('client_id', id);
    
    // If there are related records, we might want to prevent deletion or implement cascading delete
    // For now, we'll just delete the client and let RLS handle constraints
    
    const { error } = await supabase
      .from('client')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
