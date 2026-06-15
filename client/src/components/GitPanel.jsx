import React, { useState, useEffect, useCallback } from 'react';
import {
    GitBranch, GitCommit, Upload, Download, RefreshCw,
    Plus, Link2, Unplug, FileCode, CheckCircle2,
    AlertCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getOAuthStatus, getOAuthUrl, savePatToken, disconnectGitHub,
    getGitStatus, getGitLog, getGitDiff,
    initRepo, cloneRepo, stageFiles, unstageFiles, commitChanges,
    checkoutBranch, createBranch, pushChanges, pullChanges
} from '../services/gitService';
import './GitPanel.css';

const FileStatusRow = ({ file, status, onStage, onUnstage, onSelect, selected, canWrite }) => (
    <div className={`git-file-row ${selected ? 'selected' : ''}`} onClick={() => onSelect(file)}>
        <span className={`git-status-dot ${status}`} />
        <FileCode size={12} />
        <span className="git-file-name">{file}</span>
        {canWrite && status === 'modified' && (
            <button className="git-mini-btn" onClick={(e) => { e.stopPropagation(); onStage([file]); }} title="Stage">+</button>
        )}
        {canWrite && status === 'staged' && (
            <button className="git-mini-btn" onClick={(e) => { e.stopPropagation(); onUnstage([file]); }} title="Unstage">−</button>
        )}
    </div>
);

const GitPanel = ({ roomId, canWrite, isAdmin, user, onFilesSynced }) => {
    const [status, setStatus] = useState(null);
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [commitMsg, setCommitMsg] = useState('');
    const [cloneUrl, setCloneUrl] = useState('');
    const [cloneBranch, setCloneBranch] = useState('');
    const [newBranch, setNewBranch] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [diff, setDiff] = useState('');
    const [showConnect, setShowConnect] = useState(false);
    const [patToken, setPatToken] = useState('');
    const [oauthInfo, setOauthInfo] = useState({ connected: false, githubUsername: null, oauthConfigured: false });
    const [activeTab, setActiveTab] = useState('changes');

    const refresh = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            const [gitStatus, logData, oauth] = await Promise.all([
                getGitStatus(roomId),
                getGitLog(roomId).catch(() => ({ commits: [] })),
                getOAuthStatus().catch(() => ({ connected: false })),
            ]);
            setStatus(gitStatus);
            setCommits(logData.commits || []);
            setOauthInfo(oauth);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to load Git status');
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (!selectedFile || !status?.isRepo) { setDiff(''); return; }
        const staged = status.staged?.includes(selectedFile);
        getGitDiff(roomId, selectedFile, staged)
            .then((d) => setDiff(d.diff || ''))
            .catch(() => setDiff(''));
    }, [selectedFile, roomId, status]);

    const run = async (key, fn) => {
        setBusy(key);
        try {
            const result = await fn();
            if (result.files) onFilesSynced?.(result.files);
            await refresh();
            return result;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Git operation failed');
            throw err;
        } finally {
            setBusy('');
        }
    };

    const handleConnectOAuth = async () => {
        try {
            const { url } = await getOAuthUrl();
            window.open(url, '_blank', 'noopener,noreferrer');
            toast.success('Complete GitHub authorization in the new tab, then refresh');
        } catch (err) {
            toast.error(err.response?.data?.error || 'OAuth not available — use a personal access token');
            setShowConnect(true);
        }
    };

    const handleSavePat = async () => {
        if (!patToken.trim()) return;
        await run('connect', () => savePatToken(patToken.trim()));
        setPatToken('');
        setShowConnect(false);
        toast.success('GitHub connected');
    };

    const handleDisconnect = async () => {
        await run('disconnect', disconnectGitHub);
        toast.success('GitHub disconnected');
    };

    const handleInit = () => run('init', () => initRepo(roomId)).then(() => toast.success('Repository initialized'));
    const handleClone = () => {
        if (!cloneUrl.trim()) return toast.error('Enter a repository URL');
        run('clone', () => cloneRepo(roomId, cloneUrl.trim(), cloneBranch.trim() || undefined))
            .then(() => { toast.success('Repository cloned'); setCloneUrl(''); });
    };
    const handleCommit = () => {
        if (!commitMsg.trim()) return toast.error('Enter a commit message');
        run('commit', () => commitChanges(roomId, commitMsg, user?.username, user?.email))
            .then(() => { toast.success('Committed'); setCommitMsg(''); });
    };
    const handlePush = () => run('push', () => pushChanges(roomId)).then(() => toast.success('Pushed to remote'));
    const handlePull = () => run('pull', () => pullChanges(roomId)).then(() => toast.success('Pulled from remote'));
    const handleCheckout = (branch) => run('checkout', () => checkoutBranch(roomId, branch)).then(() => toast.success(`Switched to ${branch}`));
    const handleNewBranch = () => {
        if (!newBranch.trim()) return;
        run('branch', () => createBranch(roomId, newBranch.trim())).then(() => { toast.success(`Branch ${newBranch} created`); setNewBranch(''); });
    };

    if (loading && !status) {
        return (
            <div className="git-panel loading">
                <Loader2 size={20} className="spin" />
                <span>Loading source control...</span>
            </div>
        );
    }

    const allChanges = [
        ...(status?.staged || []).map((f) => ({ file: f, status: 'staged' })),
        ...(status?.modified || []).map((f) => ({ file: f, status: 'modified' })),
        ...(status?.untracked || []).map((f) => ({ file: f, status: 'untracked' })),
        ...(status?.deleted || []).map((f) => ({ file: f, status: 'deleted' })),
    ];

    return (
        <div className="git-panel">
            {/* GitHub connection bar */}
            <div className="git-connect-bar">
                {oauthInfo.connected ? (
                    <>
                        <CheckCircle2 size={14} className="text-green" />
                        <span>@{oauthInfo.githubUsername}</span>
                        <button className="git-link-btn" onClick={handleDisconnect} disabled={!!busy}>
                            <Unplug size={12} /> Disconnect
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle size={14} className="text-amber" />
                        <span>GitHub not connected</span>
                        <button className="git-link-btn" onClick={handleConnectOAuth} disabled={!!busy}>
                            <Link2 size={12} /> Connect
                        </button>
                        <button className="git-link-btn" onClick={() => setShowConnect(!showConnect)}>
                            PAT
                        </button>
                    </>
                )}
                <button className="git-icon-btn" onClick={refresh} disabled={!!busy} title="Refresh">
                    <RefreshCw size={13} className={loading ? 'spin' : ''} />
                </button>
            </div>

            {showConnect && !oauthInfo.connected && (
                <div className="git-pat-box">
                    <input
                        type="password"
                        placeholder="GitHub Personal Access Token (repo scope)"
                        value={patToken}
                        onChange={(e) => setPatToken(e.target.value)}
                    />
                    <button onClick={handleSavePat} disabled={!!busy}>Save Token</button>
                </div>
            )}

            {!status?.isRepo ? (
                <div className="git-setup">
                    <p className="git-setup-desc">Initialize Git or clone an existing repository into this workspace.</p>

                    {canWrite && (
                        <button className="git-action-btn primary" onClick={handleInit} disabled={!!busy}>
                            {busy === 'init' ? <Loader2 size={14} className="spin" /> : <GitBranch size={14} />}
                            Initialize Repository
                        </button>
                    )}

                    {isAdmin && (
                        <div className="git-clone-box">
                            <label>Clone from GitHub / GitLab</label>
                            <input
                                placeholder="https://github.com/user/repo.git"
                                value={cloneUrl}
                                onChange={(e) => setCloneUrl(e.target.value)}
                            />
                            <input
                                placeholder="Branch (optional)"
                                value={cloneBranch}
                                onChange={(e) => setCloneBranch(e.target.value)}
                            />
                            <button className="git-action-btn" onClick={handleClone} disabled={!!busy}>
                                {busy === 'clone' ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                                Clone Repository
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Branch & sync toolbar */}
                    <div className="git-toolbar">
                        <div className="git-branch-select">
                            <GitBranch size={13} />
                            <select
                                value={status.branch || ''}
                                onChange={(e) => handleCheckout(e.target.value)}
                                disabled={!canWrite || !!busy}
                            >
                                {(status.branches || []).map((b) => (
                                    <option key={b} value={b.replace('remotes/origin/', '')}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div className="git-sync-btns">
                            <button onClick={handlePull} disabled={!canWrite || !!busy} title="Pull">
                                {busy === 'pull' ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                            </button>
                            <button onClick={handlePush} disabled={!canWrite || !!busy || !oauthInfo.connected} title="Push">
                                {busy === 'push' ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
                            </button>
                        </div>
                    </div>

                    {(status.ahead > 0 || status.behind > 0) && (
                        <div className="git-tracking-badge">
                            {status.behind > 0 && <span>↓ {status.behind} behind</span>}
                            {status.ahead > 0 && <span>↑ {status.ahead} ahead</span>}
                            {status.tracking && <span className="muted"> of {status.tracking}</span>}
                        </div>
                    )}

                    {canWrite && (
                        <div className="git-new-branch">
                            <input
                                placeholder="New branch name"
                                value={newBranch}
                                onChange={(e) => setNewBranch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNewBranch()}
                            />
                            <button onClick={handleNewBranch} disabled={!!busy}><Plus size={13} /></button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="git-tabs">
                        <button className={activeTab === 'changes' ? 'active' : ''} onClick={() => setActiveTab('changes')}>
                            Changes {allChanges.length > 0 && `(${allChanges.length})`}
                        </button>
                        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                            History
                        </button>
                        {selectedFile && (
                            <button className={activeTab === 'diff' ? 'active' : ''} onClick={() => setActiveTab('diff')}>
                                Diff
                            </button>
                        )}
                    </div>

                    {activeTab === 'changes' && (
                        <div className="git-changes">
                            {canWrite && allChanges.length > 0 && (
                                <div className="git-bulk-actions">
                                    <button onClick={() => run('stage', () => stageFiles(roomId))} disabled={!!busy}>
                                        Stage All
                                    </button>
                                    <button onClick={() => run('unstage', () => unstageFiles(roomId))} disabled={!!busy}>
                                        Unstage All
                                    </button>
                                </div>
                            )}

                            {allChanges.length === 0 ? (
                                <div className="git-empty">
                                    <CheckCircle2 size={24} />
                                    <span>Working tree clean</span>
                                </div>
                            ) : (
                                allChanges.map(({ file, status: st }) => (
                                    <FileStatusRow
                                        key={`${st}-${file}`}
                                        file={file}
                                        status={st}
                                        selected={selectedFile === file}
                                        canWrite={canWrite}
                                        onSelect={setSelectedFile}
                                        onStage={(files) => run('stage', () => stageFiles(roomId, files))}
                                        onUnstage={(files) => run('unstage', () => unstageFiles(roomId, files))}
                                    />
                                ))
                            )}

                            {canWrite && (
                                <div className="git-commit-box">
                                    <textarea
                                        placeholder="Commit message"
                                        value={commitMsg}
                                        onChange={(e) => setCommitMsg(e.target.value)}
                                        rows={3}
                                    />
                                    <button
                                        className="git-action-btn primary"
                                        onClick={handleCommit}
                                        disabled={!!busy || (status.staged?.length || 0) === 0}
                                    >
                                        {busy === 'commit' ? <Loader2 size={14} className="spin" /> : <GitCommit size={14} />}
                                        Commit ({status.staged?.length || 0} staged)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="git-history">
                            {commits.length === 0 ? (
                                <div className="git-empty"><span>No commits yet</span></div>
                            ) : (
                                commits.map((c) => (
                                    <div key={c.hash} className="git-commit-item">
                                        <div className="git-commit-msg">{c.message}</div>
                                        <div className="git-commit-meta">
                                            <span>{c.author}</span>
                                            <span>{new Date(c.date).toLocaleString()}</span>
                                        </div>
                                        <code className="git-commit-hash">{c.hash.slice(0, 7)}</code>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'diff' && selectedFile && (
                        <div className="git-diff-view">
                            <div className="git-diff-header">{selectedFile}</div>
                            <pre className="git-diff-content">{diff || 'No diff available'}</pre>
                        </div>
                    )}

                    {status.remotes?.length > 0 && (
                        <div className="git-remotes">
                            <span className="git-remotes-label">Remotes</span>
                            {status.remotes.map((r) => (
                                <div key={r.name} className="git-remote-row">
                                    <strong>{r.name}</strong>
                                    <span>{r.url}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GitPanel;
