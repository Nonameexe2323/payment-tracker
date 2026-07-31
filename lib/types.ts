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
}