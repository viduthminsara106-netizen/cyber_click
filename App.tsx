
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Transaction, VIPLevel, Task } from './types';
import { 
  ADMIN_MOBILE, 
  ADMIN_PASSWORD, 
  REGISTRATION_BONUS, 
  VIP_LEVELS, 
  DEPOSIT_INFO, 
  TASKS, 
  MIN_WITHDRAWAL, 
  WITHDRAWAL_FEE 
} from './constants';
import { 
  HomeIcon, 
  UserIcon, 
  StarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ClipboardCheckIcon,
  CopyIcon,
  SearchIcon,
  CameraIcon,
  EyeIcon,
  XIcon,
  ShieldAlertIcon,
  BanIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  LogOutIcon,
  MessageCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SmartphoneIcon,
  FlagIcon,
  HammerIcon,
  SettingsIcon,
  InfoIcon,
  Share2Icon,
  ExternalLinkIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  TrophyIcon
} from 'lucide-react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass rounded-3xl p-6 mb-4 ${className}`}>
    {children}
  </div>
);

type TabType = 'home' | 'vip' | 'tasks' | 'team' | 'payout' | 'my';
type AdminTab = 'dashboard' | 'users' | 'withdrawals' | 'deposits';
type MySubTab = 'profile' | 'history';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [mySubTab, setMySubTab] = useState<MySubTab>('profile');
  const [adminSubTab, setAdminSubTab] = useState<AdminTab>('dashboard');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Auth state
  const [loginForm, setLoginForm] = useState({ mobile: '', password: '', referral: '', remember: false });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Form states
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [payoutMode, setPayoutMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // UI states
  const [adminSearch, setAdminSearch] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [tapParticles, setTapParticles] = useState<{ id: number; x: number; y: number; val: string }[]>([]);

  // Load Data
  useEffect(() => {
    const savedUsers = localStorage.getItem('cyber_db_v5');
    const savedTx = localStorage.getItem('cyber_tx_v5');
    const savedSession = localStorage.getItem('cyber_session_v5');
    
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) setAllUsers(parsed.filter(u => u !== null));
      } catch (e) { console.error(e); }
    }
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx) || []);
      } catch (e) { console.error(e); }
    }
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        if (user && typeof user === 'object' && user.mobile) {
          setCurrentUser(user);
          if (user.mobile === ADMIN_MOBILE) setIsAdmin(true);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save & Update State
  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem('cyber_db_v5', JSON.stringify(allUsers));
    }
    if (currentUser && !isAdmin) {
      const updated = allUsers.find(u => u && u.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [allUsers, currentUser, isAdmin]);

  useEffect(() => {
    localStorage.setItem('cyber_tx_v5', JSON.stringify(transactions));
  }, [transactions]);

  // Automatic Daily Profit Logic
  useEffect(() => {
    if (currentUser && !isAdmin && currentUser.vipLevel > 0) {
      const v = VIP_LEVELS.find(l => l.level === currentUser.vipLevel);
      if (!v || v.dailyProfit === 0) return;

      const now = Date.now();
      const lastClaim = new Date(currentUser.lastProfitClaim || currentUser.registrationDate).getTime();
      const diffHours = (now - lastClaim) / (1000 * 60 * 60);

      if (diffHours >= 24) {
        const cycles = Math.floor(diffHours / 24);
        const totalProfit = cycles * v.dailyProfit;
        
        // Update user
        setAllUsers(prev => prev.map(u => {
          if (u && u.id === currentUser.id) {
            return {
              ...u,
              balance: (u.balance || 0) + totalProfit,
              lastProfitClaim: new Date(lastClaim + cycles * 24 * 60 * 60 * 1000).toISOString()
            };
          }
          return u;
        }));

        // Add transaction entry
        const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          userName: currentUser.mobile,
          amount: totalProfit,
          type: 'daily_profit',
          status: 'completed',
          date: new Date().toISOString()
        };
        setTransactions(prev => [newTx, ...prev]);
      }
    }
  }, [currentUser, isAdmin, allUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (loginForm.mobile === ADMIN_MOBILE && loginForm.password === ADMIN_PASSWORD) {
      const admin: User = { id: 'admin', mobile: ADMIN_MOBILE, balance: 999999, vipLevel: 6, holderName: 'Admin', bankName: '', accountNumber: '', registrationDate: '', lastProfitClaim: '', referralCode: 'ADMIN', pendingWithdrawal: 0, completedTasks: [], referralCount: 0, totalInvested: 0, totalWithdrawn: 0 };
      setCurrentUser(admin);
      setIsAdmin(true);
      if (loginForm.remember) localStorage.setItem('cyber_session_v5', JSON.stringify(admin));
      return;
    }
    const user = allUsers.find(u => u && u.mobile === loginForm.mobile && u.password === loginForm.password);
    if (user) {
      if (user.isBanned) return setAuthError("Your account is banned.");
      setCurrentUser(user);
      if (loginForm.remember) localStorage.setItem('cyber_session_v5', JSON.stringify(user));
    } else {
      setAuthError("Wrong number or password.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^07\d{8}$/.test(loginForm.mobile)) return setAuthError("Use 07XXXXXXXX format.");
    if (allUsers.find(u => u && u.mobile === loginForm.mobile)) return setAuthError("Number already used.");
    
    let referredBy: string | undefined = undefined;
    if (loginForm.referral) {
      const referrer = allUsers.find(u => u && u.referralCode === loginForm.referral.toUpperCase());
      if (referrer) referredBy = referrer.id;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      mobile: loginForm.mobile,
      password: loginForm.password,
      balance: REGISTRATION_BONUS,
      vipLevel: 0, holderName: '', bankName: '', accountNumber: '',
      registrationDate: new Date().toISOString(), 
      lastProfitClaim: new Date().toISOString(),
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referredBy, pendingWithdrawal: 0, completedTasks: [], referralCount: 0, totalInvested: 0, totalWithdrawn: 0
    };
    setAllUsers(prev => [...prev, newUser]);
    if (referredBy) setAllUsers(prev => prev.map(u => u && u.id === referredBy ? { ...u, referralCount: u.referralCount + 1 } : u));
    setCurrentUser(newUser);
    setShowWelcome(true);
  };

  const logout = () => { 
    setCurrentUser(null); 
    setIsAdmin(false); 
    localStorage.removeItem('cyber_session_v5'); 
    setActiveTab('home'); 
  };

  const handleTap = (e: React.MouseEvent) => {
    if (!currentUser || isAdmin) return;
    const v = VIP_LEVELS.find(l => l.level === currentUser.vipLevel) || VIP_LEVELS[0];
    const reward = v.tapReward;
    setAllUsers(prev => prev.map(u => u && u.id === currentUser.id ? { ...u, balance: (u.balance || 0) + reward } : u));
    const id = Date.now();
    setTapParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY, val: `+${reward.toFixed(6)}` }]);
    setTimeout(() => setTapParticles(prev => prev.filter(p => p.id !== id)), 1000);
  };

  const buyVip = (v: VIPLevel) => {
    if (!currentUser) return;
    if (currentUser.balance < v.investment) {
      alert("You don't have enough money.");
      return;
    }
    if (confirm(`Buy VIP ${v.level} for LKR ${v.investment}?`)) {
      setAllUsers(prev => prev.map(u => u && u.id === currentUser.id ? { 
        ...u, 
        balance: (u.balance || 0) - v.investment, 
        vipLevel: v.level,
        totalInvested: (u.totalInvested || 0) + v.investment,
        lastProfitClaim: new Date().toISOString()
      } : u));
      
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.mobile,
        amount: v.investment,
        type: 'task',
        status: 'completed',
        date: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
      alert(`VIP ${v.level} is now active!`);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const submitDeposit = () => {
    if (!currentUser) return;
    const amount = parseFloat(depositAmount);
    if (!receiptBase64 || isNaN(amount) || amount <= 0) {
      alert("Please enter amount and upload your deposit photo.");
      return;
    }
    const autoRef = "DEP-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, userName: currentUser.mobile,
      amount, type: 'deposit', status: 'pending', date: new Date().toISOString(), receiptData: receiptBase64, referenceNumber: autoRef
    };
    setTransactions(prev => [newTx, ...prev]);
    alert("Deposit submitted! Status: PENDING. Check history for updates.");
    setReceiptBase64(null); setDepositAmount('');
    setMySubTab('history');
    setActiveTab('my');
  };

  const adminApproveTx = (tx: Transaction) => {
    if (!confirm("Approve this?")) return;

    const userUpdates: Record<string, Partial<User>> = {};
    const newCommTxs: Transaction[] = [];

    const user = allUsers.find(u => u && u.id === tx.userId);
    if (!user) return;

    if (tx.type === 'deposit') {
      userUpdates[user.id] = {
        balance: (user.balance || 0) + tx.amount,
        totalInvested: (user.totalInvested || 0) + tx.amount
      };

      let currentRefId = user.referredBy;
      let level = 1;
      const rates = [0.15, 0.02, 0.01];

      while (currentRefId && level <= 3) {
        const refUser = allUsers.find(u => u && u.id === currentRefId);
        if (refUser) {
          const rate = rates[level - 1];
          const commission = tx.amount * rate;
          
          userUpdates[refUser.id] = {
            balance: (userUpdates[refUser.id]?.balance ?? refUser.balance ?? 0) + commission
          };

          newCommTxs.push({
            id: Math.random().toString(36).substr(2, 9),
            userId: refUser.id,
            userName: refUser.mobile,
            amount: commission,
            type: 'referral',
            status: 'completed',
            date: new Date().toISOString(),
            referenceNumber: `COMM-L${level}-${tx.referenceNumber}`
          });

          currentRefId = refUser.referredBy;
          level++;
        } else {
          break;
        }
      }
    } else if (tx.type === 'withdrawal') {
      userUpdates[user.id] = {
        pendingWithdrawal: Math.max(0, (user.pendingWithdrawal || 0) - tx.amount),
        totalWithdrawn: (user.totalWithdrawn || 0) + tx.amount
      };
    }

    setAllUsers(prev => prev.map(u => u && userUpdates[u.id] ? { ...u, ...userUpdates[u.id] } : u));
    setTransactions(prev => {
      const updated = prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t);
      return [...newCommTxs, ...updated];
    });

    alert("Status Updated: Approved!");
  };

  const adminRejectTx = (tx: Transaction) => {
    if (!confirm("Reject this?")) return;

    if (tx.type === 'withdrawal') {
      setAllUsers(prev => prev.map(u => u && u.id === tx.userId ? { 
        ...u, 
        balance: (u.balance || 0) + tx.amount, 
        pendingWithdrawal: Math.max(0, (u.pendingWithdrawal || 0) - tx.amount) 
      } : u));
    }
    
    setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'failed' } : t));
    alert("Status Updated: Rejected!");
  };

  const adminChangeBalance = (u: User) => {
    if (!u) return;
    const amount = prompt(`Change balance for: ${u.mobile}\nCurrent: LKR ${u.balance}`, (u.balance || 0).toString());
    if (amount === null) return;
    const b = parseFloat(amount);
    if (!isNaN(b)) setAllUsers(prev => prev.map(user => (user && user.id === u.id) ? { ...user, balance: b } : user));
  };

  const adminToggleBan = (u: User) => {
    if (!u) return;
    setAllUsers(prev => prev.map(user => (user && user.id === u.id) ? { ...user, isBanned: !user.isBanned } : user));
  };

  const adminStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dailyIncome = transactions.filter(t => t.type === 'deposit' && t.status === 'completed' && t.date.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0);
    const totalPayable = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    const adminProfit = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + (t.amount * WITHDRAWAL_FEE), 0);
    return { dailyIncome, totalPayable, adminProfit };
  }, [transactions]);

  // Referral Calculations
  const teamData = useMemo(() => {
    if (!currentUser) return { l1: [], l2: [], l3: [] };
    const l1 = allUsers.filter(u => u && u.referredBy === currentUser.id);
    const l1Ids = l1.map(u => u.id);
    const l2 = allUsers.filter(u => u && u.referredBy && l1Ids.includes(u.referredBy));
    const l2Ids = l2.map(u => u.id);
    const l3 = allUsers.filter(u => u && u.referredBy && l2Ids.includes(u.referredBy));
    return { l1, l2, l3 };
  }, [allUsers, currentUser]);

  const handleWithdrawal = () => {
    if (!currentUser) return;
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt < MIN_WITHDRAWAL) {
      alert(`Minimum withdrawal is ${MIN_WITHDRAWAL} LKR`);
      return;
    }
    if (amt % 100 !== 0) {
      alert("Withdrawal amount must be a multiple of 100.");
      return;
    }
    if (amt > (currentUser?.balance || 0)) {
      alert("Not enough balance.");
      return;
    }
    // Mandatory VIP check for withdrawals
    if (currentUser.vipLevel === 0) {
      alert("To get a refund, it is mandatory to purchase a VIP package.");
      return;
    }
    if (!currentUser.accountNumber || !currentUser.bankName || !currentUser.holderName) {
      alert("Please update your bank details in 'Me > Settings' first.");
      setActiveTab('my');
      setMySubTab('profile');
      return;
    }
    
    const fee = amt * WITHDRAWAL_FEE;
    const net = amt - fee;
    if(confirm(`Withdraw LKR ${amt}?\nFee (20%): LKR ${fee}\nNet Payout: LKR ${net}\nBank: ${currentUser.bankName}\nAccount: ${currentUser.accountNumber}`)) {
       const newTx: Transaction = {
         id: Math.random().toString(36).substr(2, 9), 
         userId: currentUser.id, 
         userName: currentUser.mobile,
         amount: amt, 
         type: 'withdrawal', 
         status: 'pending', 
         date: new Date().toISOString()
       };
       setTransactions(prev => [newTx, ...prev]);
       setAllUsers(prev => prev.map(u => u && u.id === currentUser.id ? { ...u, balance: (u.balance || 0) - amt, pendingWithdrawal: (u.pendingWithdrawal || 0) + amt } : u));
       alert("Withdrawal request sent successfully!");
       setWithdrawalAmount('');
       setMySubTab('history');
       setActiveTab('my');
    }
  };

  const handleTaskAction = (task: Task) => {
    if (!currentUser) return;

    if (currentUser.completedTasks.includes(task.id) && task.type !== 'ads') {
      return;
    }

    // Special logic for referral task
    if (task.id === 'task_3') {
      if (currentUser.referralCount < 20) {
        alert(`You need 20 referrals to claim this. You currently have ${currentUser.referralCount}.`);
        return;
      }
    }

    if (task.link) {
      window.open(task.link, '_blank');
    }

    if (task.type === 'ads') {
      const lastAd = currentUser.lastAdWatch ? new Date(currentUser.lastAdWatch).getTime() : 0;
      if (Date.now() - lastAd < 24 * 60 * 60 * 1000) {
        return alert("Next ad reward available in 24 hours!");
      }
    }

    setAllUsers(prev => prev.map(u => u && u.id === currentUser.id ? { 
      ...u, 
      balance: (u.balance || 0) + task.reward, 
      completedTasks: [...u.completedTasks, task.id],
      lastAdWatch: task.type === 'ads' ? new Date().toISOString() : u.lastAdWatch
    } : u));

    alert(`Success! LKR ${task.reward} added to your balance.`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="glass w-full max-w-md rounded-[3rem] p-10 border border-gold/30 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mb-4 shadow-xl">
              <StarIcon className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-orbitron font-bold text-gold tracking-widest uppercase text-center">CYBER CLICK</h1>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.4em] mt-1 uppercase">LKR Mining</p>
          </div>
          {authError && <p className="text-red-400 text-xs text-center mb-6 font-bold">{authError}</p>}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
            <div className="relative">
              <SmartphoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="tel" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 outline-none focus:border-gold transition-all text-sm" placeholder="07XXXXXXXX" value={loginForm.mobile} onChange={e => setLoginForm({...loginForm, mobile: e.target.value})} />
            </div>
            <div className="relative">
              <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 outline-none focus:border-gold transition-all text-sm" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            {isRegistering && (
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-gold transition-all text-sm uppercase tracking-widest" placeholder="Invite Code (Optional)" value={loginForm.referral} onChange={e => setLoginForm({...loginForm, referral: e.target.value})} />
            )}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-gold transition-all" checked={loginForm.remember} onChange={e=>setLoginForm({...loginForm, remember: e.target.checked})} />
              <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-gold transition-colors">Save my details</span>
            </label>
            <button type="submit" className="w-full gold-gradient text-black font-bold py-5 rounded-2xl font-orbitron tracking-widest uppercase shadow-2xl active:scale-95 transition-all">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="w-full mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-gold transition-colors">
            {isRegistering ? 'Have an account? Login' : 'No account? Register'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center pb-24 overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/10 blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      
      {/* Floating Info Button */}
      {!isAdmin && (
        <button 
          onClick={() => setShowInfo(true)}
          className="fixed top-6 right-6 z-[60] p-4 glass rounded-full border-gold/30 text-gold shadow-lg hover:scale-110 transition-transform active:scale-95"
        >
          <InfoIcon className="w-6 h-6" />
        </button>
      )}

      {/* Floating Customer Service Button */}
      {!isAdmin && (
        <a 
          href="https://t.me/cyberclick3" 
          target="_blank" 
          className="fixed bottom-28 right-6 z-[60] p-4 gold-gradient rounded-full text-black shadow-2xl animate-bounce hover:scale-110 transition-transform flex items-center justify-center border-2 border-black/20"
        >
          <div className="relative">
            <MessageCircleIcon className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        </a>
      )}

      <div className="w-full max-w-lg p-6 flex-grow">
        {isAdmin ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 shadow-2xl">
              <h1 className="text-xl font-orbitron font-bold text-gold uppercase">Admin Dashboard</h1>
              <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOutIcon className="w-6 h-6"/></button>
            </div>
            
            <div className="flex gap-1 overflow-x-auto p-1.5 bg-white/5 rounded-3xl no-scrollbar border border-white/5">
              {(['dashboard', 'users', 'withdrawals', 'deposits'] as AdminTab[]).map(tab => (
                <button key={tab} onClick={() => setAdminSubTab(tab)} className={`flex-1 px-4 py-3 rounded-2xl text-[9px] font-bold uppercase transition-all tracking-widest ${adminSubTab === tab ? 'gold-gradient text-black shadow-lg shadow-gold/10' : 'text-gray-500'}`}>{tab}</button>
              ))}
            </div>

            {adminSubTab === 'dashboard' && (
              <div className="grid grid-cols-1 gap-4">
                <Card className="flex items-center gap-4 border-gold/20"><TrendingUpIcon className="text-gold w-10 h-10"/><div><p className="text-[10px] text-gray-500 font-bold uppercase">Today's Profit</p><p className="text-2xl font-orbitron">LKR {adminStats.dailyIncome.toFixed(2)}</p></div></Card>
                <Card className="flex items-center gap-4 border-red-900/20"><ShieldAlertIcon className="text-red-400 w-10 h-10"/><div><p className="text-[10px] text-gray-500 font-bold uppercase">Pending Payouts</p><p className="text-2xl font-orbitron">LKR {adminStats.totalPayable.toFixed(2)}</p></div></Card>
                <Card className="flex items-center gap-4 border-green-900/20"><DollarSignIcon className="text-green-500 w-10 h-10"/><div><p className="text-[10px] text-gray-500 font-bold uppercase">Admin Fees</p><p className="text-2xl font-orbitron text-gold">LKR {adminStats.adminProfit.toFixed(2)}</p></div></Card>
              </div>
            )}

            {adminSubTab === 'users' && (
              <div className="space-y-4">
                <div className="relative"><SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/><input type="text" placeholder="Search mobile..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-gold" value={adminSearch} onChange={e=>setAdminSearch(e.target.value)}/></div>
                <div className="space-y-3">
                  {allUsers.filter(u => u && u.mobile?.includes(adminSearch)).map(u => (
                    <Card key={u.id} className={`text-[10px] border-l-4 ${u.isBanned ? 'border-red-600' : 'border-gold'} shadow-xl`}>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-bold">
                        <div className="col-span-2 flex justify-between border-b border-white/5 pb-2 mb-1">
                          <span className="text-sm font-orbitron">{u.mobile} {u.isBanned && <span className="text-red-500 font-bold"> [BAN]</span>}</span>
                          <span className="text-gold uppercase tracking-[0.2em] bg-gold/5 px-2 py-0.5 rounded border border-gold/10">VIP {u.vipLevel}</span>
                        </div>
                        <div><p className="text-gray-500 uppercase text-[7px] mb-0.5">Name</p><p className="text-white uppercase truncate">{u.holderName || '-'}</p></div>
                        <div><p className="text-gray-500 uppercase text-[7px] mb-0.5">Bank</p><p className="text-white uppercase truncate">{u.bankName || '-'}</p></div>
                        <div className="col-span-1"><p className="text-gray-500 uppercase text-[7px] mb-0.5">Acc Number</p><p className="text-white font-orbitron text-xs">{u.accountNumber || '-'}</p></div>
                        <div className="text-right"><p className="text-gray-500 uppercase text-[7px] mb-0.5">Balance</p><p className="text-gold font-bold text-sm">LKR {(u?.balance || 0).toFixed(2)}</p></div>
                        <div className="col-span-2 flex gap-2 pt-3">
                           <button onClick={()=>adminChangeBalance(u)} className="flex-1 bg-gold text-black py-3 rounded-2xl uppercase tracking-widest text-[9px]">Set Bal</button>
                           <button onClick={()=>adminToggleBan(u)} className={`flex-1 py-3 rounded-2xl uppercase tracking-widest text-[9px] ${u.isBanned ? 'bg-green-600' : 'bg-red-600'}`}>{u.isBanned ? 'Unban' : 'Ban'}</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {adminSubTab === 'deposits' && (
               <div className="space-y-3">
                  {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').map(tx => (
                    <Card key={tx.id} className="border-l-4 border-green-500 shadow-xl">
                       <div className="flex justify-between items-start">
                          <div><p className="font-bold text-sm">{tx.userName}</p><p className="text-[9px] text-gold uppercase font-bold tracking-widest mt-1">ID: {tx.referenceNumber}</p></div>
                          <p className="text-xl font-orbitron font-bold text-green-500">LKR {tx.amount.toFixed(2)}</p>
                       </div>
                       <div className="flex gap-2 mt-6">
                          {tx.receiptData && <button onClick={()=>setViewingReceipt(tx.receiptData!)} className="p-3 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-lg"><EyeIcon className="w-5 h-5"/></button>}
                          <button onClick={()=>adminApproveTx(tx)} className="flex-1 bg-green-600 py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-green-900/20">APPROVE</button>
                          <button onClick={()=>adminRejectTx(tx)} className="flex-1 bg-red-600 py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-red-900/20">REJECT</button>
                       </div>
                    </Card>
                  ))}
                  {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length === 0 && <p className="text-center py-20 text-gray-600 uppercase font-bold tracking-[0.3em] text-[10px]">No pending deposits</p>}
               </div>
            )}

            {adminSubTab === 'withdrawals' && (
               <div className="space-y-3">
                  {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').map(tx => {
                    const u = allUsers.find(u => u.id === tx.userId);
                    return (
                      <Card key={tx.id} className="border-l-4 border-red-500 shadow-xl">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold text-sm">{tx.userName}</p>
                              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                            <p className="text-xl font-orbitron font-bold text-red-500">LKR {tx.amount.toFixed(2)}</p>
                         </div>
                         <div className="bg-black/20 p-3 rounded-xl mb-4 border border-white/5 text-[10px]">
                            <p className="text-gray-500 uppercase font-bold mb-1">Target Account:</p>
                            <p className="text-white font-bold">{u?.holderName || 'N/A'}</p>
                            <p className="text-gold font-orbitron">{u?.bankName} - {u?.accountNumber}</p>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={()=>adminApproveTx(tx)} className="flex-1 bg-green-600 py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-green-900/20">APPROVE</button>
                            <button onClick={()=>adminRejectTx(tx)} className="flex-1 bg-red-600 py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-red-900/20">REJECT</button>
                         </div>
                      </Card>
                    )
                  })}
                  {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length === 0 && <p className="text-center py-20 text-gray-600 uppercase font-bold tracking-[0.3em] text-[10px]">No pending withdrawals</p>}
               </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 mb-4 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-40 no-scrollbar items-center">
              {['home', 'vip', 'tasks', 'team', 'payout', 'my'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as TabType)} className={`flex-shrink-0 text-[10px] font-orbitron uppercase tracking-widest pb-2 transition-all duration-300 ${activeTab === tab ? 'text-gold border-b-2 border-gold font-bold scale-110' : 'text-gray-500'}`}>
                  {tab === 'my' ? 'ME' : tab}
                </button>
              ))}
            </div>

            {activeTab === 'home' && (
              <div className="space-y-8 py-4 animate-in fade-in duration-500">
                 <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full"></div>
                    <div>
                      <h2 className="text-2xl font-bold font-orbitron uppercase tracking-tighter text-white">Cyber Click</h2>
                      <div className="flex items-center gap-2 mt-1 bg-white/5 px-3 py-1 rounded-full w-fit">
                        <FlagIcon className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Sri Lanka Mining</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-gold font-orbitron font-bold text-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">LKR {(currentUser?.balance || 0).toFixed(4)}</p>
                       <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Available</p>
                    </div>
                 </div>

                 <div className="relative flex flex-col items-center py-10">
                    {tapParticles.map(p => (
                      <span key={p.id} className="tap-particle font-orbitron text-sm" style={{ left: p.x - 20, top: p.y - 100 }}>{p.val}</span>
                    ))}
                    
                    <button onClick={handleTap} className="relative w-72 h-72 rounded-full active:scale-90 transition-transform duration-75 group shadow-[0_0_50px_rgba(0,0,0,1)]">
                       <div className="absolute inset-0 gold-gradient rounded-full border-[12px] border-[#8B6508] shadow-[0_40px_100px_rgba(0,0,0,0.9),inset_0_4px_12px_rgba(255,255,255,0.4)] flex items-center justify-center overflow-hidden">
                          <HammerIcon className="w-36 h-36 text-black/80 drop-shadow-2xl group-active:rotate-12 transition-transform" />
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)] opacity-30 group-active:opacity-60 transition-opacity"></div>
                       </div>
                       <div className="absolute -inset-6 gold-gradient opacity-5 blur-3xl group-active:opacity-30 rounded-full transition-opacity"></div>
                    </button>
                    
                    <p className="mt-16 font-orbitron text-gold text-2xl tracking-[0.5em] animate-pulse drop-shadow-lg uppercase text-center">Tap to mine LKR</p>
                    <p className="text-[10px] text-gray-500 mt-4 font-bold uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/10">Speed: x{(VIP_LEVELS.find(l=>l.level === currentUser.vipLevel)?.tapReward || 0).toFixed(6)}</p>
                 </div>
              </div>
            )}

            {activeTab === 'vip' && (
              <div className="space-y-4 py-4 animate-in slide-in-from-right duration-500">
                <h2 className="text-xl font-orbitron font-bold text-gold uppercase tracking-tighter mb-6">Upgrade Account</h2>
                {VIP_LEVELS.filter(v=>v.level > 0).map(v => (
                  <Card key={v.level} className={`${currentUser.vipLevel === v.level ? 'border-gold border-2 shadow-[0_0_40px_rgba(255,215,0,0.1)]' : 'border-white/5 opacity-80'}`}>
                     <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-bold text-xl uppercase font-orbitron tracking-tight text-white">VIP Level {v.level}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-gray-400 font-bold">Invest: LKR {v.investment}</p>
                            <p className="text-xs text-green-500 font-bold">Daily Profit: LKR {v.dailyProfit}</p>
                          </div>
                        </div>
                        {currentUser.vipLevel === v.level && <span className="bg-gold text-black px-4 py-1.5 rounded-2xl text-[9px] font-bold shadow-lg uppercase tracking-widest border border-black/10">Active</span>}
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-gray-500 mb-1.5">24h Auto Profit</p>
                          <p className="text-gold text-base font-orbitron">LKR {v.dailyProfit}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-gray-500 mb-1.5">Tap Multiplier</p>
                          <p className="text-gold text-base font-orbitron">{v.tapReward.toFixed(5)}</p>
                        </div>
                     </div>
                     <button onClick={()=>buyVip(v)} disabled={currentUser.vipLevel >= v.level || (v.investment > 0 && v.dailyProfit === 0)} className={`w-full py-5 rounded-[1.5rem] font-bold uppercase text-[11px] tracking-[0.3em] active:scale-[0.98] transition-all shadow-2xl ${currentUser.vipLevel >= v.level ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed' : (v.dailyProfit === 0 && v.investment > 0 ? 'bg-black text-gray-800 border border-white/5' : 'gold-gradient text-black')}`}>
                        {v.dailyProfit === 0 && v.investment > 0 ? 'COMING SOON' : (currentUser.vipLevel >= v.level ? 'ALREADY ACTIVE' : 'UPGRADE NOW')}
                     </button>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'payout' && (
              <div className="space-y-6 py-4 animate-in slide-in-from-bottom duration-500 pb-10">
                 <div className="flex gap-2 p-2 bg-white/5 rounded-[2rem] border border-white/5 shadow-2xl">
                    <button onClick={()=>setPayoutMode('deposit')} className={`flex-1 py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${payoutMode === 'deposit' ? 'gold-gradient text-black shadow-lg shadow-gold/20' : 'text-gray-500'}`}>DEPOSIT</button>
                    <button onClick={()=>setPayoutMode('withdraw')} className={`flex-1 py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${payoutMode === 'withdraw' ? 'gold-gradient text-black shadow-lg shadow-gold/20' : 'text-gray-500'}`}>WITHDRAW</button>
                 </div>

                 {payoutMode === 'deposit' ? (
                   <Card className="border-gold/20 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"></div>
                      <h3 className="text-gold font-bold text-[11px] uppercase mb-8 flex items-center gap-3 tracking-[0.3em]"><CreditCardIcon className="w-5 h-5"/> Cash In</h3>
                      <div className="space-y-4 mb-10">
                         <div className="flex justify-between items-center p-4 bg-black/50 rounded-2xl border border-white/5 group shadow-inner">
                            <div className="text-[10px]"><p className="text-gray-500 font-bold uppercase mb-1">Account Name</p><p className="text-sm text-white font-bold">{DEPOSIT_INFO.holder}</p></div>
                            <button onClick={()=>copy(DEPOSIT_INFO.holder, 'Name')} className="p-3 bg-gold/5 hover:bg-gold/10 rounded-2xl transition-all border border-gold/10"><CopyIcon className="w-4 h-4 text-gold"/></button>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-black/50 rounded-2xl border border-white/5 group shadow-inner">
                            <div className="text-[10px]"><p className="text-gray-500 font-bold uppercase mb-1">Bank Name</p><p className="text-sm text-white font-bold uppercase">{DEPOSIT_INFO.bank}</p></div>
                            <button onClick={()=>copy(DEPOSIT_INFO.bank, 'Bank')} className="p-3 bg-gold/5 hover:bg-gold/10 rounded-2xl transition-all border border-gold/10"><CopyIcon className="w-4 h-4 text-gold"/></button>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-black/50 rounded-2xl border border-white/5 group shadow-inner">
                            <div className="text-[10px]"><p className="text-gray-500 font-bold uppercase mb-1">Account Number</p><p className="text-sm text-gold font-orbitron font-bold">{DEPOSIT_INFO.account}</p></div>
                            <button onClick={()=>copy(DEPOSIT_INFO.account, 'Acc')} className="p-3 bg-gold/5 hover:bg-gold/10 rounded-2xl transition-all border border-gold/10"><CopyIcon className="w-4 h-4 text-gold"/></button>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="relative">
                           <input type="number" placeholder="Enter Deposit Amount (LKR)" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white outline-none focus:border-gold transition-all" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} />
                           <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gold font-bold text-xs">LKR</span>
                         </div>
                      </div>

                      <div className="mt-8 border-2 border-dashed border-gold/20 rounded-[2.5rem] p-10 text-center bg-gold/5 group hover:bg-gold/10 transition-all cursor-pointer relative shadow-inner">
                         {receiptBase64 ? (
                           <div className="flex flex-col items-center">
                              <img src={receiptBase64} className="w-40 h-40 object-cover rounded-3xl shadow-2xl border-2 border-gold/30 mb-5"/>
                              <button onClick={()=>setReceiptBase64(null)} className="text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/30 px-6 py-2.5 rounded-2xl bg-red-500/5 shadow-xl">Remove Image</button>
                           </div>
                         ) : (
                           <label className="cursor-pointer flex flex-col items-center group">
                              <CameraIcon className="w-14 h-14 text-gold/30 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"/>
                              <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">UPLOAD DEPOSIT SLIP</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e)=>{
                                const f = e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>setReceiptBase64(r.result as string); r.readAsDataURL(f); }
                              }}/>
                           </label>
                         )}
                      </div>
                      <button onClick={submitDeposit} className="w-full mt-10 gold-gradient text-black py-6 rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.4em] shadow-2xl shadow-gold/20 active:scale-[0.98] transition-all">SUBMIT DEPOSIT</button>
                   </Card>
                 ) : (
                   <Card className="border-gold/20 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/5 blur-3xl rounded-full"></div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <DollarSignIcon className="w-5 h-5 text-gold" />
                        <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.3em]">Withdraw Balance</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-3 block tracking-widest ml-1">Withdrawal Amount (LKR)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              placeholder="Min 300" 
                              className="w-full bg-black/50 border border-white/10 rounded-[1.5rem] p-6 text-3xl font-bold text-gold outline-none focus:border-gold transition-all font-orbitron shadow-inner" 
                              value={withdrawalAmount} 
                              onChange={e=>setWithdrawalAmount(e.target.value)} 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-600 text-lg">LKR</span>
                          </div>
                          <p className="text-[9px] text-gray-500 mt-2 ml-1 italic">* Withdraw fee 20% will be deducted.</p>
                        </div>

                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest flex items-center gap-2">
                             <ShieldCheckIcon className="w-3 h-3 text-green-500" /> Bound Bank Account
                           </p>
                           {currentUser.accountNumber ? (
                             <div className="space-y-1">
                               <p className="text-sm font-bold text-white uppercase">{currentUser.holderName}</p>
                               <p className="text-xs text-gold/80 font-medium">{currentUser.bankName}</p>
                               <p className="text-xs font-orbitron text-gray-400">{currentUser.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                             </div>
                           ) : (
                             <button 
                               onClick={() => { setActiveTab('my'); setMySubTab('profile'); }}
                               className="text-[10px] text-red-400 font-bold uppercase underline"
                             >
                               Set Bank Account in Profile
                             </button>
                           )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Min. Amount</p>
                              <p className="text-sm font-orbitron font-bold text-white">LKR 300</p>
                           </div>
                           <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Fee Rate</p>
                              <p className="text-sm font-orbitron font-bold text-red-400">20%</p>
                           </div>
                        </div>

                        <button 
                          onClick={handleWithdrawal} 
                          className="w-full gold-gradient text-black py-6 rounded-[1.5rem] font-bold text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all"
                        >
                          WITHDRAW NOW
                        </button>
                      </div>
                   </Card>
                 )}

                 {/* Notices Area */}
                 <div className="px-2 animate-in fade-in duration-700">
                    <div className="flex items-center gap-2 mb-6">
                       <AlertCircleIcon className="w-5 h-5 text-gold" />
                       <h4 className="text-gold font-bold text-[11px] uppercase tracking-[0.3em]">Important Notice</h4>
                    </div>
                    <div className="space-y-4">
                       {[
                         "Double-check that the your bank details are correct.",
                         "Your withdrawal amount must be a multiple of 100.",
                         "To get a refund, it is mandatory to purchase a VIP package.",
                         "There is a 20% fee on withdrawals.",
                         "Withdrawals may take up to 24 hours to be successful."
                       ].map((note, idx) => (
                         <div key={idx} className="flex gap-4 p-4 glass rounded-2xl border border-white/5 items-start">
                            <span className="w-6 h-6 rounded-full gold-gradient flex-shrink-0 flex items-center justify-center text-black font-bold text-[10px]">{idx + 1}</span>
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{note}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6 py-4 animate-in fade-in duration-500">
                <h2 className="text-xl font-orbitron font-bold text-gold uppercase tracking-tighter">My Team</h2>
                
                <Card className="border-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-3 mb-6 text-gold">
                        <Share2Icon className="w-5 h-5" />
                        <span className="font-bold text-[10px] uppercase tracking-[0.3em]">Invite Friends</span>
                    </div>
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl mb-6 shadow-inner break-all">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Invite Link</p>
                        <p className="text-xs text-gold font-medium">{window.location.origin}/?ref={currentUser.referralCode}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => copy(`${window.location.origin}/?ref=${currentUser.referralCode}`, 'Link')} 
                            className="flex-1 gold-gradient text-black font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                        >
                            <CopyIcon className="w-4 h-4" /> COPY LINK
                        </button>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="text-center py-8">
                        <UsersIcon className="w-6 h-6 text-gold mx-auto mb-3" />
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Team Size</p>
                        <p className="text-2xl font-orbitron font-bold text-white">{teamData.l1.length + teamData.l2.length + teamData.l3.length}</p>
                    </Card>
                    <Card className="text-center py-8">
                        <TrendingUpIcon className="w-6 h-6 text-green-500 mx-auto mb-3" />
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Commission</p>
                        <p className="text-2xl font-orbitron font-bold text-green-500">Tiered</p>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gold uppercase text-[10px] tracking-widest">Level 1 (15%)</h3>
                            <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[9px] font-bold font-orbitron">{teamData.l1.length} Users</span>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                            {teamData.l1.map(u => (
                                <div key={u.id} className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5 items-center">
                                    <span className="text-xs font-medium text-white">{u.mobile}</span>
                                    <span className="text-[8px] text-gray-500 uppercase font-bold">VIP {u.vipLevel}</span>
                                </div>
                            ))}
                            {teamData.l1.length === 0 && <p className="text-[10px] text-gray-600 text-center py-2 font-bold italic">No Level 1 users</p>}
                        </div>
                    </Card>

                    <Card className="border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gold/80 uppercase text-[10px] tracking-widest">Level 2 (2%)</h3>
                            <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[9px] font-bold font-orbitron">{teamData.l2.length} Users</span>
                        </div>
                        <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar opacity-70">
                            {teamData.l2.map(u => (
                                <div key={u.id} className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5 items-center">
                                    <span className="text-xs font-medium text-white">{u.mobile}</span>
                                    <span className="text-[8px] text-gray-500 uppercase font-bold">VIP {u.vipLevel}</span>
                                </div>
                            ))}
                            {teamData.l2.length === 0 && <p className="text-[10px] text-gray-600 text-center py-2 font-bold italic">No Level 2 users</p>}
                        </div>
                    </Card>

                    <Card className="border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gold/60 uppercase text-[10px] tracking-widest">Level 3 (1%)</h3>
                            <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[9px] font-bold font-orbitron">{teamData.l3.length} Users</span>
                        </div>
                        <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar opacity-50">
                            {teamData.l3.map(u => (
                                <div key={u.id} className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5 items-center">
                                    <span className="text-xs font-medium text-white">{u.mobile}</span>
                                    <span className="text-[8px] text-gray-500 uppercase font-bold">VIP {u.vipLevel}</span>
                                </div>
                            ))}
                            {teamData.l3.length === 0 && <p className="text-[10px] text-gray-600 text-center py-2 font-bold italic">No Level 3 users</p>}
                        </div>
                    </Card>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4 py-4 animate-in slide-in-from-left duration-500">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-orbitron font-bold text-gold uppercase tracking-tighter">Cyber Missions</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Earn extra LKR daily</p>
                  </div>
                  <div className="bg-gold/10 px-3 py-1.5 rounded-xl border border-gold/20 flex items-center gap-2">
                    <TrophyIcon className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-bold font-orbitron text-white">REWARDS</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {TASKS.map(task => {
                    const isCompleted = currentUser.completedTasks.includes(task.id);
                    const isReferralTask = task.id === 'task_3';
                    const canClaimReferral = isReferralTask && currentUser.referralCount >= 20;
                    
                    return (
                      <Card key={task.id} className={`flex flex-col group border-white/5 shadow-lg transition-all ${isCompleted ? 'opacity-70 grayscale bg-white/5' : ''}`}>
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <p className="font-bold text-sm group-hover:text-gold transition-colors text-white uppercase tracking-tight">{task.title}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <DollarSignIcon className="w-3.5 h-3.5 text-gold" />
                                  <p className="text-gold font-bold text-xs font-orbitron tracking-widest">+ LKR {task.reward}.00</p>
                                </div>
                            </div>
                            <button 
                              onClick={() => handleTaskAction(task)} 
                              disabled={isCompleted && task.type !== 'ads'}
                              className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-bold tracking-[0.3em] uppercase transition-all shadow-xl min-w-[120px] ${
                                (isCompleted && task.type !== 'ads') 
                                  ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed' 
                                  : (isReferralTask && !canClaimReferral)
                                    ? 'bg-white/5 text-gray-500 border border-white/10'
                                    : 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 active:scale-95'
                              }`}
                            >
                               {isCompleted && task.type !== 'ads' ? 'DONE' : (isReferralTask ? 'CLAIM' : 'START')}
                            </button>
                         </div>

                         {/* Progress bar for referral task */}
                         {isReferralTask && !isCompleted && (
                           <div className="mt-2 space-y-2">
                             <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-gray-500">
                               <span>Progress</span>
                               <span className={canClaimReferral ? 'text-green-500' : 'text-gold'}>
                                 {Math.min(currentUser.referralCount, 20)} / 20 Referrals
                               </span>
                             </div>
                             <div className="w-full h-2 bg-black/50 rounded-full border border-white/5 overflow-hidden">
                               <div 
                                 className="h-full gold-gradient shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-all duration-1000 ease-out" 
                                 style={{ width: `${Math.min((currentUser.referralCount / 20) * 100, 100)}%` }}
                               />
                             </div>
                             {canClaimReferral && (
                               <div className="flex items-center gap-2 justify-center pt-2 animate-pulse">
                                  <CheckCircle2Icon className="w-3 h-3 text-green-500" />
                                  <span className="text-[8px] text-green-500 font-bold uppercase">Ready to claim!</span>
                               </div>
                             )}
                           </div>
                         )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'my' && (
              <div className="space-y-6 py-4 animate-in fade-in duration-500">
                 <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-full border-4 border-gold p-2 shadow-[0_0_60px_rgba(255,215,0,0.2)] bg-black overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_80px_rgba(255,215,0,0.3)]">
                          <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.mobile}`} className="w-full h-full rounded-full object-cover grayscale opacity-90 scale-125 group-hover:scale-150 transition-transform duration-700" />
                      </div>
                      <div className="absolute -bottom-3 -right-3 gold-gradient text-black px-6 py-2.5 rounded-2xl font-bold text-[10px] shadow-2xl font-orbitron tracking-widest border border-black/10">LVL {currentUser.vipLevel}</div>
                    </div>
                    <h2 className="text-3xl font-orbitron font-bold mt-12 tracking-tighter text-white uppercase">{currentUser.mobile}</h2>
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] opacity-80 mt-2">CYBER CLICK MEMBER</p>
                 </div>

                 <div className="flex gap-2 p-1.5 bg-white/5 rounded-3xl border border-white/5">
                    <button onClick={() => setMySubTab('profile')} className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${mySubTab === 'profile' ? 'gold-gradient text-black shadow-lg shadow-gold/10' : 'text-gray-500'}`}>Settings</button>
                    <button onClick={() => setMySubTab('history')} className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${mySubTab === 'history' ? 'gold-gradient text-black shadow-lg shadow-gold/10' : 'text-gray-500'}`}>History</button>
                 </div>
                 
                 {mySubTab === 'profile' ? (
                   <>
                    <Card className="border-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-2">
                        <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-8 tracking-[0.4em] border-l-3 border-gold pl-5">Bank Profile</h3>
                        <form onSubmit={(e)=>{
                           e.preventDefault(); 
                           const d = new FormData(e.currentTarget); 
                           setAllUsers(prev=>prev.map(u=>u && u.id===currentUser.id?{...u, holderName:d.get('holder') as string, bankName:d.get('bank') as string, accountNumber:d.get('acc') as string}:u)); 
                           alert("Profile updated successfully!");
                        }} className="space-y-6">
                           <div>
                              <label className="text-[9px] text-gray-600 font-bold uppercase ml-4 mb-2 block tracking-widest">Account Name</label>
                              <input name="holder" defaultValue={currentUser.holderName} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-gold transition-all text-white shadow-inner" placeholder="Enter Full Name"/>
                           </div>
                           <div>
                              <label className="text-[9px] text-gray-600 font-bold uppercase ml-4 mb-2 block tracking-widest">Bank</label>
                              <input name="bank" defaultValue={currentUser.bankName} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-gold transition-all text-white shadow-inner" placeholder="e.g. BOC, HNB, Peoples Bank"/>
                           </div>
                           <div>
                              <label className="text-[9px] text-gray-600 font-bold uppercase ml-4 mb-2 block tracking-widest">Account #</label>
                              <input name="acc" defaultValue={currentUser.accountNumber} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-gold transition-all text-white shadow-inner font-orbitron" placeholder="Enter Number"/>
                           </div>
                           <button className="w-full gold-gradient text-black py-6 rounded-[1.5rem] font-bold text-[11px] tracking-[0.5em] uppercase mt-4 shadow-[0_15px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-all">SAVE SETTINGS</button>
                        </form>
                    </Card>
                    
                    <div className="space-y-4">
                        <button onClick={logout} className="w-full bg-red-950/30 text-red-500 py-7 rounded-[2.5rem] font-bold text-[12px] border border-red-900/30 tracking-[0.5em] uppercase active:scale-95 transition-all mt-8 shadow-2xl">LOGOUT</button>
                    </div>
                   </>
                 ) : (
                   <div className="space-y-4 animate-in slide-in-from-right duration-500">
                     {transactions.filter(t => t.userId === currentUser.id).length === 0 ? (
                        <p className="text-center py-20 text-gray-600 uppercase font-bold tracking-widest text-xs">No transaction history</p>
                     ) : (
                        transactions.filter(t => t.userId === currentUser.id).map(tx => (
                          <Card key={tx.id} className={`border-l-4 py-8 relative overflow-hidden group border-white/5 shadow-2xl transition-all hover:translate-x-1 ${tx.type === 'daily_profit' ? 'border-green-500' : tx.status === 'failed' ? 'border-red-500' : 'border-gold'}`}>
                             <div className="flex justify-between items-center relative z-10 font-bold">
                                <div>
                                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-[0.3em] mb-1">
                                      {tx.type === 'deposit' ? 'DEPOSIT' : 
                                       tx.type === 'withdrawal' ? 'WITHDRAWAL' : 
                                       tx.type === 'referral' ? 'COMMISSION' : 
                                       tx.type === 'daily_profit' ? 'DAILY EARN' : 'TASK REWARD'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-orbitron font-bold text-xl ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-gold'} drop-shadow-sm`}>
                                       {tx.type === 'withdrawal' ? '-' : '+'} LKR {tx.amount.toFixed(2)}
                                    </p>
                                    <p className={`text-[8px] uppercase font-bold mt-2 tracking-[0.2em] px-3 py-1 rounded-full inline-block ${tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : tx.status === 'pending' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}`}>
                                       {tx.status}
                                    </p>
                                </div>
                             </div>
                          </Card>
                        ))
                     )}
                   </div>
                 )}
              </div>
            )}
          </>
        )}
      </div>

      {!isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-gold/20 px-6 py-6 flex justify-between items-center z-50 rounded-t-[4rem] max-w-lg mx-auto shadow-[0_-20px_80px_rgba(0,0,0,1)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'home' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><HomeIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Home</span></button>
          <button onClick={() => setActiveTab('vip')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'vip' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><StarIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">VIP</span></button>
          <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'tasks' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><ClipboardCheckIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Tasks</span></button>
          <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'team' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><UsersIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Team</span></button>
          <button onClick={() => setActiveTab('payout')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'payout' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><CreditCardIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Wallet</span></button>
          <button onClick={() => { setActiveTab('my'); setMySubTab('profile'); }} className={`flex flex-col items-center flex-1 transition-all duration-300 ${activeTab === 'my' ? 'text-gold scale-125 font-bold drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-gray-500 opacity-50 hover:opacity-100'}`}><UserIcon className="w-6 h-6"/><span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Me</span></button>
        </div>
      )}

      {/* Website Info Popup */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
          <div className="glass w-full max-w-md rounded-[3rem] p-10 border-gold/30 shadow-2xl relative">
            <button onClick={() => setShowInfo(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
              <XIcon className="w-8 h-8" />
            </button>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <SettingsIcon className="w-10 h-10 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-orbitron font-bold text-gold uppercase tracking-tight">Cyber Click</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">LKR Mining Platform v5.0</p>
              </div>
            </div>
            <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-medium">
              <p>Welcome to Cyber Click! Our platform is designed to provide high-return LKR mining opportunities for our users in Sri Lanka.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-gold font-bold mb-1 uppercase text-[10px] tracking-widest">Reg Bonus</p>
                  <p className="text-white font-orbitron font-bold text-lg">LKR 100</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-gold font-bold mb-1 uppercase text-[10px] tracking-widest">Min Payout</p>
                  <p className="text-white font-orbitron font-bold text-lg">LKR 300</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-gold font-bold mb-1 uppercase text-[10px] tracking-widest">Ref Level 1</p>
                  <p className="text-white font-orbitron font-bold text-lg">15%</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-gold font-bold mb-1 uppercase text-[10px] tracking-widest">Ref Level 2</p>
                  <p className="text-white font-orbitron font-bold text-lg">2%</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="flex items-start gap-4 text-[11px]"><span className="text-gold font-bold">•</span> Automatic daily profits are added based on your active VIP level every 24 hours.</p>
                <p className="flex items-start gap-4 text-[11px]"><span className="text-gold font-bold">•</span> Withdrawals are processed within 24 hours after approval.</p>
                <p className="flex items-start gap-4 text-[11px]"><span className="text-gold font-bold">•</span> Referral commissions are credited instantly upon successful deposit approval.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full mt-10 gold-gradient text-black font-bold py-6 rounded-2xl font-orbitron tracking-[0.2em] uppercase shadow-2xl active:scale-95 transition-all text-sm"
            >
              START MINING NOW
            </button>
          </div>
        </div>
      )}

      {showWelcome && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-700">
           <div className="glass p-12 rounded-[4rem] text-center max-w-sm border-2 border-gold/30 shadow-[0_0_150px_rgba(255,215,0,0.25)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 blur-3xl rounded-full"></div>
              <div className="w-28 h-28 gold-gradient rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl border-4 border-black/20">
                 <FlagIcon className="w-16 h-16 text-black drop-shadow-xl" />
              </div>
              <h3 className="text-3xl font-orbitron font-bold text-white mb-6 tracking-tight uppercase">WELCOME</h3>
              <p className="text-gray-300 text-sm mb-12 leading-relaxed font-bold italic tracking-wide">You got LKR 100 bonus! Support: @cyberclick3</p>
              <a href="https://t.me/cyberclick3" target="_blank" onClick={()=>setShowWelcome(false)} className="w-full gold-gradient text-black py-6 rounded-[2rem] font-bold uppercase tracking-[0.4em] inline-block shadow-2xl active:scale-95 transition-all text-sm border border-black/10 flex items-center justify-center gap-3">
                <ExternalLinkIcon className="w-5 h-5"/> JOIN TELEGRAM
              </a>
              <button onClick={()=>setShowWelcome(false)} className="mt-8 text-[11px] text-gray-500 font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors block w-full">CLOSE</button>
           </div>
        </div>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/98 animate-in fade-in duration-300">
           <button onClick={()=>setViewingReceipt(null)} className="absolute top-10 right-10 text-white p-6 glass rounded-full hover:bg-white/10 transition-all border-white/20 shadow-2xl z-50"><XIcon className="w-10 h-10"/></button>
           <img src={viewingReceipt} className="max-w-full max-h-[85vh] object-contain rounded-[4rem] shadow-[0_0_200px_rgba(255,215,0,0.3)] border-4 border-gold/20 animate-in zoom-in duration-300"/>
        </div>
      )}

      {copySuccess && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 bg-gold text-black px-12 py-5 rounded-full font-bold text-[11px] z-[200] animate-in slide-in-from-bottom-5 shadow-2xl tracking-[0.5em] uppercase font-orbitron border-2 border-black/20">
          {copySuccess} COPIED
        </div>
      )}
    </div>
  );
};

export default App;
