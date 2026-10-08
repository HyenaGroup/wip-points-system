
import express from 'express';
import crypto from 'crypto';
import {handleSlipEvent} from '../services/slipok.js';
const router = express.Router();
export function validateSignature(body, signature) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !Buffer.isBuffer(body) || typeof signature !== 'string') return false;
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(body).digest('base64'));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
router.post('/webhook', (req, res) => {
  if (!validateSignature(req.rawBody, req.headers['x-line-signature'])) return res.status(401).json({error:'Invalid signature'});
  res.status(200).json({success:true});
  for (const event of req.body.events || []) handleSlipEvent(event).catch(() => console.error('Slip verification or LINE reply failed'));
});
export default router;
