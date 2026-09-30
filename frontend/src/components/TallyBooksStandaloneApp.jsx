import React, { useState, useEffect } from 'react';
import { 
  Building, Printer, Plus, Search, FileText, DollarSign, 
  CreditCard, Users, ShieldCheck, ArrowRight, CheckCircle, 
  Key, RefreshCw, Download, Settings, BarChart2, BookOpen, 
  ChevronRight, ExternalLink, HelpCircle
} from 'lucide-react';

export default function TallyBooksStandaloneApp({ onBackToHub }) {
  // Navigation inside TallyBooks SaaS
  // 'daybook' | 'vouchers' | 'trial-balance' | 'profit-loss' | 'payroll' | 'invoice' | 'letterhead' | 'api-keys'
  const [activeScreen, setActiveScreen] = useState('daybook');

  const [companyHeader, setCompanyHeader] = useState(null);
  const [trialBalance, setTrialBalance] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Voucher State (Tally-Style F8/F5)
  const [newVoucher, setNewVoucher] = useState({
    voucher_type: 'Sales Invoice',
    narration: '',
    account_debit: 'Sundry Debtors - Tata Steel',
    account_credit: 'Freight Revenue - Long Haul',
    amount_inr: 450000,
    tax_gst_inr: 81000
  });
  const [voucherSavedNotice, setVoucherSavedNotice] = useState(false);

  // API Key State for AI Linking
  const [apiKey, setApiKey] = useState('tbk_live_9941a8e2_enterprise_sec');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const [dashRes, tbRes, plRes, payRes, vouchRes, headRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/accounting/dashboard').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/trial-balance').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/profit-loss').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/payroll').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/vouchers').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/header').then(r => r.json())
      ]);

      setDashboard(dashRes);
      setTrialBalance(tbRes);
      setProfitLoss(plRes);
      setPayroll(payRes);
      setVouchers(vouchRes);
      setCompanyHeader(headRes);
    } catch (err) {
      console.error('Failed to load TallyBooks data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostVoucher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoucher)
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setVoucherSavedNotice(true);
        setTimeout(() => setVoucherSavedNotice(false), 3000);
        fetchFinancials();
        setActiveScreen('daybook');
      }
    } catch (err) {
      alert('Failed to post voucher');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#042f1a', // Classic Tally Dark Emerald Theme
      fontFamily: 'Inter, Segoe UI, sans-serif',
      color: '#0f172a',
      overflow: 'hidden'
    }}>
      
      {/* 1. INDEPENDENT SAAS HEADER & BRANDING */}
      <header style={{
        height: '52px',
        background: '#064e3b',
        borderBottom: '2px solid #022c22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        color: '#ffffff',
        flexShrink: 0
      }}>
        {/* Left: Custom TallyBooks Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#10b981',
            color: '#022c22',
            fontWeight: 900,
            fontSize: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            T
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>TallyBooks ERP</span>
              <span style={{ fontSize: '9px', background: '#059669', color: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                STANDALONE SAAS v4.2
              </span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#a7f3d0' }}>
              Enterprise Logistics General Ledger &bull; Legal Tax Invoicing
            </div>
          </div>
        </div>

        {/* Center: Active Tenant / Company Indicator */}
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          padding: '4px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: '11.5px',
          color: '#d1fae5',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Building size={13} color="#6ee7b7" />
          <span>{companyHeader?.trade_name || 'Loading Company...'}</span>
        </div>

        {/* Right: Hub Back Button + Print Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => window.print()}
            style={{
              background: '#047857',
              color: '#ffffff',
              border: '1px solid #10b981',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={13} />
            <span>Print Current Sheet</span>
          </button>

          {onBackToHub && (
            <button
              onClick={onBackToHub}
              style={{
                background: '#ffffff',
                color: '#064e3b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              &larr; Exit to App Library
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN SAAS WORKSPACE (Sidebar + Central Canvas) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* APP SIDEBAR NAVIGATION */}
        <aside style={{
          width: '240px',
          background: '#022c22',
          borderRight: '1px solid #064e3b',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '14px 16px', fontSize: '10px', fontWeight: 800, color: '#6ee7b7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Accounting Masters
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px', flex: 1 }}>
            {[
              { id: 'daybook', label: 'Daybook & Vouchers', icon: BookOpen },
              { id: 'new-voucher', label: 'Post New Voucher (F8)', icon: Plus },
              { id: 'trial-balance', label: 'Trial Balance Sheet', icon: BarChart2 },
              { id: 'profit-loss', label: 'Profit & Loss Statement', icon: DollarSign },
              { id: 'payroll', label: 'Crew CTC & Payroll Register', icon: Users },
              { id: 'invoice', label: 'Commercial Tax Invoice', icon: FileText },
              { id: 'letterhead', label: 'Corporate Letterhead', icon: Building },
              { id: 'api-keys', label: 'AI Connect & API Keys', icon: Key }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: isActive ? '#059669' : 'transparent',
                    color: isActive ? '#ffffff' : '#a7f3d0',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isActive ? 800 : 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <Icon size={15} color={isActive ? '#ffffff' : '#6ee7b7'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI Plugin Connection Indicator */}
          <div style={{
            margin: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #059669',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6ee7b7', fontWeight: 800 }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>AI Plugin Endpoint</span>
            </div>
            <div style={{ fontSize: '10px', color: '#a7f3d0', marginTop: '3px' }}>
              Port 8000 &bull; OAuth Active
            </div>
          </div>
        </aside>

        {/* CENTRAL SPREADSHEET / DOCUMENT CANVAS */}
        <main style={{
          flex: 1,
          background: '#f8fafc',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          
          {/* SCREEN 1: DAYBOOK & RECENT JOURNAL ENTRIES */}
          {activeScreen === 'daybook' && (
            <div style={{ width: '920px', maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    GENERAL LEDGER &amp; DAYBOOK TRANSACTIONS
                  </h1>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Double-Entry Journal audit logs &bull; Automated freight revenue and fuel expense postings
                  </div>
                </div>
                <button
                  onClick={() => setActiveScreen('new-voucher')}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={15} />
                  <span>Record Voucher</span>
                </button>
              </div>

              <div style={{ background: '#ffffff', border: '1.5px solid #000000', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Voucher No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Debit Account</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Credit Account</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #cbd5e1', fontWeight: 800, fontFamily: 'monospace' }}>{v.voucher_id}</td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>{v.date}</td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #cbd5e1' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                            {v.voucher_type}
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{v.account_debit}</td>
                        <td style={{ padding: '9px 12px', borderRight: '1px solid #cbd5e1', color: '#475569' }}>{v.account_credit}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                          ₹{v.debit_amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 2: POST NEW VOUCHER */}
          {activeScreen === 'new-voucher' && (
            <div style={{ width: '680px', maxWidth: '100%', background: '#ffffff', border: '1.5px solid #000000', borderRadius: '8px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 900, margin: '0 0 16px 0' }}>POST NEW TALLY JOURNAL VOUCHER</h2>
              <form onSubmit={handlePostVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Voucher Type</label>
                  <select 
                    value={newVoucher.voucher_type}
                    onChange={(e) => setNewVoucher({ ...newVoucher, voucher_type: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #000000', borderRadius: '4px' }}
                  >
                    <option value="Sales Invoice">F8: Sales Invoice (Freight Billing)</option>
                    <option value="Payment">F5: Payment (Fuel / Concessionaire)</option>
                    <option value="Receipt">F6: Receipt (Client Freight Payment)</option>
                    <option value="Contra">F4: Contra (Bank / Cash Deposit)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Narration / Description</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Freight haulage billing for 34 tons Jindal Steel coils"
                    value={newVoucher.narration}
                    onChange={(e) => setNewVoucher({ ...newVoucher, narration: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Debit Account</label>
                    <input 
                      type="text"
                      value={newVoucher.account_debit}
                      onChange={(e) => setNewVoucher({ ...newVoucher, account_debit: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #000000', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Credit Account</label>
                    <input 
                      type="text"
                      value={newVoucher.account_credit}
                      onChange={(e) => setNewVoucher({ ...newVoucher, account_credit: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #000000', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Amount (INR ₹)</label>
                  <input 
                    type="number"
                    value={newVoucher.amount_inr}
                    onChange={(e) => setNewVoucher({ ...newVoucher, amount_inr: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Confirm &amp; Post Voucher
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: TRIAL BALANCE */}
          {activeScreen === 'trial-balance' && trialBalance && (
            <div style={{ width: '920px', maxWidth: '100%', background: '#ffffff', border: '1.5px solid #000000', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ borderBottom: '2px solid #000000', paddingBottom: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{companyHeader?.company_legal_name}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>TRIAL BALANCE SHEET</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>As of Date: {trialBalance.as_of_date}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Particulars</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.debit_schedule.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{item.code}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹{item.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>-</td>
                    </tr>
                  ))}
                  {trialBalance.credit_schedule.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{item.code}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>-</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹{item.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#ecfdf5', fontWeight: 900, borderTop: '2px solid #000000', fontSize: '13px' }}>
                    <td colSpan={2} style={{ padding: '10px 8px', textAlign: 'right' }}>BALANCED TOTAL:</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#047857' }}>₹{trialBalance.total_debit_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#047857' }}>₹{trialBalance.total_credit_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN 4: AI CONNECT & API KEYS */}
          {activeScreen === 'api-keys' && (
            <div style={{ width: '680px', maxWidth: '100%', background: '#ffffff', border: '1.5px solid #000000', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Key size={20} color="#059669" />
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0 }}>CONNECT TALLYBOOKS TO SABRE AI</h2>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Provide this API key to SABRE AI to enable automated financial postings</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>LIVE PRODUCTION API KEY</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={apiKey} 
                    style={{ flex: 1, padding: '8px 12px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid #000000', borderRadius: '4px', background: '#ffffff' }}
                  />
                  <button 
                    onClick={handleCopyKey}
                    style={{
                      background: copiedKey ? '#15803d' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedKey ? 'Copied!' : 'Copy Key'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                <strong>Automations enabled when plugged into AI:</strong>
                <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                  <li>Automated sales invoice creation upon trip POD upload</li>
                  <li>Automated reconciliation of FASTag deductions against bank statements</li>
                  <li>Automated query answering: <em>"What is our fuel spend vs freight margin this week?"</em></li>
                </ul>
              </div>
            </div>
          )}

          {/* SCREEN 5: PROFIT & LOSS */}
          {activeScreen === 'profit-loss' && profitLoss && (
            <div style={{ width: '920px', maxWidth: '100%', background: '#ffffff', border: '1.5px solid #000000', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ borderBottom: '2px solid #000000', paddingBottom: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{companyHeader?.company_legal_name}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>PROFIT &amp; LOSS STATEMENT (ANNUAL/YTD)</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Period: {profitLoss.period}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <tbody>
                  <tr style={{ background: '#ecfdf5', fontWeight: 800 }}>
                    <td style={{ padding: '8px' }}>I. REVENUE FROM FREIGHT OPERATIONS</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{profitLoss.total_revenue_inr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ background: '#fee2e2', fontWeight: 800 }}>
                    <td style={{ padding: '8px' }}>II. DIRECT FLEET &amp; OPERATING EXPENSES</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#b91c1c' }}>-₹{profitLoss.total_expenses_inr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ fontWeight: 800 }}>
                    <td style={{ padding: '8px' }}>EBITDA</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{profitLoss.ebitda_inr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ fontWeight: 900, background: '#f8fafc', fontSize: '13.5px', borderTop: '2px solid #000000' }}>
                    <td style={{ padding: '10px 8px', color: '#047857' }}>NET PROFIT AFTER TAX (PAT):</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#047857' }}>₹{profitLoss.profit_after_tax_net_inr.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN 6: PAYROLL */}
          {activeScreen === 'payroll' && (
            <div style={{ width: '920px', maxWidth: '100%', background: '#ffffff', border: '1.5px solid #000000', padding: '36px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 900, margin: '0 0 16px 0' }}>DRIVER &amp; CREW CTC PAYROLL DISBURSEMENT</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Emp ID</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Annual CTC</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Basic</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Trip Bata</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Net Pay (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{p.emp_id}</td>
                      <td style={{ padding: '8px' }}>{p.name} ({p.role})</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{p.ctc_annual_inr.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{p.monthly_basic.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{p.trip_mileage_allowance.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>₹{p.net_monthly_salary.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
