
import test from 'node:test';
import assert from 'node:assert/strict';
import {handleSlipEvent, formatSlipResult} from './slipok.js';
import {validateSignature} from '../routes/webhookRoutes.js';
import crypto from 'node:crypto';
test('signature uses exact bytes', () => {
  process.env.LINE_CHANNEL_SECRET = 'test-secret';
  const raw = Buffer.from('{ "events": [] }');
  const sig = crypto.createHmac('sha256', 'test-secret').update(raw).digest('base64');
  assert.equal(validateSignature(raw, sig), true);
  assert.equal(validateSignature(Buffer.from('{"events":[]}'), sig), false);
  assert.equal(validateSignature(raw, 'invalid'), false);
});
test('gating, multipart upload, reply and duplicate prevention', async () => {
  const env = {SLIPOK_ENABLED:'true',SLIPOK_TEST_USER_IDS:'Utest',SLIPOK_API_KEY:'test',SLIPOK_BRANCH_ID:'123',LINE_CHANNEL_ACCESS_TOKEN:'test'};
  const event = {type:'message',webhookEventId:'test-event',source:{type:'user',userId:'Utest'},message:{type:'image',id:'1'},replyToken:'reply'};
  const calls = [];
  const request = async (url, options) => {
    calls.push({url,options});
    if (url.includes('api-data')) return new Response(new Uint8Array([1,2]), {headers:{'content-type':'image/png'}});
    if (url.includes('api.slipok')) {
      assert.equal(options.body.get('log'), 'true');
      assert.ok(options.body.get('files') instanceof Blob);
      return Response.json({success:true,data:{success:true,amount:100,transRef:'ref'}});
    }
    return Response.json({});
  };
  await handleSlipEvent(event,request,{...env,SLIPOK_ENABLED:'false'});
  await handleSlipEvent(event,request,{...env,SLIPOK_TEST_USER_IDS:''});
  assert.equal(calls.length,0);
  await handleSlipEvent(event,request,env);
  await handleSlipEvent(event,request,env);
  assert.equal(calls.length,3);
  assert.match(JSON.parse(calls[2].options.body).messages[0].text,/100.00/);
});
test('invalid results cannot be treated as success', () => {
  assert.match(formatSlipResult({success:true,data:{success:false,amount:100,transRef:'ref'}}),/❌/);
  assert.match(formatSlipResult({code:1014}),/บัญชีรับเงิน/);
});
test('upstream timeout produces a failure reply', async () => {
  const env = {SLIPOK_ENABLED:'true',SLIPOK_TEST_USER_IDS:'Utest',SLIPOK_API_KEY:'test',SLIPOK_BRANCH_ID:'123',LINE_CHANNEL_ACCESS_TOKEN:'test'};
  let reply;
  await handleSlipEvent({type:'message',webhookEventId:'failure',source:{type:'user',userId:'Utest'},message:{type:'image',id:'2'},replyToken:'r'}, async (url,opts) => {
    if (url.includes('api-data')) throw new Error('timeout');
    reply = JSON.parse(opts.body);
    return Response.json({});
  },env);
  assert.match(reply.messages[0].text,/ยังตรวจสอบสลิปไม่สำเร็จ/);
});
