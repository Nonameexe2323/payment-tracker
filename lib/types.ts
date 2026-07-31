export type Customer = {
  id: string
  code: string
  name: string
  phone: string | null
  total_amount: number
  monthly_amount: number
  created_at: string
}

export type Payment = {
  id: string
  customer_id: string
  amount: number
  paid_at: string
  status: 'pending' | 'approved' | 'rejected'
  slip_url?: string | null
  approved_by?: string | null
  approved_at?: string | null
}