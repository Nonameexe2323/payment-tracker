import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentCode, customerName, amount, slipUrl, adminName } = body

    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    const groupId = process.env.LINE_GROUP_ID

    if (!lineToken || !groupId) {
      console.warn('LINE_CHANNEL_ACCESS_TOKEN or LINE_GROUP_ID is missing in environment variables.')
      return NextResponse.json({ success: false, message: 'LINE credentials missing' }, { status: 500 })
    }

    const adminText = adminName ? `\nแอดมินผู้ดูแล: ${adminName}` : ''

    const message = `แจ้งเตือนสลิปใหม่!\n\nรหัสผ่อน: ${paymentCode}\nชื่อลูกค้า: ${customerName}${adminText}\nยอดเงิน: ${amount} บาท\n\nดูสลิปและอนุมัติได้ที่ระบบแอดมิน\nหรือคลิกดูสลิป: ${slipUrl}`

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lineToken}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('LINE API Error:', errorData)
      return NextResponse.json({ success: false, error: errorData }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send LINE message:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
