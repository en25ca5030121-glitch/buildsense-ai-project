import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Building,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import DemoModeBadge from '../components/common/DemoModeBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const SUGGESTED_PROMPTS = [
  'What are the OSHA requirements for scaffolding guardrails & toeboards?',
  'How do I calculate concrete slump loss in hot weather (>32°C)?',
  'Generate a 5-step checklist for pre-pour slab inspection.',
  'Explain total float vs free float in Critical Path Method (CPM).'
];

export const AssistantPage = () => {
  const { selectedProject } = useProject();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am **BuildSense AI Construction Assistant**, your intelligent advisor for OSHA safety standards, concrete curing, critical path scheduling, and QA/QC hold-points.\n\nHow can I support your project operations today?',
      mode: 'ai'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeProjectContext, setIncludeProjectContext] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend) => {
    const text = messageToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      mode: 'user'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        message: text,
        session_id: 'active_session',
        project_id: includeProjectContext ? selectedProject?.id : null
      };

      const res = await api.post('/assistant/chat', payload);
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.data.content,
        mode: res.mode || 'ai',
        disclaimer: res.data.disclaimer
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      showToast('Assistant query failed: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Response copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation cleared. How can I assist you with your construction specs?',
        mode: 'ai'
      }
    ]);
    showToast('Chat history cleared', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Bot className="w-6 h-6 text-accent-cyan" />
              AI Construction Assistant
            </h1>
            <DemoModeBadge mode="ai" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time advisory for materials, methods, safety procedures, and CPM project scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-navy-800 px-3 py-1.5 rounded-xl border border-slate-700/60 cursor-pointer">
            <input
              type="checkbox"
              checked={includeProjectContext}
              onChange={(e) => setIncludeProjectContext(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
            <span className="truncate">Context: {selectedProject?.name ? selectedProject.name.slice(0, 20) + '...' : 'Global'}</span>
          </label>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-navy-800 border border-slate-700/60 hover:border-slate-600 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Engineering Disclaimer Bar */}
      <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          BuildSense AI answers provide educational reference guidance. For high-risk decisions (such as structural load calculations, shoring engineering, and high-voltage connections), consult a licensed Professional Engineer (PE).
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-navy-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-6 overflow-y-auto space-y-4 shadow-xl">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-accent-cyan'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-accent-cyan text-navy-950 font-semibold'
                    : 'bg-navy-800 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">BuildSense Verified Engine</span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="flex items-center gap-1 hover:text-accent-cyan transition text-slate-400"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-accent-cyan flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-navy-800 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping"></span>
              Consulting engineering specifications & construction checklists...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Suggested:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full text-[11px] bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700/70 whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about materials, curing, OSHA safety, scheduling, or quality control..."
          className="flex-1 bg-navy-800 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan transition shadow-lg"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-2xl bg-accent-cyan hover:bg-cyan-300 text-navy-950 font-bold transition shadow-lg shadow-cyan-950/40 disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AssistantPage;
