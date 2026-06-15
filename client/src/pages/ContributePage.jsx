import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import {
  Plus, Code2, Trophy, Users, CheckCircle2, X, AlertTriangle,
  ChevronRight, ChevronLeft, BookOpen, Tag, Activity, Check,
  Loader2, Shield, Eye, Trash2, HelpCircle, FileText
} from 'lucide-react';
import './ContributePage.css';

const ContributePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, admin (visible to admins)
  const [contributions, setContributions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard Modal
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Details, 2: Starter Code, 3: Test cases
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    difficulty: 'easy',
    category: 'algorithms',
    tags: '',
    description: '',
    starterCode: '// Write your problem starter code stub here\n\n',
    testCases: [{ input: '', expected: '' }]
  });

  // Admin Review Modal
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
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || user?.token;
      
      // Fetch personal contributions
      const resMy = await axios.get(`${API_URL}/api/contribute/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContributions(resMy.data.contributions || []);

      // Fetch pending reviews if admin
      if (user?.username === 'admin') {
        const resPending = await axios.get(`${API_URL}/api/contribute/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingReviews(resPending.data.pending || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contributor data');
    } finally {
      setLoading(false);
    }
  };

  // Add/Remove test cases in wizard
  const addTestCase = () => {
    setForm(p => ({ ...p, testCases: [...p.testCases, { input: '', expected: '' }] }));
  };

  const removeTestCase = (idx) => {
    if (form.testCases.length <= 1) return;
    setForm(p => ({ ...p, testCases: p.testCases.filter((_, i) => i !== idx) }));
  };

  const updateTestCase = (idx, field, value) => {
    setForm(p => {
      const copy = [...p.testCases];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...p, testCases: copy };
    });
  };

  // Submit challenge contribution
  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Problem title is required');
    if (!form.description.trim()) return toast.error('Problem description is required');
    
    // Validate test cases
    const invalidCase = form.testCases.some(tc => !tc.input.trim() || !tc.expected.trim());
    if (invalidCase) return toast.error('All test cases must have an input and expected output');

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || user?.token;
      const parsedTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const payload = {
        title: form.title,
        difficulty: form.difficulty,
        category: form.category,
        tags: parsedTags,
        description: form.description,
        starterCode: form.starterCode,
        testCases: form.testCases
      };

      const res = await axios.post(`${API_URL}/api/contribute/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Challenge submitted successfully for moderation!');
        setShowWizard(false);
        setForm({
          title: '',
          difficulty: 'easy',
          category: 'algorithms',
          tags: '',
          description: '',
          starterCode: '// Write your problem starter code stub here\n\n',
          testCases: [{ input: '', expected: '' }]
        });
        setWizardStep(1);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  // Open review editor
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
      editStarterCode: problem.starterCode || '',
      editTestCases: problem.testCases || []
    });
  };

  const handleReviewAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this contribution?`)) return;
    
    try {
      const token = localStorage.getItem('token') || user?.token;
      const parsedTags = reviewForm.editTags.split(',').map(t => t.trim()).filter(Boolean);
      
      const payload = {
        action,
        points: reviewForm.points,
        timeLimit: reviewForm.timeLimit,
        editTitle: reviewForm.editTitle,
        editDifficulty: reviewForm.editDifficulty,
        editCategory: reviewForm.editCategory,
        editTags: parsedTags,
        editDescription: reviewForm.editDescription,
        editStarterCode: reviewForm.editStarterCode,
        editTestCases: reviewForm.editTestCases
      };

      const res = await axios.post(`${API_URL}/api/contribute/review/${selectedReview.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(res.data.message || `Submission successfully reviewed.`);
        setSelectedReview(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  // Edit test cases in admin review
  const updateReviewTestCase = (idx, field, value) => {
    setReviewForm(p => {
      const copy = [...p.editTestCases];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...p, editTestCases: copy };
    });
  };

  const addReviewTestCase = () => {
    setReviewForm(p => ({ ...p, editTestCases: [...p.editTestCases, { input: '', expected: '' }] }));
  };

  const removeReviewTestCase = (idx) => {
    if (reviewForm.editTestCases.length <= 1) return;
    setReviewForm(p => ({ ...p, editTestCases: p.editTestCases.filter((_, i) => i !== idx) }));
  };

  // Stats calculation
  const totalSubmissions = contributions.length;
  const approvedCount = contributions.filter(c => c.status === 'approved').length;
  const pendingCount = contributions.filter(c => c.status === 'pending').length;
  const rejectedCount = contributions.filter(c => c.status === 'rejected').length;

  return (
    <div className="contribute-page">
      <div className="contribute-header-banner">
        <div className="banner-overlay" />
        <div className="banner-content">
          <Shield size={28} className="banner-icon" />
          <h1>Community Contributor Console</h1>
          <p>Design challenges, verify test cases, and earn XP to build BrightCode together.</p>
        </div>
      </div>

      <div className="contribute-container">
        {/* Navigation Tabs */}
        <div className="contribute-tabs">
          <button
            className={`tab-trigger ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={16} />
            <span>Dashboard</span>
          </button>
          {user?.username === 'admin' && (
            <button
              className={`tab-trigger admin-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={16} />
              <span>Moderation Review ({pendingReviews.length})</span>
            </button>
          )}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="contribute-dashboard">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="card-label">Total Submitted</div>
                <div className="card-value">{totalSubmissions}</div>
              </div>
              <div className="stat-card approved">
                <div className="card-label">Approved &amp; Live</div>
                <div className="card-value">{approvedCount}</div>
                <span className="xp-gain">+{approvedCount * 500} XP Earned</span>
              </div>
              <div className="stat-card pending">
                <div className="card-label">Pending Review</div>
                <div className="card-value">{pendingCount}</div>
              </div>
              <div className="stat-card rejected">
                <div className="card-label">Declined</div>
                <div className="card-value">{rejectedCount}</div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="submissions-section">
              <div className="section-header">
                <div>
                  <h2>Your Submissions</h2>
                  <p>Track the approval status of your contributed challenges.</p>
                </div>
                <button className="primary-action-btn" onClick={() => setShowWizard(true)}>
                  <Plus size={16} />
                  <span>Submit a Challenge</span>
                </button>
              </div>

              {loading ? (
                <div className="list-loading">
                  <Loader2 className="spinner" />
                  <span>Loading submissions...</span>
                </div>
              ) : contributions.length === 0 ? (
                <div className="empty-state-card">
                  <HelpCircle size={40} />
                  <h3>No Contributions Yet</h3>
                  <p>Help build the BrightCode challenge library. Submit your first coding problem to earn XP!</p>
                  <button className="primary-action-btn mt-4" onClick={() => setShowWizard(true)}>
                    <Plus size={16} />
                    <span>Create Problem</span>
                  </button>
                </div>
              ) : (
                <div className="submissions-table">
                  <div className="table-head">
                    <span>Title</span>
                    <span>Category</span>
                    <span>Difficulty</span>
                    <span>Status</span>
                    <span>Submitted On</span>
                  </div>
                  <div className="table-body">
                    {contributions.map((c) => (
                      <div key={c.id} className="table-row">
                        <span className="row-title">{c.title}</span>
                        <span className="row-category">{c.category}</span>
                        <span className="row-difficulty">
                          <span className={`diff-badge ${c.difficulty}`}>{c.difficulty}</span>
                        </span>
                        <span className="row-status">
                          <span className={`status-badge ${c.status}`}>{c.status}</span>
                        </span>
                        <span className="row-date">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Review Tab */}
        {activeTab === 'admin' && user?.username === 'admin' && (
          <div className="admin-moderation-panel">
            <h2>Pending Submissions Queue</h2>
            <p className="subtitle">Review community questions, verify test structures, and deploy them live.</p>

            {loading ? (
              <div className="list-loading">
                <Loader2 className="spinner" />
                <span>Loading moderation queue...</span>
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="empty-state-card clean">
                <CheckCircle2 size={40} style={{ color: '#4ade80' }} />
                <h3>Queue Clear!</h3>
                <p>All contributed challenges have been reviewed.</p>
              </div>
            ) : (
              <div className="pending-queue-list">
                {pendingReviews.map((problem) => (
                  <div key={problem.id} className="queue-item">
                    <div className="queue-item-info">
                      <h3>{problem.title}</h3>
                      <div className="meta-row">
                        <span className="meta-item">By: <strong>@{problem.contributor_username}</strong></span>
                        <span className="meta-item">Difficulty: <strong className={`diff-text ${problem.difficulty}`}>{problem.difficulty}</strong></span>
                        <span className="meta-item">Category: <strong>{problem.category}</strong></span>
                      </div>
                    </div>
                    <button className="review-action-btn" onClick={() => handleOpenReview(problem)}>
                      <span>Inspect &amp; Review</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WIZARD MODAL */}
      <AnimatePresence>
        {showWizard && (
          <>
            <div className="wizard-overlay" onClick={() => setShowWizard(false)} />
            <div className="wizard-modal">
              <div className="wizard-header">
                <div className="header-left">
                  <Plus size={20} />
                  <h2>Create New Problem</h2>
                </div>
                <button className="close-btn" onClick={() => setShowWizard(false)}><X size={18} /></button>
              </div>

              {/* Progress Steps */}
              <div className="wizard-steps-indicator">
                <div className={`step-node ${wizardStep >= 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}>
                  <div className="node-num">{wizardStep > 1 ? <Check size={12} /> : '1'}</div>
                  <span>Metadata</span>
                </div>
                <div className="step-line" />
                <div className={`step-node ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
                  <div className="node-num">{wizardStep > 2 ? <Check size={12} /> : '2'}</div>
                  <span>Template</span>
                </div>
                <div className="step-line" />
                <div className={`step-node ${wizardStep >= 3 ? 'active' : ''}`}>
                  <div className="node-num">3</div>
                  <span>Test Cases</span>
                </div>
              </div>

              <form onSubmit={handleSubmitContribution} className="wizard-form-body">
                {/* Step 1: Metadata */}
                {wizardStep === 1 && (
                  <div className="wizard-step-content">
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label>Problem Title *</label>
                        <input
                          type="text"
                          className="premium-input"
                          placeholder="e.g. Reverse a String"
                          value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Difficulty *</label>
                        <select
                          className="premium-input"
                          value={form.difficulty}
                          onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row mt-3">
                      <div className="form-group flex-1">
                        <label>Category</label>
                        <select
                          className="premium-input"
                          value={form.category}
                          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        >
                          <option value="algorithms">Algorithms</option>
                          <option value="data_structures">Data Structures</option>
                          <option value="concurrency">Concurrency</option>
                          <option value="database">Databases</option>
                        </select>
                      </div>
                      <div className="form-group flex-1">
                        <label>Tags (Comma separated)</label>
                        <input
                          type="text"
                          className="premium-input"
                          placeholder="e.g. strings, recursion, pointers"
                          value={form.tags}
                          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Problem Statement / Description (Markdown supported) *</label>
                      <textarea
                        className="premium-textarea"
                        placeholder="Write a clear statement. Describe the task, constraints, input format, output format, and examples."
                        style={{ minHeight: '180px' }}
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Starter code */}
                {wizardStep === 2 && (
                  <div className="wizard-step-content">
                    <div className="form-group">
                      <label>Starter Code Stub / Boilerplate</label>
                      <p className="input-tip">Write a code snippet template that players can build their solution on top of.</p>
                      <textarea
                        className="premium-textarea code-area-mono"
                        style={{ minHeight: '300px', fontFamily: 'monospace' }}
                        value={form.starterCode}
                        onChange={e => setForm(f => ({ ...f, starterCode: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Test Suite */}
                {wizardStep === 3 && (
                  <div className="wizard-step-content test-suite-step">
                    <div className="test-cases-header">
                      <h3>Define Test Cases</h3>
                      <button type="button" className="add-case-btn" onClick={addTestCase}>
                        <Plus size={14} /> Add Test Case
                      </button>
                    </div>

                    <div className="test-cases-list">
                      {form.testCases.map((tc, idx) => (
                        <div key={idx} className="test-case-row">
                          <div className="tc-index">#{idx + 1}</div>
                          <div className="form-group flex-1">
                            <label>Input (stdIn payload)</label>
                            <textarea
                              className="premium-textarea tc-area-mono"
                              placeholder="e.g. hello"
                              value={tc.input}
                              onChange={e => updateTestCase(idx, 'input', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group flex-1">
                            <label>Expected Output (stdOut expected)</label>
                            <textarea
                              className="premium-textarea tc-area-mono"
                              placeholder="e.g. olleh"
                              value={tc.expected}
                              onChange={e => updateTestCase(idx, 'expected', e.target.value)}
                              required
                            />
                          </div>
                          {form.testCases.length > 1 && (
                            <button type="button" className="delete-case-btn" onClick={() => removeTestCase(idx)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="wizard-footer">
                  {wizardStep > 1 ? (
                    <button type="button" className="secondary-btn" onClick={() => setWizardStep(s => s - 1)}>
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <button type="button" className="secondary-btn" onClick={() => setShowWizard(false)}>
                      Cancel
                    </button>
                  )}

                  {wizardStep < 3 ? (
                    <button type="button" className="primary-btn" onClick={() => setWizardStep(s => s + 1)}>
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" className="primary-btn submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Contribution'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ADMIN REVIEW MODAL */}
      <AnimatePresence>
        {selectedReview && (
          <>
            <div className="wizard-overlay" onClick={() => setSelectedReview(null)} />
            <div className="wizard-modal review-modal">
              <div className="wizard-header">
                <div className="header-left">
                  <Shield size={20} className="admin-color" />
                  <h2>Moderate Challenge Submission</h2>
                </div>
                <button className="close-btn" onClick={() => setSelectedReview(null)}><X size={18}/></button>
              </div>

              <div className="review-modal-body">
                <div className="review-fields-column">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Challenge Title</label>
                      <input
                        type="text"
                        className="premium-input"
                        value={reviewForm.editTitle}
                        onChange={e => setReviewForm(f => ({ ...f, editTitle: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        className="premium-input"
                        value={reviewForm.editDifficulty}
                        onChange={e => setReviewForm(f => ({ ...f, editDifficulty: e.target.value }))}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row mt-3">
                    <div className="form-group">
                      <label>Reward points</label>
                      <input
                        type="number"
                        className="premium-input"
                        value={reviewForm.points}
                        onChange={e => setReviewForm(f => ({ ...f, points: parseInt(e.target.value) || 80 }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time Limit (sec)</label>
                      <input
                        type="number"
                        className="premium-input"
                        value={reviewForm.timeLimit}
                        onChange={e => setReviewForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 300 }))}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Tags</label>
                      <input
                        type="text"
                        className="premium-input"
                        value={reviewForm.editTags}
                        onChange={e => setReviewForm(f => ({ ...f, editTags: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label>Description Statement</label>
                    <textarea
                      className="premium-textarea"
                      style={{ minHeight: '140px' }}
                      value={reviewForm.editDescription}
                      onChange={e => setReviewForm(f => ({ ...f, editDescription: e.target.value }))}
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Boilerplate Starter Code</label>
                    <textarea
                      className="premium-textarea code-area-mono"
                      style={{ minHeight: '180px', fontFamily: 'monospace' }}
                      value={reviewForm.editStarterCode}
                      onChange={e => setReviewForm(f => ({ ...f, editStarterCode: e.target.value }))}
                    />
                  </div>

                  {/* Admin Test Cases */}
                  <div className="form-group mt-3">
                    <div className="test-cases-header">
                      <label>Verify Test Cases</label>
                      <button type="button" className="add-case-btn" onClick={addReviewTestCase}>
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div className="test-cases-list border-box">
                      {reviewForm.editTestCases.map((tc, idx) => (
                        <div key={idx} className="test-case-row small">
                          <div className="form-group flex-1">
                            <input
                              type="text"
                              className="premium-input tc-mono"
                              placeholder="Input"
                              value={tc.input}
                              onChange={e => updateReviewTestCase(idx, 'input', e.target.value)}
                            />
                          </div>
                          <div className="form-group flex-1">
                            <input
                              type="text"
                              className="premium-input tc-mono"
                              placeholder="Expected"
                              value={tc.expected}
                              onChange={e => updateReviewTestCase(idx, 'expected', e.target.value)}
                            />
                          </div>
                          {reviewForm.editTestCases.length > 1 && (
                            <button type="button" className="delete-case-btn" onClick={() => removeReviewTestCase(idx)}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="review-footer">
                <button className="reject-btn" onClick={() => handleReviewAction('reject')}>
                  Reject Submission
                </button>
                <button className="approve-btn" onClick={() => handleReviewAction('approve')}>
                  <CheckCircle2 size={16} /> Approve &amp; Launch
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContributePage;
