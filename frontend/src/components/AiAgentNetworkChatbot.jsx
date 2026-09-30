import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot, Cpu, Zap, Shield, ShieldCheck, CheckCircle2, AlertTriangle,
  Play, Copy, Check, Flame, Database, Globe, Box, Layers, Code, Trash2,
  X, Sparkles, ArrowUp, ExternalLink, RotateCcw, ThumbsUp, ThumbsDown,
  Plus, MessageSquare, Compass, Activity, Terminal, Send, Clock,
  PanelLeftClose, PanelLeft, Search, Edit3, CheckCheck, Filter, Folder,
  Tag, History
} from 'lucide-react';
import SabreMarkdownRenderer from './SabreMarkdownRenderer';
import { SAAS_CATALOG } from './SaasAppLibraryModal';

const SCREEN_TITLES = {
  '3d-map': 'Photorealistic 3D GIS Elevation Engine & Real-Time Corridor Radar',
  'compute': 'Elastic Compute Nodes & In-Vehicle Telematics (COMP-01..08)',
  'networking': 'Corridors & Routing DNS (NET-09..16)',
  'storage': 'Black-Box Object Lake & Telemetry Vault (STOR-17..22)',
  'governance': 'Security & Governance Audit Trail (SEC-41..45)',
  'observability': 'Real-Time Telemetry & Prometheus Metrics',
  'paas-foundations': 'PaaS Foundational Architecture (6 Core Layers & 6 Subsystems)',
  'transport-cloud': 'SABRE Cloud Cockpit & Fleet Overview',
  'developer': 'Developer Hub & REST/WebSocket APIs',
  'ai-agents': 'Sovereign Multi-Agent Network & Reasoning Engine'
};

const PAAS_DOMAINS = [
  { id: 'ALL', label: 'All Missions' },
  { id: 'Corridors', label: 'Corridors', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'Telematics', label: 'Telematics', color: '#16a34a', bg: '#dcfce7' },
  { id: 'Lakehouse', label: 'Lakehouse', color: '#d97706', bg: '#fef3c7' },
  { id: 'Compute', label: 'Compute', color: '#7c3aed', bg: '#f3e8ff' },
  { id: 'Governance', label: 'Security', color: '#dc2626', bg: '#fee2e2' },
  { id: 'PaaS Engine', label: 'PaaS Core', color: '#2e7d32', bg: '#e8f5e9' }
];

const detectPaaSDomain = (text) => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('corridor') || lower.includes('route') || lower.includes('traffic') || lower.includes('speed') || lower.includes('gis') || lower.includes('map')) {
    return { name: 'Corridors', color: '#0284c7', bg: '#e0f2fe' };
  }
  if (lower.includes('telematics') || lower.includes('truck') || lower.includes('vehicle') || lower.includes('fleet') || lower.includes('driver') || lower.includes('fuel')) {
    return { name: 'Telematics', color: '#16a34a', bg: '#dcfce7' };
  }
  if (lower.includes('lake') || lower.includes('storage') || lower.includes('s3') || lower.includes('parquet') || lower.includes('delta') || lower.includes('vault') || lower.includes('db')) {
    return { name: 'Lakehouse', color: '#d97706', bg: '#fef3c7' };
  }
  if (lower.includes('compute') || lower.includes('node') || lower.includes('cpu') || lower.includes('ram') || lower.includes('docker') || lower.includes('cluster') || lower.includes('server')) {
    return { name: 'Compute', color: '#7c3aed', bg: '#f3e8ff' };
  }
  if (lower.includes('security') || lower.includes('audit') || lower.includes('token') || lower.includes('auth') || lower.includes('policy') || lower.includes('governance')) {
    return { name: 'Governance', color: '#dc2626', bg: '#fee2e2' };
  }
  return { name: 'PaaS Engine', color: '#2e7d32', bg: '#e8f5e9' };
};

const formatSessionTime = (isoStr) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

const createNewSession = (title = 'New Mission') => {
  const newId = `mission-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: newId,
    title,
    domain: 'PaaS Engine',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chatHistory: [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Welcome to SABRE-AI. How may I assist you today with logistics intelligence, fleet optimization, or PaaS infrastructure?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    activeSessionData: null
  };
};

export default function AiAgentNetworkChatbot({ isSidecar = false, currentPage = '3d-map', onClose, onOpenSwarm, onOpenAppLibrary }) {
  const [selectedTier, setSelectedTier] = useState('Pro');
  const [tierConfigs, setTierConfigs] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  // ChatGPT-style active plugins state
  const [linkedPlugins, setLinkedPlugins] = useState(() => {
    try {
      const saved = localStorage.getItem('sabre_ai_linked_plugins');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['tallybooks', 'shield-waf', 'nexus-dispatch'];
  });

  // Multi-session operations vault state
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('sabre_ai_chat_sessions_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved sessions', e);
    }
    return [createNewSession('Mission Alpha (Fleet Operations)')];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const savedId = localStorage.getItem('sabre_ai_active_session_id_v3');
      if (savedId) return savedId;
    } catch (e) {}
    return '';
  });

  // Keep activeSessionId validated against current sessions
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    } else if (activeSessionId && !sessions.some(s => s.id === activeSessionId)) {
      if (sessions.length > 0) setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sabre_ai_chat_sessions_v3', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem('sabre_ai_active_session_id_v3', activeSessionId);
      }
    } catch (e) {}
  }, [activeSessionId]);

  // Active session context & history
  const activeSessionObj = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const [chatHistory, setChatHistory] = useState(() => {
    return activeSessionObj?.chatHistory || [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: isSidecar
          ? `Welcome to SABRE-AI. How can I assist you on this screen?`
          : 'Welcome to SABRE-AI. How may I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [activeSession, setActiveSession] = useState(() => activeSessionObj?.activeSessionData || null);

  // Sync state when active session changes
  useEffect(() => {
    if (activeSessionObj) {
      setChatHistory(activeSessionObj.chatHistory || []);
      setActiveSession(activeSessionObj.activeSessionData || null);
    }
  }, [activeSessionId]);

  // Sidebar controls
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilterTag, setHistoryFilterTag] = useState('ALL');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const [poweringOn, setPoweringOn] = useState(false);
  const [powerOnSuccess, setPowerOnSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const chatEndRef = useRef(null);

  // =========================================================================
  // FLUID CURSOR-FOLLOWING MOTION GRAPHICS STATE & LERP PHYSICS
  // =========================================================================
  const [fluidMousePos, setFluidMousePos] = useState({ x: 0, y: 0 });
  const fluidContainerRef = useRef(null);
  const fluidPhysicsRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
  const fluidAnimRef = useRef(null);

  useEffect(() => {
    // Initialize glow position to center
    if (fluidContainerRef.current) {
      const rect = fluidContainerRef.current.getBoundingClientRect();
      const initialX = rect.width / 2 || window.innerWidth / 2;
      const initialY = rect.height / 2 || 350;
      fluidPhysicsRef.current = { currentX: initialX, currentY: initialY, targetX: initialX, targetY: initialY };
      setFluidMousePos({ x: initialX, y: initialY });
    }

    // Silky smooth lerp loop for liquid fluid lag motion
    const loop = () => {
      const p = fluidPhysicsRef.current;
      p.currentX += (p.targetX - p.currentX) * 0.055;
      p.currentY += (p.targetY - p.currentY) * 0.055;
      setFluidMousePos({ x: p.currentX, y: p.currentY });
      fluidAnimRef.current = requestAnimationFrame(loop);
    };
    fluidAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (fluidAnimRef.current) cancelAnimationFrame(fluidAnimRef.current);
    };
  }, []);

  const handleContainerMouseMove = (e) => {
    if (fluidContainerRef.current) {
      const rect = fluidContainerRef.current.getBoundingClientRect();
      fluidPhysicsRef.current.targetX = e.clientX - rect.left;
      fluidPhysicsRef.current.targetY = e.clientY - rect.top;
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };


  // Timer while analyzing
  useEffect(() => {
    let timer;
    if (analyzing) {
      setElapsedSec(0);
      timer = setInterval(() => {
        setElapsedSec(prev => Math.round((prev + 0.1) * 10) / 10);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [analyzing]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, analyzing]);

  // Fetch Tier configurations
  useEffect(() => {
    fetch('/api/v1/paas/ai/homegrown/tiers')
      .then(r => r.json())
      .then(data => setTierConfigs(data))
      .catch(console.error);
  }, []);

  // Filtered sessions for sidebar
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const q = historySearchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        (s.title || '').toLowerCase().includes(q) ||
        (s.domain || '').toLowerCase().includes(q) ||
        (s.chatHistory || []).some(m => (m.content || '').toLowerCase().includes(q));

      const matchesFilter = historyFilterTag === 'ALL' || s.domain === historyFilterTag;
      return matchesSearch && matchesFilter;
    });
  }, [sessions, historySearchQuery, historyFilterTag]);

  // Session switching with full state preservation
  const handleSelectSession = (id) => {
    if (id === activeSessionId) return;

    // Sync current session state first
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          chatHistory: chatHistory,
          activeSessionData: activeSession,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    const target = sessions.find(s => s.id === id);
    if (target) {
      setActiveSessionId(id);
      setChatHistory(target.chatHistory || []);
      setActiveSession(target.activeSessionData || null);
      setPromptInput('');
      showToast(`Loaded "${target.title}"`);
    }
  };

  // Create new operational mission
  const handleCreateNewMission = () => {
    const freshMission = createNewSession(`Mission #${sessions.length + 1}`);
    setSessions(prev => [freshMission, ...prev]);
    setActiveSessionId(freshMission.id);
    setChatHistory(freshMission.chatHistory);
    setActiveSession(null);
    setPromptInput('');
    showToast('New mission context initiated');
  };

  // Delete mission
  const handleDeleteSession = (id, e) => {
    if (e) e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewSession('Mission Alpha (Fleet Operations)');
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setChatHistory(fresh.chatHistory);
      setActiveSession(null);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        const next = remaining[0];
        setActiveSessionId(next.id);
        setChatHistory(next.chatHistory || []);
        setActiveSession(next.activeSessionData || null);
      }
    }
    showToast('Mission log archived');
  };

  // Clear all missions
  const handleClearAllSessions = () => {
    if (window.confirm && !window.confirm('Reset and archive all mission histories?')) return;
    const fresh = createNewSession('Mission Alpha (Fleet Operations)');
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setChatHistory(fresh.chatHistory);
    setActiveSession(null);
    showToast('All mission history cleared');
  };

  // Rename mission
  const startEditingSession = (session, e) => {
    if (e) e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitleText(session.title);
  };

  const saveEditingSession = (id) => {
    if (editingTitleText.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editingTitleText.trim() } : s));
      showToast('Mission renamed');
    }
    setEditingSessionId(null);
  };

  // Keyboard shortcut Ctrl+B to toggle sidebar, Ctrl+N for new mission
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewMission();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessions.length]);

  const handleSendPrompt = async (forcedText = null) => {
    const textValue = (typeof forcedText === 'string' && forcedText.trim()) ? forcedText : promptInput;
    const textToSend = (textValue || '').trim();
    if (!textToSend || analyzing) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      tier: selectedTier,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation history locally immediately
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setPromptInput('');
    setAnalyzing(true);
    setPowerOnSuccess(false);

    // Auto-update mission title & domain tag if default
    const curSession = sessions.find(s => s.id === activeSessionId);
    let sessionTitle = curSession?.title || 'Mission';
    if (sessionTitle.startsWith('New Mission') || sessionTitle.startsWith('Mission #') || sessionTitle.startsWith('Mission Alpha')) {
      sessionTitle = textToSend.length > 36 ? textToSend.slice(0, 36).trim() + '...' : textToSend;
    }
    const detected = detectPaaSDomain(textToSend);

    // Immediate save of user message into persistent session store
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: sessionTitle,
          domain: detected.name,
          updatedAt: new Date().toISOString(),
          chatHistory: updatedHistory
        };
      }
      return s;
    }));

    try {
      // Build history for backend LLM memory
      const conversationPayload = updatedHistory
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/v1/paas/ai/homegrown/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          tier: selectedTier,
          conversation_history: conversationPayload,
          current_page: currentPage
        })
      });

      if (res.status === 429) {
        const err = await res.json();
        showToast(`Hardware Rate Limit: ${err.detail}`);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);

        const responseContent = data.response_text || data.raw_neural_response || 
          "SABRE Sovereign Intelligence generated this response for your query.";

        // Append assistant response to chat thread
        const assistantMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          session: data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalHistory = [...updatedHistory, assistantMsg];
        setChatHistory(finalHistory);

        // Update session in storage
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              title: sessionTitle,
              domain: detected.name,
              updatedAt: new Date().toISOString(),
              chatHistory: finalHistory,
              activeSessionData: data
            };
          }
          return s;
        }));

        showToast('SABRE-AI replied');
      } else {
        throw new Error(`Server returned status ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      // Graceful local response if network glitch occurs
      const fallbackMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `I received your message: **"${textToSend}"**.\n\nSABRE-AI processed your request. Multi-turn context is saved in this mission thread.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalHistory = [...updatedHistory, fallbackMsg];
      setChatHistory(finalHistory);

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: sessionTitle,
            domain: detected.name,
            updatedAt: new Date().toISOString(),
            chatHistory: finalHistory
          };
        }
        return s;
      }));
      showToast('Completed with local cache fallback');
    } finally {
      setAnalyzing(false);
    }
  };

  // =========================================================================
  // SIDECAR DRAWER MODE (When summoned from top navigation bar)
  // =========================================================================
  if (isSidecar) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#e8f5e9', /* Light leaf green background */
        color: '#111827',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#091a36', /* Dark Blue */
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                Ask SABRE-AI
              </div>
              <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                {SCREEN_TITLES[currentPage] || currentPage}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Chat Thread */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#e8f5e9' /* Light leaf green chat thread */
        }}>
          {chatHistory.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '85%' : '96%',
                  background: isUser ? '#091a36' : '#f1f8e9', /* Very light leaf green assistant bubble */
                  color: isUser ? '#ffffff' : '#111827',
                  borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: '1px solid #000000',
                  fontSize: '13px',
                  lineHeight: '1.55'
                }}
              >
                {!isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#2e7d32', letterSpacing: '0.4px' }}>
                      SABRE-AI
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#4b5563' }}>{msg.timestamp}</span>
                  </div>
                )}
                {isUser ? (
                  <div>{msg.content}</div>
                ) : (
                  <SabreMarkdownRenderer content={msg.content} />
                )}
              </div>
            );
          })}

          {analyzing && (
            <div style={{ alignSelf: 'flex-start', background: '#f1f8e9', border: '1px solid #000000', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2e7d32' }}>
                Thinking... {elapsedSec}s
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Prompt Bar */}
        <div style={{ padding: '12px', borderTop: '1px solid #000000', background: '#e8f5e9', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <input
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
            placeholder="Ask SABRE-AI about this screen or request assistance..."
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid #000000',
              background: '#ffffff',
              color: '#111827',
              fontSize: '12.5px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={analyzing}
            style={{
              background: '#091a36',
              color: '#ffffff',
              border: '1px solid #000000',
              padding: '0 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Send size={13} />
            <span>Send</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: FULL-WINDOW LIGHT MODE ENTERPRISE CANVAS (NO EMOJIS, NO DARK MODE)
  // =========================================================================
  const hasUserMessages = chatHistory.filter(m => m.role === 'user').length > 0;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fbf7f2', /* Soft almost-white skin background */
      color: '#111827',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1e3a5f',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid #000000',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 9999
        }}>
          <CheckCircle2 size={16} color="#4ade80" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER: OPERATIONS BAR */}
      <div style={{
        background: '#1e3a5f',
        color: '#ffffff',
        padding: '12px 24px',
        borderBottom: '1px solid #000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Left: Clean Brand & Mission Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#2e7d32',
              border: '1px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
            }}>
              <Bot size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              SABRE-AI
            </span>
          </div>

          {/* Operations Vault History Toggle Button */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            title={sidebarOpen ? "Collapse Operations Vault" : "Open Operations Vault"}
            style={{
              background: sidebarOpen ? '#2e7d32' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
            <span>Missions Vault</span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              padding: '1px 6px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              {sessions.length}
            </span>
          </button>

          {/* Active Mission Context Chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11.5px',
            color: '#e2e8f0',
            maxWidth: '340px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ color: '#94a3b8' }}>Context:</span>
            <strong style={{ color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSessionObj?.title || 'Operational'}
            </strong>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* SaaS Software Applications Marketplace Launcher */}
          <button
            onClick={() => {
              if (onOpenAppLibrary) onOpenAppLibrary();
            }}
            title="Open Standalone SaaS Applications Marketplace"
            style={{
              background: '#0c192c',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(56, 189, 248, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} />
            <span>SaaS Apps</span>
            <ExternalLink size={11} />
          </button>

          <button
            onClick={handleCreateNewMission}
            title="Start new mission context"
            style={{
              background: '#2e7d32',
              border: '1px solid #000000',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={14} color="#ffffff" />
            <span>New Mission</span>
          </button>

          {onOpenSwarm && (
            <button
              onClick={onOpenSwarm}
              title="Open Multi-Agent Swarm Console in a full dedicated tab window"
              style={{
                background: '#e8f5e9',
                border: '1px solid #000000',
                color: '#1b5e20',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={13} color="#2e7d32" />
              <span>Multi-Agent Swarm</span>
              <ExternalLink size={12} color="#2e7d32" />
            </button>
          )}

          <button
            onClick={() => {
              const freshHistory = [{
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                content: 'Conversation reset. How may I assist you today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }];
              setChatHistory(freshHistory);
              setActiveSession(null);
              setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, chatHistory: freshHistory, activeSessionData: null } : s));
              showToast('Current mission thread reset');
            }}
            title="Reset conversation in this mission"
            style={{
              background: '#ffffff',
              border: '1px solid #000000',
              color: '#111827',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE: SIDEBAR + MAIN FLUID MOTION CANVAS                             */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

        {/* ========================================================================= */}
        {/* OPERATIONS VAULT: PAAS MISSION & CHAT HISTORY SIDEBAR                     */}
        {/* ========================================================================= */}
        {sidebarOpen ? (
          <aside
            style={{
              width: '280px',
              minWidth: '280px',
              maxWidth: '280px',
              height: '100%',
              background: '#f8f5f0',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* CHATGPT-STYLE AI PLUGINS BAR - LIGHTER BLUE SHADE WITH ROUNDED CORNERS */}
            <div style={{
              margin: '10px 10px 6px 10px',
              padding: '9px 12px',
              borderRadius: '10px',
              background: '#1e3a5f',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(30, 58, 95, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={13} color="#4ade80" />
                  <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#e2e8f0' }}>
                    AI Plugins
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    background: 'rgba(74, 222, 128, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    padding: '1px 5px',
                    borderRadius: '8px'
                  }}>
                    {linkedPlugins.length} Active
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse Sidebar"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>

              {/* Plugin Icons Row with Plus (+) button just like ChatGPT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {linkedPlugins.map(appId => {
                  const appObj = SAAS_CATALOG.find(a => a.id === appId);
                  if (!appObj) return null;
                  return (
                    <div
                      key={appObj.id}
                      onClick={() => window.open(`/?app=${appObj.id}`, '_blank')}
                      title={`Plugin: ${appObj.name} (Click to open standalone app)`}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: appObj.iconBg,
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {appObj.iconLetter}
                    </div>
                  );
                })}

                {/* ChatGPT-style Plus (+) Button */}
                <button
                  onClick={() => {
                    if (onOpenAppLibrary) onOpenAppLibrary();
                  }}
                  title="Add / Manage AI Plugins"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px dashed #38bdf8',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0284c7';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderStyle = 'solid';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.color = '#38bdf8';
                    e.currentTarget.style.borderStyle = 'dashed';
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Quick Action: Clean New Mission Button */}
            <div style={{ padding: '6px 10px 4px 10px' }}>
              <button
                onClick={handleCreateNewMission}
                title="Create New Mission Context"
                style={{
                  width: '100%',
                  background: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(46, 125, 50, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} />
                  <span>New Mission</span>
                </div>
              </button>
            </div>

            {/* Clean Search Input */}
            <div style={{ padding: '4px 10px 6px 10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px'
              }}>
                <Search size={12} color="#64748b" />
                <input
                  value={historySearchQuery}
                  onChange={e => setHistorySearchQuery(e.target.value)}
                  placeholder="Search missions..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '11.5px',
                    width: '100%',
                    color: '#111827'
                  }}
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={11} color="#64748b" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Missions History - Spacious Single-Line Rows (ChatGPT Style) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '4px 8px 12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              {filteredSessions.length === 0 ? (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '11.5px'
                }}>
                  <div>No missions found.</div>
                </div>
              ) : (
                filteredSessions.map(s => {
                  const isActive = s.id === activeSessionId;
                  const isEditing = editingSessionId === s.id;

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      style={{
                        height: '34px',
                        minHeight: '34px',
                        padding: '0 8px',
                        borderRadius: '6px',
                        background: isActive ? '#e2e8f0' : 'transparent',
                        color: isActive ? '#0f172a' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: '6px',
                        position: 'relative',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#ece5db';
                        const acts = e.currentTarget.querySelector('.session-row-actions');
                        if (acts) acts.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                        const acts = e.currentTarget.querySelector('.session-row-actions');
                        if (acts) acts.style.opacity = '0';
                      }}
                    >
                      {/* Left: Message Icon + Single-Line Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
                        <MessageSquare size={13} color={isActive ? '#16a34a' : '#94a3b8'} style={{ flexShrink: 0 }} />
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingTitleText}
                            onChange={e => setEditingTitleText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditingSession(s.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            onBlur={() => saveEditingSession(s.id)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: '100%',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: '1px solid #000000',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              outline: 'none',
                              background: '#ffffff',
                              color: '#111827'
                            }}
                          />
                        ) : (
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px'
                          }}>
                            {s.title}
                          </span>
                        )}
                      </div>

                      {/* Right: Actions on Hover */}
                      {!isEditing && (
                        <div
                          className="session-row-actions"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            opacity: 0,
                            transition: 'opacity 0.15s ease',
                            flexShrink: 0
                          }}
                        >
                          <button
                            onClick={e => startEditingSession(s, e)}
                            title="Rename mission"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={e => handleDeleteSession(s.id, e)}
                            title="Delete mission"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Status */}
            <div style={{
              padding: '9px 12px',
              borderTop: '1px solid #000000',
              background: '#ece5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#15803d' }}>
                <CheckCircle2 size={12} color="#16a34a" />
                <span>Multi-Turn Memory</span>
              </div>
              <button
                onClick={handleClearAllSessions}
                title="Archive and clear all past missions"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#b91c1c',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear All
              </button>
            </div>
          </aside>
        ) : (
          /* Mini Collapsed Rail (56px) */
          <aside
            style={{
              width: '56px',
              minWidth: '56px',
              maxWidth: '56px',
              height: '100%',
              background: '#f6f1ea',
              borderRight: '1px solid #000000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 6px',
              gap: '10px',
              zIndex: 10,
              boxShadow: '2px 0 6px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Expand button */}
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand Operations Vault"
              style={{
                background: 'transparent',
                border: '1px solid #000000',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#111827'
              }}
            >
              <PanelLeft size={16} />
            </button>

            {/* New Mission icon button */}
            <button
              onClick={handleCreateNewMission}
              title="New Mission"
              style={{
                background: '#2e7d32',
                border: '1px solid #000000',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(46, 125, 50, 0.25)'
              }}
            >
              <Plus size={16} />
            </button>

            {/* Vertical Mission Dots/Pills */}
            <div style={{
              flex: 1,
              width: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '7px',
              paddingTop: '6px',
              scrollbarWidth: 'none'
            }}>
              {sessions.slice(0, 8).map(s => {
                const isActive = s.id === activeSessionId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    title={`${s.title} (${(s.chatHistory || []).filter(m => m.role === 'user').length} turns)`}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: isActive ? '#edf7ee' : '#ffffff',
                      border: isActive ? '1.5px solid #000000' : '1px solid #cbd5e1',
                      color: isActive ? '#1b5e20' : '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 800,
                      boxShadow: isActive ? '0 2px 4px rgba(46, 125, 50, 0.2)' : 'none',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <MessageSquare size={14} color={isActive ? '#2e7d32' : '#64748b'} />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* MAIN VIEW: FULL-WINDOW SPACE WITH FLUID MOTION GRAPHICS                   */}
        {/* ========================================================================= */}
        <div
          ref={fluidContainerRef}
          onMouseMove={handleContainerMouseMove}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: '#fbf7f2'
          }}
        >
        {/* ========================================================================= */}
        {/* FLUID MOTION GRAPHICS GLOW (Light Canvas Aurora, Mouse-Interactive)       */}
        {/* ========================================================================= */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {/* Subtle noise/vignette or base tone for depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.6) 0%, rgba(251, 247, 242, 0.95) 85%)',
              mixBlendMode: 'normal'
            }}
          />

          {/* Ambient Floating Blob 1 - Top Left Emerald Sage Mist */}
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '12%',
              width: '620px',
              height: '520px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.22) 0%, rgba(134, 239, 172, 0.12) 45%, rgba(251, 247, 242, 0) 75%)',
              filter: 'blur(80px)',
              animation: 'fluidOrbDrift1 22s ease-in-out infinite alternate',
              willChange: 'transform'
            }}
          />

          {/* Ambient Floating Blob 2 - Bottom Right Sunbeam Amber Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '12%',
              right: '10%',
              width: '680px',
              height: '560px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.24) 0%, rgba(253, 224, 71, 0.10) 45%, rgba(251, 247, 242, 0) 75%)',
              filter: 'blur(95px)',
              animation: 'fluidOrbDrift2 26s ease-in-out infinite alternate',
              willChange: 'transform'
            }}
          />

          {/* Ambient Floating Blob 3 - Center Gentle Breathing Aura */}
          <div
            style={{
              position: 'absolute',
              top: '35%',
              left: '32%',
              width: '540px',
              height: '460px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167, 243, 208, 0.22) 0%, rgba(187, 247, 208, 0.08) 50%, rgba(251, 247, 242, 0) 75%)',
              filter: 'blur(90px)',
              animation: 'fluidPulseBreathe 14s ease-in-out infinite',
              willChange: 'transform, opacity'
            }}
          />

          {/* Dynamic Interactive Cursor Fluid Glow Orb (Smooth Physics Tracking) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '750px',
              height: '620px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.28) 0%, rgba(110, 231, 183, 0.16) 38%, rgba(254, 243, 199, 0.12) 60%, rgba(251, 247, 242, 0) 78%)',
              filter: 'blur(85px)',
              transform: `translate3d(${fluidMousePos.x - 375}px, ${fluidMousePos.y - 310}px, 0)`,
              willChange: 'transform',
              transition: 'opacity 0.5s ease',
              opacity: 0.95
            }}
          />
        </div>
        
        {/* CASE A: EMPTY CANVAS STATE */}
        {!hasUserMessages ? (
          <div style={{
            position: 'relative',
            zIndex: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            minHeight: '520px'
          }}>
            {/* Clean Center Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#2e7d32',
                border: '1px solid #000000',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                marginBottom: '14px'
              }}>
                <Bot size={28} color="#ffffff" />
              </div>
              <h1 style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                SABRE-AI
              </h1>
            </div>

            {/* Clean Leaf Green Context Window */}
            <div style={{
              width: '740px',
              maxWidth: '92%',
              background: '#edf7ee', /* Light leaf green prompt window */
              border: '1px solid #000000',
              borderRadius: '12px',
              padding: '16px 18px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <textarea
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Message SABRE-AI..."
                rows={2}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#0f172a',
                  fontSize: '14.5px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  onClick={() => handleSendPrompt()}
                  disabled={analyzing || !promptInput.trim()}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: promptInput.trim() ? '#0284c7' : '#e2e8f0',
                    color: promptInput.trim() ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    cursor: promptInput.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* CASE B: ACTIVE CONVERSATION THREAD (Spacious Light Mode Canvas) */
          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '960px',
            width: '100%',
            margin: '0 auto',
            padding: '32px 24px 160px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {chatHistory.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: 'flex-end',
                      background: '#1e3a5f',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      maxWidth: '82%',
                      fontSize: '14px',
                      lineHeight: '1.55',
                      border: '1px solid #000000',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Operator • {msg.timestamp}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                );
              }

              // Assistant message card - leaf green context window with crisp black borders
              const s = msg.session || activeSession;
              return (
                <div
                  key={msg.id}
                  style={{
                    background: '#edf7ee', /* Light leaf green message background */
                    border: '1px solid #000000',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Meta header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #000000', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: '#2e7d32', border: '1px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1b5e20' }}>
                        SABRE-AI
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Body with Markdown & Visual Architecture Diagrams */}
                  <div style={{
                    fontSize: '14px',
                    color: '#1e293b',
                    lineHeight: '1.65'
                  }}>
                    <SabreMarkdownRenderer content={msg.content} />
                  </div>

                  {/* Safety Gate Banner if Deployment Intent */}
                  {s && s.is_deployment_intent && s.action_plan_steps?.length > 0 && msg.id === chatHistory[chatHistory.length - 1]?.id && (
                    <div style={{
                      marginTop: '12px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '14px',
                      color: '#92400e'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '12.5px', marginBottom: '8px' }}>
                        <ShieldCheck size={16} color="#d97706" />
                        <span>HUMAN-IN-THE-LOOP SAFETY GATE: AUTHORIZATION REQUIRED</span>
                      </div>
                      <button
                        onClick={async () => {
                          setPoweringOn(true);
                          try {
                            const r = await fetch('/api/v1/paas/ai/homegrown/power-on', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ session_id: s.session_id, action_plan_steps: s.action_plan_steps })
                            });
                            if (r.ok) {
                              setPowerOnSuccess(true);
                              showToast('All 6 services powered on successfully');
                            }
                          } finally {
                            setPoweringOn(false);
                          }
                        }}
                        disabled={poweringOn}
                        style={{
                          background: '#d97706',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {poweringOn ? 'Authorizing & Powering On...' : 'Confirm & Arm Power On'}
                      </button>
                    </div>
                  )}

                  {/* Power On Success Banner */}
                  {powerOnSuccess && msg.id === chatHistory[chatHistory.length - 1]?.id && (
                    <div style={{
                      marginTop: '10px',
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                      <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                        All 6 SABRE services activated & powered on via local orchestration.
                      </span>
                    </div>
                  )}

                  {/* Action row (Copy, Thumbs, Retry) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', borderTop: '1px solid #f8fafc', paddingTop: '8px', color: '#64748b' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        showToast('Response copied to clipboard');
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                      title="Copy response"
                    >
                      <Copy size={13} />
                      <span>Copy</span>
                    </button>
                    <button
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                      title="Helpful"
                    >
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                      title="Not helpful"
                    >
                      <ThumbsDown size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {analyzing && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                width: 'fit-content'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  Thinking... {elapsedSec}s
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        </div>

      </div>

      {/* FLOATING BOTTOM INPUT CAPSULE (When conversation is active) */}
      {hasUserMessages && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: sidebarOpen ? 'calc(50% + 158px)' : 'calc(50% + 28px)',
          transform: 'translateX(-50%)',
          width: '780px',
          maxWidth: sidebarOpen ? 'calc(100% - 360px)' : 'calc(100% - 100px)',
          background: '#edf7ee', /* Leaf green context window */
          border: '1px solid #000000',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 50,
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.22s ease'
        }}>
          <textarea
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder="Message SABRE-AI..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#111827',
              fontSize: '14px',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            onClick={() => handleSendPrompt()}
            disabled={analyzing || !promptInput.trim()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: promptInput.trim() ? '#2e7d32' : '#c8e6c9',
              color: promptInput.trim() ? '#ffffff' : '#4b5563',
              border: '1px solid #000000',
              cursor: promptInput.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Send size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
