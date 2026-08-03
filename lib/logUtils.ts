import { supabaseAdmin } from './supabase-admin'

interface RecordLogParams {
  adminName?: string | null
  adminRole?: string | null
  actionType: string
  details: string
}

export async function recordAdminLog({
  adminName,
  adminRole,
  actionType,
  details,
}: RecordLogParams): Promise<void> {
  try {
    const finalAdminName = adminName?.trim() || 'แอดมิน'
    const finalAdminRole = adminRole?.trim() || 'staff'

    await supabaseAdmin.from('admin_logs').insert({
      admin_name: finalAdminName,
      admin_role: finalAdminRole,
      action_type: actionType,
      details,
    })
  } catch (error) {
    console.error('Failed to write admin log:', error)
  }
}
