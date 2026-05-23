// Test Supabase connection, columns, and PATCH behavior for Porterful submissions
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== Porterful Submissions DB Investigation ===\n')
console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING')
console.log('Service Role Key:', supabaseKey ? 'SET (' + supabaseKey.substring(0, 20) + '...)' : 'MISSING')
console.log()

async function main() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // --- TASK 1: List all submissions (first 20) ---
  console.log('--- TASK 1: List submissions (first 20) ---')
  const { data: subs, error: subsError } = await supabase
    .from('submissions')
    .select('*')
    .limit(20)

  if (subsError) {
    console.error('ERROR listing submissions:', subsError.message)
  } else {
    console.log('Count:', subs.length)
    if (subs.length > 0) {
      console.log('First row keys:', Object.keys(subs[0]).join(', '))
      console.log('IDs:', subs.map(s => s.id).join(', '))
      const tempCount = subs.filter(s => String(s.id).startsWith('temp_')).length
      console.log('temp_ IDs in this batch:', tempCount)
    }
  }
  console.log()

  // --- TASK 2: Check for temp_ IDs across entire table ---
  console.log('--- TASK 2: Check for temp_ IDs across all submissions ---')
  const { data: tempSubs, error: tempError } = await supabase
    .from('submissions')
    .select('id, status, created_at')
    .neq('id', '00000000-0000-0000-0000-000000000000') // dummy to get all

  if (tempError) {
    console.error('ERROR fetching all for temp check:', tempError.message)
  } else {
    const tempOnes = tempSubs.filter(s => String(s.id).startsWith('temp_'))
    console.log('Total submissions:', tempSubs.length)
    console.log('Total temp_ submissions found:', tempOnes.length)
    if (tempOnes.length > 0) {
      tempOnes.forEach(s => console.log(' -', s.id, '| status:', s.status, '| created:', s.created_at))
    } else {
      console.log('No temp_ IDs exist in the database.')
    }
  }
  console.log()

  // --- TASK 4: Check table schema ---
  console.log('--- TASK 4: Check table schema ---')
  const { data: columns, error: colError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'submissions')
    .order('ordinal_position')

  if (colError) {
    console.error('Schema query error:', colError.message)
  } else {
    console.log('Columns found:', columns.length)
    columns.forEach(c => console.log(` - ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`))
  }
  console.log()

  // --- TASK 5: Check RLS policies ---
  console.log('--- TASK 5: Check RLS policies ---')
  const { data: policies, error: rlsError } = await supabase
    .from('pg_policies')
    .select('policyname, permissive, cmd, qual, with_check')
    .eq('tablename', 'submissions')

  if (rlsError) {
    console.error('RLS query error (pg_policies):', rlsError.message)
    // Fallback: use raw SQL via rpc if available
    try {
      const { data: pol2, error: pol2Err } = await supabase.rpc('exec_sql', {
        sql: `SELECT * FROM pg_policies WHERE tablename = 'submissions'`
      })
      if (pol2Err) console.error('Fallback RLS error:', pol2Err.message)
      else console.log('Policies (RPC):', JSON.stringify(pol2, null, 2))
    } catch (e) {
      console.error('RPC also failed:', e.message)
    }
  } else {
    console.log('Policies found:', policies.length)
    if (policies.length > 0) {
      policies.forEach(p => console.log(` - ${p.policyname}: ${p.permissive} ${p.cmd} qual=${p.qual}`))
    } else {
      console.log('No policies found on submissions table.')
    }
  }
  console.log()

  // --- TASK 3: Test PATCH on a real submission ---
  console.log('--- TASK 3: Test PATCH on status field ---')
  let testId = subs && subs.length > 0 ? subs[0].id : null
  if (!testId) {
    console.log('No submissions found to test PATCH against.')
  } else {
    const originalStatus = subs[0].status
    console.log('Test submission ID:', testId)
    console.log('Original status:', originalStatus)

    // Try patching to 'rejected'
    const { data: patchData, error: patchError } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', testId)
      .select()

    if (patchError) {
      console.error('PATCH ERROR:', patchError.message)
      console.error('PATCH ERROR details:', JSON.stringify(patchError, null, 2))
    } else {
      console.log('PATCH success! Returned rows:', patchData.length)
      console.log('New status:', patchData[0]?.status)
    }

    // Revert
    const { data: revertData, error: revertError } = await supabase
      .from('submissions')
      .update({ status: originalStatus })
      .eq('id', testId)
      .select()

    if (revertError) {
      console.error('REVERT ERROR:', revertError.message)
    } else {
      console.log('Reverted status back to:', revertData[0]?.status)
    }
  }
  console.log()

  // --- TASK 5b: Check for declined_at / approved_at columns ---
  console.log('--- TASK 5b: Check for declined_at / approved_at columns ---')
  if (!colError && columns) {
    const names = columns.map(c => c.column_name)
    console.log('declined_at exists:', names.includes('declined_at') ? 'YES' : 'NO')
    console.log('approved_at exists:', names.includes('approved_at') ? 'YES' : 'NO')
    console.log('declined_by exists:', names.includes('declined_by') ? 'YES' : 'NO')
    console.log('approved_by exists:', names.includes('approved_by') ? 'YES' : 'NO')
  }
  console.log()

  console.log('=== Investigation complete ===')
}

main().catch(err => {
  console.error('Script error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
