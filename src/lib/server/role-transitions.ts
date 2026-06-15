import type { SupabaseClient } from '@supabase/supabase-js'

export type RoleTransitionInput = {
  userId: string
  previousRole: string | null | undefined
  nextRole: string
  performedByUserId?: string | null
  source: string
  reason?: string | null
  metadata?: Record<string, unknown> | null
}

export async function recordRoleTransition(
  supabase: SupabaseClient,
  input: RoleTransitionInput,
): Promise<{ recorded: boolean }> {
  const previousRole = String(input.previousRole || '').trim().toLowerCase() || null
  const nextRole = String(input.nextRole || '').trim().toLowerCase()

  if (!input.userId || !nextRole || previousRole === nextRole) {
    return { recorded: false }
  }

  const { error } = await supabase.from('role_transitions').insert({
    user_id: input.userId,
    previous_role: previousRole,
    next_role: nextRole,
    changed_by: input.performedByUserId || null,
    source: input.source,
    reason: input.reason || null,
    metadata: input.metadata || {},
  })

  if (error) {
    console.warn('[role-transitions] insert failed:', error)
    return { recorded: false }
  }

  return { recorded: true }
}
