
const seen = new Map();
export function formatSlipResult(result) {
  if (result?.success === true && result.data?.success === true && result.data?.transRef && typeof result.data.amount === 'number' && Number.isFinite(result.data.amount)) {
    return '✅ ตรวจสอบสลิปสำเร็จ\nยอดเงิน ' + result.data.amount.toLocaleString('th-TH', {minimumFractionDigits:2}) + ' บาท\nเลขอ้างอิง ' + result.data.transRef + '\nยังไม่ได้ยืนยันยอดกับรายการซื้อหรือเพิ่มแต้ม';
  }
  const messages = {1012:'สลิปนี้เคยตรวจแล้ว',1013:'ยอดเงินไม่ตรง',1014:'บัญชีรับเงินไม่ตรงกับบัญชีของร้าน',1010:'ธนาคารยังไม่พร้อมให้ตรวจ กรุณาลองใหม่ภายหลัง'};
  return '❌ ' + (messages[result?.code] || 'ยังตรวจสอบสลิปไม่สำเร็จ กรุณาติดต่อร้าน');
}
export async function handleSlipEvent(event, request = fetch, env = process.env) {
  const allowed = (env.SLIPOK_TEST_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (env.SLIPOK_ENABLED !== 'true' || event.type !== 'message' || event.message?.type !== 'image' || event.source?.type !== 'user' || !allowed.includes(event.source.userId)) return;
  if (!env.SLIPOK_API_KEY || !env.SLIPOK_BRANCH_ID || !env.LINE_CHANNEL_ACCESS_TOKEN || !event.replyToken) return;
  // Demo deduplication is per process, for 24 hours. Use durable storage for production.
  const now = Date.now();
  for (const [key, expiry] of seen) if (expiry <= now) seen.delete(key);
  const id = event.webhookEventId || event.message.id;
  if (seen.has(id)) return;
  seen.set(id, now + 86400000);
  let text;
  try {
    const image = await request('https://api-data.line.me/v2/bot/message/' + encodeURIComponent(event.message.id) + '/content', {
      headers:{Authorization:'Bearer ' + env.LINE_CHANNEL_ACCESS_TOKEN}, signal:AbortSignal.timeout(10000)
    });
    if (!image.ok) throw new Error('Download failed');
    const bytes = await image.arrayBuffer();
    if (bytes.byteLength > 10485760) throw new Error('Image too large');
    const type = image.headers.get('content-type')?.split(';')[0];
    const ext = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];
    if (!ext) throw new Error('Unsupported image');
    const form = new FormData();
    form.append('files', new Blob([bytes], {type}), 'slip.' + ext);
    form.append('log', 'true');
    const response = await request('https://api.slipok.com/api/line/apikey/' + encodeURIComponent(env.SLIPOK_BRANCH_ID), {
      method:'POST', headers:{'x-authorization':env.SLIPOK_API_KEY}, body:form, signal:AbortSignal.timeout(20000)
    });
    const result = await response.json();
    text = formatSlipResult(response.ok ? result : {code:result.code});
  } catch { text = 'ยังตรวจสอบสลิปไม่สำเร็จในขณะนี้ กรุณาติดต่อร้านก่อนยืนยันการชำระเงิน'; }
  const reply = await request('https://api.line.me/v2/bot/message/reply', {
    method:'POST', headers:{Authorization:'Bearer ' + env.LINE_CHANNEL_ACCESS_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({replyToken:event.replyToken,messages:[{type:'text',text}]}), signal:AbortSignal.timeout(10000)
  });
  if (!reply.ok) throw new Error('LINE reply failed');
}
