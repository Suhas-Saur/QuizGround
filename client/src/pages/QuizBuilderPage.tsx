import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Quiz, Question, QuestionType, Difficulty } from '@shared/types';
import { Plus, Trash, ArrowUp, ArrowDown, Sparkles, Settings2, HelpCircle, Save, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';

export const QuizBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Form State - Metadata & Settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timerMode, setTimerMode] = useState<'off' | 'question' | 'quiz'>('question');
  const [timerDuration, setTimerDuration] = useState(30);

  // Form State - Questions list
  const [questions, setQuestions] = useState<Question[]>([]);

  // AI Generator Panel State
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium');
  const [aiCount, setAiCount] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Question Bank State
  const [bankSearch, setBankSearch] = useState('');
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankIdxs, setSelectedBankIdxs] = useState<number[]>([]);
  const [bankLoading, setBankLoading] = useState(false);

  // Preparation Assistant State
  const [assistantTopic, setAssistantTopic] = useState('');
  const [assistantCount, setAssistantCount] = useState(5);
  const [assistantDifficulty, setAssistantDifficulty] = useState<Difficulty>('medium');
  const [aiAutofilling, setAiAutofilling] = useState(false);
  const [bankCount, setBankCount] = useState(0);

  useEffect(() => {
    if (topic && !assistantTopic) {
      setAssistantTopic(topic);
    }
  }, [topic]);

  useEffect(() => {
    const fetchBankCount = async () => {
      const topicQuery = assistantTopic || topic || subject || 'general';
      try {
        const res = await api.get(`/quizzes/bank?topic=${topicQuery}`);
        if (res.data.success) {
          setBankCount(res.data.questions.length);
        }
      } catch (err) {
        console.error('Failed to fetch bank count:', err);
      }
    };
    fetchBankCount();
  }, [topic, subject, assistantTopic]);

  // View tabs
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      // Add a default first question for new quizzes
      setQuestions([createEmptyQuestion(1)]);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (res.data.success) {
          const q: Quiz = res.data.data;
          setTitle(q.title);
          setDescription(q.description);
          setSubject(q.subject);
          setTopic(q.topic);
          setDifficulty(q.difficulty);
          setTimerMode(q.settings.timerMode);
          setTimerDuration(q.settings.timerDuration);
          setQuestions(q.questions);
        }
      } catch (err) {
        setError('Failed to load quiz details for editing');
      }
    };
    fetchQuiz();
  }, [id, isEdit]);

  function createEmptyQuestion(order: number): Question {
    return {
      type: 'multiple_choice',
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: '',
      points: 100,
      difficulty: 'medium',
      order
    };
  }

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, createEmptyQuestion(prev.length + 1)]);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      return filtered.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    setQuestions(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      const oldVal = opts[optIdx];
      opts[optIdx] = value;
      copy[qIdx].options = opts;

      // Adjust correctAnswer reference if it matched the modified option
      if (copy[qIdx].correctAnswer === oldVal) {
        copy[qIdx].correctAnswer = value;
      }
      return copy;
    });
  };

  const handleAIQuestionsGenerate = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic for AI generation');
      return;
    }
    setAiGenerating(true);
    setError(null);

    try {
      const res = await api.post('/quizzes/generate', {
        topic: aiTopic,
        difficulty: aiDifficulty,
        count: aiCount
      });

      if (res.data.success) {
        // Map and append to current questions
        const startOrder = questions.length + 1;
        const newQs = res.data.questions.map((q: any, i: number) => ({
          ...q,
          order: startOrder + i
        }));
        setQuestions(prev => [...prev, ...newQs]);
        setActiveTab('questions');
        setAiTopic('');
      }
    } catch (err) {
      setError('AI generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleFetchBank = async () => {
    if (!bankSearch.trim()) return;
    setBankLoading(true);
    try {
      const res = await api.get(`/quizzes/bank?topic=${bankSearch}`);
      if (res.data.success) {
        setBankQuestions(res.data.questions);
        setSelectedBankIdxs([]);
      }
    } catch (err) {
      console.error('Failed to fetch from question bank:', err);
    } finally {
      setBankLoading(false);
    }
  };

  const handleImportBank = () => {
    if (selectedBankIdxs.length === 0) return;
    
    setQuestions(prev => {
      const startOrder = prev.length + 1;
      const imported = selectedBankIdxs.map((idx, i) => {
        const q = bankQuestions[idx];
        return {
          type: q.type,
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          difficulty: q.difficulty,
          order: startOrder + i
        };
      });
      return [...prev, ...imported];
    });

    setSelectedBankIdxs([]);
    setBankQuestions([]);
    setBankSearch('');
    setActiveTab('questions');
  };

  const handleAutofillAI = async () => {
    const topicToUse = assistantTopic || topic || subject || 'general';
    setAiAutofilling(true);
    setError(null);
    try {
      const res = await api.post('/quizzes/generate', {
        topic: topicToUse,
        difficulty: assistantDifficulty,
        count: assistantCount
      });
      if (res.data.success) {
        const startOrder = questions.length + 1;
        const newQs = res.data.questions.map((q: any, i: number) => ({
          ...q,
          order: startOrder + i
        }));
        setQuestions(prev => {
          if (prev.length === 1 && !prev[0].question.trim()) {
            return newQs;
          }
          return [...prev, ...newQs];
        });
      }
    } catch (err) {
      setError('AI auto-fill failed. Please try again.');
    } finally {
      setAiAutofilling(false);
    }
  };

  const handleSaveQuiz = async (publish: boolean) => {
    if (!title || !subject) {
      setError('Please fill in Quiz Title and Subject');
      setActiveTab('settings');
      return;
    }

    // Validate questions
    const invalidQ = questions.some(q => !q.question.trim());
    if (invalidQ) {
      setError('Please ensure all question text fields are populated');
      setActiveTab('questions');
      return;
    }

    setError(null);
    setSubmitting(true);

    const payload = {
      title,
      description,
      subject,
      topic,
      difficulty,
      questions,
      settings: {
        shuffleQuestions: false,
        shuffleAnswers: false,
        timerMode,
        timerDuration,
        showCorrectAnswers: 'immediately',
        showExplanations: 'immediately',
        enableLeaderboard: true,
        enableSpeedBonus: true,
        allowRetry: true,
        allowLateJoining: true
      },
      published: publish
    };

    try {
      if (isEdit) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }
      navigate('/teacher/dashboard');
    } catch (err) {
      setError('Failed to save quiz. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-dark-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            {isEdit ? 'Modify Quiz' : 'Assemble New Quiz'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure metadata, compile questions, or leverage AI generation.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleSaveQuiz(false)}
            disabled={submitting}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:text-white dark:hover:bg-dark-750 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSaveQuiz(true)}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
          >
            <CheckCircle size={14} />
            <span>Publish Quiz</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800/40 p-3.5 rounded-xl text-sm">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-dark-900 p-1.5 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-dark-300'
          }`}
        >
          1. General Settings
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-dark-300'
          }`}
        >
          2. Questions ({questions.length})
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-800 flex items-center space-x-1.5">
              <Settings2 size={16} className="text-primary-500" />
              <span>Core Configurations</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Binary Search Trees - Quiz 1"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Test understanding of AVL Trees, BST lookup values, and tree traversals."
                rows={3}
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Data Structures"
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-xs outline-none focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Trees"
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-xs outline-none focus:border-primary-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-3 text-xs outline-none focus:border-primary-500 transition text-slate-700 dark:text-dark-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Timer Mode</label>
                <select
                  value={timerMode}
                  onChange={(e) => setTimerMode(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-3 text-xs outline-none focus:border-primary-500 transition text-slate-700 dark:text-dark-200"
                >
                  <option value="off">No Timer</option>
                  <option value="question">Per Question</option>
                  <option value="quiz">Whole Quiz</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Duration (secs)</label>
                <input
                  type="number"
                  disabled={timerMode === 'off'}
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-3 text-xs outline-none focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Sidebar stack */}
          <div className="space-y-6">
            {/* AI Generator Panel Sidebar */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 space-y-4 shadow-md">
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm flex items-center space-x-1 text-indigo-400">
                  <Sparkles size={16} />
                  <span>AI Questions Generator</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter a topic, and AI will automatically build, formulate, and compile multiple questions to expand your quiz.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic Keyword</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="E.g., Quick Sort algorithms"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs outline-none text-white focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as Difficulty)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-2 text-xs outline-none text-white focus:border-indigo-500 transition"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Count</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={aiCount}
                      onChange={(e) => setAiCount(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-2 text-xs outline-none text-white focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAIQuestionsGenerate}
                disabled={aiGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-4"
              >
                <Sparkles size={14} />
                <span>{aiGenerating ? 'Generating...' : 'Generate Questions'}</span>
              </button>
            </div>

            {/* Question Bank Sidebar */}
            <div id="question-bank-search" className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 space-y-4 shadow-sm text-slate-800 dark:text-white">
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm flex items-center space-x-1.5 text-primary-500">
                  <span>📚</span>
                  <span>Import from Question Bank</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lookup curated standard questions from LeetCode or GeeksforGeeks by topic.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-dark-300 uppercase tracking-wider">Search Topic</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="E.g., Sorting, Hashing..."
                      className="flex-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleFetchBank}
                      disabled={bankLoading}
                      className="bg-slate-800 hover:bg-slate-900 dark:bg-dark-800 dark:hover:bg-dark-750 text-white text-xs font-bold px-3.5 rounded-xl transition"
                    >
                      {bankLoading ? '...' : 'Find'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Question list search results */}
              {bankQuestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-850">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Results ({bankQuestions.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {bankQuestions.map((q, idx) => {
                      const isSelected = selectedBankIdxs.includes(idx);
                      return (
                        <label
                          key={idx}
                          className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 text-left text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedBankIdxs(prev =>
                                isSelected ? prev.filter(i => i !== idx) : [...prev, idx]
                              );
                            }}
                            className="mt-0.5 accent-primary-500"
                          />
                          <div className="space-y-0.5">
                            <p className="font-semibold leading-snug line-clamp-2 text-slate-700 dark:text-dark-100">{q.question}</p>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">{q.difficulty} • {q.topic}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportBank}
                    disabled={selectedBankIdxs.length === 0}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition disabled:opacity-50 mt-2"
                  >
                    Import Selected ({selectedBankIdxs.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions list Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Teacher Question Preparation Assistant Card */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Sparkles size={12} />
                  <span>Teacher Question Preparation Assistant</span>
                </h3>
                <h2 className="text-base font-extrabold text-white mt-1">Preparing Questions Made Easy</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Import pre-built questions for <span className="text-indigo-300 font-bold capitalize">{assistantTopic || topic || subject || 'your topic'}</span> or use AI auto-fill.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setBankSearch(assistantTopic || topic || subject || '');
                    handleFetchBank();
                    document.getElementById('question-bank-search')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <span>📚</span>
                  <span>Question Bank ({bankCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutofillAI}
                  disabled={aiAutofilling}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition disabled:opacity-50"
                >
                  <Sparkles size={12} className={aiAutofilling ? "animate-spin" : ""} />
                  <span>{aiAutofilling ? 'Autofilling...' : `AI Auto-Fill (${assistantCount} Qs)`}</span>
                </button>
              </div>
            </div>

            {/* Assistant Options Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Select Topic</label>
                <input
                  type="text"
                  value={assistantTopic}
                  onChange={(e) => setAssistantTopic(e.target.value)}
                  placeholder="E.g., Sorting, Arrays"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs outline-none text-white focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                <select
                  value={assistantDifficulty}
                  onChange={(e) => setAssistantDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-xs outline-none text-white focus:border-indigo-500 transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={assistantCount}
                  onChange={(e) => setAssistantCount(parseInt(e.target.value, 10) || 5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-xs outline-none text-white focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {questions.map((quest, qIdx) => (
            <div
              key={qIdx}
              className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4"
            >
              {/* Question Header & shift keys */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3 flex-wrap gap-2">
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Question {qIdx + 1}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMoveQuestion(qIdx, 'up')}
                    disabled={qIdx === 0}
                    className="p-2 bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveQuestion(qIdx, 'down')}
                    disabled={qIdx === questions.length - 1}
                    className="p-2 bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(qIdx)}
                    disabled={questions.length === 1}
                    className="p-2 hover:bg-red-50 text-danger rounded-lg disabled:opacity-30"
                    title="Delete Question"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              {/* Question Inputs details */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Question Statement</label>
                  <input
                    type="text"
                    required
                    value={quest.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-xs outline-none focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Question Format</label>
                  <select
                    value={quest.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      handleQuestionChange(qIdx, 'type', newType);
                      // Set default option layouts for binary selection formats
                      if (newType === 'true_false') {
                        handleQuestionChange(qIdx, 'options', ['True', 'False']);
                        handleQuestionChange(qIdx, 'correctAnswer', 'True');
                      } else if (newType === 'fill_in_the_blank') {
                        handleQuestionChange(qIdx, 'options', []);
                        handleQuestionChange(qIdx, 'correctAnswer', '');
                      } else {
                        handleQuestionChange(qIdx, 'options', ['Option A', 'Option B', 'Option C', 'Option D']);
                        handleQuestionChange(qIdx, 'correctAnswer', 'Option A');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-3 text-xs outline-none focus:border-primary-500 transition text-slate-700 dark:text-dark-200"
                  >
                    <option value="multiple_choice">Multiple Choice (Single Answer)</option>
                    <option value="true_false">True / False</option>
                    <option value="multiple_select">Multiple Select (Checkboxes)</option>
                    <option value="fill_in_the_blank">Fill in the Blank</option>
                  </select>
                </div>
              </div>

              {/* Answers choices configurations */}
              {quest.type === 'fill_in_the_blank' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Correct Blank Answer</label>
                  <input
                    type="text"
                    value={quest.correctAnswer as string}
                    onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                    placeholder="Enter precise correct word or value"
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-3 text-xs outline-none"
                  />
                </div>
              ) : quest.type === 'true_false' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Correct Choice</label>
                  <div className="flex space-x-3">
                    {['True', 'False'].map((tfVal) => (
                      <button
                        key={tfVal}
                        type="button"
                        onClick={() => handleQuestionChange(qIdx, 'correctAnswer', tfVal)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold border transition ${
                          quest.correctAnswer === tfVal
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-dark-950 dark:border-dark-800 dark:text-dark-200'
                        }`}
                      >
                        {tfVal}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Multiple Choice / Select choices lists */
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Answer Choices & Key</label>
                  <div className="grid gap-3">
                    {quest.options.map((opt, optIdx) => {
                      const isCorrect = quest.type === 'multiple_select'
                        ? Array.isArray(quest.correctAnswer) && quest.correctAnswer.includes(opt)
                        : quest.correctAnswer === opt;

                      return (
                        <div key={optIdx} className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (quest.type === 'multiple_select') {
                                const currentCorr = Array.isArray(quest.correctAnswer) ? [...quest.correctAnswer] : [];
                                if (currentCorr.includes(opt)) {
                                  handleQuestionChange(qIdx, 'correctAnswer', currentCorr.filter(c => c !== opt));
                                } else {
                                  handleQuestionChange(qIdx, 'correctAnswer', [...currentCorr, opt]);
                                }
                              } else {
                                handleQuestionChange(qIdx, 'correctAnswer', opt);
                              }
                            }}
                            className={`p-2 rounded-xl border font-bold text-[10px] shrink-0 transition ${
                              isCorrect
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-slate-50 border-slate-200 dark:bg-dark-950 dark:border-dark-800 text-slate-400'
                            }`}
                            title={isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                          >
                            ✓
                          </button>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Choice ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-xs outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanations & points config */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Correct Explanation</label>
                  <input
                    type="text"
                    value={quest.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    placeholder="E.g., Halving the range yields logarithmic complexity."
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-3 text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Points</label>
                    <input
                      type="number"
                      value={quest.points}
                      onChange={(e) => handleQuestionChange(qIdx, 'points', parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-2 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-dark-300 uppercase tracking-wider">Question Diff</label>
                    <select
                      value={quest.difficulty}
                      onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-2 text-xs outline-none text-slate-700 dark:text-dark-200"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          ))}

          <button
            onClick={handleAddQuestion}
            className="w-full border-2 border-dashed border-slate-300 dark:border-dark-800 hover:border-primary-500 py-4 rounded-2xl flex items-center justify-center space-x-2 text-slate-500 hover:text-primary-500 font-bold transition text-xs"
          >
            <Plus size={16} />
            <span>Add Question Card</span>
          </button>
        </div>
      )}

    </div>
  );
};
