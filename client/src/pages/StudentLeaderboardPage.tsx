import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, ShieldAlert, Award, Star, Flame, Sparkles } from 'lucide-react';

export const StudentLeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [globalRank, setGlobalRank] = useState<any[]>([]);
  const [weeklyRank, setWeeklyRank] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [globalRes, weeklyRes] = await Promise.all([
          api.get('/leaderboards/global'),
          api.get('/leaderboards/weekly')
        ]);
        if (globalRes.data.success) setGlobalRank(globalRes.data.data);
        if (weeklyRes.data.success) setWeeklyRank(weeklyRes.data.data);
      } catch (err) {
        console.error('Failed to load leaderboards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
      </div>
    );
  }

  const currentList = activeTab === 'global' ? globalRank : weeklyRank;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <Trophy className="text-amber-500" />
          <span>Hall of Fame</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compete with students globally and check who has accumulated the most experience.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-dark-900 p-1.5 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'global'
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-dark-300'
          }`}
        >
          🏆 All-Time Global
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-dark-300'
          }`}
        >
          ⚡ Weekly Standings
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-4 items-end pt-8 max-w-md mx-auto">
        {/* 2nd Place */}
        {currentList[1] && (
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-bold text-slate-400 truncate max-w-[80px]">{currentList[1].name}</span>
            <div className="w-16 sm:w-20 bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 h-24 rounded-t-2xl flex items-center justify-center text-slate-400 font-extrabold text-xl shadow-sm">
              2
            </div>
            <span className="text-[10px] text-slate-400">{currentList[1].xp || currentList[1].weeklyXp} XP</span>
          </div>
        )}

        {/* 1st Place */}
        {currentList[0] && (
          <div className="flex flex-col items-center space-y-1">
            <Sparkles className="text-amber-500 animate-pulse" size={20} />
            <span className="text-xs font-extrabold text-amber-500 truncate max-w-[90px]">{currentList[0].name}</span>
            <div className="w-20 sm:w-24 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 h-32 rounded-t-2xl flex items-center justify-center text-amber-500 font-black text-2xl shadow-md">
              1
            </div>
            <span className="text-xs font-bold text-amber-500">{currentList[0].xp || currentList[0].weeklyXp} XP</span>
          </div>
        )}

        {/* 3rd Place */}
        {currentList[2] && (
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-bold text-slate-450 truncate max-w-[80px]">{currentList[2].name}</span>
            <div className="w-16 sm:w-20 bg-slate-100 dark:bg-dark-800 border border-slate-250 dark:border-dark-700 h-16 rounded-t-2xl flex items-center justify-center text-amber-600 font-bold text-lg shadow-sm">
              3
            </div>
            <span className="text-[10px] text-slate-400">{currentList[2].xp || currentList[2].weeklyXp} XP</span>
          </div>
        )}
      </div>

      {/* Rank list table */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-dark-800">
        {currentList.map((row, idx) => {
          const isMe = row.name === user?.name;
          return (
            <div
              key={row.id}
              className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-850/50 transition ${
                isMe
                  ? 'bg-primary-50/50 border-y border-primary-100 dark:bg-primary-950/20 dark:border-primary-900/60'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="w-6 font-bold text-slate-400 text-xs">{idx + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-850 flex items-center justify-center font-bold text-xs">
                  {row.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-dark-100'}`}>
                    {row.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{row.institution || 'Enrolled Student'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3.5 text-right">
                <div>
                  <span className="text-xs font-extrabold text-slate-600 dark:text-dark-200">
                    {row.xp || row.weeklyXp} XP
                  </span>
                  {row.streak > 0 && (
                    <span className="text-[9px] font-bold text-amber-500 block uppercase">🔥 {row.streak} Streak</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
