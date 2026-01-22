
import { VIPLevel, Task } from './types';

export const ADMIN_MOBILE = '0711452778';
export const ADMIN_PASSWORD = '12345678';

export const REGISTRATION_BONUS = 100;
export const MIN_WITHDRAWAL = 300;
export const WITHDRAWAL_FEE = 0.20;

export const VIP_LEVELS: VIPLevel[] = [
  { level: 0, investment: 0, dailyProfit: 0, tapReward: 0.000001 },
  { level: 1, investment: 500, dailyProfit: 50, tapReward: 0.00001 },
  { level: 2, investment: 1000, dailyProfit: 120, tapReward: 0.0001 },
  { level: 3, investment: 2000, dailyProfit: 300, tapReward: 0.001 },
  { level: 4, investment: 5000, dailyProfit: 550, tapReward: 0.01 },
  { level: 6, investment: 10000, dailyProfit: 1400, tapReward: 0.1 },
  { level: 7, investment: 15000, dailyProfit: 0, tapReward: 0 }, // Coming soon
  { level: 8, investment: 20000, dailyProfit: 0, tapReward: 0 }, // Coming soon
];

export const TASKS: Task[] = [
  { id: 'task_1', title: 'Join Telegram Channel', reward: 10, link: 'https://t.me/tappercombat', type: 'telegram' },
  { id: 'task_2', title: 'Watch Ads (Daily)', reward: 10, type: 'ads' },
  { id: 'task_3', title: 'Refer 20 Active Users', reward: 200, type: 'referral' },
];

export const DEPOSIT_INFO = {
  holder: 'Jayawardana',
  bank: 'DIALOG FINANCE PLC',
  account: '001022368055'
};
