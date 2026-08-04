import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const DEFAULT_REVIEWS = [
  { id: '1', name: 'Sahapab Punyasaikunkphut', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-pink-950/80 text-pink-300 border-pink-500/40', rating: 5, comment: 'ร้านนี้ไม่โกงงงง ขายรหัสถูกด้วย', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '2', name: 'Keke Jdjdj', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-purple-950/80 text-purple-300 border-purple-500/40', rating: 5, comment: 'ดีครับบริการดีราคาไม่แพงด้วย', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '3', name: 'Wutthichai Phasuk', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', rating: 5, comment: 'บริการดี ได้จริงแน่นอน ไม่มีบิด100%', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '4', name: 'Natthaphong Eiei', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', rating: 5, comment: 'ร้านดีมากกก ไม่โกงแน่นอน💫', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '5', name: "K'Kritsada Buaphian", badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-amber-950/80 text-amber-300 border-amber-500/40', rating: 5, comment: '+1บริการดีกว่าที่คิดไม่เข้าใจก็บอกทุกอย่าง', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '6', name: 'Kaka Jg', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40', rating: 5, comment: 'ร้านนี้ดีมากๆครับมีแต่ไอดีโหดๆไม่มีไอดีที่ไม่โหดเลยราคาถูกกว่าร้านอื่นตอบเร็ว', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '7', name: 'ยุครับ เน', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-rose-950/80 text-rose-300 border-rose-500/40', rating: 5, comment: 'ร้านนี้ดีครับผมไม่โกงแน่นอนครับ', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '8', name: 'ผมใจ ว่าไง', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-sky-950/80 text-sky-300 border-sky-500/40', rating: 5, comment: 'ดีครับร้านนี้ตอบไวปลอดภัยแน่นอน', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '9', name: 'Pukkawat Eamphabun', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-purple-950/80 text-purple-300 border-purple-500/40', rating: 5, comment: 'ร้านบริการดีมากครับพูดจาน่ารักมากครับ', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '10', name: 'ใช่ไง ออ', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-pink-950/80 text-pink-300 border-pink-500/40', rating: 5, comment: 'ร้านนี้ดีครับแอดตอบไวทันใจของเขาดีจริงครับมาจัดกันได้', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '11', name: 'Ramet RA', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', rating: 5, comment: '+1ปลอดภัยไม่บิดไม่โกงมีกิจกรรมแจกไอดีฟรีด้วยครับ', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '12', name: "อา' ปาย.", badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-amber-950/80 text-amber-300 border-amber-500/40', rating: 5, comment: 'ร้านไม่โกงงง ไอดีโหดมากกกกกก', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '13', name: 'Wachirawit Cheysanoi', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', rating: 5, comment: 'ร้านดีแบบนี้หายากเอาไปเลย5💫เลย', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '14', name: 'Suphakit Chaowart', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40', rating: 5, comment: 'ไม่โกงไม่เกรียนคุยง่าย+1.', image_url: '/logo.jpg', created_at: new Date().toISOString() },
  { id: '15', name: 'ชิเณวัฒน์ ฯ.', badge: '💖 แนะนำ Jiksaw shop', badge_color: 'bg-rose-950/80 text-rose-300 border-rose-500/40', rating: 5, comment: 'ไม่โกงไม่เกรียน100%คุยง่ายราคาถูกใจ +1', image_url: '/logo.jpg', created_at: new Date().toISOString() }
]

// GET — List reviews
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      // Return default initial reviews if table doesn't exist yet or is empty
      return NextResponse.json({ data: DEFAULT_REVIEWS })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
    return NextResponse.json({ data: DEFAULT_REVIEWS })
  }
}

// POST — Create new review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, badge, badge_color, rating, comment, image_url } = body

    if (!name?.trim() || !comment?.trim()) {
      return NextResponse.json({ error: 'ชื่อผู้รีวิวและข้อความรีวิวจำเป็นต้องกรอก' }, { status: 400 })
    }

    const payload = {
      name: name.trim(),
      badge: badge?.trim() || '💖 แนะนำ Jiksaw shop',
      badge_color: badge_color?.trim() || 'bg-pink-950/80 text-pink-300 border-pink-500/40',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      image_url: image_url?.trim() || '/logo.jpg',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([payload])
      .select()
      .single()

    if (error) {
      // If table missing, return synthesized response so admin UX works gracefully
      return NextResponse.json({ data: { id: Date.now().toString(), ...payload } })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Failed to insert review:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE — Remove review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing review ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Error deleting review from Supabase:', error.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete review:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
