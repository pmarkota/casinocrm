import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/agents/[id] - Get a single agent by ID
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
    
    // Get agent by ID
    const { data: agent, error } = await supabase
      .from('agent')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      throw error;
    }
    
    return NextResponse.json({ data: agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/agents/[id] - Update an agent
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
    
    // Check if the agent exists
    const { data: existingAgent, error: checkError } = await supabase
      .from('agent')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      throw checkError;
    }
    
    // Update the agent
    const { data, error } = await supabase
      .from('agent')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/agents/[id] - Delete an agent
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
    
    // Check if the agent exists
    const { data: existingAgent, error: checkError } = await supabase
      .from('agent')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      throw checkError;
    }
    
    // Delete the agent
    const { error } = await supabase
      .from('agent')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
