import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/agents - Get all agents
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all agents, default to active only
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    
    let query = supabase.from('agent').select('*');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data: agents, error } = await query.order('lastname');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents - Create a new agent
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agentData = await request.json();
    
    // Basic validation
    if (!agentData.firstname || !agentData.lastname) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    
    // Default to active if not specified
    if (agentData.is_active === undefined) {
      agentData.is_active = true;
    }
    
    // Insert the agent
    const { data: newAgent, error } = await supabase
      .from('agent')
      .insert(agentData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
