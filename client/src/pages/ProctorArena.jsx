import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Shield, Camera, Lock, Mic, MicOff, VideoOff, Video,
    Clock, AlertTriangle, CheckCircle, XCircle, Play,
    Users, ChevronRight, ChevronLeft, Monitor, MonitorOff,
    Eye, Maximize, Code2, Send, Crown, User, BookOpen,
    ChevronDown, ChevronUp, Search, Filter, X, Zap
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import Editor from '@monaco-editor/react';
import ProctorHub from '../components/ProctorHub';
import './ProctorArena.css';

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const MODE_META = {
    INTERVIEW:  { label: 'Technical Interview', color: '#3b82f6' },
    ASSESSMENT: { label: 'Coding Assessment',   color: '#f59e0b' },
    EXAM:       { label: 'Proctored Exam',       color: '#ef4444' },
};

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go'];

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

// All 24 question files — loaded client-side via fetch
const QUESTION_FILES = [
    'array_reverse.json', 'min_max_in_array.json', 'kth_smallest_full.json',
    'sort_0s_1s_2s_full.json', 'union_of_arrays_with_duplicates_full.json',
    'rotate_array_by_one_full.json', 'kadanes_algorithm_full.json',
    'minimize_heights_ii_full.json', 'minimum_jumps_full.json',
    'find_duplicate_number_full.json', 'merge_intervals_full.json',
    'next_permutation_full.json', 'count_inversions_full.json',
    'best_time_to_buy_sell_stock_full.json', 'two_sum_pairs_with_0_sum_full.json',
    'common_in_3_sorted_arrays_full.json', 'alternate_positive_negative_full.json',
    'subarray_with_0_sum_full.json', 'factorials_of_large_numbers_full.json',
    'median_of_an_array_full.json', 'array_with_all_palindromes_full.json',
    'trapping_rain_water_full.json', 'longest_consecutive_subsequence_full.json',
    'maximum_product_subarray_full.json',
];

/* ─────────────────────────────────────────────────────────
   VideoTile — self-contained video element
───────────────────────────────────────────────────────── */
const VideoTile = ({ stream, muted = false, label, className, noStreamText = 'No feed' }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.srcObject = stream || null;
        if (stream) ref.current.play().catch(() => {});
    }, [stream]);

    return (
        <div className={`pa-video-tile ${className || ''}`}>
            <video ref={ref} autoPlay playsInline muted={muted} />
            {!stream && (
                <div className="pa-video-no-stream">
                    <VideoOff size={22} />
                    <span>{noStreamText}</span>
                </div>
            )}
            {label && <div className="pa-video-label">{label}</div>}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const ProctorArena = () => {
    const { user }      = useAuth();
    const navigate      = useNavigate();
    const { sessionId } = useParams();

    /* ── Core ── */
    const [sessionState,   setSessionState]   = useState('loading');
    const [currentSession, setCurrentSession] = useState(null);
    const socketRef = useRef(null);

    /* ── Role ── */
    const [isAdmin, setIsAdmin] = useState(false);

    /* ── Proctoring ── */
    const [violations,     setViolations]     = useState([]);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const tabCountRef      = useRef(0);
    const [isTabFocused,   setIsTabFocused]   = useState(true);
    const [isFullscreen,   setIsFullscreen]   = useState(false);
    const [showViolModal,  setShowViolModal]  = useState(false);
    const [violDetails,    setViolDetails]    = useState(null);

    /* ── Media — local ── */
    const [localCamStream,    setLocalCamStream]    = useState(null);
    const [localScreenStream, setLocalScreenStream] = useState(null);
    const [camEnabled,        setCamEnabled]        = useState(false);
    const [micEnabled,        setMicEnabled]        = useState(false);
    const [screenSharing,     setScreenSharing]     = useState(false);
    const [setupStep,         setSetupStep]         = useState(0); // 0=cam 1=fullscreen 2=ready

    /* ── Media — remote peers ── */
    // peerStreams[userId] = { camera: MediaStream|null, screen: MediaStream|null, username }
    const [peerStreams, setPeerStreams] = useState({});
    // peerConns[userId_streamType] = RTCPeerConnection
    const peerConns = useRef({});
    // track which (userId, streamType) we've already initiated an offer for
    const pendingOffers = useRef(new Set());

    /* ── Questions ── */
    const [questionBank,    setQuestionBank]    = useState([]);   // admin: all 24 loaded
    const [qBankLoading,    setQBankLoading]    = useState(false);
    const [qSearch,         setQSearch]         = useState('');
    const [qDiffFilter,     setQDiffFilter]     = useState('all');
    const [showQPanel,      setShowQPanel]      = useState(false);
    const [activeQuestion,  setActiveQuestion]  = useState(null); // currently pushed question

    /* ── Candidate editor ── */
    const [questions,      setQuestions]      = useState([]);
    const [qIdx,           setQIdx]           = useState(0);
    const [code,           setCode]           = useState('// Start coding here\n');
    const [language,       setLanguage]       = useState('javascript');

    /* ── Timer ── */
    const [timeRemaining,  setTimeRemaining]  = useState(0);
    const [timerActive,    setTimerActive]    = useState(false);

    /* ── Admin participant tracking ── */
    const [participants,    setParticipants]    = useState([]);
    const [participantData, setParticipantData] = useState({});
    const [watchingUserId,  setWatchingUserId]  = useState(null);
    const [watchTab,        setWatchTab]        = useState('editor'); // 'editor'|'camera'|'screen'

    /* ── Chat ── */
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput,    setChatInput]    = useState('');
    const [showChat,     setShowChat]     = useState(false);
    const chatEndRef = useRef(null);

    /* ─────────────────────────────────────────────────────
       INIT
    ───────────────────────────────────────────────────── */
    useEffect(() => {
        if (!user)      { navigate('/auth'); return; }
        if (!sessionId) return;
        initSession();
        // proctoring listeners are set up after role is known — see useEffect below
        return () => { cleanup(); };
    }, [user, sessionId]);

    // Set up proctoring only once role is resolved and only for candidates
    useEffect(() => {
        if (!currentSession) return; // not loaded yet
        if (isAdmin) return;         // admin is never restricted
        const cleanup = setupProctoring();
        return cleanup;
    }, [isAdmin, currentSession]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const initSession = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/proctor/session/${sessionId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const s = data.session;
            setCurrentSession(s);
            setQuestions(s.questions || []);
            setTimeRemaining(s.timeLimit || 3600);

            const admin = s.creatorId === user.id || s.interviewerId === user.id;
            setIsAdmin(admin);

            const sock = initSocket();
            socketRef.current = sock;

            sock.emit('join-proctor-session', {
                sessionId,
                userId:   user.id,
                username: user.username,
                role:     admin ? 'admin' : 'candidate',
            });

            /* ── Socket events ── */
            sock.on('session-updated',  d => setCurrentSession(d.session));
            sock.on('session-ended',    () => setSessionState('completed'));

            sock.on('session-state', d => {
                if (d.activeQuestion) setActiveQuestion(d.activeQuestion);
            });

            sock.on('participant-joined', d => {
                const p = d.participant;
                setParticipants(prev => prev.find(x => x.id === (p.id || p.userId)) ? prev
                    : [...prev, { id: p.id || p.userId, username: p.username || 'Unknown', role: p.role || 'candidate' }]);
                setParticipantData(prev => ({
                    ...prev,
                    [p.id || p.userId]: {
                        username: p.username || 'Unknown',
                        code: '// Waiting…\n', language: 'javascript',
                        violations: [], isActive: true,
                    }
                }));
            });

            sock.on('participant-left', d => {
                setParticipants(prev => prev.filter(x => x.id !== d.participantId));
                setParticipantData(prev => {
                    const next = { ...prev };
                    if (next[d.participantId]) next[d.participantId].isActive = false;
                    return next;
                });
            });

            // Live code from candidate → admin
            sock.on('candidate-code-update', d => {
                if (!admin) return;
                setParticipantData(prev => ({
                    ...prev,
                    [d.userId]: { ...(prev[d.userId] || {}), code: d.code, language: d.language }
                }));
            });

            // Violation
            sock.on('violation-detected', d => {
                if (!admin) return;
                toast.error(`⚠️ ${d.participantUsername || d.violation?.userId || 'Candidate'}: ${d.violation.description}`);
                setParticipantData(prev => ({
                    ...prev,
                    [d.participantId || d.userId]: {
                        ...(prev[d.participantId || d.userId] || {}),
                        violations: [...(prev[d.participantId || d.userId]?.violations || []), d.violation],
                    }
                }));
            });

            /* ── Question push / clear ── */
            sock.on('proctor-question-pushed', d => {
                setActiveQuestion(d.question);
                if (!admin) toast.success(`📋 New question: ${d.question?.name}`);
            });
            sock.on('proctor-question-cleared', () => setActiveQuestion(null));

            /* ── WebRTC new-style signals ── */
            sock.on('proctor-webrtc-offer',   d => handleIncomingOffer(d, sock));
            sock.on('proctor-webrtc-answer',  d => handleIncomingAnswer(d));
            sock.on('proctor-webrtc-ice',     d => handleIncomingIce(d));

            // A peer just started a stream — we need to send them an offer
            sock.on('proctor-stream-ready', d => {
                if (d.userId === user.id) return; // own echo
                initiateOffer(d.userId, d.streamType, sock);
            });

            sock.on('proctor-stream-ended', d => {
                setPeerStreams(prev => {
                    const next = { ...prev };
                    if (next[d.userId]) {
                        next[d.userId] = { ...next[d.userId], [d.streamType]: null };
                    }
                    return next;
                });
            });

            /* ── Chat ── */
            sock.on('chat-message', d => {
                setChatMessages(prev => [...prev, d.message]);
            });

            const stateMap = { created:'lobby', lobby:'lobby', active:'active', paused:'active', completed:'completed', terminated:'completed' };
            setSessionState(stateMap[s.status] || 'lobby');
            if (admin) {
                setSessionState(s.status === 'active' ? 'active' : (s.status === 'completed' || s.status === 'terminated') ? 'completed' : 'lobby');
                loadQuestionBank();
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to load session');
            navigate('/proctor');
        }
    };

    /* ─────────────────────────────────────────────────────
       LOAD 24 QUESTIONS FOR ADMIN PANEL
    ───────────────────────────────────────────────────── */
    const loadQuestionBank = async () => {
        setQBankLoading(true);
        const loaded = [];
        await Promise.allSettled(
            QUESTION_FILES.map(async file => {
                try {
                    const r = await fetch(`/data/${file}`);
                    if (!r.ok) return;
                    const q = await r.json();
                    loaded.push({ ...q, _file: file });
                } catch {}
            })
        );
        // sort by difficulty
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        loaded.sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1));
        setQuestionBank(loaded);
        setQBankLoading(false);
    };

    /* ─────────────────────────────────────────────────────
       QUESTION PUSH
    ───────────────────────────────────────────────────── */
    const pushQuestion = (q) => {
        socketRef.current?.emit('proctor-push-question', { sessionId, question: q });
        setShowQPanel(false);
        toast.success(`Pushed: ${q.name}`);
    };

    const clearQuestion = () => {
        socketRef.current?.emit('proctor-clear-question', { sessionId });
    };

    /* ─────────────────────────────────────────────────────
       PROCTORING SETUP — candidates only
    ───────────────────────────────────────────────────── */
    const setupProctoring = () => {
        // Admin is the interviewer — no restrictions apply to them
        if (isAdmin) return;

        const onVis  = () => { setIsTabFocused(!document.hidden); if (document.hidden) recordViolation('TAB_SWITCH', 'Switched tabs'); };
        const onFS   = () => { const fs = !!document.fullscreenElement; setIsFullscreen(fs); if (!fs) recordViolation('FULLSCREEN_EXIT', 'Exited fullscreen'); };
        const onKey  = (e) => {
            const blocked = ((e.ctrlKey||e.metaKey) && ['t','n','w','r'].includes(e.key.toLowerCase()))
                || ['F12','F5'].includes(e.key) || (e.altKey && e.key==='Tab');
            if (blocked) { e.preventDefault(); recordViolation('SHORTCUT_ATTEMPT', `Blocked: ${e.key}`); }
        };
        const onCtx = (e) => e.preventDefault();
        document.addEventListener('visibilitychange', onVis);
        document.addEventListener('fullscreenchange', onFS);
        document.addEventListener('keydown', onKey);
        document.addEventListener('contextmenu', onCtx);
        return () => {
            document.removeEventListener('visibilitychange', onVis);
            document.removeEventListener('fullscreenchange', onFS);
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('contextmenu', onCtx);
        };
    };

    const recordViolation = useCallback((type, description) => {
        if (isAdmin) return; // admin is never violated
        const v = { id: Date.now(), type, description, timestamp: new Date().toISOString(),
            severity: ['FULLSCREEN_EXIT','MULTIPLE_TABS'].includes(type) ? 'HIGH' : 'MEDIUM' };
        setViolations(prev => [...prev, v]);
        if (type === 'TAB_SWITCH') { tabCountRef.current += 1; setTabSwitchCount(tabCountRef.current); }
        socketRef.current?.emit('violation-reported', { sessionId, violation: v, userId: user?.id, username: user?.username });
        if (v.severity === 'HIGH' || tabCountRef.current >= 3) {
            setViolDetails(v); setShowViolModal(true);
            if (tabCountRef.current >= 3) setTimeout(() => endSession('VIOLATIONS'), 3000);
        } else {
            toast.error(`⚠️ ${description}`, { duration: 3000 });
        }
    }, [sessionId, user, isAdmin]);

    /* ─────────────────────────────────────────────────────
       MEDIA — CAMERA + MIC
    ───────────────────────────────────────────────────── */
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalCamStream(stream);
            setCamEnabled(true);
            setMicEnabled(true);
            setSetupStep(1);
            toast.success('Camera & mic ready');
            // tell peers we have a camera stream
            socketRef.current?.emit('proctor-stream-ready', { sessionId, streamType: 'camera', username: user.username });
        } catch {
            toast.error('Camera/mic access denied');
        }
    };

    const toggleMic = () => {
        if (!localCamStream) return;
        localCamStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setMicEnabled(prev => !prev);
    };

    const toggleCam = () => {
        if (!localCamStream) return;
        localCamStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setCamEnabled(prev => !prev);
    };

    /* ─────────────────────────────────────────────────────
       MEDIA — SCREEN SHARE
    ───────────────────────────────────────────────────── */
    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setLocalScreenStream(stream);
            setScreenSharing(true);
            toast.success('Screen sharing started');
            socketRef.current?.emit('proctor-stream-ready', { sessionId, streamType: 'screen', username: user.username });
            stream.getVideoTracks()[0].addEventListener('ended', stopScreenShare);
        } catch {
            toast.error('Screen share cancelled');
        }
    };

    const stopScreenShare = () => {
        localScreenStream?.getTracks().forEach(t => t.stop());
        setLocalScreenStream(null);
        setScreenSharing(false);
        socketRef.current?.emit('proctor-stream-ended', { sessionId, streamType: 'screen' });
        // close screen peer connections
        Object.keys(peerConns.current).forEach(k => {
            if (k.endsWith('_screen')) { peerConns.current[k].close(); delete peerConns.current[k]; }
        });
    };

    /* ─────────────────────────────────────────────────────
       WEBRTC — initiate offer to a peer for a stream type
    ───────────────────────────────────────────────────── */
    const initiateOffer = useCallback(async (targetUserId, streamType, sock) => {
        const key = `${targetUserId}_${streamType}`;
        if (pendingOffers.current.has(key)) return;
        pendingOffers.current.add(key);

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConns.current[key] = pc;

        // Add our tracks depending on stream type
        const stream = streamType === 'screen' ? localScreenStream : localCamStream;
        if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = e => {
            const incoming = e.streams[0];
            setPeerStreams(prev => ({
                ...prev,
                [targetUserId]: { ...(prev[targetUserId] || {}), [streamType]: incoming }
            }));
        };

        pc.onicecandidate = e => {
            if (e.candidate) {
                (sock || socketRef.current)?.emit('proctor-webrtc-ice', {
                    sessionId, targetUserId, streamType, candidate: e.candidate
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (['disconnected','failed','closed'].includes(pc.connectionState)) {
                pendingOffers.current.delete(key);
            }
        };

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            (sock || socketRef.current)?.emit('proctor-webrtc-offer', {
                sessionId, targetUserId, streamType, offer
            });
        } catch (err) {
            console.error('[WebRTC] offer failed', err);
            pendingOffers.current.delete(key);
        }
    }, [sessionId, localCamStream, localScreenStream]);

    const handleIncomingOffer = useCallback(async ({ fromUserId, streamType, offer }, sock) => {
        const key = `${fromUserId}_${streamType}`;
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConns.current[key] = pc;

        pc.ontrack = e => {
            const incoming = e.streams[0];
            setPeerStreams(prev => ({
                ...prev,
                [fromUserId]: { ...(prev[fromUserId] || {}), [streamType]: incoming }
            }));
        };

        pc.onicecandidate = e => {
            if (e.candidate) {
                (sock || socketRef.current)?.emit('proctor-webrtc-ice', {
                    sessionId, targetUserId: fromUserId, streamType, candidate: e.candidate
                });
            }
        };

        try {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            (sock || socketRef.current)?.emit('proctor-webrtc-answer', {
                sessionId, targetUserId: fromUserId, streamType, answer
            });
        } catch (err) {
            console.error('[WebRTC] answer failed', err);
        }
    }, [sessionId]);

    const handleIncomingAnswer = useCallback(async ({ fromUserId, streamType, answer }) => {
        const pc = peerConns.current[`${fromUserId}_${streamType}`];
        if (pc) { try { await pc.setRemoteDescription(answer); } catch {} }
    }, []);

    const handleIncomingIce = useCallback(async ({ fromUserId, streamType, candidate }) => {
        const pc = peerConns.current[`${fromUserId}_${streamType}`];
        if (pc && candidate) { try { await pc.addIceCandidate(candidate); } catch {} }
    }, []);

    /* ─────────────────────────────────────────────────────
       FULLSCREEN
    ───────────────────────────────────────────────────── */
    const enterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
            setSetupStep(2);
        } catch { toast.error('Fullscreen failed'); }
    };

    /* ─────────────────────────────────────────────────────
       SESSION CONTROL
    ───────────────────────────────────────────────────── */
    const startSession = () => {
        setTimerActive(true);
        setSessionState('active');
        socketRef.current?.emit('session-started', { sessionId });
        socketRef.current?.emit('candidate-ready', { sessionId, userId: user.id });
        toast.success('Session started — good luck!');
    };

    const adminStartSession = async () => {
        try {
            await axios.post(`${API_URL}/api/proctor/start-session`, { sessionId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTimerActive(true);
            setSessionState('active');
            socketRef.current?.emit('session-started', { sessionId });
            toast.success('Session started');
        } catch { toast.error('Failed to start session'); }
    };

    const endSession = (reason = 'COMPLETED') => {
        setTimerActive(false);
        setSessionState('completed');
        localCamStream?.getTracks().forEach(t => t.stop());
        localScreenStream?.getTracks().forEach(t => t.stop());
        socketRef.current?.emit('session-ended', { sessionId, reason, code, violations });
        Object.values(peerConns.current).forEach(pc => pc.close());
        peerConns.current = {};
    };

    const submitCode = async () => {
        try {
            await axios.post(`${API_URL}/api/proctor/submit-code`,
                { sessionId, questionId: (activeQuestion || questions[qIdx])?.name || 'open', code, language, timestamp: new Date().toISOString() },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            toast.success('Submitted!');
        } catch { toast.error('Submit failed'); }
    };

    const handleCodeChange = (val) => {
        const v = val || '';
        setCode(v);
        socketRef.current?.emit('candidate-code-update', { sessionId, userId: user.id, code: v, language });
    };

    /* ─────────────────────────────────────────────────────
       CHAT
    ───────────────────────────────────────────────────── */
    const sendChat = () => {
        if (!chatInput.trim()) return;
        socketRef.current?.emit('session-chat-message', {
            sessionId,
            message: chatInput.trim(),
        });
        setChatMessages(prev => [...prev, {
            id: Date.now(), userId: user.id,
            username: user.username, message: chatInput.trim(), timestamp: Date.now()
        }]);
        setChatInput('');
    };

    /* ─────────────────────────────────────────────────────
       CLEANUP
    ───────────────────────────────────────────────────── */
    const cleanup = () => {
        localCamStream?.getTracks().forEach(t => t.stop());
        localScreenStream?.getTracks().forEach(t => t.stop());
        Object.values(peerConns.current).forEach(pc => pc.close());
        socketRef.current?.disconnect();
    };

    /* ── Timer ── */
    useEffect(() => {
        if (!timerActive || timeRemaining <= 0) return;
        const iv = setInterval(() => setTimeRemaining(t => {
            if (t <= 1) { endSession('TIME_UP'); return 0; }
            return t - 1;
        }), 1000);
        return () => clearInterval(iv);
    }, [timerActive, timeRemaining]);

    const fmt = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
        return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    };

    const pct   = currentSession ? timeRemaining / (currentSession.timeLimit || 3600) : 1;
    const isLow = timeRemaining > 0 && timeRemaining < 300;

    /* ── Render guards ── */
    if (!user)      { navigate('/auth'); return null; }
    if (!sessionId) return <ProctorHub />;
    if (sessionState === 'loading') return (
        <div className="pa-loading"><div className="pa-spinner" /><p>Loading session…</p></div>
    );

    const mode         = MODE_META[currentSession?.mode] || MODE_META.INTERVIEW;
    const allViolCount = violations.length + Object.values(participantData).reduce((a, p) => a + (p.violations?.length || 0), 0);
    const watchedData  = watchingUserId ? participantData[watchingUserId] : null;

    // Question to show the candidate (pushed > session-defined > empty)
    const displayQ = activeQuestion || questions[qIdx] || null;

    // Filtered question bank for admin panel
    const filteredBank = questionBank.filter(q => {
        const matchDiff = qDiffFilter === 'all' || q.difficulty?.toLowerCase() === qDiffFilter;
        const matchSearch = !qSearch || q.name?.toLowerCase().includes(qSearch.toLowerCase());
        return matchDiff && matchSearch;
    });

    /* ─────────────────────────────────────────────────────
       JSX
    ───────────────────────────────────────────────────── */
    return (
        <div className="pa-root">

            {/* ══ TOP BAR ══ */}
            <header className="pa-topbar">
                <div className="pa-topbar-left">
                    <button className="pa-back-btn" onClick={() => navigate('/proctor')}><ArrowLeft size={18} /></button>
                    <div className="pa-session-name">
                        <span className="pa-session-title">{currentSession?.title || 'Proctored Session'}</span>
                        <span className="pa-mode-chip" style={{ color: mode.color, borderColor: mode.color + '40', background: mode.color + '12' }}>{mode.label}</span>
                        <span className={`pa-role-chip ${isAdmin ? 'admin' : 'candidate'}`}>
                            {isAdmin ? <><Crown size={11} /> Admin</> : <><User size={11} /> Candidate</>}
                        </span>
                    </div>
                </div>

                <div className="pa-topbar-center">
                    {timerActive && (
                        <div className={`pa-timer ${isLow ? 'pa-timer--low' : ''}`}>
                            <Clock size={15} /><span>{fmt(timeRemaining)}</span>
                            <div className="pa-timer-bar"><div className="pa-timer-fill" style={{ width: `${pct * 100}%`, background: isLow ? '#ef4444' : '#22c55e' }} /></div>
                        </div>
                    )}
                </div>

                <div className="pa-topbar-right">
                    {/* Media controls (candidate only) */}
                    {!isAdmin && sessionState === 'active' && (
                        <div className="pa-media-controls">
                            <button className={`pa-media-btn ${micEnabled ? 'active' : 'muted'}`} onClick={toggleMic} title={micEnabled ? 'Mute mic' : 'Unmute mic'}>
                                {micEnabled ? <Mic size={15} /> : <MicOff size={15} />}
                            </button>
                            <button className={`pa-media-btn ${camEnabled ? 'active' : 'muted'}`} onClick={toggleCam} title={camEnabled ? 'Turn off camera' : 'Turn on camera'}>
                                {camEnabled ? <Video size={15} /> : <VideoOff size={15} />}
                            </button>
                            <button className={`pa-media-btn ${screenSharing ? 'sharing' : ''}`}
                                onClick={screenSharing ? stopScreenShare : startScreenShare}
                                title={screenSharing ? 'Stop sharing' : 'Share screen'}>
                                {screenSharing ? <MonitorOff size={15} /> : <Monitor size={15} />}
                            </button>
                        </div>
                    )}

                    <div className={`pa-pill ${allViolCount > 0 ? 'pa-pill--warn' : ''}`}>
                        <AlertTriangle size={13} /><span>{allViolCount} violation{allViolCount !== 1 ? 's' : ''}</span>
                    </div>

                    {!isAdmin && (
                        <div className="pa-dots">
                            <span className={`pa-dot ${isTabFocused ? 'on' : 'off'}`} title="Tab focus" />
                            <span className={`pa-dot ${camEnabled ? 'on' : 'off'}`} title="Camera" />
                            <span className={`pa-dot ${isFullscreen ? 'on' : 'warn'}`} title="Fullscreen" />
                            {screenSharing && <span className="pa-dot sharing" title="Screen sharing" />}
                        </div>
                    )}

                    {isAdmin && participants.length > 0 && (
                        <div className="pa-pill"><Users size={13} /><span>{participants.length} connected</span></div>
                    )}

                    {/* Admin question panel toggle */}
                    {isAdmin && sessionState === 'active' && (
                        <button className={`pa-qpanel-btn ${showQPanel ? 'active' : ''}`} onClick={() => setShowQPanel(p => !p)}>
                            <BookOpen size={15} /> Questions
                        </button>
                    )}

                    <button className={`pa-chat-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(p => !p)}>
                        💬 {chatMessages.length > 0 && <span className="pa-chat-badge">{chatMessages.length}</span>}
                    </button>

                    {sessionState === 'active' && (
                        <button className="pa-end-btn" onClick={() => endSession('COMPLETED')}>
                            {isAdmin ? 'End for All' : 'End Session'}
                        </button>
                    )}
                </div>
            </header>

            {/* ══ ADMIN QUESTION PANEL (slide-down) ══ */}
            <AnimatePresence>
                {isAdmin && showQPanel && (
                    <motion.div className="pa-qpanel"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <div className="pa-qpanel-inner">
                            <div className="pa-qpanel-header">
                                <span className="pa-qpanel-title"><BookOpen size={16} /> Question Bank ({questionBank.length})</span>
                                {activeQuestion && (
                                    <div className="pa-qpanel-active">
                                        <Zap size={13} /> Active: <strong>{activeQuestion.name}</strong>
                                        <button className="pa-qpanel-clear" onClick={clearQuestion}><X size={13} /> Clear</button>
                                    </div>
                                )}
                                <div className="pa-qpanel-filters">
                                    <div className="pa-qsearch-wrap">
                                        <Search size={13} />
                                        <input className="pa-qsearch" placeholder="Search…" value={qSearch} onChange={e => setQSearch(e.target.value)} />
                                    </div>
                                    <select className="pa-qfilter" value={qDiffFilter} onChange={e => setQDiffFilter(e.target.value)}>
                                        <option value="all">All</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pa-qpanel-list">
                                {qBankLoading ? (
                                    <div className="pa-qpanel-loading"><div className="pa-spinner-sm" /> Loading questions…</div>
                                ) : filteredBank.map((q, i) => (
                                    <button key={i} className={`pa-qpanel-item ${activeQuestion?.name === q.name ? 'selected' : ''}`}
                                        onClick={() => pushQuestion(q)}>
                                        <div className="pa-qpanel-item-left">
                                            <span className={`pa-diff pa-diff--${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                                            <span className="pa-qpanel-name">{q.name}</span>
                                            <span className="pa-qpanel-topic">{q.topic}</span>
                                        </div>
                                        <div className="pa-qpanel-item-right">
                                            <span className="pa-qpanel-platform">{q.platform}</span>
                                            {activeQuestion?.name === q.name
                                                ? <CheckCircle size={15} color="#22c55e" />
                                                : <ChevronRight size={15} color="#555" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ CHAT DRAWER ══ */}
            <AnimatePresence>
                {showChat && (
                    <motion.div className="pa-chat-drawer"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.25 }}>
                        <div className="pa-chat-header">
                            <span>Session Chat</span>
                            <button onClick={() => setShowChat(false)}><X size={16} /></button>
                        </div>
                        <div className="pa-chat-messages">
                            {chatMessages.length === 0
                                ? <p className="pa-chat-empty">No messages yet</p>
                                : chatMessages.map(m => (
                                    <div key={m.id} className={`pa-chat-msg ${m.userId === user.id ? 'own' : ''}`}>
                                        <span className="pa-chat-author">{m.userId === user.id ? 'You' : m.username}</span>
                                        <span className="pa-chat-text">{m.message}</span>
                                    </div>
                                ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="pa-chat-input-row">
                            <input className="pa-chat-input" value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendChat()}
                                placeholder="Type a message…" />
                            <button className="pa-chat-send" onClick={sendChat}><Send size={15} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ MAIN CONTENT ══ */}
            <AnimatePresence mode="wait">

                {/* ════ ADMIN LOBBY ════ */}
                {sessionState === 'lobby' && isAdmin && (
                    <motion.div key="admin-lobby" className="pa-lobby"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="pa-lobby-card">
                            <div className="pa-admin-lobby-header">
                                <Crown size={32} className="pa-admin-crown" />
                                <h2>Admin Control Panel</h2>
                                <p>Candidates join using the session ID below. Start when ready.</p>
                                <div className="pa-session-id-box">
                                    <span>Session ID:</span>
                                    <code>{sessionId}</code>
                                    <button onClick={() => { navigator.clipboard.writeText(sessionId); toast.success('Copied!'); }}>Copy</button>
                                </div>
                            </div>
                            <div className="pa-admin-info">
                                <div className="pa-info-row"><Clock size={15} /><span>Duration: {Math.floor((currentSession?.timeLimit || 3600) / 60)} minutes</span></div>
                                <div className="pa-info-row"><Shield size={15} /><span>Mode: {mode.label}</span></div>
                            </div>
                            <div className="pa-waiting-list">
                                <div className="pa-waiting-title"><Users size={15} /> Waiting room <span className="pa-waiting-count">{participants.length}</span></div>
                                {participants.length === 0
                                    ? <p className="pa-monitor-empty">No candidates yet</p>
                                    : participants.map(p => (
                                        <div key={p.id} className="pa-waiting-row">
                                            <div className="pa-waiting-avatar">{p.username?.[0]?.toUpperCase()}</div>
                                            <span>{p.username}</span>
                                            <span className="pa-waiting-status">Ready</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <button className="pa-start-btn" onClick={adminStartSession}><Play size={20} /> Start Session for All</button>
                        </div>
                    </motion.div>
                )}

                {/* ════ CANDIDATE LOBBY ════ */}
                {sessionState === 'lobby' && !isAdmin && (
                    <motion.div key="candidate-lobby" className="pa-lobby"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="pa-lobby-card">
                            <div className="pa-steps">
                                {['Camera & Mic', 'Fullscreen', 'Ready'].map((s, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`pa-step ${setupStep === i ? 'active' : setupStep > i ? 'done' : ''}`}>
                                            <div className="pa-step-circle">{setupStep > i ? <CheckCircle size={14} /> : <span>{i + 1}</span>}</div>
                                            <span>{s}</span>
                                        </div>
                                        {i < 2 && <div className={`pa-step-line ${setupStep > i ? 'done' : ''}`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="pa-lobby-body">
                                {setupStep === 0 && (
                                    <div className="pa-setup-step">
                                        <div className="pa-setup-icon cam"><Camera size={32} /></div>
                                        <h2>Enable Camera & Microphone</h2>
                                        <p>Required for identity verification and communication during the session.</p>
                                        <button className="pa-action-btn" onClick={startCamera}><Camera size={18} /> Allow Camera & Mic</button>
                                    </div>
                                )}
                                {setupStep === 1 && (
                                    <div className="pa-setup-step">
                                        <VideoTile stream={localCamStream} className="pa-cam-preview-tile" muted label="You" />
                                        <h2>Enter Fullscreen</h2>
                                        <p>Prevents tab switching and ensures a fair environment.</p>
                                        <button className="pa-action-btn" onClick={enterFullscreen}><Maximize size={18} /> Enter Fullscreen</button>
                                    </div>
                                )}
                                {setupStep === 2 && (
                                    <div className="pa-setup-step">
                                        <div className="pa-setup-icon ready"><CheckCircle size={32} /></div>
                                        <h2>Ready to Begin</h2>
                                        <p>All checks passed. The timer starts when you click Start.</p>
                                        <div className="pa-session-summary">
                                            <div className="pa-sum-row"><Clock size={15} /><span>{Math.floor((currentSession?.timeLimit || 3600) / 60)} min</span></div>
                                            <div className="pa-sum-row"><Shield size={15} /><span>{mode.label}</span></div>
                                        </div>
                                        <VideoTile stream={localCamStream} className="pa-cam-thumb-tile" muted label="Preview" />
                                        <button className="pa-start-btn" onClick={startSession}><Play size={20} /> Start Session</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ════ ADMIN ACTIVE ════ */}
                {sessionState === 'active' && isAdmin && (
                    <motion.div key="admin-active" className="pa-admin-workspace"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        {/* Left sidebar — candidates */}
                        <div className="pa-candidates-sidebar">
                            <div className="pa-sidebar-header"><Users size={16} /> Candidates <span className="pa-cand-count">{participants.length}</span></div>
                            {participants.length === 0
                                ? <p className="pa-sidebar-empty">No candidates</p>
                                : participants.filter(p => p.role !== 'admin').map(p => {
                                    const pD = participantData[p.id] || {};
                                    return (
                                        <button key={p.id}
                                            className={`pa-cand-card ${watchingUserId === p.id ? 'active' : ''}`}
                                            onClick={() => setWatchingUserId(p.id)}>
                                            <div className="pa-cand-avatar">{p.username?.[0]?.toUpperCase()}</div>
                                            <div className="pa-cand-info">
                                                <span className="pa-cand-name">{p.username}</span>
                                                {pD.violations?.length > 0 && (
                                                    <span className="pa-cand-viol"><AlertTriangle size={11} /> {pD.violations.length}</span>
                                                )}
                                            </div>
                                            <div className="pa-cand-dots">
                                                <span className={`pa-dot ${pD.isActive !== false ? 'on' : 'off'}`} />
                                                {peerStreams[p.id]?.camera && <Camera size={11} style={{ color: '#22c55e' }} />}
                                                {peerStreams[p.id]?.screen && <Monitor size={11} style={{ color: '#3b82f6' }} />}
                                            </div>
                                        </button>
                                    );
                                })
                            }

                            {/* Active question indicator */}
                            {activeQuestion && (
                                <div className="pa-sidebar-question">
                                    <div className="pa-sq-label"><Zap size={12} /> Active Q</div>
                                    <div className="pa-sq-name">{activeQuestion.name}</div>
                                    <span className={`pa-diff pa-diff--${activeQuestion.difficulty?.toLowerCase()}`}>{activeQuestion.difficulty}</span>
                                </div>
                            )}
                        </div>

                        {/* Main area */}
                        <div className="pa-admin-main">
                            {watchingUserId && watchedData ? (
                                <>
                                    <div className="pa-admin-watching-bar">
                                        <div className="pa-watching-label"><Eye size={14} /> Watching: <strong>{watchedData.username || participants.find(p => p.id === watchingUserId)?.username}</strong></div>
                                        <div className="pa-watch-tabs">
                                            {['editor','camera','screen'].map(tab => (
                                                <button key={tab}
                                                    className={`pa-watch-tab ${watchTab === tab ? 'active' : ''}`}
                                                    onClick={() => setWatchTab(tab)}>
                                                    {tab === 'editor' ? <Code2 size={13} /> : tab === 'camera' ? <Camera size={13} /> : <Monitor size={13} />}
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        {watchedData.violations?.length > 0 && (
                                            <div className="pa-watching-viols"><AlertTriangle size={13} /> {watchedData.violations.length} violation{watchedData.violations.length !== 1 ? 's' : ''}</div>
                                        )}
                                    </div>

                                    <div className="pa-admin-view">
                                        {watchTab === 'editor' && (
                                            <Editor height="100%"
                                                language={watchedData.language || 'javascript'}
                                                value={watchedData.code || '// Waiting for candidate to type…'}
                                                theme="vs-dark"
                                                options={{ readOnly: true, fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
                                            />
                                        )}
                                        {watchTab === 'camera' && (
                                            <div className="pa-admin-video-view">
                                                <VideoTile stream={peerStreams[watchingUserId]?.camera || null}
                                                    className="pa-admin-big-video"
                                                    label={watchedData.username}
                                                    noStreamText="Camera not available" />
                                                <div className="pa-admin-viol-list">
                                                    <div className="pa-monitor-sub">Violations</div>
                                                    {!watchedData.violations?.length
                                                        ? <p className="pa-monitor-empty">Clean</p>
                                                        : watchedData.violations.slice(-6).reverse().map(v => (
                                                            <div key={v.id} className={`pa-viol-item pa-viol--${v.severity?.toLowerCase()}`}>
                                                                <span className="pa-viol-type">{v.type.replace(/_/g,' ')}</span>
                                                                <span className="pa-viol-time">{new Date(v.timestamp).toLocaleTimeString()}</span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        {watchTab === 'screen' && (
                                            <div className="pa-admin-video-view">
                                                <VideoTile stream={peerStreams[watchingUserId]?.screen || null}
                                                    className="pa-admin-big-video"
                                                    label={`${watchedData.username} — Screen`}
                                                    noStreamText="Screen not shared" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="pa-admin-placeholder">
                                    <Eye size={48} /><h3>Select a candidate</h3>
                                    <p>Click a candidate on the left to view their editor, camera, or screen.</p>
                                </div>
                            )}
                        </div>

                        {/* Admin's own camera tile (PiP bottom-right) */}
                        <div className="pa-admin-self-pip">
                            <VideoTile stream={localCamStream} className="pa-pip-tile" muted label="You (Admin)" />
                            {!localCamStream && (
                                <button className="pa-pip-cam-btn" onClick={startCamera}><Camera size={14} /> Join with Camera</button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ════ CANDIDATE ACTIVE ════ */}
                {sessionState === 'active' && !isAdmin && (
                    <motion.div key="candidate-active" className="pa-workspace"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        {/* Problem pane */}
                        <div className="pa-problem-pane">
                            <div className="pa-pane-header">
                                {!activeQuestion && questions.length > 0 && (
                                    <div className="pa-qnav">
                                        <button className="pa-qnav-btn" onClick={() => qIdx > 0 && setQIdx(i => i-1)} disabled={qIdx === 0}><ChevronLeft size={16} /></button>
                                        <span>Q {qIdx+1} / {questions.length}</span>
                                        <button className="pa-qnav-btn" onClick={() => qIdx < questions.length-1 && setQIdx(i => i+1)} disabled={qIdx >= questions.length-1}><ChevronRight size={16} /></button>
                                    </div>
                                )}
                                {activeQuestion && <div className="pa-pushed-badge"><Zap size={13} /> Live Question</div>}
                                {displayQ?.difficulty && <span className={`pa-diff pa-diff--${displayQ.difficulty?.toLowerCase()}`}>{displayQ.difficulty}</span>}
                            </div>

                            <div className="pa-problem-body">
                                {displayQ ? (
                                    <>
                                        <h2 className="pa-q-title">{displayQ.name || displayQ.title}</h2>
                                        <p className="pa-q-desc">{displayQ.statement || displayQ.description}</p>
                                        {displayQ.examples?.length > 0 && (
                                            <div className="pa-examples">
                                                <h4>Examples</h4>
                                                {displayQ.examples.slice(0, 3).map((ex, i) => (
                                                    <div key={i} className="pa-example">
                                                        <div className="pa-ex-row"><strong>Input:</strong> <code>{JSON.stringify(ex.input)}</code></div>
                                                        <div className="pa-ex-row"><strong>Output:</strong> <code>{JSON.stringify(ex.output ?? ex.expected)}</code></div>
                                                        {ex.explanation && <div className="pa-ex-row pa-ex-note">{ex.explanation}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {displayQ.constraints && (
                                            <div className="pa-constraints">
                                                <h4>Constraints</h4>
                                                {typeof displayQ.constraints === 'object' && !Array.isArray(displayQ.constraints)
                                                    ? Object.values(displayQ.constraints).map((c, i) => <div key={i} className="pa-constraint-row">{c}</div>)
                                                    : Array.isArray(displayQ.constraints)
                                                        ? <ul>{displayQ.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul>
                                                        : null
                                                }
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="pa-no-q">
                                        <Code2 size={40} /><h3>Waiting for question…</h3>
                                        <p>The interviewer will push a question shortly.</p>
                                    </div>
                                )}
                            </div>

                            {/* Peers video strip at bottom of problem pane */}
                            {Object.keys(peerStreams).length > 0 && (
                                <div className="pa-peer-strip">
                                    {Object.entries(peerStreams).map(([uid, streams]) => (
                                        <VideoTile key={uid}
                                            stream={streams.camera}
                                            className="pa-peer-tile"
                                            label={participantData[uid]?.username || uid}
                                            noStreamText="No cam" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Editor pane */}
                        <div className="pa-editor-pane">
                            <div className="pa-pane-header">
                                <select className="pa-lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <button className="pa-submit-btn" onClick={submitCode}><Send size={15} /> Submit</button>
                            </div>
                            <div className="pa-editor-wrap">
                                <Editor height="100%" language={language} value={code} onChange={handleCodeChange}
                                    theme="vs-dark"
                                    options={{ fontSize: 14, fontFamily: "'Fira Code','Consolas',monospace", fontLigatures: true, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', contextmenu: false, padding: { top: 12 } }}
                                />
                            </div>
                        </div>

                        {/* Own camera PiP */}
                        {localCamStream && (
                            <div className="pa-cam-pip">
                                <VideoTile stream={localCamStream} className="pa-pip-tile" muted />
                                <div className="pa-pip-badge"><span className="pa-rec-dot" /> REC</div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ════ COMPLETED ════ */}
                {sessionState === 'completed' && (
                    <motion.div key="done" className="pa-done"
                        initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="pa-done-card">
                            <div className="pa-done-icon"><CheckCircle size={56} /></div>
                            <h2>{isAdmin ? 'Session Ended' : 'Session Complete'}</h2>
                            <p>{isAdmin ? 'The session has been permanently closed. It cannot be re-entered.' : 'Your work has been saved and submitted.'}</p>
                            <div className="pa-done-stats">
                                {!isAdmin && (
                                    <><div className="pa-done-stat"><span className="pa-done-val">{violations.length}</span><span className="pa-done-lbl">Violations</span></div><div className="pa-done-sep" /></>
                                )}
                                {isAdmin && (
                                    <><div className="pa-done-stat"><span className="pa-done-val">{participants.length}</span><span className="pa-done-lbl">Candidates</span></div><div className="pa-done-sep" /></>
                                )}
                                <div className="pa-done-stat"><span className="pa-done-val">{fmt((currentSession?.timeLimit || 3600) - timeRemaining)}</span><span className="pa-done-lbl">Time used</span></div>
                            </div>
                            <div className="pa-done-actions">
                                <button className="pa-done-btn primary" onClick={() => navigate('/proctor')}>Back to Hub</button>
                                <button className="pa-done-btn ghost" onClick={() => navigate('/hub')}>Go Home</button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* ══ VIOLATION MODAL ══ */}
            <AnimatePresence>
                {showViolModal && (
                    <motion.div className="pa-modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowViolModal(false)}>
                        <motion.div className="pa-modal" initial={{ scale: .9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
                            <div className="pa-modal-icon"><AlertTriangle size={28} /></div>
                            <h3>Violation Recorded</h3>
                            <p className="pa-modal-type">{violDetails?.type?.replace(/_/g,' ')}</p>
                            <p className="pa-modal-desc">{violDetails?.description}</p>
                            {tabSwitchCount >= 3 && (
                                <div className="pa-modal-warn"><XCircle size={16} /><span>Too many violations — session will be terminated.</span></div>
                            )}
                            <button className="pa-modal-ack" onClick={() => setShowViolModal(false)}>Acknowledge</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProctorArena;
