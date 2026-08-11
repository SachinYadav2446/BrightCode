import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Swords, Trophy, Play, CheckCircle, XCircle, AlertCircle,
  Loader, ChevronDown, ChevronUp, MessageSquare, LogOut,
  RotateCcw, Copy, Star, X, Check,
  Code, Code2, Clock, Database, ChevronRight, BarChart2,
  ArrowLeft, ArrowRight, Terminal, FlaskConical,
  Maximize2, Minimize2, Sparkles, Settings, Wand2
} from 'lucide-react';
import ChatPanel from '../ChatPanel';
import API_URL from '../../config';
import './BattleCodeEditor.css';

/* ── Full Judge0 Language Map (~60 languages) ─────────────────── */
const LANGUAGE_GROUPS = [
  {
    group: 'Popular',
    langs: [
      { id: 'java',       label: 'Java',         monacoId: 'java',       judge0: 62  },
      { id: 'python',     label: 'Python 3',      monacoId: 'python',     judge0: 71  },
      { id: 'javascript', label: 'JavaScript',    monacoId: 'javascript', judge0: 63  },
      { id: 'cpp',        label: 'C++',           monacoId: 'cpp',        judge0: 54  },
      { id: 'c',          label: 'C',             monacoId: 'c',          judge0: 50  },
      { id: 'csharp',     label: 'C#',            monacoId: 'csharp',     judge0: 51  },
    ]
  },
  {
    group: 'Systems',
    langs: [
      { id: 'go',         label: 'Go',            monacoId: 'go',         judge0: 60  },
      { id: 'rust',       label: 'Rust',          monacoId: 'rust',       judge0: 73  },
      { id: 'kotlin',     label: 'Kotlin',        monacoId: 'kotlin',     judge0: 78  },
      { id: 'swift',      label: 'Swift',         monacoId: 'swift',      judge0: 83  },
      { id: 'cpp17',      label: 'C++ 17',        monacoId: 'cpp',        judge0: 76  },
      { id: 'cpp14',      label: 'C++ 14',        monacoId: 'cpp',        judge0: 75  },
    ]
  },
  {
    group: 'Scripting',
    langs: [
      { id: 'python2',    label: 'Python 2',      monacoId: 'python',     judge0: 70  },
      { id: 'ruby',       label: 'Ruby',          monacoId: 'ruby',       judge0: 72  },
      { id: 'php',        label: 'PHP',           monacoId: 'php',        judge0: 68  },
      { id: 'perl',       label: 'Perl',          monacoId: 'perl',       judge0: 85  },
      { id: 'lua',        label: 'Lua',           monacoId: 'lua',        judge0: 64  },
      { id: 'r',          label: 'R',             monacoId: 'r',          judge0: 80  },
    ]
  },
  {
    group: 'JVM / .NET',
    langs: [
      { id: 'scala',      label: 'Scala',         monacoId: 'scala',      judge0: 81  },
      { id: 'groovy',     label: 'Groovy',        monacoId: 'groovy',     judge0: 96  },
      { id: 'clojure',    label: 'Clojure',       monacoId: 'clojure',    judge0: 86  },
      { id: 'fsharp',     label: 'F#',            monacoId: 'fsharp',     judge0: 87  },
      { id: 'vb',         label: 'VB.NET',        monacoId: 'vb',         judge0: 84  },
    ]
  },
  {
    group: 'Functional / Other',
    langs: [
      { id: 'typescript', label: 'TypeScript',    monacoId: 'typescript', judge0: 74  },
      { id: 'haskell',    label: 'Haskell',       monacoId: 'haskell',    judge0: 61  },
      { id: 'erlang',     label: 'Erlang',        monacoId: 'erlang',     judge0: 58  },
      { id: 'elixir',     label: 'Elixir',        monacoId: 'elixir',     judge0: 57  },
      { id: 'nim',        label: 'Nim',           monacoId: 'nim',        judge0: 88  },
      { id: 'pascal',     label: 'Pascal',        monacoId: 'pascal',     judge0: 67  },
      { id: 'fortran',    label: 'Fortran',       monacoId: 'fortran',    judge0: 59  },
      { id: 'cobol',      label: 'COBOL',         monacoId: 'cobol',      judge0: 77  },
      { id: 'octave',     label: 'Octave',        monacoId: 'matlab',     judge0: 66  },
      { id: 'bash',       label: 'Bash',          monacoId: 'shell',      judge0: 46  },
      { id: 'sql',        label: 'SQL',           monacoId: 'sql',        judge0: 82  },
    ]
  }
];

// Flat lookup
const LANG_MAP = {};
LANGUAGE_GROUPS.forEach(g => g.langs.forEach(l => { LANG_MAP[l.id] = l; }));

/* ── Default boilerplate per language ─────────────────────────── */
const BOILERPLATE = {
  java: `public class Solution {
    public int solution(int n) {
        // Write your solution here
        return 0;
    }
}`,
  python: `def solution(n):
    # Write your solution here
    return 0`,
  javascript: `function solution(n) {
    // Write your solution here
    return 0;
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int solution(int n) {
    // Write your solution here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your solution here
    return 0;
}`,
  csharp: `using System;

class Solution {
    public int Solve(int n) {
        // Write your solution here
        return 0;
    }
}`,
  go: `package main

import "fmt"

func solution(n int) int {
    // Write your solution here
    return 0
}

func main() {
    fmt.Println(solution(0))
}`,
  rust: `fn solution(n: i32) -> i32 {
    // Write your solution here
    0
}

fn main() {
    println!("{}", solution(0));
}`,
  kotlin: `fun solution(n: Int): Int {
    // Write your solution here
    return 0
}`,
  typescript: `function solution(n: number): number {
    // Write your solution here
    return 0;
}`,
  ruby: `def solution(n)
  # Write your solution here
  0
end`,
  php: `<?php
function solution($n) {
    // Write your solution here
    return 0;
}`,
  swift: `func solution(_ n: Int) -> Int {
    // Write your solution here
    return 0
}`,
  scala: `object Solution {
  def solution(n: Int): Int = {
    // Write your solution here
    0
  }
}`,
  python2: `def solution(n):
    # Write your solution here
    return 0`,
  bash: `#!/bin/bash
# Write your solution here
echo "Hello"`,
};

const getBoilerplate = (lang) => BOILERPLATE[lang] || `# Write your solution here`;

/* ── Simple Markdown renderer ─────────────────────────────────── */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  const inlineFormat = (str) => {
    const parts = [];
    let remaining = str;
    let key = 0;
    // Bold, italic, inline code
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) parts.push(<span key={key++}>{str.slice(last, match.index)}</span>);
      const token = match[0];
      if (token.startsWith('`'))   parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
      else if (token.startsWith('**')) parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
      else parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
      last = match.index + token.length;
    }
    if (last < str.length) parts.push(<span key={key++}>{str.slice(last)}</span>);
    return parts.length > 0 ? parts : str;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (/^### /.test(line)) {
      elements.push(<h3 key={i}>{inlineFormat(line.slice(4))}</h3>);
    } else if (/^## /.test(line)) {
      elements.push(<h2 key={i}>{inlineFormat(line.slice(3))}</h2>);
    } else if (/^# /.test(line)) {
      elements.push(<h1 key={i}>{inlineFormat(line.slice(2))}</h1>);
    } else if (/^```/.test(line)) {
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<pre key={i}><code>{codeLines.join('\n')}</code></pre>);
    } else if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    } else if (line.trim() === '') {
      // skip blank
    } else {
      elements.push(<p key={i}>{inlineFormat(line)}</p>);
    }
    i++;
  }
  return elements;
}

/* ── Custom Monaco Theme ──────────────────────────────────────── */
const registerTheme = (monaco) => {
  monaco.editor.defineTheme('brightcode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword',  foreground: 'f87171', fontStyle: 'bold' },
      { token: 'string',   foreground: '86efac' },
      { token: 'number',   foreground: 'fb923c' },
      { token: 'comment',  foreground: '4b5563', fontStyle: 'italic' },
      { token: 'type',     foreground: '60a5fa' },
      { token: 'function', foreground: '60a5fa' },
      { token: 'variable', foreground: 'f1f5f9' },
      { token: 'operator', foreground: 'fca5a5' },
      { token: 'class',    foreground: 'fbbf24', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background':                  '#0f0f0f',
      'editor.foreground':                  '#f1f5f9',
      'editorLineNumber.foreground':        '#374151',
      'editorLineNumber.activeForeground':  '#6b7280',
      'editor.lineHighlightBackground':     '#1a1a1a',
      'editor.selectionBackground':         '#371111',
      'editorCursor.foreground':            '#ef4444',
      'editorBracketMatch.background':      '#3b1111',
      'editorBracketMatch.border':          '#ef4444',
      'scrollbarSlider.background':         '#1f1f1f80',
      'scrollbarSlider.hoverBackground':    '#2a2a2a80',
    },
  });
};

/* ── Timer Ring ───────────────────────────────────────────────── */
const TimerRing = ({ timeLeft, totalTime }) => {
  const R = 15;
  const C = 2 * Math.PI * R;
  const fraction = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 0;
  const offset = C * (1 - fraction);
  const urgent = timeLeft < 120;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bce-timer">
      <div className="bce-timer-ring-wrap">
        <svg className="bce-timer-ring" viewBox="0 0 36 36">
          <circle className="bce-timer-ring-bg" cx="18" cy="18" r={R} />
          <circle
            className={`bce-timer-ring-progress ${urgent ? 'urgent' : ''}`}
            cx="18" cy="18" r={R}
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
      <span className={`bce-timer-text ${urgent ? 'urgent' : ''}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════════ */
const BattleCodeEditor = ({ room, user, socket, playerFinished, onEndContest }) => {
  const [questionIdx,       setQuestionIdx]       = useState(0);
  const [code,              setCode]              = useState('');
  const [lang,              setLang]              = useState('java');
  const [langDropOpen,      setLangDropOpen]      = useState(false);
  const [leftPct,           setLeftPct]           = useState(42);
  const [isDragging,        setIsDragging]        = useState(false);
  const [leftTab,           setLeftTab]           = useState('problem');
  const [consoleTab,        setConsoleTab]        = useState('testcase');
  const [consoleOpen,       setConsoleOpen]       = useState(true);
  const [consoleH,          setConsoleH]          = useState(250);
  const [isResizingConsole, setIsResizingConsole] = useState(false);

  const startConsoleResize = useCallback((e) => {
    e.preventDefault();
    setIsResizingConsole(true);
  }, []);

  useEffect(() => {
    if (!isResizingConsole) return;
    const onMove = (e) => {
      const newH = window.innerHeight - e.clientY;
      setConsoleH(Math.max(120, Math.min(650, newH)));
    };
    const onUp = () => setIsResizingConsole(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizingConsole]);
  const [activeTcIdx,       setActiveTcIdx]       = useState(0);
  const [tcInputs,          setTcInputs]          = useState([]);
  const [runResult,         setRunResult]         = useState(null);
  const [submitResult,      setSubmitResult]      = useState(null);
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [submitting,        setSubmitting]        = useState(false);
  const [running,           setRunning]           = useState(false);
  const [showEndConfirm,    setShowEndConfirm]    = useState(false);
  const [timeLeft,          setTimeLeft]          = useState(0);
  const [totalTime,         setTotalTime]         = useState(0);
  const [chatMessages,      setChatMessages]      = useState([]);
  const [lbPlayers,         setLbPlayers]         = useState([]);
  const [fontSize,          setFontSize]          = useState(14);
  const [copied,            setCopied]            = useState(false);
  const [isFullscreen,      setIsFullscreen]      = useState(false);
  const [wordWrap,          setWordWrap]          = useState('off');
  const [minimap,           setMinimap]           = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cursorPos,         setCursorPos]         = useState({ line: 1, col: 1 });

  const editorRef     = useRef(null);
  const bodyRef       = useRef(null);
  const langBtnRef    = useRef(null);
  const settingsRef   = useRef(null);

  /* Derived */
  const isFinished = playerFinished ||
    (Array.isArray(room?.finishedPlayers) && room.finishedPlayers.includes(user?.id));
  const currentQ     = room?.questions?.[questionIdx];
  const myPlayer     = room?.teams?.flatMap(t => t.players).find(p => p.id === user?.id);
  const myTeam       = room?.teams?.find(t => t.players.some(p => p.id === user?.id));
  const hasTeamChat  = room?.teamSize > 1;
  const finishedCnt  = Array.isArray(room?.finishedPlayers) ? room.finishedPlayers.length : 0;
  const totalPlayers = room?.teams?.reduce((s, t) => s + t.players.length, 0) || 0;
  const currentLang  = LANG_MAP[lang] || LANG_MAP.java;

  /* ── Monaco mount ─────────────────────────────────────────── */
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    registerTheme(monaco);
    monaco.editor.setTheme('brightcode-dark');
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleRun);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, handleSubmit);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote, () => setConsoleOpen(o => !o));
    
    // Cursor position listener for Status Bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.success('Code formatted');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  /* ── Timer ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!room?.endTime) return;
    const end   = new Date(room.endTime).getTime();
    const start = new Date(room.startTime || Date.now()).getTime();
    setTotalTime(Math.max(1, Math.floor((end - start) / 1000)));
    const update = () => setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [room?.endTime, room?.startTime]);

  /* ── Code persistence ─────────────────────────────────────── */
  useEffect(() => {
    if (!currentQ || !room?.id || !user?.id) return;
    const key   = `bce_${room.id}_${user.id}_${currentQ.id}_${lang}`;
    const saved = localStorage.getItem(key);
    setCode(saved || getBoilerplate(lang));
    setRunResult(null);
    setSubmitResult(null);
    setShowSubmitOverlay(false);
  }, [questionIdx, lang, room?.id, user?.id, currentQ?.id]);

  useEffect(() => {
    if (!currentQ || !code) return;
    const key = `bce_${room.id}_${user.id}_${currentQ.id}_${lang}`;
    const id  = setTimeout(() => localStorage.setItem(key, code), 800);
    return () => clearTimeout(id);
  }, [code, questionIdx, lang, room?.id, user?.id, currentQ?.id]);

  /* ── Init testcase inputs ─────────────────────────────────── */
  useEffect(() => {
    if (!currentQ?.testCases) { setTcInputs([]); return; }
    const visible = currentQ.testCases
      .filter(tc => tc.category === 'sample' || !tc.category)
      .slice(0, 3);
    setTcInputs(visible.map(tc => ({
      stdin:    Array.isArray(tc.input) ? tc.input.join('\n') : String(tc.input ?? ''),
      expected: String(tc.expected ?? ''),
    })));
    setActiveTcIdx(0);
  }, [questionIdx, currentQ?.id]);

  /* ── Leaderboard ──────────────────────────────────────────── */
  useEffect(() => {
    if (!room?.teams) return;
    const players = room.teams.flatMap(team =>
      team.players.map(p => ({
        ...p,
        teamName: team.name,
        score: room.scores?.[p.id] || p.score || 0,
        isMe: p.id === user?.id,
      }))
    ).sort((a, b) => b.score - a.score);
    setLbPlayers(players);
  }, [room?.scores, room?.teams, user?.id]);

  /* ── Socket events ────────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;
    const onChat = (data) => setChatMessages(prev => [...prev, data]);
    const onUpdate = (data) => {
      if (data.room?.scores && data.room?.teams) {
        const players = data.room.teams.flatMap(team =>
          team.players.map(p => ({
            ...p, teamName: team.name,
            score: data.room.scores[p.id] || p.score || 0,
            isMe: p.id === user?.id,
          }))
        ).sort((a, b) => b.score - a.score);
        setLbPlayers(players);
      }
    };
    socket.on('cw-team-chat', onChat);
    socket.on('cw-room-update', onUpdate);
    return () => { socket.off('cw-team-chat', onChat); socket.off('cw-room-update', onUpdate); };
  }, [socket, user?.id]);

  /* ── Close dropdowns on outside click ─────────────────────── */
  useEffect(() => {
    if (!langDropOpen && !showSettingsModal) return;
    const handler = (e) => {
      if (langBtnRef.current && !langBtnRef.current.contains(e.target)) {
        setLangDropOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettingsModal(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langDropOpen, showSettingsModal]);

  /* ── Drag resize ──────────────────────────────────────────── */
  const startDrag = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      setLeftPct(Math.max(25, Math.min(70, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  /* ── Question completion ──────────────────────────────────── */
  const isQCompleted = (qid) => {
    if (!room?.submissions || !user?.id) return false;
    return (room.submissions[user.id] || []).some(
      s => s.questionId === qid && s.result?.scoreData?.allPassed
    );
  };

  /* ── Run ──────────────────────────────────────────────────── */
  const handleRun = async () => {
    if (!code.trim() || isFinished) return;
    setRunning(true);
    setConsoleTab('result');
    setConsoleOpen(true);
    setRunResult(null);
    const stdin = tcInputs[activeTcIdx]?.stdin || '';
    try {
      const res = await axios.post(`${API_URL}/judge0/run`, {
        code, language: lang, stdin,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setRunResult({ ...res.data, stdin });
    } catch (err) {
      setRunResult({ stdout: '', stderr: err.response?.data?.stderr || err.message || 'Execution failed', executionTime: 0, memoryKb: 0, status: 'Error', exitCode: 1, stdin });
    } finally { setRunning(false); }
  };

  /* ── Submit ───────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!code.trim() || isFinished) { if (isFinished) toast.error('Contest already ended'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/code-wars/submit-solution`, {
        questionId: currentQ.id, code, language: lang,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = res.data;
      setSubmitResult(data);
      setShowSubmitOverlay(true);
      if (data.success) {
        toast.success(`✅ All tests passed! +${data.points} pts`);
        if (questionIdx < (room.questions?.length || 0) - 1) {
          setTimeout(() => { setShowSubmitOverlay(false); setQuestionIdx(i => i + 1); }, 2500);
        }
      } else if (data.partialCredit) {
        toast.success(`🟡 Partial: ${data.testsPassed}/${data.testsTotal} tests — +${data.points} pts`);
      } else {
        toast.error(`❌ Wrong Answer — ${data.testsPassed || 0}/${data.testsTotal || 0} passed`);
      }
    } catch (err) {
      toast.error(`Submission failed: ${err.response?.data?.error || err.message}`);
    } finally { setSubmitting(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const handleReset = () => { setCode(getBoilerplate(lang)); toast.success('Code reset to template'); };

  const handleSendChat = (msg) => {
    if (!socket || !myTeam || !msg.trim()) return;
    socket.emit('cw-team-chat', { roomId: room.id, teamId: myTeam.id, userId: user.id, username: user.username, message: msg.trim(), timestamp: Date.now() });
  };

  /* ── Render: Problem ──────────────────────────────────────── */
  const renderProblem = () => {
    if (!currentQ) return <div className="bce-loader"><Loader size={16} className="bce-spinning" /> Loading...</div>;

    const constraints = Array.isArray(currentQ.constraints)
      ? currentQ.constraints
      : typeof currentQ.constraints === 'string' ? [currentQ.constraints]
      : typeof currentQ.constraints === 'object' && currentQ.constraints ? Object.values(currentQ.constraints).map(String)
      : [];

    const examples = Array.isArray(currentQ.examples) ? currentQ.examples : [];
    const descText = currentQ.description || '';
    const hasExamplesInDesc = /###\s*Examples?|Example\s*\d+:/i.test(descText);

    return (
      <>
        <div className="bce-problem-header">
          <h2 className="bce-problem-title">{currentQ.title}</h2>
          <div className="bce-problem-meta">
            <span className={`bce-diff-badge ${(currentQ.difficulty || 'medium').toLowerCase()}`}>
              {currentQ.difficulty || 'Medium'}
            </span>
            <span className="bce-pts-chip"><Star size={10} /> {currentQ.points || 100} pts</span>
            {currentQ.source && <span className="bce-src-chip">{currentQ.source}</span>}
          </div>
        </div>

        <div className="bce-md">{renderMarkdown(descText)}</div>

        {!hasExamplesInDesc && examples.length > 0 && (
          <>
            <div className="bce-section-title">Examples</div>
            {examples.map((ex, i) => (
              <div key={i} className="bce-example">
                <div className="bce-example-label">Example {i + 1}</div>
                <div className="bce-io-row">
                  <span className="bce-io-label">Input:</span>
                  <span className="bce-io-val">{String(ex.input ?? '')}</span>
                </div>
                <div className="bce-io-row">
                  <span className="bce-io-label">Output:</span>
                  <span className="bce-io-val">{String(ex.output ?? '')}</span>
                </div>
                {ex.explanation && (
                  <div className="bce-example-explanation"><strong>Explanation:</strong> {ex.explanation}</div>
                )}
              </div>
            ))}
          </>
        )}

        {constraints.length > 0 && (
          <>
            <div className="bce-section-title">Constraints</div>
            <ul className="bce-constraints">
              {constraints.map((c, i) => <li key={i}>{typeof c === 'object' ? JSON.stringify(c) : String(c)}</li>)}
            </ul>
          </>
        )}
      </>
    );
  };

  /* ── Render: Leaderboard ──────────────────────────────────── */
  const renderLeaderboard = () => {
    const maxScore = lbPlayers[0]?.score || 1;
    return (
      <div className="bce-leaderboard">
        <div className="bce-lb-title">Live Standings</div>
        {lbPlayers.map((p, i) => (
          <div key={p.id} className={`bce-lb-card ${p.isMe ? 'me' : ''}`}>
            <div className="bce-lb-rank">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>
            <div className="bce-lb-avatar">{(p.username || '?').charAt(0).toUpperCase()}</div>
            <div className="bce-lb-info">
              <div className="bce-lb-name">{p.username}{p.isMe ? ' (you)' : ''}</div>
              <div className="bce-lb-team">{p.teamName}</div>
              <div className="bce-lb-progress">
                <div className="bce-lb-bar" style={{ width: `${Math.min(100, (p.score / Math.max(maxScore, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="bce-lb-pts">{p.score} pts</div>
          </div>
        ))}
        {lbPlayers.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            No players yet
          </div>
        )}
      </div>
    );
  };

  /* ── Render: Console Testcase ─────────────────────────────── */
  const renderTestcaseTab = () => (
    <div className="bce-testcase-panel">
      <div className="bce-tc-sidebar">
        {tcInputs.map((tc, i) => (
          <button key={i} className={`bce-tc-btn ${activeTcIdx === i ? 'active' : ''}`} onClick={() => setActiveTcIdx(i)}>
            <span className={`bce-tc-dot ${runResult?.perCase?.[i]?.passed === true ? 'pass' : runResult?.perCase?.[i]?.passed === false ? 'fail' : ''}`} />
            Case {i + 1}
          </button>
        ))}
        {tcInputs.length === 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: '8px 4px' }}>No cases</div>
        )}
      </div>
      <div className="bce-tc-main">
        {tcInputs[activeTcIdx] !== undefined ? (
          <>
            <div className="bce-tc-field">
              <label>stdin</label>
              <textarea rows={3} value={tcInputs[activeTcIdx].stdin}
                onChange={(e) => { const u = [...tcInputs]; u[activeTcIdx] = { ...u[activeTcIdx], stdin: e.target.value }; setTcInputs(u); }}
                placeholder="Custom input..." />
            </div>
            {tcInputs[activeTcIdx].expected && (
              <div className="bce-tc-field">
                <label>expected output</label>
                <input type="text" value={tcInputs[activeTcIdx].expected}
                  onChange={(e) => { const u = [...tcInputs]; u[activeTcIdx] = { ...u[activeTcIdx], expected: e.target.value }; setTcInputs(u); }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', paddingTop: 12 }}>
            Edit stdin above and click ▶ Run.
          </div>
        )}
      </div>
    </div>
  );

  /* ── Render: Console Result ───────────────────────────────── */
  const renderResultTab = () => {
    if (running) return (
      <div className="bce-result-panel">
        <div className="bce-result-header">
          <div className="bce-result-status running"><Loader size={13} className="bce-spinning" /> Running via Judge0 Engine...</div>
        </div>
      </div>
    );

    if (!runResult) return (
      <div className="bce-result-panel" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
          Hit <strong style={{ color: 'rgba(255,255,255,0.6)' }}>▶ Run</strong> to evaluate code & complexity.
        </span>
      </div>
    );

    const comp = runResult.complexity;

    return (
      <div className="bce-result-panel">
        <div className="bce-result-header">
          <div className={`bce-result-status ${runResult.stderr ? 'error' : 'accepted'}`}>
            {runResult.stderr ? <><AlertCircle size={13} /> Runtime Error</> : <><CheckCircle size={13} /> {runResult.status || 'Executed'}</>}
          </div>
          <div className="bce-result-meta">
            {runResult.executionTime > 0 && <span className="bce-meta-chip"><Clock size={10} /> <span>{runResult.executionTime} ms</span></span>}
            {runResult.memoryKb > 0 && <span className="bce-meta-chip"><Database size={10} /> <span>{(runResult.memoryKb / 1024).toFixed(1)} MB</span></span>}
          </div>
        </div>

        {comp && (
          <div className="bce-complexity-card-grid">
            <div className="bce-comp-card">
              <div className="bce-comp-label">Time Complexity</div>
              <div className="bce-comp-val">{comp.timeComplexity}</div>
              <div className="bce-comp-expl">{comp.timeExplanation}</div>
            </div>
            <div className="bce-comp-card">
              <div className="bce-comp-label">Space Complexity</div>
              <div className="bce-comp-val">{comp.spaceComplexity}</div>
              <div className="bce-comp-expl">{comp.spaceExplanation}</div>
            </div>
          </div>
        )}

        {comp?.optimizationHint && (
          <div className="bce-comp-hint">
            <Sparkles size={13} style={{ color: 'var(--primary, #ef4444)', flexShrink: 0 }} />
            <span>{comp.optimizationHint}</span>
          </div>
        )}

        {runResult.stdin  && <><div className="bce-result-label">stdin</div><div className="bce-result-output">{runResult.stdin}</div></>}
        {runResult.stdout && <><div className="bce-result-label">stdout</div><div className="bce-result-output">{runResult.stdout}</div></>}
        {runResult.stderr && <><div className="bce-result-label stderr-label">⚠ stderr / error</div><div className="bce-result-output stderr">{runResult.stderr}</div></>}
        {!runResult.stdout && !runResult.stderr && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>(no output produced)</div>}
      </div>
    );
  };

  /* ── Render: Submission Overlay ───────────────────────────── */
  const renderSubmitOverlay = () => {
    if (!showSubmitOverlay || !submitResult) return null;
    const verdict = submitResult.success ? 'accepted' : submitResult.partialCredit ? 'partial' : 'wrong';
    const cats = submitResult.passedByCategory || {};
    const totals = submitResult.totalByCategory || {};
    const hasNext = questionIdx < (room?.questions?.length || 0) - 1;
    const catLabels = { sample: 'Sample', hidden: 'Hidden', edge: 'Edge', stress: 'Stress', random: 'Random' };

    return (
      <div className="bce-submit-overlay">
        <div className={`bce-submit-card ${verdict}`}>
          <button className="bce-submit-close" onClick={() => setShowSubmitOverlay(false)}><X size={15} /></button>
          <div className="bce-submit-banner">
            <div className={`bce-submit-icon ${verdict}`}>
              {verdict === 'accepted' ? <CheckCircle size={28} /> : verdict === 'partial' ? <AlertCircle size={28} /> : <XCircle size={28} />}
            </div>
            <h2 className={`bce-submit-verdict ${verdict}`}>
              {verdict === 'accepted' ? '✅ Accepted' : verdict === 'partial' ? '🟡 Partial Credit' : '❌ Wrong Answer'}
            </h2>
            <p className="bce-submit-sub">
              {verdict === 'accepted' ? 'All test cases passed!' : `${submitResult.testsPassed || 0} / ${submitResult.testsTotal || 0} test cases passed`}
            </p>
          </div>
          <div className="bce-submit-stats">
            <div className="bce-stat-box"><div className="bce-stat-val">{submitResult.points || 0}</div><div className="bce-stat-lbl">Points</div></div>
            <div className="bce-stat-box"><div className="bce-stat-val">{submitResult.scorePercentage || 0}%</div><div className="bce-stat-lbl">Score</div></div>
            <div className="bce-stat-box"><div className="bce-stat-val">{submitResult.testsPassed || 0}/{submitResult.testsTotal || 0}</div><div className="bce-stat-lbl">Tests</div></div>
          </div>
          <div className="bce-overall-bar">
            <div className="bce-overall-bar-head"><span>Overall Progress</span><span style={{ color: '#fff', fontWeight: 700 }}>{submitResult.scorePercentage || 0}%</span></div>
            <div className="bce-overall-bar-track">
              <div className={`bce-overall-bar-fill ${verdict}`} style={{ width: `${submitResult.scorePercentage || 0}%` }} />
            </div>
          </div>
          {submitResult.complexity && (
            <div className="bce-complexity-card-grid">
              <div className="bce-comp-card">
                <div className="bce-comp-label">Time Complexity</div>
                <div className="bce-comp-val">{submitResult.complexity.timeComplexity}</div>
                <div className="bce-comp-expl">{submitResult.complexity.timeExplanation}</div>
              </div>
              <div className="bce-comp-card">
                <div className="bce-comp-label">Space Complexity</div>
                <div className="bce-comp-val">{submitResult.complexity.spaceComplexity}</div>
                <div className="bce-comp-expl">{submitResult.complexity.spaceExplanation}</div>
              </div>
            </div>
          )}

          {submitResult.complexity?.optimizationHint && (
            <div className="bce-comp-hint" style={{ marginBottom: 12 }}>
              <Sparkles size={13} style={{ color: 'var(--primary, #ef4444)', flexShrink: 0 }} />
              <span>{submitResult.complexity.optimizationHint}</span>
            </div>
          )}

          {Object.keys(cats).length > 0 && (
            <div className="bce-cat-grid">
              {Object.entries(cats).map(([cat, passed]) => {
                const total = totals[cat] || 0;
                const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
                const cls = passed === total ? 'full' : passed > 0 ? 'partial' : 'zero';
                return (
                  <div key={cat} className="bce-cat-card">
                    <div className="bce-cat-head">
                      <span className="bce-cat-name">{catLabels[cat] || cat}</span>
                      <span className={`bce-cat-score ${cls}`}>{passed}/{total}</span>
                    </div>
                    <div className="bce-cat-bar-bg"><div className={`bce-cat-bar-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="bce-submit-actions">
            <button className="bce-submit-dismiss" onClick={() => setShowSubmitOverlay(false)}>Close</button>
            {hasNext && verdict === 'accepted' && (
              <button className="bce-submit-next" onClick={() => { setShowSubmitOverlay(false); setQuestionIdx(i => i + 1); }}>
                Next Question <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════
     JSX
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="bce-shell">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <div className="bce-navbar">
        <div className="bce-nav-left">
          <div className="bce-room-badge"><Swords size={16} /> {room?.name || 'Battle Room'}</div>
        </div>

        <div className="bce-nav-center">
          {(room?.questions || []).map((q, i) => {
            const done = isQCompleted(q.id);
            return (
              <button key={q.id}
                className={`bce-q-tab ${i === questionIdx ? 'active' : ''} ${done ? 'completed' : ''}`}
                onClick={() => !isFinished && setQuestionIdx(i)}
                disabled={isFinished}
                title={q.title}
              >
                {i + 1}
                {done && <span className="bce-q-check"><Check size={6} /></span>}
              </button>
            );
          })}
        </div>

        <div className="bce-nav-right">
          <TimerRing timeLeft={timeLeft} totalTime={totalTime} />
          <div className="bce-score-chip"><Trophy size={13} /> {myPlayer?.score || 0} pts</div>
          <button className="bce-end-btn" onClick={() => setShowEndConfirm(true)}>
            <LogOut size={13} /> End
          </button>
        </div>
      </div>

      {/* Finished banner */}
      {isFinished && (
        <div className="bce-finished-banner">
          <CheckCircle size={15} />
          Contest Ended — Score: {myPlayer?.score || 0} pts
          <span className="bce-wait">· Waiting ({finishedCnt}/{totalPlayers})</span>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="bce-body" ref={bodyRef} style={{ userSelect: isDragging ? 'none' : 'auto' }}>

        {/* LEFT PANEL */}
        <div className="bce-left" style={{ width: `${leftPct}%` }}>
          <div className="bce-left-tabs">
            <button className={`bce-ltab ${leftTab === 'problem' ? 'active' : ''}`} onClick={() => setLeftTab('problem')}>
              <Code2 size={12} /> Description
            </button>
            <button className={`bce-ltab ${leftTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setLeftTab('leaderboard')}>
              <BarChart2 size={12} /> Rankings
            </button>
            {hasTeamChat && (
              <button className={`bce-ltab ${leftTab === 'chat' ? 'active' : ''}`} onClick={() => setLeftTab('chat')}>
                <MessageSquare size={12} /> Team Chat
              </button>
            )}
          </div>

          {leftTab === 'problem'      && <div className="bce-left-content">{renderProblem()}</div>}
          {leftTab === 'leaderboard'  && <div className="bce-left-content">{renderLeaderboard()}</div>}
          {leftTab === 'chat'         && <div className="bce-chat-wrap"><ChatPanel socket={socket} roomId={`team_${room.id}_${myTeam?.id}`} user={user} title={`${myTeam?.name || 'Team'} Chat`} messages={chatMessages} onSend={handleSendChat} /></div>}
        </div>

        {/* DRAG HANDLE */}
        <div className={`bce-drag ${isDragging ? 'dragging' : ''}`} onMouseDown={startDrag} />

        {/* RIGHT PANEL */}
        <div className="bce-right">

          {/* Toolbar */}
          <div className="bce-toolbar">
            <div className="bce-toolbar-left">

              {/* Language selector with full dropdown */}
              <div className="bce-lang-wrap" ref={langBtnRef}>
                <button className="bce-lang-btn" onClick={() => setLangDropOpen(o => !o)} disabled={isFinished}>
                  <Code size={13} style={{ color: 'var(--primary, #ef4444)' }} />
                  {currentLang.label}
                  <span className="bce-lang-arrow">{langDropOpen ? '▴' : '▾'}</span>
                </button>

                {langDropOpen && (
                  <div className="bce-lang-dropdown">
                    {LANGUAGE_GROUPS.map(group => (
                      <div key={group.group}>
                        <div className="bce-lang-group-label">{group.group}</div>
                        {group.langs.map(l => (
                          <div
                            key={l.id}
                            className={`bce-lang-option ${lang === l.id ? 'active' : ''}`}
                            onClick={() => { setLang(l.id); setLangDropOpen(false); }}
                          >
                            {l.label}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bce-toolbar-right">
              <button className="bce-tool-btn icon-only" title="Auto-format code (Indent)" onClick={handleFormatCode}>
                <Wand2 size={12} />
              </button>
              <button className="bce-tool-btn icon-only" title="Reset code template" onClick={handleReset}>
                <RotateCcw size={12} />
              </button>
              <button className="bce-tool-btn icon-only" title="Copy code" onClick={handleCopy}>
                {copied ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
              </button>
              <button className="bce-tool-btn icon-only" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"} onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>

              <div className="bce-lang-wrap" ref={settingsRef}>
                <button className={`bce-tool-btn icon-only ${showSettingsModal ? 'active' : ''}`} title="Editor Settings" onClick={() => setShowSettingsModal(s => !s)}>
                  <Settings size={12} />
                </button>

                {showSettingsModal && (
                  <div className="bce-settings-dropdown">
                    <div className="bce-settings-row">
                      <span>Word Wrap</span>
                      <button className={`bce-settings-toggle ${wordWrap === 'on' ? 'on' : ''}`} onClick={() => setWordWrap(w => w === 'on' ? 'off' : 'on')}>
                        {wordWrap === 'on' ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="bce-settings-row">
                      <span>Minimap</span>
                      <button className={`bce-settings-toggle ${minimap ? 'on' : ''}`} onClick={() => setMinimap(m => !m)}>
                        {minimap ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="bce-settings-row">
                      <span>Font Size</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button className="bce-tool-btn" onClick={() => setFontSize(f => Math.max(10, f - 1))}>−</button>
                        <span style={{ fontSize: 11, fontFamily: 'monospace' }}>{fontSize}px</span>
                        <button className="bce-tool-btn" onClick={() => setFontSize(f => Math.min(22, f + 1))}>+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className={`bce-tool-btn ${consoleOpen ? 'active' : ''}`} title="Toggle console (Ctrl + `)" onClick={() => setConsoleOpen(o => !o)}>
                <Terminal size={12} /> Console {consoleOpen ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="bce-editor-wrap">
            <Editor
              height="100%"
              language={currentLang.monacoId}
              theme="brightcode-dark"
              value={code}
              onChange={val => setCode(val || '')}
              onMount={handleEditorMount}
              options={{
                fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: minimap },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: 'on',
                padding: { top: 14, bottom: 14 },
                readOnly: isFinished,
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                folding: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: 'gutter',
                wordWrap,
                quickSuggestions: true,
              }}
            />

            {/* Editor Status Bar */}
            <div className="bce-status-bar">
              <span className="bce-status-item">Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span className="bce-status-item">{code.length} chars</span>
              <span className="bce-status-item" style={{ color: 'var(--primary, #ef4444)', fontWeight: 600 }}>{currentLang.label}</span>
            </div>
          </div>

          {/* Console Panel */}
          <div className={`bce-console ${consoleOpen ? '' : 'collapsed'}`} style={consoleOpen ? { height: consoleH } : {}}>
            {consoleOpen && (
              <div
                className={`bce-console-resizer ${isResizingConsole ? 'resizing' : ''}`}
                onMouseDown={startConsoleResize}
                title="Drag to resize console height"
              />
            )}
            <div className="bce-console-tabs">
              <button className={`bce-console-tab ${consoleTab === 'testcase' ? 'active' : ''}`}
                onClick={() => { setConsoleTab('testcase'); setConsoleOpen(true); }}>
                <FlaskConical size={12} /> Testcase
              </button>
              <button className={`bce-console-tab ${consoleTab === 'result' ? 'active' : ''}`}
                onClick={() => { setConsoleTab('result'); setConsoleOpen(true); }}>
                <Terminal size={12} /> Result
                {runResult && !running && (
                  <span style={{ marginLeft: 4, width: 6, height: 6, borderRadius: '50%', background: runResult.stderr ? '#f59e0b' : '#22c55e', display: 'inline-block' }} />
                )}
              </button>
              <button className="bce-console-toggle" onClick={() => setConsoleOpen(o => !o)}>
                {consoleOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
            </div>
            {consoleOpen && (
              <div className="bce-console-body">
                {consoleTab === 'testcase' ? renderTestcaseTab() : renderResultTab()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bce-footer">
            <div className="bce-footer-left">
              <button className="bce-nav-btn"
                onClick={() => { setQuestionIdx(i => i - 1); setRunResult(null); }}
                disabled={isFinished || questionIdx === 0}>
                <ArrowLeft size={12} /> Prev
              </button>
            </div>
            <div className="bce-footer-center">
              <button className="bce-run-btn" onClick={handleRun}
                disabled={running || submitting || !code.trim() || isFinished}>
                {running ? <><Loader size={13} className="bce-spinning" /> Running...</> : <><Play size={13} /> Run</>}
              </button>
              <button className="bce-submit-btn" onClick={handleSubmit}
                disabled={submitting || running || !code.trim() || isFinished}>
                {submitting ? <><Loader size={13} className="bce-spinning" /> Submitting...</> : <><CheckCircle size={13} /> Submit</>}
              </button>
            </div>
            <div className="bce-footer-right">
              <button className="bce-nav-btn"
                onClick={() => { setQuestionIdx(i => i + 1); setRunResult(null); }}
                disabled={isFinished || questionIdx >= (room?.questions?.length || 0) - 1}>
                Next <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Overlay */}
      {renderSubmitOverlay()}

      {/* End Confirm */}
      {showEndConfirm && (
        <div className="bce-confirm-overlay">
          <div className="bce-confirm-card">
            <h3 className="bce-confirm-title">End Contest?</h3>
            <p className="bce-confirm-text">
              This will end your session. You cannot resume.<br />
              Your score so far: <strong style={{ color: '#ef4444' }}>{myPlayer?.score || 0} points</strong>.
            </p>
            <div className="bce-confirm-actions">
              <button className="bce-confirm-cancel" onClick={() => setShowEndConfirm(false)}>Cancel</button>
              <button className="bce-confirm-end" onClick={() => { setShowEndConfirm(false); onEndContest(); }}>End Contest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleCodeEditor;
