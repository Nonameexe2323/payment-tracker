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
    let finalAdminRole = adminRole?.trim()

    // Smart role detection if name contains owner keywords or if role is missing/staff
    const nameLower = finalAdminName.toLowerCase()
    if (
      nameLower.includes('หัวเพจ') ||
      nameLower.includes('owner') ||
      nameLower.includes('เจ้าของ') ||
      nameLower.includes('head') ||
      nameLower.includes('ปอนด์')
    ) {
      finalAdminRole = 'owner'
    } else if (!finalAdminRole) {
      finalAdminRole = 'staff'
    }

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
