import { Client } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const lineConfig = {
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

export const lineClient = new Client(lineConfig);

export const liffId = process.env.LIFF_ID;
