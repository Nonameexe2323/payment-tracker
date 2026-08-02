import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET — List all ID sales
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('id_sales')
      .select('*')
      .order('sold_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Failed to fetch id_sales:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST — Create new ID sale
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { game_id, game_name, buy_price, sell_price, admin_name, sold_at } = body

    if (!game_id || buy_price === undefined || sell_price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const profit = Number(sell_price) - Number(buy_price)

    const { data, error } = await supabaseAdmin
      .from('id_sales')
      .insert({
        game_id: game_id.trim(),
        game_name: game_name?.trim() || null,
        buy_price: Number(buy_price),
        sell_price: Number(sell_price),
        profit,
        admin_name: admin_name?.trim() || null,
        sold_at: sold_at || new Date().toISOString(),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (error) {
    console.error('Failed to create id_sale:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT — Update ID sale
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, game_id, game_name, buy_price, sell_price, admin_name, sold_at } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (game_id !== undefined) updateData.game_id = game_id.trim()
    if (game_name !== undefined) updateData.game_name = game_name?.trim() || null
    if (buy_price !== undefined) updateData.buy_price = Number(buy_price)
    if (sell_price !== undefined) updateData.sell_price = Number(sell_price)
    if (admin_name !== undefined) updateData.admin_name = admin_name?.trim() || null
    if (sold_at !== undefined) updateData.sold_at = sold_at

    // Recalculate profit if prices changed
    if (buy_price !== undefined || sell_price !== undefined) {
      const bp = buy_price !== undefined ? Number(buy_price) : undefined
      const sp = sell_price !== undefined ? Number(sell_price) : undefined

      if (bp !== undefined && sp !== undefined) {
        updateData.profit = sp - bp
      } else {
        // Need to fetch the other value
        const { data: existing } = await supabaseAdmin
          .from('id_sales')
          .select('buy_price, sell_price')
          .eq('id', id)
          .single()

        if (existing) {
          const finalBuy = bp ?? existing.buy_price
          const finalSell = sp ?? existing.sell_price
          updateData.profit = finalSell - finalBuy
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('id_sales')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('Failed to update id_sale:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE — Delete ID sale (single or bulk by month)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const monthStart = searchParams.get('month_start')
    const monthEnd = searchParams.get('month_end')

    // Bulk delete by month range
    if (monthStart && monthEnd) {
      const { error } = await supabaseAdmin
        .from('id_sales')
        .delete()
        .gte('sold_at', monthStart)
        .lt('sold_at', monthEnd)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Single delete by id
    if (!id) {
      return NextResponse.json({ error: 'Missing id or month range' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('id_sales')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete id_sale:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
