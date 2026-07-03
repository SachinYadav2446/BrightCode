import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Shield, Camera, Lock, Mic, MicOff, VideoOff, Video,
    Clock, AlertTriangle, CheckCircle, XCircle, Play,
    Users, ChevronRight, ChevronLeft, Monitor, MonitorOff,
    Eye, Maximize, Code2, Send, Crown, User, BookOpen,
    ChevronDown, ChevronUp, Search, Filter, X, Zap, MessageCircle
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
    EXAM:       { label: 'Proctored Exam',       color: 'var(--primary)' },
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
const VideoTile = ({ stream, muted = false, label, className, noStreamText = 'No feed', compact = false }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.srcObject = stream || null;
        if (stream) ref.current.play().catch(() => {});
    }, [stream]);

    const initial = label?.[0]?.toUpperCase() || '?';

    return (
        <div className={`pa-vid ${compact ? 'pa-vid--compact' : ''} ${className || ''}`}>
            <video ref={ref} autoPlay playsInline muted={muted} />
            {!stream && (
                <div className="pa-vid-placeholder">
                    <div className="pa-vid-avatar">{initial}</div>
                    <span>{noStreamText}</span>
                </div>
            )}
            {label && <div className="pa-vid-name">{label}</div>}
            {stream && <div className="pa-vid-live" />}
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
    const sessionIdRef = useRef(sessionId);
    const socketHandlersRef = useRef([]);

    useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

    const peerKey = (remoteId, streamType) =>
        `${sessionIdRef.current}_${String(remoteId)}_${streamType}`;

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
    const pendingOffers = useRef(new Set());
    const localCamStreamRef    = useRef(null);
    const localScreenStreamRef = useRef(null);
    const participantsRef      = useRef([]);
    const userRef              = useRef(user);
    const isAdminRef           = useRef(false);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);
    useEffect(() => { localCamStreamRef.current = localCamStream; }, [localCamStream]);
    useEffect(() => { localScreenStreamRef.current = localScreenStream; }, [localScreenStream]);

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

    useEffect(() => { participantsRef.current = participants; }, [participants]);

    /* ── Chat ── */
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput,    setChatInput]    = useState('');
    const [showChat,     setShowChat]     = useState(false);
    const chatEndRef = useRef(null);

    const detachSocketHandlers = () => {
        const sock = socketRef.current;
        if (!sock) return;
        socketHandlersRef.current.forEach(({ event, handler }) => sock.off(event, handler));
        socketHandlersRef.current = [];
    };

    const bindSocket = (event, handler) => {
        socketRef.current?.on(event, handler);
        socketHandlersRef.current.push({ event, handler });
    };

    const teardownMediaAndPeers = () => {
        localCamStreamRef.current?.getTracks().forEach(t => t.stop());
        localScreenStreamRef.current?.getTracks().forEach(t => t.stop());
        localCamStreamRef.current = null;
        localScreenStreamRef.current = null;
        Object.values(peerConns.current).forEach(pc => pc.close());
        peerConns.current = {};
        pendingOffers.current.clear();
    };
    useEffect(() => {
        if (!user)      { navigate('/auth'); return; }
        if (!sessionId) return;
        initSession();
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
        const sid = sessionId;
        detachSocketHandlers();
        teardownMediaAndPeers();
        setParticipants([]);
        setParticipantData({});
        setPeerStreams({});
        setWatchingUserId(null);
        setChatMessages([]);
        setViolations([]);
        setActiveQuestion(null);
        setCode('// Start coding here\n');
        setSetupStep(0);
        setLocalCamStream(null);
        setLocalScreenStream(null);
        setCamEnabled(false);
        setMicEnabled(false);
        setScreenSharing(false);
        setSessionState('loading');

        try {
            const { data } = await axios.get(`${API_URL}/api/proctor/session/${sid}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const s = data.session;
            if (sessionIdRef.current !== sid) return;

            setCurrentSession(s);
            setQuestions(s.questions || []);
            setTimeRemaining(s.timeLimit || 3600);

            const admin = s.creatorId === user.id || s.interviewerId === user.id;
            setIsAdmin(admin);

            const sock = initSocket();
            socketRef.current = sock;

            sock.emit('join-proctor-session', {
                sessionId: sid,
                userId:   user.id,
                username: user.username,
                role:     admin ? 'admin' : 'candidate',
                dbStatus: s.status,
            });

            const guard = (d) => !d?.sessionId || d.sessionId === sid;

            bindSocket('session-updated', d => { if (guard(d)) setCurrentSession(d.session); });
            bindSocket('session-ended', d => { if (!d?.sessionId || d.sessionId === sid) setSessionState('completed'); });

            bindSocket('session-started', d => {
                if (!guard(d)) return;
                setSessionState('active');
                setTimerActive(true);
                if (!admin) toast.success('Interviewer started the session');
            });

            bindSocket('session-state', d => {
                if (!guard(d)) return;
                if (d.activeQuestion) setActiveQuestion(d.activeQuestion);
                if (Array.isArray(d.participants)) {
                    const list = d.participants.map(p => ({
                        id: String(p.id || p.userId),
                        username: p.username || 'Unknown',
                        role: p.role || 'candidate',
                    }));
                    setParticipants(list);
                    const pdata = {};
                    list.forEach(p => {
                        pdata[p.id] = {
                            username: p.username,
                            code: '// Waiting…\n',
                            language: 'javascript',
                            violations: [],
                            isActive: true,
                        };
                    });
                    setParticipantData(pdata);
                }
                if (d.sessionStatus === 'active') {
                    setSessionState('active');
                    setTimerActive(true);
                }
                (d.activeStreams || []).forEach(st => {
                    if (String(st.userId) !== String(user.id)) {
                        sock.emit('proctor-request-stream', {
                            sessionId: sid, targetUserId: st.userId, streamType: st.streamType,
                        });
                    }
                });
            });

            bindSocket('participant-joined', d => {
                if (!guard(d)) return;
                const p = d.participant;
                const pid = String(p.id || p.userId);
                setParticipants(prev => prev.find(x => String(x.id) === pid) ? prev
                    : [...prev, { id: pid, username: p.username || 'Unknown', role: p.role || 'candidate' }]);
                setParticipantData(prev => ({
                    ...prev,
                    [pid]: {
                        username: p.username || 'Unknown',
                        code: '// Waiting…\n', language: 'javascript',
                        violations: [], isActive: true,
                    },
                }));
                if (localCamStreamRef.current) {
                    sock.emit('proctor-stream-ready', { sessionId: sid, streamType: 'camera', username: user.username });
                }
                if (localScreenStreamRef.current) {
                    sock.emit('proctor-stream-ready', { sessionId: sid, streamType: 'screen', username: user.username });
                }
            });

            bindSocket('participant-left', d => {
                if (!guard(d)) return;
                const pid = String(d.participantId);
                setParticipants(prev => prev.filter(x => String(x.id) !== pid));
                setParticipantData(prev => {
                    const next = { ...prev };
                    if (next[pid]) next[pid].isActive = false;
                    return next;
                });
                setPeerStreams(prev => {
                    const next = { ...prev };
                    delete next[pid];
                    return next;
                });
            });

            bindSocket('candidate-code-update', d => {
                if (!admin || !guard(d)) return;
                const uid = String(d.userId);
                setParticipantData(prev => ({
                    ...prev,
                    [uid]: { ...(prev[uid] || {}), code: d.code, language: d.language },
                }));
            });

            bindSocket('violation-detected', d => {
                if (!admin || !guard(d)) return;
                const pid = String(d.participantId || d.userId);
                toast.error(`⚠️ ${d.participantUsername || 'Candidate'}: ${d.violation.description}`);
                setParticipantData(prev => ({
                    ...prev,
                    [pid]: {
                        ...(prev[pid] || {}),
                        violations: [...(prev[pid]?.violations || []), d.violation],
                    },
                }));
            });

            bindSocket('proctor-question-pushed', d => {
                if (!guard(d)) return;
                setActiveQuestion(d.question);
                if (!admin) toast.success(`📋 New question: ${d.question?.name}`);
            });
            bindSocket('proctor-question-cleared', d => { if (!d?.sessionId || d.sessionId === sid) setActiveQuestion(null); });

            bindSocket('proctor-webrtc-offer', d => { if (guard(d)) handleIncomingOffer(d, sock); });
            bindSocket('proctor-webrtc-answer', d => { if (guard(d)) handleIncomingAnswer(d); });
            bindSocket('proctor-webrtc-ice', d => { if (guard(d)) handleIncomingIce(d); });

            bindSocket('proctor-stream-ready', d => {
                if (!guard(d) || String(d.userId) === String(user.id)) return;
                sock.emit('proctor-request-stream', {
                    sessionId: sid, targetUserId: d.userId, streamType: d.streamType,
                });
            });

            bindSocket('proctor-request-stream', d => {
                if (!guard(d)) return;
                const key = `${sessionIdRef.current}_${String(d.fromUserId)}_${d.streamType}`;
                pendingOffers.current.delete(key);
                peerConns.current[key]?.close();
                delete peerConns.current[key];
                initiateOfferAsSender(d.fromUserId, d.streamType, sock);
            });

            bindSocket('proctor-stream-ended', d => {
                if (!guard(d)) return;
                const uid = String(d.userId);
                setPeerStreams(prev => {
                    const next = { ...prev };
                    if (next[uid]) next[uid] = { ...next[uid], [d.streamType]: null };
                    return next;
                });
                const key = peerKey(uid, d.streamType);
                peerConns.current[key]?.close();
                delete peerConns.current[key];
                pendingOffers.current.delete(key);
            });

            bindSocket('chat-message', d => {
                if (!guard(d)) return;
                setChatMessages(prev => [...prev, d.message]);
            });

            const stateMap = { created:'lobby', lobby:'lobby', active:'active', paused:'active', completed:'completed', terminated:'completed' };
            setSessionState(stateMap[s.status] || 'lobby');
            if (s.status === 'active') {
                setSessionState('active');
                setTimerActive(true);
            }
            if (admin) loadQuestionBank();
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
        if (isAdmin) return;
        const strictMode = currentSession?.mode !== 'INTERVIEW';

        const onVis  = () => {
            setIsTabFocused(!document.hidden);
            if (document.hidden && strictMode) recordViolation('TAB_SWITCH', 'Switched tabs');
        };
        const onFS   = () => {
            const fs = !!document.fullscreenElement;
            setIsFullscreen(fs);
            if (!fs && strictMode) recordViolation('FULLSCREEN_EXIT', 'Exited fullscreen');
        };
        const onKey  = (e) => {
            if (!strictMode) return;
            const blocked = ((e.ctrlKey||e.metaKey) && ['t','n','w','r'].includes(e.key.toLowerCase()))
                || ['F12','F5'].includes(e.key) || (e.altKey && e.key==='Tab');
            if (blocked) { e.preventDefault(); recordViolation('SHORTCUT_ATTEMPT', `Blocked: ${e.key}`); }
        };
        const onCtx = (e) => { if (strictMode) e.preventDefault(); };
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
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            localCamStreamRef.current = stream;
            setLocalCamStream(stream);
            setCamEnabled(true);
            setMicEnabled(true);
            if (!isAdminRef.current) setSetupStep(1);
            toast.success('Camera & mic ready');
            announceStream('camera');
        } catch {
            toast.error('Camera/mic access denied — check browser permissions');
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
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            localScreenStreamRef.current = stream;
            setLocalScreenStream(stream);
            setScreenSharing(true);
            toast.success('Screen sharing started');
            announceStream('screen');
            stream.getVideoTracks()[0].addEventListener('ended', stopScreenShare);
        } catch {
            toast.error('Screen share cancelled');
        }
    };

    const stopScreenShare = () => {
        localScreenStreamRef.current?.getTracks().forEach(t => t.stop());
        localScreenStreamRef.current = null;
        setLocalScreenStream(null);
        setScreenSharing(false);
        socketRef.current?.emit('proctor-stream-ended', { sessionId, streamType: 'screen' });
        const prefix = `${sessionIdRef.current}_`;
        Object.keys(peerConns.current).forEach(k => {
            if (k.startsWith(prefix) && k.endsWith('_screen')) {
                peerConns.current[k].close();
                delete peerConns.current[k];
            }
        });
    };

    const getLocalStream = (streamType) =>
        streamType === 'screen' ? localScreenStreamRef.current : localCamStreamRef.current;

    const announceStream = (streamType, sock) => {
        const s = sock || socketRef.current;
        s?.emit('proctor-stream-ready', { sessionId, streamType, username: userRef.current?.username });
        participantsRef.current.forEach(p => {
            if (String(p.id) !== String(userRef.current?.id)) {
                s?.emit('proctor-request-stream', { sessionId, targetUserId: p.id, streamType });
            }
        });
    };

    /* ─────────────────────────────────────────────────────
       WEBRTC — stream owner sends offer with media tracks
    ───────────────────────────────────────────────────── */
    const initiateOfferAsSender = useCallback(async (targetUserId, streamType, sock) => {
        const targetId = String(targetUserId);
        const key = `${sessionIdRef.current}_${targetId}_${streamType}`;
        if (pendingOffers.current.has(key)) return;

        const stream = getLocalStream(streamType);
        if (!stream) return;

        pendingOffers.current.add(key);
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConns.current[key] = pc;

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.onicecandidate = e => {
            if (e.candidate) {
                (sock || socketRef.current)?.emit('proctor-webrtc-ice', {
                    sessionId, targetUserId: targetId, streamType, candidate: e.candidate,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
                pendingOffers.current.delete(key);
            }
        };

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            (sock || socketRef.current)?.emit('proctor-webrtc-offer', {
                sessionId, targetUserId: targetId, streamType, offer,
            });
        } catch (err) {
            console.error('[WebRTC] sender offer failed', err);
            pendingOffers.current.delete(key);
            pc.close();
            delete peerConns.current[key];
        }
    }, [sessionId]);

    const handleIncomingOffer = useCallback(async ({ fromUserId, streamType, offer }, sock) => {
        const remoteId = String(fromUserId);
        const key = `${sessionIdRef.current}_${remoteId}_${streamType}`;
        if (peerConns.current[key]) {
            peerConns.current[key].close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConns.current[key] = pc;

        pc.ontrack = e => {
            const incoming = e.streams[0];
            if (!incoming) return;
            setPeerStreams(prev => ({
                ...prev,
                [remoteId]: { ...(prev[remoteId] || {}), [streamType]: incoming },
            }));
        };

        pc.onicecandidate = e => {
            if (e.candidate) {
                (sock || socketRef.current)?.emit('proctor-webrtc-ice', {
                    sessionId, targetUserId: remoteId, streamType, candidate: e.candidate,
                });
            }
        };

        try {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            (sock || socketRef.current)?.emit('proctor-webrtc-answer', {
                sessionId, targetUserId: remoteId, streamType, answer,
            });
        } catch (err) {
            console.error('[WebRTC] answer failed', err);
            pc.close();
            delete peerConns.current[key];
        }
    }, [sessionId]);

    const handleIncomingAnswer = useCallback(async ({ fromUserId, streamType, answer }) => {
        const pc = peerConns.current[`${sessionIdRef.current}_${String(fromUserId)}_${streamType}`];
        if (pc) {
            try { await pc.setRemoteDescription(answer); } catch (err) {
                console.error('[WebRTC] setRemoteDescription failed', err);
            }
        }
    }, []);

    const handleIncomingIce = useCallback(async ({ fromUserId, streamType, candidate }) => {
        const pc = peerConns.current[`${sessionIdRef.current}_${String(fromUserId)}_${streamType}`];
        if (pc && candidate) {
            try { await pc.addIceCandidate(candidate); } catch {}
        }
    }, []);

    const requestRemoteStream = useCallback((targetUserId, streamType) => {
        socketRef.current?.emit('proctor-request-stream', {
            sessionId, targetUserId: String(targetUserId), streamType,
        });
    }, [sessionId]);

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
        if (currentSession?.mode === 'INTERVIEW') {
            socketRef.current?.emit('candidate-ready', { sessionId, userId: user.id });
            toast.success('You are ready — waiting for interviewer to start');
            return;
        }
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
        teardownMediaAndPeers();
        socketRef.current?.emit('leave-proctor-session');
        detachSocketHandlers();
    };

    /* ── Request streams when admin selects a candidate ── */
    useEffect(() => {
        if (!isAdmin || !watchingUserId || sessionState !== 'active') return;
        requestRemoteStream(watchingUserId, 'camera');
        if (watchTab === 'screen') requestRemoteStream(watchingUserId, 'screen');
    }, [isAdmin, watchingUserId, watchTab, sessionState, requestRemoteStream]);

    /* ── Admin: prompt camera on active session ── */
    useEffect(() => {
        if (isAdmin && sessionState === 'active' && !localCamStreamRef.current) {
            startCamera();
        }
    }, [isAdmin, sessionState]);

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
    const readyStep = currentSession?.mode === 'INTERVIEW' ? 1 : 2;
    const displayQ = activeQuestion || questions[qIdx] || null;

    const getPeerLabel = (uid) => {
        const p = participants.find(x => String(x.id) === String(uid));
        const name = p?.username || participantData[uid]?.username;
        if (name && name.toLowerCase() !== 'nothing' && name.toLowerCase() !== 'unknown') return name;
        return p?.role === 'admin' ? 'Interviewer' : 'Participant';
    };

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

            {/* ── TOP BAR ── */}
            <header className="pa-topbar">
                <div className="pa-topbar-left">
                    <button className="pa-back-btn" onClick={() => navigate('/proctor')} title="Back to hub">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="pa-session-name">
                        <span className="pa-session-title">{currentSession?.title || 'Interview Session'}</span>
                        <span className="pa-mode-chip" style={{ color: mode.color, borderColor: mode.color + '40', background: mode.color + '12' }}>
                            {mode.label}
                        </span>
                        <span className={`pa-role-chip ${isAdmin ? 'admin' : 'candidate'}`}>
                            {isAdmin ? <><Crown size={10} /> Interviewer</> : <><User size={10} /> Candidate</>}
                        </span>
                    </div>
                </div>

                <div className="pa-topbar-center">
                    {timerActive && (
                        <div className={`pa-timer ${isLow ? 'pa-timer--low' : ''}`}>
                            <Clock size={14} />
                            <span>{fmt(timeRemaining)}</span>
                            <div className="pa-timer-bar">
                                <div className="pa-timer-fill" style={{ width: `${pct * 100}%`, background: isLow ? 'var(--red)' : 'var(--green)' }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pa-topbar-right">
                    {sessionState === 'active' && (
                        <div className="pa-media-controls">
                            <button className={`pa-media-btn ${micEnabled ? 'active' : 'muted'}`} onClick={toggleMic} title="Microphone">
                                {micEnabled ? <Mic size={15} /> : <MicOff size={15} />}
                            </button>
                            <button className={`pa-media-btn ${camEnabled ? 'active' : 'muted'}`} onClick={toggleCam} title="Camera">
                                {camEnabled ? <Video size={15} /> : <VideoOff size={15} />}
                            </button>
                            {!isAdmin && (
                                <button className={`pa-media-btn ${screenSharing ? 'sharing' : ''}`}
                                    onClick={screenSharing ? stopScreenShare : startScreenShare} title="Screen share">
                                    {screenSharing ? <MonitorOff size={15} /> : <Monitor size={15} />}
                                </button>
                            )}
                        </div>
                    )}

                    {!isAdmin && sessionState === 'active' && (
                        <div className="pa-dots" title="Tab · Camera · Fullscreen">
                            <span className={`pa-dot ${isTabFocused ? 'on' : 'off'}`} />
                            <span className={`pa-dot ${camEnabled ? 'on' : 'off'}`} />
                            <span className={`pa-dot ${isFullscreen ? 'on' : 'warn'}`} />
                            {screenSharing && <span className="pa-dot sharing" />}
                        </div>
                    )}

                    {allViolCount > 0 && (
                        <div className="pa-pill pa-pill--warn">
                            <AlertTriangle size={12} /> {allViolCount} violation{allViolCount !== 1 ? 's' : ''}
                        </div>
                    )}

                    {isAdmin && sessionState === 'active' && (
                        <button className={`pa-qpanel-btn ${showQPanel ? 'active' : ''}`}
                            onClick={() => setShowQPanel(p => !p)}>
                            <BookOpen size={14} /> Questions
                        </button>
                    )}

                    <button className={`pa-chat-btn ${showChat ? 'active' : ''}`}
                        onClick={() => setShowChat(p => !p)}>
                        💬
                        {chatMessages.length > 0 && <span className="pa-chat-badge">{chatMessages.length}</span>}
                    </button>

                    {sessionState === 'active' && (
                        <button className="pa-end-btn" onClick={() => endSession('COMPLETED')}>
                            {isAdmin ? 'End Session' : 'Leave'}
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
                                <div className="pa-admin-crown"><Crown size={28} /></div>
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
                                {(currentSession?.mode === 'INTERVIEW'
                                    ? ['Camera & Mic', 'Ready']
                                    : ['Camera & Mic', 'Fullscreen', 'Ready']
                                ).map((s, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`pa-step ${setupStep === i ? 'active' : setupStep > i ? 'done' : ''}`}>
                                            <div className="pa-step-circle">{setupStep > i ? <CheckCircle size={14} /> : <span>{i + 1}</span>}</div>
                                            <span>{s}</span>
                                        </div>
                                        {i < (currentSession?.mode === 'INTERVIEW' ? 1 : 2) && (
                                            <div className={`pa-step-line ${setupStep > i ? 'done' : ''}`} />
                                        )}
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
                                {setupStep === 1 && currentSession?.mode !== 'INTERVIEW' && (
                                    <div className="pa-setup-step">
                                        <VideoTile stream={localCamStream} className="pa-cam-preview-tile" muted label="You" />
                                        <h2>Enter Fullscreen</h2>
                                        <p>Prevents tab switching and ensures a fair environment.</p>
                                        <button className="pa-action-btn" onClick={enterFullscreen}><Maximize size={18} /> Enter Fullscreen</button>
                                    </div>
                                )}
                                {setupStep === readyStep && (
                                    <div className="pa-setup-step">
                                        <div className="pa-setup-icon ready"><CheckCircle size={32} /></div>
                                        <h2>{currentSession?.mode === 'INTERVIEW' ? 'Waiting for Interviewer' : 'Ready to Begin'}</h2>
                                        <p>{currentSession?.mode === 'INTERVIEW'
                                            ? 'Camera is on. The interviewer will start the session when ready.'
                                            : 'All checks passed. The timer starts when you click Start.'}</p>
                                        <div className="pa-session-summary">
                                            <div className="pa-sum-row"><Clock size={15} /><span>{Math.floor((currentSession?.timeLimit || 3600) / 60)} min</span></div>
                                            <div className="pa-sum-row"><Shield size={15} /><span>{mode.label}</span></div>
                                        </div>
                                        <VideoTile stream={localCamStream} className="pa-cam-thumb-tile" muted label="Preview" />
                                        <button className="pa-start-btn" onClick={startSession}>
                                            <Play size={20} /> {currentSession?.mode === 'INTERVIEW' ? 'I\'m Ready' : 'Start Session'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── ADMIN ACTIVE ── */}
                {sessionState === 'active' && isAdmin && (
                    <motion.div key="admin-active" className="pa-stage pa-stage--admin"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        <aside className="pa-roster">
                            <div className="pa-roster__head">
                                <Users size={15} />
                                <span>Candidates</span>
                                <span className="pa-roster__count">{participants.filter(p => p.role !== 'admin').length}</span>
                            </div>
                            <div className="pa-roster__list">
                                {participants.filter(p => p.role !== 'admin').length === 0 ? (
                                    <p className="pa-roster__empty">Waiting for candidates to join…</p>
                                ) : participants.filter(p => p.role !== 'admin').map(p => {
                                    const pD = participantData[p.id] || {};
                                    return (
                                        <button key={p.id}
                                            className={`pa-roster__item ${String(watchingUserId) === String(p.id) ? 'is-active' : ''}`}
                                            onClick={() => setWatchingUserId(p.id)}>
                                            <div className="pa-roster__avatar">{p.username?.[0]?.toUpperCase()}</div>
                                            <div className="pa-roster__info">
                                                <span className="pa-roster__name">{p.username}</span>
                                                <span className="pa-roster__status">
                                                    {peerStreams[p.id]?.camera ? 'On camera' : 'Connected'}
                                                </span>
                                            </div>
                                            {pD.violations?.length > 0 && (
                                                <span className="pa-roster__flag"><AlertTriangle size={11} /></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {activeQuestion && (
                                <div className="pa-roster__q">
                                    <span className="pa-roster__q-label">Active question</span>
                                    <span className="pa-roster__q-name">{activeQuestion.name}</span>
                                </div>
                            )}
                        </aside>

                        <main className="pa-stage__main">
                            {watchingUserId && watchedData ? (
                                <>
                                    <div className="pa-workbench__toolbar">
                                        <div className="pa-segment">
                                            {['editor', 'camera', 'screen'].map(tab => (
                                                <button key={tab}
                                                    className={`pa-segment__btn ${watchTab === tab ? 'is-active' : ''}`}
                                                    onClick={() => setWatchTab(tab)}>
                                                    {tab === 'editor' ? <Code2 size={14} /> : tab === 'camera' ? <Camera size={14} /> : <Monitor size={14} />}
                                                    <span>{tab === 'editor' ? 'Code' : tab === 'camera' ? 'Camera' : 'Screen'}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <span className="pa-workbench__watching">
                                            <Eye size={14} /> {watchedData.username || getPeerLabel(watchingUserId)}
                                        </span>
                                        {watchedData.violations?.length > 0 && (
                                            <span className="pa-badge pa-badge--warn">
                                                {watchedData.violations.length} violations
                                            </span>
                                        )}
                                    </div>
                                    <div className="pa-workbench__body">
                                        {watchTab === 'editor' && (
                                            <Editor height="100%"
                                                language={watchedData.language || 'javascript'}
                                                value={watchedData.code || '// Waiting for candidate to type…'}
                                                theme="vs-dark"
                                                options={{ readOnly: true, fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 16 } }}
                                            />
                                        )}
                                        {watchTab === 'camera' && (
                                            <VideoTile stream={peerStreams[watchingUserId]?.camera || null}
                                                label={getPeerLabel(watchingUserId)}
                                                noStreamText="Connecting camera…"
                                                className="pa-vid--stage" />
                                        )}
                                        {watchTab === 'screen' && (
                                            <VideoTile stream={peerStreams[watchingUserId]?.screen || null}
                                                label={`${getPeerLabel(watchingUserId)} — screen`}
                                                noStreamText="Screen not shared"
                                                className="pa-vid--stage" />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="pa-empty">
                                    <div className="pa-empty__icon"><Eye size={40} /></div>
                                    <h3>Select a candidate</h3>
                                    <p>Choose someone from the roster to monitor their code and camera.</p>
                                    {participants.filter(p => p.role !== 'admin').length > 0 && (
                                        <button className="pa-btn pa-btn--primary"
                                            onClick={() => {
                                                const first = participants.find(p => p.role !== 'admin');
                                                if (first) setWatchingUserId(first.id);
                                            }}>
                                            <Eye size={15} /> Watch candidate
                                        </button>
                                    )}
                                </div>
                            )}
                        </main>

                        <aside className="pa-dock">
                            <div className="pa-dock__head">Video</div>
                            <div className="pa-dock__tiles">
                                <VideoTile stream={peerStreams[watchingUserId]?.camera || null}
                                    compact label={watchingUserId ? getPeerLabel(watchingUserId) : 'Candidate'}
                                    noStreamText="No camera" />
                                <VideoTile stream={localCamStream} compact muted label="You" noStreamText="Camera off" />
                                {peerStreams[watchingUserId]?.screen && (
                                    <VideoTile stream={peerStreams[watchingUserId]?.screen}
                                        compact label="Screen" noStreamText="No screen" />
                                )}
                            </div>
                            {watchedData && (
                                <div className="pa-dock__viol">
                                    <span className="pa-dock__viol-title">Integrity</span>
                                    {!watchedData.violations?.length ? (
                                        <span className="pa-dock__clean"><CheckCircle size={13} /> Clean</span>
                                    ) : watchedData.violations.slice(-4).reverse().map(v => (
                                        <div key={v.id} className="pa-dock__viol-row">
                                            <span>{v.type.replace(/_/g, ' ')}</span>
                                            <span>{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </motion.div>
                )}

                {/* ── CANDIDATE ACTIVE ── */}
                {sessionState === 'active' && !isAdmin && (
                    <motion.div key="candidate-active" className="pa-stage pa-stage--candidate"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        <aside className="pa-brief">
                            <div className="pa-brief__head">
                                {activeQuestion && <span className="pa-tag pa-tag--live"><Zap size={11} /> Live</span>}
                                {displayQ?.difficulty && (
                                    <span className={`pa-tag pa-tag--${displayQ.difficulty?.toLowerCase()}`}>{displayQ.difficulty}</span>
                                )}
                                {!activeQuestion && questions.length > 0 && (
                                    <div className="pa-brief__nav">
                                        <button onClick={() => qIdx > 0 && setQIdx(i => i - 1)} disabled={qIdx === 0}><ChevronLeft size={16} /></button>
                                        <span>{qIdx + 1}/{questions.length}</span>
                                        <button onClick={() => qIdx < questions.length - 1 && setQIdx(i => i + 1)} disabled={qIdx >= questions.length - 1}><ChevronRight size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <div className="pa-brief__body">
                                {displayQ ? (
                                    <>
                                        <h2 className="pa-brief__title">{displayQ.name || displayQ.title}</h2>
                                        <p className="pa-brief__text">{displayQ.statement || displayQ.description}</p>
                                        {displayQ.examples?.length > 0 && (
                                            <div className="pa-brief__section">
                                                <h4>Examples</h4>
                                                {displayQ.examples.slice(0, 3).map((ex, i) => (
                                                    <div key={i} className="pa-codeblock">
                                                        <div><b>In:</b> <code>{JSON.stringify(ex.input)}</code></div>
                                                        <div><b>Out:</b> <code>{JSON.stringify(ex.output ?? ex.expected)}</code></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {displayQ.constraints && (
                                            <div className="pa-brief__section">
                                                <h4>Constraints</h4>
                                                {typeof displayQ.constraints === 'object' && !Array.isArray(displayQ.constraints)
                                                    ? Object.values(displayQ.constraints).map((c, i) => <p key={i} className="pa-brief__mono">{c}</p>)
                                                    : Array.isArray(displayQ.constraints)
                                                        ? <ul className="pa-brief__list">{displayQ.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul>
                                                        : null}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="pa-empty pa-empty--sm">
                                        <Code2 size={32} />
                                        <h3>Waiting for question</h3>
                                        <p>Your interviewer will assign a problem shortly.</p>
                                    </div>
                                )}
                            </div>
                        </aside>

                        <main className="pa-stage__main">
                            <div className="pa-workbench__toolbar">
                                <select className="pa-select" value={language} onChange={e => setLanguage(e.target.value)}>
                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <button className="pa-btn pa-btn--primary" onClick={submitCode}>
                                    <Send size={14} /> Submit
                                </button>
                            </div>
                            <div className="pa-workbench__body">
                                <Editor height="100%" language={language} value={code} onChange={handleCodeChange}
                                    theme="vs-dark"
                                    options={{ fontSize: 14, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontLigatures: true, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', contextmenu: false, padding: { top: 16 } }}
                                />
                            </div>
                        </main>

                        <aside className="pa-dock">
                            <div className="pa-dock__head">Call</div>
                            <div className="pa-dock__tiles">
                                {Object.entries(peerStreams).map(([uid, streams]) => (
                                    streams.camera && (
                                        <VideoTile key={uid} compact
                                            stream={streams.camera}
                                            label={getPeerLabel(uid)}
                                            noStreamText="Connecting…" />
                                    )
                                ))}
                                <VideoTile compact stream={localCamStream} muted label="You" noStreamText="Camera off" />
                            </div>
                            {!localCamStream && (
                                <button className="pa-dock__enable" onClick={startCamera}>
                                    <Camera size={14} /> Turn on camera
                                </button>
                            )}
                        </aside>
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
