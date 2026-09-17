'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { mockTransactions, dashboardStats } from '@/lib/mockData';
import { translations, isRTL, getTranslation } from '@/lib/translations';
import {
  getSavedPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  UserPaymentMethod,
  pakistaniLocalBanks,
} from '@/lib/paymentMethods';

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

  // Interactive Breakdown Modals & Payment Methods State
  const [walletStatModal, setWalletStatModal] = useState<'earnings' | 'pending' | 'lastMonth' | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  
  // Add Payment Method Form Input Fields
  const [newChannelType, setNewChannelType] = useState<'bank' | 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay'>('bank');
  const [newBankName, setNewBankName] = useState<string>('Meezan Bank Limited');
  const [newAccountTitle, setNewAccountTitle] = useState<string>('');
  const [newAccountNumber, setNewAccountNumber] = useState<string>('');

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
    
    const loadMethods = () => {
      setPaymentMethods(getSavedPaymentMethods());
    };
    loadMethods();

    try {
      const stored = localStorage.getItem('safarload_logged_user');
      if (stored) {
        setLoggedUser(JSON.parse(stored));
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.addEventListener('safarload_payment_methods_change', loadMethods);
      return () => {
        clearInterval(timer);
        window.removeEventListener('safarload_payment_methods_change', loadMethods);
      };
    }
  }, []);

  const handleSaveNewPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountTitle.trim() || !newAccountNumber.trim()) {
      alert('Please fill out both Account Title and Account Number / IBAN!');
      return;
    }

    const newPm: UserPaymentMethod = {
      id: `PM-${Math.floor(100 + Math.random() * 900)}`,
      userName: loggedUser?.name || 'Tariq Mehmood',
      userRole: loggedUser?.role || 'driver',
      channelType: newChannelType,
      bankName: newBankName,
      accountTitle: newAccountTitle,
      accountNumber: newAccountNumber,
      addedDate: new Date().toISOString().split('T')[0],
      status: 'verified',
    };

    savePaymentMethod(newPm);

    alert(
      `✅ Payment Account Connected & Verified!\n\n🏦 Local Bank: ${newBankName}\n👤 Account Title: ${newAccountTitle}\n💳 Account / IBAN: ${newAccountNumber}\n\nThis payment method is now synced with SafarLoad Finance Desk for instant withdrawals & payouts!`
    );

    setNewAccountTitle('');
    setNewAccountNumber('');
    setShowAddMethodModal(false);
  };

  const handleRemovePaymentMethod = (id: string, bank: string) => {
    if (confirm(`Are you sure you want to remove ${bank} from your connected payment methods?`)) {
      deletePaymentMethod(id);
    }
  };

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

      {/* Quick Stats Row — Clickable with Info Modals */}
      <div className={styles.statsGrid}>
        <div onClick={() => setWalletStatModal('earnings')} className={styles.statCard} style={{ cursor: 'pointer' }} title="Click for Earnings Breakdown">
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>💰</span>
            <span className={styles.statLabel}>{getTranslation(lang, 'thisMonth')} Earnings</span>
            <span className={styles.statBadge}>+15.2%</span>
          </div>
          <div className={styles.statValue}>{formatRs(dashboardStats.thisMonthEarnings)}</div>
        </div>

        <div onClick={() => setWalletStatModal('pending')} className={styles.statCard} style={{ cursor: 'pointer' }} title="Click for Pending Settlements">
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>⏳</span>
            <span className={styles.statLabel}>{getTranslation(lang, 'pendingPayments')}</span>
          </div>
          <div className={styles.statValue}>{formatRs(dashboardStats.pendingPayments)}</div>
        </div>

        <div onClick={() => setWalletStatModal('lastMonth')} className={styles.statCard} style={{ cursor: 'pointer' }} title="Click for Previous Month Ledger">
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
        <div className={styles.methodsScroll} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {paymentMethods.map((pm) => (
            <div key={pm.id} className={`${styles.methodCard} ${styles.bank}`} style={{ minWidth: '260px', flex: 1 }}>
              <div className={styles.methodHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className={styles.methodBrand} style={{ fontWeight: 700, color: '#38BDF8' }}>
                  {pm.channelType === 'bank' ? '🏦' : pm.channelType === 'jazzcash' ? '📱' : pm.channelType === 'easypaisa' ? '💲' : '💳'} {pm.bankName}
                </span>
                <span className={styles.connectedBadge} style={{ fontSize: '0.75rem' }}>✅ Verified</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#F1F5F9', fontWeight: 600 }}>
                👤 Account Title: <strong>{pm.accountTitle}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '2px', wordBreak: 'break-all' }}>
                💳 Account #: <strong>{pm.accountNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem' }}>
                <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Added: {pm.addedDate}</small>
                <button
                  onClick={() => handleRemovePaymentMethod(pm.id, pm.bankName)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
          <div onClick={() => setShowAddMethodModal(true)} className={styles.addMethodCard} style={{ cursor: 'pointer', minWidth: '200px' }}>
            <span style={{ fontSize: '24px' }}>➕</span>
            <span>Add New Payment Method</span>
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
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              className={styles.transactionItem}
              style={{ cursor: 'pointer' }}
              title="Click to View Digital Receipt & Audit Trail"
            >
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

      {/* WALLET STAT BREAKDOWN MODAL */}
      {walletStatModal && (
        <div className={styles.withdrawSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#38BDF8' }}>
              {walletStatModal === 'earnings' && '💰 Monthly Freight Revenue Ledger'}
              {walletStatModal === 'pending' && '⏳ Pending Escrow Settlements'}
              {walletStatModal === 'lastMonth' && '📈 Previous Month Financial Summary'}
            </h3>
            <button onClick={() => setWalletStatModal(null)} className={styles.btnOutline} style={{ width: 'auto' }}>✕ Close</button>
          </div>

          <div style={{ lineHeight: 1.6, color: '#CBD5E1' }}>
            {walletStatModal === 'earnings' && (
              <div>
                <p><strong>This Month Total Earnings:</strong> <strong style={{ color: '#10B981' }}>{formatRs(dashboardStats.thisMonthEarnings)}</strong></p>
                <p><strong>Trips Completed:</strong> 14 Deliveries across Multan, Karachi, and Lahore.</p>
                <p><strong>Average Freight per Trip:</strong> Rs 22,000</p>
              </div>
            )}

            {walletStatModal === 'pending' && (
              <div>
                <p><strong>Pending Settlements:</strong> <strong style={{ color: '#F59E0B' }}>{formatRs(dashboardStats.pendingPayments)}</strong></p>
                <p><strong>Status:</strong> Funds locked in SafarLoad Escrow awaiting POD verification from consignee.</p>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  ⏳ Payout automatically releases to your wallet within 2 hours of POD scan.
                </div>
              </div>
            )}

            {walletStatModal === 'lastMonth' && (
              <div>
                <p><strong>Last Month Revenue:</strong> <strong style={{ color: '#38BDF8' }}>{formatRs(dashboardStats.lastMonthEarnings)}</strong></p>
                <p><strong>Growth:</strong> +15.2% increase in monthly freight earnings compared to prior month!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIGITAL TRANSACTION RECEIPT MODAL */}
      {selectedTxn && (
        <div className={styles.withdrawSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0F172A', border: '1px solid #10B981', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#10B981' }}>🧾 Official Digital Transaction Receipt</h3>
            <button onClick={() => setSelectedTxn(null)} className={styles.btnOutline} style={{ width: 'auto' }}>✕ Close</button>
          </div>

          <div style={{ background: '#1E293B', padding: '1.25rem', borderRadius: '12px', lineHeight: 1.7, color: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <strong>Transaction Reference ID:</strong>
              <strong style={{ color: '#38BDF8' }}>{selectedTxn.id}</strong>
            </div>
            <p><strong>Type:</strong> {selectedTxn.type === 'credit' ? '🟢 Freight Credit / Payout Deposit' : '🔴 Wallet Withdrawal / Settlement'}</p>
            <p><strong>Description:</strong> {selectedTxn.description} ({selectedTxn.descriptionUr})</p>
            <p><strong>Amount:</strong> <strong style={{ color: selectedTxn.type === 'credit' ? '#10B981' : '#EF4444', fontSize: '1.2rem' }}>{formatRs(selectedTxn.amount)}</strong></p>
            <p><strong>Payment Channel:</strong> {selectedTxn.methodIcon} {selectedTxn.method}</p>
            <p><strong>Date & Timestamp:</strong> {new Date(selectedTxn.date).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style={{ color: '#10B981', fontWeight: 800 }}>{selectedTxn.status.toUpperCase()} ✅</span></p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => alert(`📄 PDF Receipt for ${selectedTxn.id} downloaded!`)} className={styles.btnPrimary} style={{ flex: 1 }}>
              📥 Download Official PDF Receipt
            </button>
            <button onClick={() => setSelectedTxn(null)} className={styles.btnOutline} style={{ width: 'auto' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ADD NEW PAYMENT METHOD MODAL */}
      {showAddMethodModal && (
        <div className={styles.withdrawSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0F172A', border: '1px solid #3B82F6', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#3B82F6' }}>💳 Add New Bank or Mobile Wallet Channel</h3>
            <button onClick={() => setShowAddMethodModal(false)} className={styles.btnOutline} style={{ width: 'auto' }}>✕ Close</button>
          </div>

          <form onSubmit={handleSaveNewPaymentMethod} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#CBD5E1', fontWeight: 600 }}>
                1. Select Channel Type (ادائیگی کا طریقہ):
              </label>
              <select
                value={newChannelType}
                onChange={(e) => setNewChannelType(e.target.value as any)}
                className={styles.amountInput}
                style={{ fontSize: '1rem', width: '100%' }}
              >
                <option value="bank">🏦 Commercial Bank Account (IBFT)</option>
                <option value="jazzcash">📱 JazzCash Wallet</option>
                <option value="easypaisa">💲 Easypaisa Wallet</option>
                <option value="nayapay">💳 NayaPay Account</option>
                <option value="sadapay">💳 SadaPay Account</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#CBD5E1', fontWeight: 600 }}>
                2. Select Local Bank Name (بینک کا نام):
              </label>
              <select
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className={styles.amountInput}
                style={{ fontSize: '1rem', width: '100%' }}
              >
                {pakistaniLocalBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#CBD5E1', fontWeight: 600 }}>
                3. Account Title / Owner Name (اکاؤنٹ ہولڈر کا نام):
              </label>
              <input
                type="text"
                value={newAccountTitle}
                onChange={(e) => setNewAccountTitle(e.target.value)}
                className={styles.amountInput}
                placeholder="e.g. Tariq Mehmood or Noor Textile Mills"
                style={{ fontSize: '1rem', width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#CBD5E1', fontWeight: 600 }}>
                4. Account Number / IBAN (اکاؤنٹ نمبر یا IBAN):
              </label>
              <input
                type="text"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                className={styles.amountInput}
                placeholder="e.g. PK36 MEZN 0099 2301 0482 9101"
                style={{ fontSize: '1rem', width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowAddMethodModal(false)} className={styles.btnOutline} style={{ width: 'auto' }}>
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary} style={{ width: 'auto', background: '#3B82F6', borderColor: '#3B82F6' }}>
                🚀 Save & Connect Account to Finance Desk
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
