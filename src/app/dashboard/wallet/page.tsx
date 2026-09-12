'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { mockTransactions, dashboardStats } from '@/lib/mockData';
import { translations, isRTL, getTranslation } from '@/lib/translations';

// Formatting helper
const formatRs = (amount: number) => {
  return 'Rs. ' + amount.toLocaleString('en-PK');
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');

  const lang = 'en'; // Ideally from a context
  const rtl = isRTL(lang);

  useEffect(() => {
    // Animate balance counter on mount
    setIsAnimating(true);
    let start = 0;
    const end = dashboardStats.walletBalance;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setBalance(end);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setBalance(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, []);

  const [transactionsList, setTransactionsList] = useState(mockTransactions);

  const handleQuickAmount = (amount: number | 'all') => {
    if (amount === 'all') {
      setWithdrawAmount(balance.toString());
    } else {
      setWithdrawAmount(amount.toString());
    }
  };

  const handleAddMoney = () => {
    const inputAmt = prompt('Enter Deposit Amount (PKR) to Add to Wallet:');
    if (!inputAmt || isNaN(Number(inputAmt)) || Number(inputAmt) <= 0) return;

    const amtNum = Number(inputAmt);
    const newBal = balance + amtNum;
    setBalance(newBal);

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'credit' as const,
      description: 'Wallet Deposit / Escrow Topup',
      descriptionUr: 'والٹ ڈیپازٹ / ایڈ فنڈز',
      amount: amtNum,
      date: new Date().toISOString(),
      status: 'completed' as const,
      method: 'Meezan Bank IBFT / JazzCash',
      methodIcon: '💳',
    };

    setTransactionsList([newTxn, ...transactionsList]);
    alert(`✅ Deposit Successful!\nAmount: Rs. ${amtNum.toLocaleString()}\nNew Wallet Balance: Rs. ${newBal.toLocaleString()}`);
  };

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = Number(withdrawAmount);

    if (!withdrawAmount || isNaN(amtNum) || amtNum <= 0) {
      alert('Please enter a valid withdrawal amount!');
      return;
    }

    if (amtNum > balance) {
      alert(`⚠️ Insufficient Balance! Your available balance is Rs. ${balance.toLocaleString()}`);
      return;
    }

    // STATE BANK REGULATION: JazzCash & Easypaisa 50k Limit Check
    if ((withdrawMethod === 'jazzcash' || withdrawMethod === 'easypaisa') && amtNum > 50000) {
      alert(
        `⚠️ SBP Mobile Wallet Limit Exceeded!\n\nJazzCash and Easypaisa wallets have a transaction limit of Rs. 50,000.\n\nFor amounts greater than Rs. 50,000, please select 🏦 Bank Transfer (Unlimited Balance)!`
      );
      return;
    }

    const methodName =
      withdrawMethod === 'jazzcash'
        ? 'JazzCash Wallet (+92 301 2345678)'
        : withdrawMethod === 'easypaisa'
        ? 'Easypaisa Wallet (+92 301 2345678)'
        : 'HBL Corporate Bank Account (****4567)';

    const newTxId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn = {
      id: newTxId,
      type: 'debit' as const,
      description: `Withdrawal Request (${withdrawMethod.toUpperCase()})`,
      descriptionUr: `والٹ سے رقم کا انخلا (${withdrawMethod})`,
      amount: amtNum,
      date: new Date().toISOString(),
      status: 'pending' as const,
      method: methodName,
      methodIcon: withdrawMethod === 'jazzcash' ? '📱' : withdrawMethod === 'easypaisa' ? '💲' : '🏦',
    };

    // Save to Pending Queue for Finance Desk
    try {
      const pendingStr = localStorage.getItem('safarload_pending_withdrawals');
      const currentQueue = pendingStr ? JSON.parse(pendingStr) : [];
      localStorage.setItem('safarload_pending_withdrawals', JSON.stringify([newTxn, ...currentQueue]));
    } catch (err) {
      console.error(err);
    }

    setTransactionsList([newTxn, ...transactionsList]);

    alert(
      `⏳ Withdrawal Request Submitted to Finance Desk!\n\nTransaction ID: ${newTxId}\nAmount: Rs. ${amtNum.toLocaleString()}\nMethod: ${methodName}\nStatus: Pending Finance Approval ⏳\n\nYour request has been routed to SafarLoad Finance Desk for clearance!`
    );

    setWithdrawAmount('');
    setShowWithdraw(false);
  };

  const filteredTransactions = transactionsList.filter((txn) => {
    if (activeTab === 'all') return true;
    return txn.type === activeTab;
  });

  return (
    <div className={styles.container} dir={rtl ? 'rtl' : 'ltr'}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>{getTranslation(lang, 'wallet')}</h1>
          <span className={styles.pageTitleUr}>والٹ</span>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceContent}>
          <div className={styles.balanceLabel}>
            <span>{getTranslation(lang, 'balance')}</span>
            <span className={styles.balanceLabelUr}>دستیاب بیلنس</span>
          </div>
          <div className={`${styles.balanceValue} ${isAnimating ? styles.animating : ''}`}>
            {formatRs(balance)}
          </div>
          
          <div className={styles.cardButtons}>
            <button className={styles.btnOutline} onClick={handleAddMoney}>
              <span>➕</span> {getTranslation(lang, 'addMoney')}
            </button>
            <button 
              className={styles.btnPrimary}
              onClick={() => setShowWithdraw(!showWithdraw)}
            >
              <span>💸</span> {getTranslation(lang, 'withdraw')}
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Section Inline */}
      <form onSubmit={handleExecuteWithdrawal} className={`${styles.withdrawSection} ${showWithdraw ? styles.open : ''}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Withdraw Funds <span className={styles.sectionTitleUr}>رقم نکالیں</span>
          </h2>
        </div>
        
        <div className={styles.inputGroup}>
          <label>Amount (Rs)</label>
          <div className={styles.amountInputWrapper}>
            <span className={styles.rsPrefix}>Rs.</span>
            <input 
              type="number" 
              className={styles.amountInput}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.quickAmounts}>
            <button type="button" className={styles.quickAmountBtn} onClick={() => handleQuickAmount(5000)}>5,000</button>
            <button type="button" className={styles.quickAmountBtn} onClick={() => handleQuickAmount(10000)}>10,000</button>
            <button type="button" className={styles.quickAmountBtn} onClick={() => handleQuickAmount(25000)}>25,000</button>
            <button type="button" className={styles.quickAmountBtn} onClick={() => handleQuickAmount(50000)}>50,000</button>
            <button type="button" className={styles.quickAmountBtn} onClick={() => handleQuickAmount('all')}>All</button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Transfer To</label>
          <div className={styles.methodSelect}>
            <div 
              className={`${styles.methodOption} ${withdrawMethod === 'jazzcash' ? styles.selected : ''}`}
              onClick={() => setWithdrawMethod('jazzcash')}
            >
              📱 JazzCash
            </div>
            <div 
              className={`${styles.methodOption} ${withdrawMethod === 'easypaisa' ? styles.selected : ''}`}
              onClick={() => setWithdrawMethod('easypaisa')}
            >
              💲 Easypaisa
            </div>
            <div 
              className={`${styles.methodOption} ${withdrawMethod === 'bank' ? styles.selected : ''}`}
              onClick={() => setWithdrawMethod('bank')}
            >
              🏦 Bank Transfer
            </div>
          </div>
        </div>

        <button type="submit" className={styles.btnPrimary} style={{ maxWidth: '200px', margin: '0 auto' }}>
          Withdraw Now
        </button>
        
        <div className={styles.processingNote} style={{ lineHeight: 1.6 }}>
          ℹ️ <strong>SBP Wallet Limits:</strong> JazzCash / Easypaisa: <strong>Max Rs. 50,000</strong> per transaction/day.<br />
          🏦 Bank Transfer (IBFT): <strong>Unlimited Balance Withdrawal!</strong><br />
          ⏳ All requests are routed to <strong>Finance Desk</strong> for instant verification & clearance.
        </div>
      </form>

      {/* Quick Stats Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>💰</span>
            <span className={styles.statLabel}>{getTranslation(lang, 'thisMonth')} Earnings</span>
            <span className={styles.statBadge}>+15.2%</span>
          </div>
          <div className={styles.statValue}>{formatRs(dashboardStats.thisMonthEarnings)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>⏳</span>
            <span className={styles.statLabel}>{getTranslation(lang, 'pendingPayments')}</span>
          </div>
          <div className={styles.statValue}>{formatRs(dashboardStats.pendingPayments)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>📈</span>
            <span className={styles.statLabel}>Last Month</span>
          </div>
          <div className={styles.statValue}>{formatRs(dashboardStats.lastMonthEarnings)}</div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Payment Methods <span className={styles.sectionTitleUr}>ادائیگی کے طریقے</span>
          </h2>
        </div>
        <div className={styles.methodsScroll}>
          <div className={`${styles.methodCard} ${styles.jazzcash}`}>
            <div className={styles.methodHeader}>
              <span className={styles.methodBrand}>📱 JazzCash</span>
              <span className={styles.connectedBadge}>✅ Connected</span>
            </div>
            <div className={styles.methodDetails}>+92 301 234 5678</div>
          </div>
          <div className={`${styles.methodCard} ${styles.easypaisa}`}>
            <div className={styles.methodHeader}>
              <span className={styles.methodBrand}>💲 Easypaisa</span>
              <span className={styles.connectedBadge}>✅ Connected</span>
            </div>
            <div className={styles.methodDetails}>+92 301 234 5678</div>
          </div>
          <div className={`${styles.methodCard} ${styles.bank}`}>
            <div className={styles.methodHeader}>
              <span className={styles.methodBrand}>🏦 Bank Transfer</span>
              <span className={styles.connectedBadge}>✅ Connected</span>
            </div>
            <div className={styles.methodDetails}>HBL ****4567</div>
          </div>
          <div className={styles.addMethodCard}>
            <span style={{ fontSize: '24px' }}>➕</span>
            <span>Add New Method</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {getTranslation(lang, 'transactionHistory')} <span className={styles.sectionTitleUr}>حالیہ لین دین</span>
          </h2>
          <div className={styles.filters}>
            <button 
              className={`${styles.filterBtn} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`${styles.filterBtn} ${activeTab === 'credit' ? styles.active : ''}`}
              onClick={() => setActiveTab('credit')}
            >
              Credits
            </button>
            <button 
              className={`${styles.filterBtn} ${activeTab === 'debit' ? styles.active : ''}`}
              onClick={() => setActiveTab('debit')}
            >
              Debits
            </button>
          </div>
        </div>

        <div className={styles.transactionsList}>
          {filteredTransactions.map(txn => (
            <div key={txn.id} className={styles.transactionItem}>
              <div className={`${styles.txnIcon} ${styles[txn.type]}`}>
                {txn.type === 'credit' ? '⬆️' : '⬇️'}
              </div>
              <div className={styles.txnDetails}>
                <div className={styles.txnDesc}>
                  {txn.description}
                  <span className={styles.txnDescUr}>{txn.descriptionUr}</span>
                </div>
                <div className={styles.txnMeta}>
                  <span>{new Date(txn.date).toLocaleDateString()}</span>
                  <span className={styles.txnMethod}>
                    {txn.methodIcon} {txn.method}
                  </span>
                </div>
              </div>
              <div className={styles.txnAmountArea}>
                <div className={`${styles.txnAmount} ${styles[txn.type]}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatRs(txn.amount)}
                </div>
                <div className={`${styles.txnStatus} ${styles[`status-${txn.status}`]}`}>
                  {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
