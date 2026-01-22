
export interface User {
  id: string;
  mobile: string;
  password?: string;
  balance: number;
  vipLevel: number;
  holderName: string;
  bankName: string;
  accountNumber: string;
  registrationDate: string;
  lastProfitClaim: string;
  referralCode: string;
  referredBy?: string;
  pendingWithdrawal: number;
  receiptData?: string;
  completedTasks: string[];
  referralCount: number;
  lastAdWatch?: string;
  isBanned?: boolean;
  totalInvested: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'referral' | 'task' | 'daily_profit';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  receiptData?: string;
  referenceNumber?: string;
}

export interface VIPLevel {
  level: number;
  investment: number;
  dailyProfit: number;
  tapReward: number;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  link?: string;
  type: 'telegram' | 'ads' | 'referral';
}
