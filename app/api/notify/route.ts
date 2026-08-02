import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentCode, customerName, amount, slipUrl, adminName } = body

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_CHAT_ID
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    const groupId = process.env.LINE_GROUP_ID

    if (!discordWebhookUrl && !telegramToken && (!lineToken || !groupId)) {
      console.warn('No notification credentials (Discord, Telegram, or LINE) are configured.')
      return NextResponse.json({ success: false, message: 'Notification credentials missing' }, { status: 500 })
    }

    const formattedAmount = Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })

    let sentSuccess = false
    const errors: any[] = []

    // 1. Send Discord Webhook Notification if configured
    if (discordWebhookUrl) {
      try {
        const discordPayload = {
          username: 'Payment Tracker Bot',
          embeds: [
            {
              title: '🔔 แจ้งเตือนสลิปชำระเงินใหม่!',
              color: 0x3b82f6, // Vibrant Blue
              fields: [
                { name: '📌 รหัสผ่อน', value: String(paymentCode || '-'), inline: true },
                { name: '👤 ชื่อลูกค้า', value: String(customerName || '-'), inline: true },
                { name: '💰 ยอดเงิน', value: `${formattedAmount} บาท`, inline: true },
                ...(adminName ? [{ name: '🛠️ แอดมินผู้ดูแล', value: String(adminName), inline: true }] : []),
              ],
              image: slipUrl ? { url: slipUrl } : undefined,
              footer: { text: 'ระบบแจ้งเตือนการชำระเงิน' },
              timestamp: new Date().toISOString(),
            },
          ],
        }

        const discordRes = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload),
        })

        if (discordRes.ok || discordRes.status === 204) {
          sentSuccess = true
        } else {
          const discordData = await discordRes.json().catch(() => ({}))
          console.error('Discord Webhook Error:', discordRes.status, discordData)
          errors.push({ provider: 'discord', error: discordData })
        }
      } catch (err: any) {
        console.error('Failed to send Discord message:', err)
        errors.push({ provider: 'discord', error: err.message })
      }
    }

    // 2. Send Telegram Notification if configured
    if (telegramToken && telegramChatId) {
      const adminText = adminName ? `\n👤 <b>แอดมินผู้ดูแล:</b> ${adminName}` : ''
      const telegramMessage = `🔔 <b>แจ้งเตือนสลิปใหม่!</b>\n\n📌 <b>รหัสผ่อน:</b> ${paymentCode}\n👤 <b>ชื่อลูกค้า:</b> ${customerName}${adminText}\n💰 <b>ยอดเงิน:</b> ${formattedAmount} บาท\n\n🔗 <a href="${slipUrl}">คลิกเพื่อดูรูปสลิป</a>`

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          }),
        })

        const tgData = await tgRes.json()
        if (tgRes.ok && tgData.ok) {
          sentSuccess = true
        } else {
          console.error('Telegram API Error:', tgData)
          errors.push({ provider: 'telegram', error: tgData })
        }
      } catch (err: any) {
        console.error('Failed to send Telegram message:', err)
        errors.push({ provider: 'telegram', error: err.message })
      }
    }

    // 3. Send LINE Notification as backup if configured
    if (lineToken && groupId) {
      const lineAdminText = adminName ? `\nแอดมินผู้ดูแล: ${adminName}` : ''
      const lineMessage = `แจ้งเตือนสลิปใหม่!\n\nรหัสผ่อน: ${paymentCode}\nชื่อลูกค้า: ${customerName}${lineAdminText}\nยอดเงิน: ${formattedAmount} บาท\n\nดูสลิปและอนุมัติได้ที่ระบบแอดมิน\nหรือคลิกดูสลิป: ${slipUrl}`

      try {
        const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lineToken}`,
          },
          body: JSON.stringify({
            to: groupId,
            messages: [{ type: 'text', text: lineMessage }],
          }),
        })

        const lineData = await lineRes.json().catch(() => ({}))
        if (lineRes.ok) {
          sentSuccess = true
        } else {
          console.error('LINE API Error:', lineRes.status, lineData)
          errors.push({ provider: 'line', error: lineData })
        }
      } catch (err: any) {
        console.error('Failed to send LINE message:', err)
        errors.push({ provider: 'line', error: err.message })
      }
    }

    if (!sentSuccess && errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send notification:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
