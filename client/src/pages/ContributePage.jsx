import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import {
  Plus, Code2, Trophy, Users, CheckCircle2, X, AlertTriangle,
  ChevronRight, ChevronLeft, BookOpen, Tag, Activity, Check,
  Loader2, Shield, Eye, Trash2, HelpCircle, FileText, Sparkles,
  Zap, Clock, Star, GitPullRequest, ArrowUpRight
} from 'lucide-react';
import './ContributePage.css';

const ContributePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [contributions, setContributions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    difficulty: 'easy',
    category: 'algorithms',
    tags: '',
    description: '',
    starterCode: '// Write your problem starter code stub here\n\nfunction solution(input) {\n  // your logic here\n}\n',
    testCases: [{ input: '', expected: '' }]
  });

  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    points: 80,
    timeLimit: 300,
    editTitle: '',
    editDifficulty: 'easy',
    editCategory: 'algorithms',
    editTags: '',
    editDescription: '',
    editStarterCode: '',
    editTestCases: []
  });

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchData();
  }, [user]);

  const getToken = () => user?.token || localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('No auth token found. Please log in again.');

      const [myRes, pendingRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/contribute/my`, { headers: { Authorization: `Bearer ${token}` } }),
        user?.username === 'admin'
          ? axios.get(`${API_URL}/api/contribute/pending`, { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve({ data: { pending: [] } })
      ]);

      if (myRes.status === 'fulfilled') {
        setContributions(myRes.value.data.contributions || []);
      } else {
        throw new Error(myRes.reason?.response?.data?.error || 'Could not fetch your contributions');
      }

      if (pendingRes.status === 'fulfilled') {
        setPendingReviews(pendingRes.value.data.pending || []);
      }
    } catch (err) {
      console.error('[ContributePage] fetchData error:', err);
      const msg = err.message || 'Failed to load contributor data';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => setForm(p => ({ ...p, testCases: [...p.testCases, { input: '', expected: '' }] }));
  const removeTestCase = (idx) => { if (form.testCases.length <= 1) return; setForm(p => ({ ...p, testCases: p.testCases.filter((_, i) => i !== idx) })); };
  const updateTestCase = (idx, field, value) => { setForm(p => { const copy = [...p.testCases]; copy[idx] = { ...copy[idx], [field]: value }; return { ...p, testCases: copy }; }); };

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Problem title is required');
    if (!form.description.trim()) return toast.error('Problem description is required');
    const invalidCase = form.testCases.some(tc => !tc.input.trim() || !tc.expected.trim());
    if (invalidCase) return toast.error('All test cases need both input and expected output');

    setSubmitting(true);
    try {
      const token = getToken();
      const parsedTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await axios.post(`${API_URL}/api/contribute/submit`, {
        title: form.title, difficulty: form.difficulty, category: form.category,
        tags: parsedTags, description: form.description, starterCode: form.starterCode, testCases: form.testCases
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success('Challenge submitted for review! 🎉');
        setShowWizard(false);
        setForm({ title: '', difficulty: 'easy', category: 'algorithms', tags: '', description: '', starterCode: '// Write your problem starter code stub here\n\nfunction solution(input) {\n  // your logic here\n}\n', testCases: [{ input: '', expected: '' }] });
        setWizardStep(1);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (problem) => {
    setSelectedReview(problem);
    setReviewForm({
      points: problem.difficulty === 'easy' ? 50 : problem.difficulty === 'medium' ? 100 : 150,
      timeLimit: 300,
      editTitle: problem.title,
      editDifficulty: problem.difficulty,
      editCategory: problem.category || 'algorithms',
      editTags: Array.isArray(problem.tags) ? problem.tags.join(', ') : '',
      editDescription: problem.description,
      editStarterCode: problem.starter_code || problem.starterCode || '',
      editTestCases: problem.test_cases || problem.testCases || []
    });
  };

  const handleReviewAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this contribution?`)) return;
    try {
      const token = getToken();
      const parsedTags = reviewForm.editTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await axios.post(`${API_URL}/api/contribute/review/${selectedReview.id}`, {
        action, points: reviewForm.points, timeLimit: reviewForm.timeLimit,
        editTitle: reviewForm.editTitle, editDifficulty: reviewForm.editDifficulty,
        editCategory: reviewForm.editCategory, editTags: parsedTags,
        editDescription: reviewForm.editDescription, editStarterCode: reviewForm.editStarterCode,
        editTestCases: reviewForm.editTestCases
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success(res.data.message || 'Review submitted.');
        setSelectedReview(null);
        fetchData();
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit review'); }
  };

  const updateReviewTestCase = (idx, field, value) => { setReviewForm(p => { const copy = [...p.editTestCases]; copy[idx] = { ...copy[idx], [field]: value }; return { ...p, editTestCases: copy }; }); };
  const addReviewTestCase = () => setReviewForm(p => ({ ...p, editTestCases: [...p.editTestCases, { input: '', expected: '' }] }));
  const removeReviewTestCase = (idx) => { if (reviewForm.editTestCases.length <= 1) return; setReviewForm(p => ({ ...p, editTestCases: p.editTestCases.filter((_, i) => i !== idx) })); };

  const totalSubmissions = contributions.length;
  const approvedCount = contributions.filter(c => c.status === 'approved').length;
  const pendingCount = contributions.filter(c => c.status === 'pending').length;
  const rejectedCount = contributions.filter(c => c.status === 'rejected').length;

  const stepLabels = ['Problem Info', 'Starter Code', 'Test Cases'];

  return (
    <div className="cp-page">
      {/* ── Hero Banner ── */}
      <div className="cp-hero">
        <div className="cp-hero-glow" />
        <div className="cp-hero-grid" />
        <div className="cp-hero-content">
          <div className="cp-hero-badge">
            <GitPullRequest size={13} />
            <span>Open Contributions</span>
          </div>
          <h1 className="cp-hero-title">
            Shape the <span className="cp-gradient-text">BrightCode</span> Library
          </h1>
          <p className="cp-hero-sub">
            Design problems, craft test suites, and earn <strong>+500 XP</strong> when your challenge goes live.
          </p>
          <div className="cp-hero-actions">
            <button className="cp-btn-primary" onClick={() => setShowWizard(true)}>
              <Plus size={16} /> Submit a Challenge
            </button>
            <button className="cp-btn-ghost" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
              View My Submissions <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Floating stat pills */}
        <div className="cp-hero-pills">
          <div className="cp-pill green"><CheckCircle2 size={14}/> {approvedCount} Live</div>
          <div className="cp-pill yellow"><Clock size={14}/> {pendingCount} In Review</div>
          <div className="cp-pill red"><Zap size={14}/> +{approvedCount * 500} XP</div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="cp-body">

        {/* ── Tab bar ── */}
        <div className="cp-tabs">
          <button className={`cp-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Activity size={15} /> My Dashboard
          </button>
          {user?.username === 'admin' && (
            <button className={`cp-tab admin-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={15} /> Moderation Queue
              {pendingReviews.length > 0 && <span className="cp-badge-count">{pendingReviews.length}</span>}
            </button>
          )}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="cp-dashboard">
            {/* Stat cards */}
            <div className="cp-stats-row">
              {[
                { label: 'Total Submitted', value: totalSubmissions, icon: <FileText size={20}/>, color: 'default' },
                { label: 'Live & Approved', value: approvedCount, icon: <CheckCircle2 size={20}/>, color: 'green', sub: `+${approvedCount * 500} XP` },
                { label: 'Pending Review', value: pendingCount, icon: <Clock size={20}/>, color: 'yellow' },
                { label: 'Declined', value: rejectedCount, icon: <X size={20}/>, color: 'red' },
              ].map((s, i) => (
                <motion.div key={i} className={`cp-stat-card ${s.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div className="cp-stat-icon">{s.icon}</div>
                  <div className="cp-stat-val">{s.value}</div>
                  <div className="cp-stat-label">{s.label}</div>
                  {s.sub && <div className="cp-stat-sub">{s.sub}</div>}
                </motion.div>
              ))}
            </div>

            {/* Submissions panel */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div>
                  <h2>Your Submissions</h2>
                  <p>Track the status of every challenge you've contributed.</p>
                </div>
                <button className="cp-btn-primary sm" onClick={() => setShowWizard(true)}>
                  <Plus size={15}/> New Challenge
                </button>
              </div>

              {loading ? (
                <div className="cp-loading">
                  <Loader2 className="cp-spinner" size={28}/>
                  <span>Loading your contributions…</span>
                </div>
              ) : loadError ? (
                <div className="cp-error-state">
                  <AlertTriangle size={36}/>
                  <h3>Couldn't load data</h3>
                  <p>{loadError}</p>
                  <button className="cp-btn-ghost sm" onClick={fetchData}>Try Again</button>
                </div>
              ) : contributions.length === 0 ? (
                <div className="cp-empty-state">
                  <div className="cp-empty-icon"><Sparkles size={32}/></div>
                  <h3>No Contributions Yet</h3>
                  <p>Be the first to shape the BrightCode challenge deck. Submit a problem and earn XP when it goes live!</p>
                  <button className="cp-btn-primary" onClick={() => setShowWizard(true)}>
                    <Plus size={15}/> Create First Problem
                  </button>
                </div>
              ) : (
                <div className="cp-table">
                  <div className="cp-table-head">
                    <span>Title</span>
                    <span>Category</span>
                    <span>Difficulty</span>
                    <span>Status</span>
                    <span>Submitted</span>
                  </div>
                  <div className="cp-table-body">
                    {contributions.map((c, i) => (
                      <motion.div key={c.id} className="cp-table-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <span className="cp-row-title">{c.title}</span>
                        <span className="cp-row-cat">{c.category || '—'}</span>
                        <span><span className={`cp-diff-badge ${c.difficulty}`}>{c.difficulty}</span></span>
                        <span><span className={`cp-status-badge ${c.status}`}>{c.status}</span></span>
                        <span className="cp-row-date">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="cp-how-it-works">
              <h3><Sparkles size={16}/> How Contributions Work</h3>
              <div className="cp-steps-row">
                {['Design your coding problem with a clear statement & examples', 'Add a code template stub and define test cases', 'Submit for admin moderation review', 'Get approved → earn +500 XP and your problem goes live!'].map((text, i) => (
                  <div key={i} className="cp-how-step">
                    <div className="cp-how-num">{i + 1}</div>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Admin Tab ── */}
        {activeTab === 'admin' && user?.username === 'admin' && (
          <div className="cp-admin-panel">
            <div className="cp-panel-header">
              <div>
                <h2><Shield size={18}/> Moderation Queue</h2>
                <p>Review community submissions, verify test suites, and deploy them live.</p>
              </div>
            </div>

            {loading ? (
              <div className="cp-loading"><Loader2 className="cp-spinner" size={28}/><span>Loading queue…</span></div>
            ) : pendingReviews.length === 0 ? (
              <div className="cp-empty-state clean">
                <div className="cp-empty-icon green"><CheckCircle2 size={32}/></div>
                <h3>Queue is clear!</h3>
                <p>All submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="cp-queue-list">
                {pendingReviews.map((problem, i) => (
                  <motion.div key={problem.id} className="cp-queue-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="cp-queue-left">
                      <div className="cp-queue-meta">
                        <span className={`cp-diff-badge ${problem.difficulty}`}>{problem.difficulty}</span>
                        <span className="cp-queue-cat">{problem.category}</span>
                      </div>
                      <h3 className="cp-queue-title">{problem.title}</h3>
                      <p className="cp-queue-by">by <strong>@{problem.contributor_username}</strong> · {new Date(problem.created_at).toLocaleDateString()}</p>
                      <p className="cp-queue-preview">{problem.description?.slice(0, 120)}{problem.description?.length > 120 ? '…' : ''}</p>
                    </div>
                    <button className="cp-review-btn" onClick={() => handleOpenReview(problem)}>
                      <Eye size={15}/> Inspect & Review
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ WIZARD MODAL ═══════════ */}
      <AnimatePresence>
        {showWizard && (
          <>
            <motion.div className="cp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWizard(false)} />
            <div className="cp-modal-centering">
            <motion.div className="cp-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              {/* Modal header */}
              <div className="cp-modal-header">
                <div className="cp-modal-title">
                  <div className="cp-modal-icon"><Plus size={18}/></div>
                  <div>
                    <h2>Submit a Challenge</h2>
                    <p>Step {wizardStep} of 3 — {stepLabels[wizardStep - 1]}</p>
                  </div>
                </div>
                <button className="cp-close-btn" onClick={() => setShowWizard(false)}><X size={18}/></button>
              </div>

              {/* Progress bar */}
              <div className="cp-progress-bar">
                {stepLabels.map((label, i) => (
                  <React.Fragment key={i}>
                    <div className={`cp-progress-step ${wizardStep > i ? 'done' : ''} ${wizardStep === i + 1 ? 'current' : ''}`}>
                      <div className="cp-prog-circle">
                        {wizardStep > i + 1 ? <Check size={12}/> : i + 1}
                      </div>
                      <span>{label}</span>
                    </div>
                    {i < stepLabels.length - 1 && <div className={`cp-prog-line ${wizardStep > i + 1 ? 'done' : ''}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitContribution} className="cp-modal-body">
                <AnimatePresence mode="wait">
                  {/* Step 1 */}
                  {wizardStep === 1 && (
                    <motion.div key="step1" className="cp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="cp-form-row">
                        <div className="cp-form-group cp-flex1">
                          <label>Problem Title <span className="req">*</span></label>
                          <input type="text" className="cp-input" placeholder="e.g. Reverse a Linked List" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </div>
                        <div className="cp-form-group">
                          <label>Difficulty <span className="req">*</span></label>
                          <select className="cp-input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>
                      <div className="cp-form-row mt2">
                        <div className="cp-form-group cp-flex1">
                          <label>Category</label>
                          <select className="cp-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            <option value="algorithms">Algorithms</option>
                            <option value="data_structures">Data Structures</option>
                            <option value="concurrency">Concurrency</option>
                            <option value="database">Database</option>
                            <option value="math">Math</option>
                            <option value="strings">Strings</option>
                          </select>
                        </div>
                        <div className="cp-form-group cp-flex1">
                          <label>Tags (comma separated)</label>
                          <input type="text" className="cp-input" placeholder="e.g. arrays, two-pointers" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                        </div>
                      </div>
                      <div className="cp-form-group mt2">
                        <label>Problem Statement <span className="req">*</span></label>
                        <p className="cp-input-tip">Describe the task clearly. Include constraints, input/output format, and at least one example.</p>
                        <textarea className="cp-textarea" style={{ minHeight: '200px' }} placeholder="Given an array of integers, return the two numbers that add up to a target..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 */}
                  {wizardStep === 2 && (
                    <motion.div key="step2" className="cp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="cp-form-group">
                        <label>Starter Code / Boilerplate</label>
                        <p className="cp-input-tip">Provide a code template that players will build their solution on. The function signature should be included.</p>
                        <textarea className="cp-textarea cp-mono" style={{ minHeight: '320px' }} value={form.starterCode} onChange={e => setForm(f => ({ ...f, starterCode: e.target.value }))} />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 */}
                  {wizardStep === 3 && (
                    <motion.div key="step3" className="cp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="cp-tc-header">
                        <div>
                          <h3>Test Cases</h3>
                          <p className="cp-input-tip">Define at least one input/output pair that will be used to validate solutions.</p>
                        </div>
                        <button type="button" className="cp-add-tc-btn" onClick={addTestCase}><Plus size={13}/> Add Case</button>
                      </div>
                      <div className="cp-tc-list">
                        {form.testCases.map((tc, idx) => (
                          <div key={idx} className="cp-tc-row">
                            <div className="cp-tc-num">#{idx + 1}</div>
                            <div className="cp-form-group cp-flex1">
                              <label>Input</label>
                              <textarea className="cp-textarea cp-mono sm" placeholder="5\n[1,2,3,4,5]" value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} required />
                            </div>
                            <div className="cp-form-group cp-flex1">
                              <label>Expected Output</label>
                              <textarea className="cp-textarea cp-mono sm" placeholder="15" value={tc.expected} onChange={e => updateTestCase(idx, 'expected', e.target.value)} required />
                            </div>
                            {form.testCases.length > 1 && (
                              <button type="button" className="cp-del-btn" onClick={() => removeTestCase(idx)}><Trash2 size={15}/></button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="cp-modal-footer">
                  {wizardStep > 1 ? (
                    <button type="button" className="cp-btn-secondary" onClick={() => setWizardStep(s => s - 1)}>
                      <ChevronLeft size={16}/> Back
                    </button>
                  ) : (
                    <button type="button" className="cp-btn-secondary" onClick={() => setShowWizard(false)}>Cancel</button>
                  )}
                  {wizardStep < 3 ? (
                    <button type="button" className="cp-btn-primary" onClick={() => setWizardStep(s => s + 1)}>
                      Continue <ChevronRight size={16}/>
                    </button>
                  ) : (
                    <button type="submit" className="cp-btn-primary submit-btn" disabled={submitting}>
                      {submitting ? <><Loader2 size={15} className="cp-spinner-sm"/> Submitting…</> : <><CheckCircle2 size={15}/> Submit Challenge</>}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ ADMIN REVIEW MODAL ═══════════ */}
      <AnimatePresence>
        {selectedReview && (
          <>
            <motion.div className="cp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReview(null)} />
            <div className="cp-modal-centering">
            <motion.div className="cp-modal large" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="cp-modal-header">
                <div className="cp-modal-title">
                  <div className="cp-modal-icon admin"><Shield size={18}/></div>
                  <div>
                    <h2>Moderate Submission</h2>
                    <p>Review, edit, and deploy or reject this contribution</p>
                  </div>
                </div>
                <button className="cp-close-btn" onClick={() => setSelectedReview(null)}><X size={18}/></button>
              </div>

              <div className="cp-modal-body review-body">
                <div className="cp-form-row">
                  <div className="cp-form-group cp-flex1">
                    <label>Title</label>
                    <input type="text" className="cp-input" value={reviewForm.editTitle} onChange={e => setReviewForm(f => ({ ...f, editTitle: e.target.value }))} />
                  </div>
                  <div className="cp-form-group">
                    <label>Difficulty</label>
                    <select className="cp-input" value={reviewForm.editDifficulty} onChange={e => setReviewForm(f => ({ ...f, editDifficulty: e.target.value }))}>
                      <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="cp-form-row mt2">
                  <div className="cp-form-group">
                    <label>Reward Points</label>
                    <input type="number" className="cp-input" value={reviewForm.points} onChange={e => setReviewForm(f => ({ ...f, points: parseInt(e.target.value) || 80 }))} />
                  </div>
                  <div className="cp-form-group">
                    <label>Time Limit (sec)</label>
                    <input type="number" className="cp-input" value={reviewForm.timeLimit} onChange={e => setReviewForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 300 }))} />
                  </div>
                  <div className="cp-form-group cp-flex1">
                    <label>Tags</label>
                    <input type="text" className="cp-input" value={reviewForm.editTags} onChange={e => setReviewForm(f => ({ ...f, editTags: e.target.value }))} />
                  </div>
                </div>
                <div className="cp-form-group mt2">
                  <label>Description</label>
                  <textarea className="cp-textarea" style={{ minHeight: '130px' }} value={reviewForm.editDescription} onChange={e => setReviewForm(f => ({ ...f, editDescription: e.target.value }))} />
                </div>
                <div className="cp-form-group mt2">
                  <label>Starter Code</label>
                  <textarea className="cp-textarea cp-mono" style={{ minHeight: '160px' }} value={reviewForm.editStarterCode} onChange={e => setReviewForm(f => ({ ...f, editStarterCode: e.target.value }))} />
                </div>
                <div className="cp-form-group mt2">
                  <div className="cp-tc-header small">
                    <label>Test Cases</label>
                    <button type="button" className="cp-add-tc-btn xs" onClick={addReviewTestCase}><Plus size={12}/> Add</button>
                  </div>
                  <div className="cp-tc-list">
                    {reviewForm.editTestCases.map((tc, idx) => (
                      <div key={idx} className="cp-tc-row compact">
                        <div className="cp-tc-num">#{idx + 1}</div>
                        <div className="cp-form-group cp-flex1">
                          <input type="text" className="cp-input cp-mono" placeholder="Input" value={tc.input} onChange={e => updateReviewTestCase(idx, 'input', e.target.value)} />
                        </div>
                        <div className="cp-form-group cp-flex1">
                          <input type="text" className="cp-input cp-mono" placeholder="Expected" value={tc.expected} onChange={e => updateReviewTestCase(idx, 'expected', e.target.value)} />
                        </div>
                        {reviewForm.editTestCases.length > 1 && (
                          <button type="button" className="cp-del-btn" onClick={() => removeReviewTestCase(idx)}><X size={14}/></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cp-review-footer">
                <button className="cp-reject-btn" onClick={() => handleReviewAction('reject')}>
                  <X size={15}/> Reject Submission
                </button>
                <button className="cp-approve-btn" onClick={() => handleReviewAction('approve')}>
                  <CheckCircle2 size={15}/> Approve & Launch Live
                </button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContributePage;
