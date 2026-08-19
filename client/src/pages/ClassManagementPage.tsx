import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Class, Quiz, Assignment } from '@shared/types';
import { Users, Plus, ShieldCheck, ClipboardList, Calendar, Users2, Trash, AlertCircle } from 'lucide-react';

export const ClassManagementPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Toggles
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAssignQuiz, setShowAssignQuiz] = useState(false);

  // New Class Form State
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');

  // Assign Homework Form State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attemptLimit, setAttemptLimit] = useState(1);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, quizRes, assignRes] = await Promise.all([
          api.get('/classes'),
          api.get('/quizzes?published=true'),
          api.get('/assignments')
        ]);

        if (classRes.data.success) setClasses(classRes.data.data);
        if (quizRes.data.success) setQuizzes(quizRes.data.data);
        if (assignRes.data.success) setAssignments(assignRes.data.data);
      } catch (err) {
        console.error('Failed to load classes or assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !classSubject) return;

    setError(null);
    try {
      const res = await api.post('/classes', { name: className, subject: classSubject });
      if (res.data.success) {
        setClasses(prev => [...prev, res.data.data]);
        setClassName('');
        setClassSubject('');
        setShowCreateClass(false);
      }
    } catch (err) {
      setError('Failed to create class cohort. Please try again.');
    }
  };

  const handleAssignQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedQuizId || !deadline) return;

    setError(null);
    try {
      const res = await api.post('/assignments', {
        quizId: selectedQuizId,
        classId: selectedClassId,
        deadline,
        attemptLimit
      });

      if (res.data.success) {
        // Reload assignments list
        const assignRes = await api.get('/assignments');
        if (assignRes.data.success) setAssignments(assignRes.data.data);

        setSelectedQuizId('');
        setSelectedClassId('');
        setDeadline('');
        setAttemptLimit(1);
        setShowAssignQuiz(false);
      }
    } catch (err) {
      setError('Failed to delegate homework assignment.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-dark-800 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 text-left pb-16">
      
      {/* Left panel: Classes list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <Users2 size={20} className="text-indigo-500" />
            <span>Classroom Rosters</span>
          </h2>
          <button
            onClick={() => setShowCreateClass(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-xl text-xs flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Create Class</span>
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-8 rounded-2xl text-center text-slate-400">
            No class rosters created yet. Add a class to begin organizing students.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm space-y-4 text-left"
              >
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">{cls.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{cls.subject}</p>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-850 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Roster PIN</span>
                    <span className="font-extrabold text-base text-primary-500 tracking-wider">{cls.joinCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block text-right">Students</span>
                    <span className="font-bold text-sm text-slate-700 dark:text-dark-250 block text-right">{cls.students?.length || 0} enrolled</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedClassId(cls._id);
                    setShowAssignQuiz(true);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-750 dark:text-dark-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <ClipboardList size={12} />
                  <span>Assign Homework</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel: Active homework assignments */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-dark-800 pb-3">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <ClipboardList size={20} className="text-indigo-500" />
            <span>Homework Delegations</span>
          </h2>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl text-center text-slate-400">
            No quizzes assigned as homework yet. Select a class to delegate exercises.
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assign) => {
              const qInfo = assign.quizId as unknown as { title: string; subject: string };
              const cInfo = assign.classId as unknown as { name: string };
              return (
                <div
                  key={assign._id}
                  className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-4 rounded-xl shadow-sm text-xs space-y-2.5"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-slate-800 dark:text-white truncate">
                      {qInfo?.title || 'Unknown Quiz'}
                    </h4>
                    <p className="text-[10px] text-slate-450 uppercase font-semibold">
                      Assigned to: <strong className="text-slate-600 dark:text-dark-200">{cInfo?.name || 'Class'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                    <Calendar size={12} />
                    <span>Due Date: {new Date(assign.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Class */}
      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateClass}
            className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-3xl max-w-sm w-full space-y-4 text-left shadow-2xl relative"
          >
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Create Class Cohort</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Name</label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Data Structures - Section C"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                required
                value={classSubject}
                onChange={(e) => setClassSubject(e.target.value)}
                placeholder="Data Structures"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateClass(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 dark:text-white text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Save Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Assign Homework Quiz */}
      {showAssignQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleAssignQuiz}
            className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-3xl max-w-sm w-full space-y-4 text-left shadow-2xl relative"
          >
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Assign Homework Exercise</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-700 dark:text-dark-200"
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Quiz Set</label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-700 dark:text-dark-200"
              >
                <option value="">-- Choose Quiz --</option>
                {quizzes.map(q => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-3 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attempt Boundary Limit</label>
              <input
                type="number"
                min={1}
                required
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-xs outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignQuiz(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 dark:text-white text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedClassId || !selectedQuizId || !deadline}
                className="flex-1 bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
