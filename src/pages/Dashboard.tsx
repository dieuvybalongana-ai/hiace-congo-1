import { useState, useEffect } from 'react';
import {
  TrendingUp, Wallet, AlertCircle, Zap,
  CreditCard, Target, ArrowUpRight, ArrowDownRight, Minus, PiggyBank
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

export default function Dashboard() {
  const { dailyEntries, debts, provisionalDebts, automations, objectives, cashBalance, settings } = useStore();
  const [deductDebt, setDeductDebt] = useState(false);
  const [animatedNet, setAnimatedNet] = useState(0);

  const currency = settings?.currency || 'Fr';
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = dailyEntries.find((e) => e.date === today);

  const totalRevenue = dailyEntries.reduce((s, e) => s + e.revenue, 0);
  const totalExpenses = dailyEntries.reduce(
    (s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0
  );
  const totalBreakdowns = dailyEntries.reduce(
    (s, e) => s + e.breakdowns.reduce((a, b) => a + b.amount, 0), 0
  );
  const totalNet = dailyEntries.reduce((s, e) => s + e.netRevenue, 0);
  const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);

  const netWithDebt = totalNet - totalDebt;
  const displayedNet = deductDebt ? netWithDebt : totalNet;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedNet(prev => {
        const diff = displayedNet - prev;
        if (Math.abs(diff) < 1) return displayedNet;
        return prev + diff * 0.1;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [displayedNet]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthEntries = dailyEntries.filter((e) => e.date.startsWith(thisMonth));
  const monthRevenue = monthEntries.reduce((s, e) => s + e.revenue, 0);
  const monthNet = monthEntries.reduce((s, e) => s + e.netRevenue, 0);

  return (
    <div className="relative min-h-screen bg-black/90">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/8k-futuristic-bus.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 space-y-6 p-6">

        <motion.div 
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-white font-extrabold text-2xl">Bonjour 👋</h2>
            <p className="text-slate-400 text-sm mt-1">
              {settings?.staff?.collaboratorName || 'Collaborateur'} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-bold text-sm">{settings?.vehicleName}</p>
            <p className="text-slate-500 text-xs">{settings?.vehiclePlate}</p>
          </div>
        </motion.div>

        <div className="bg-slate-900/50 border border-slate-700/40 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-4">Résultat Net Global</h3>

          <p className={`font-bold text-2xl ${displayedNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(animatedNet, currency)}
          </p>

          <p className="text-slate-400 text-sm mt-2">
            Recettes du mois : {fmt(monthRevenue, currency)}  
            <br />
            Net du mois : {fmt(monthNet, currency)}
          </p>
        </div>

      </div>
    </div>
  );
}
