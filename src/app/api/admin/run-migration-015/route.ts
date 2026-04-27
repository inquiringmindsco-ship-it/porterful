import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/admin/run-migration-015
// One-time endpoint to apply migration 015 (track description + updated_at)
// Requires admin/SUPABASE_SERVICE_ROLE_KEY
export async function POST(request: NextRequest) {
  try {
    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Check if columns exist
    const { data: descCol } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'tracks' AND column_name = 'description'
      `
    });

    const { data: updatedAtCol } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'tracks' AND column_name = 'updated_at'
      `
    });

    const results: string[] = [];

    // Add description column if missing
    if (!descCol || descCol.length === 0) {
      const { error: descErr } = await supabaseAdmin.rpc('execute_sql', {
        sql: `ALTER TABLE tracks ADD COLUMN description TEXT`
      });
      if (descErr) throw descErr;
      results.push('Added description column');
    } else {
      results.push('description column already exists');
    }

    // Add updated_at column if missing
    if (!updatedAtCol || updatedAtCol.length === 0) {
      const { error: updErr } = await supabaseAdmin.rpc('execute_sql', {
        sql: `ALTER TABLE tracks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()`
      });
      if (updErr) throw updErr;
      results.push('Added updated_at column');
    } else {
      results.push('updated_at column already exists');
    }

    // Create/update trigger function
    const { error: fnErr } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_tracks_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `
    });
    if (fnErr) throw fnErr;
    results.push('Created/updated trigger function');

    // Create trigger
    const { error: trigErr } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        DROP TRIGGER IF EXISTS tracks_updated_at ON tracks;
        CREATE TRIGGER tracks_updated_at
          BEFORE UPDATE ON tracks
          FOR EACH ROW EXECUTE FUNCTION update_tracks_updated_at()
      `
    });
    if (trigErr) throw trigErr;
    results.push('Created trigger');

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('[migration-015] Error:', err);
    return NextResponse.json({ error: err.message || 'Migration failed' }, { status: 500 });
  }
}

// GET /api/admin/run-migration-015 — Check status
export async function GET() {
  return NextResponse.json({ 
    info: 'POST to run migration 015 (adds description + updated_at to tracks)',
    requires: 'SUPABASE_SERVICE_ROLE_KEY'
  });
}
