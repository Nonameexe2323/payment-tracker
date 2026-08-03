export type Customer = {
  id: string
  code: string
  name: string
  total_amount: number
  status: 'active' | 'defaulted'
  plan_type?: 'daily' | 'weekly' | null
  due_date?: string | null
  weekly_day?: number | null // 0=Sun, 1=Mon, ..., 6=Sat
  max_unpaid_days?: number | null // Days allowed without payment before default (default: 3)
  admin_name?: string | null
  admin_note?: string | null
  image_url?: string | null
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

export type IdSale = {
  id: string
  game_id: string
  game_name?: string | null
  buy_price: number
  sell_price: number
  profit: number
  admin_name?: string | null
  sold_at: string
  created_at: string
}

export type StockId = {
  id: string
  code: string
  title: string
  game_name: string
  price_cash: number
  price_installment?: number | null
  details?: string | null
  image_url?: string | null
  status: 'available' | 'reserved' | 'sold'
  admin_name?: string | null
  created_at: string
}