import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Quiz } from '@shared/types';
import { Search, SlidersHorizontal, BookOpen, Star, Play, Clock, BarChart } from 'lucide-react';

export const PracticeBrowsePage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes?published=true');
        if (res.data.success) {
          setQuizzes(res.data.data);
          setFilteredQuizzes(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching quiz catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = quizzes;

    if (search) {
      result = result.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedSubject !== 'All') {
      result = result.filter(q => q.subject === selectedSubject);
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(q => q.difficulty === selectedDifficulty.toLowerCase());
    }

    setFilteredQuizzes(result);
  }, [search, selectedSubject, selectedDifficulty, quizzes]);

  // Extract unique subjects for filters list
  const subjects = ['All', ...new Set(quizzes.map(q => q.subject))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Catalog Header */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Practice Arena
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Find quizzes on any subject, filter by difficulty, and test your knowledge at your own pace.
        </p>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 text-left">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes, subjects, topics..."
            className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="flex-1 md:flex-none">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary-500 transition text-slate-700 dark:text-dark-200"
            >
              <option value="All">All Subjects</option>
              {subjects.filter(s => s !== 'All').map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 md:flex-none">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary-500 transition text-slate-700 dark:text-dark-200"
            >
              <option value="All">All Difficulties</option>
              {difficulties.filter(d => d !== 'All').map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-dark-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-12 text-center text-slate-400">
          No quizzes found matching your parameters. Try modifying your search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 hover:border-primary-500/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between text-left"
            >
              {/* Card Banner / Topic */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded-md uppercase">
                    {quiz.subject}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                    <Star size={14} fill="currentColor" />
                    <span>{quiz.rating || '4.5'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-white line-clamp-1">{quiz.title}</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 line-clamp-2">{quiz.description}</p>
                </div>

                <div className="flex items-center space-x-4 pt-2 text-slate-400 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>~{quiz.questions.length * 30}s</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart size={14} />
                    <span className="capitalize">{quiz.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen size={14} />
                    <span>{quiz.questions.length} Qs</span>
                  </div>
                </div>
              </div>

              {/* Card Action footer */}
              <div className="bg-slate-50 dark:bg-dark-850 px-5 py-4 border-t border-slate-100 dark:border-dark-800/50 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  Created by: <strong className="text-slate-600 dark:text-dark-200">{quiz.creatorName || 'Instructor'}</strong>
                </div>
                <Link
                  to={`/student/practice/play/${quiz._id}`}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Play size={12} fill="white" />
                  <span>Start Practice</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
