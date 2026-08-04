-- ══════════════════════════════════════════════════════════
-- SUPABASE SQL MIGRATION: REVIEWS TABLE
-- คัดลอกคำสั่งด้านล่างนี้ไปรันใน Supabase Dashboard -> SQL Editor
-- ══════════════════════════════════════════════════════════

-- 1. สร้างตาราง 'reviews' สำหรับเก็บรีวิวเพจ
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    badge TEXT DEFAULT '💖 แนะนำ Jiksaw shop',
    badge_color TEXT DEFAULT 'bg-pink-950/80 text-pink-300 border-pink-500/40',
    rating INT DEFAULT 5,
    comment TEXT NOT NULL,
    image_url TEXT DEFAULT '/logo.jpg',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. เปิดใช้งาน Row Level Security (RLS) และสร้างสิทธิ์การเข้าถึง
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews"
    ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Allow public insert to reviews"
    ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete to reviews"
    ON public.reviews FOR DELETE USING (true);

-- 3. เพิ่มข้อมูลรีวิวจริงเริ่มต้น 15 รายการลงตาราง Database
INSERT INTO public.reviews (name, badge, badge_color, rating, comment, image_url) VALUES
('Sahapab Punyasaikunkphut', '💖 แนะนำ Jiksaw shop', 'bg-pink-950/80 text-pink-300 border-pink-500/40', 5, 'ร้านนี้ไม่โกงงงง ขายรหัสถูกด้วย', '/logo.jpg'),
('Keke Jdjdj', '💖 แนะนำ Jiksaw shop', 'bg-purple-950/80 text-purple-300 border-purple-500/40', 5, 'ดีครับบริการดีราคาไม่แพงด้วย', '/logo.jpg'),
('Wutthichai Phasuk', '💖 แนะนำ Jiksaw shop', 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', 5, 'บริการดี ได้จริงแน่นอน ไม่มีบิด100%', '/logo.jpg'),
('Natthaphong Eiei', '💖 แนะนำ Jiksaw shop', 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', 5, 'ร้านดีมากกก ไม่โกงแน่นอน💫', '/logo.jpg'),
('K''Kritsada Buaphian', '💖 แนะนำ Jiksaw shop', 'bg-amber-950/80 text-amber-300 border-amber-500/40', 5, '+1บริการดีกว่าที่คิดไม่เข้าใจก็บอกทุกอย่าง', '/logo.jpg'),
('Kaka Jg', '💖 แนะนำ Jiksaw shop', 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40', 5, 'ร้านนี้ดีมากๆครับมีแต่ไอดีโหดๆไม่มีไอดีที่ไม่โหดเลยราคาถูกกว่าร้านอื่นตอบเร็ว', '/logo.jpg'),
('ยุครับ เน', '💖 แนะนำ Jiksaw shop', 'bg-rose-950/80 text-rose-300 border-rose-500/40', 5, 'ร้านนี้ดีครับผมไม่โกงแน่นอนครับ', '/logo.jpg'),
('ผมใจ ว่าไง', '💖 แนะนำ Jiksaw shop', 'bg-sky-950/80 text-sky-300 border-sky-500/40', 5, 'ดีครับร้านนี้ตอบไวปลอดภัยแน่นอน', '/logo.jpg'),
('Pukkawat Eamphabun', '💖 แนะนำ Jiksaw shop', 'bg-purple-950/80 text-purple-300 border-purple-500/40', 5, 'ร้านบริการดีมากครับพูดจาน่ารักมากครับ', '/logo.jpg'),
('ใช่ไง ออ', '💖 แนะนำ Jiksaw shop', 'bg-pink-950/80 text-pink-300 border-pink-500/40', 5, 'ร้านนี้ดีครับแอดตอบไวทันใจของเขาดีจริงครับมาจัดกันได้', '/logo.jpg'),
('Ramet RA', '💖 แนะนำ Jiksaw shop', 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', 5, '+1ปลอดภัยไม่บิดไม่โกงมีกิจกรรมแจกไอดีฟรีด้วยครับ', '/logo.jpg'),
('อา'' ปาย.', '💖 แนะนำ Jiksaw shop', 'bg-amber-950/80 text-amber-300 border-amber-500/40', 5, 'ร้านไม่โกงงง ไอดีโหดมากกกกกก', '/logo.jpg'),
('Wachirawit Cheysanoi', '💖 แนะนำ Jiksaw shop', 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', 5, 'ร้านดีแบบนี้หายากเอาไปเลย5💫เลย', '/logo.jpg'),
('Suphakit Chaowart', '💖 แนะนำ Jiksaw shop', 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40', 5, 'ไม่โกงไม่เกรียนคุยง่าย+1.', '/logo.jpg'),
('ชิเณวัฒน์ ฯ.', '💖 แนะนำ Jiksaw shop', 'bg-rose-950/80 text-rose-300 border-rose-500/40', 5, 'ไม่โกงไม่เกรียน100%คุยง่ายราคาถูกใจ +1', '/logo.jpg');
