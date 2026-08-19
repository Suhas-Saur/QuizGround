import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileSpreadsheet, ArrowLeft, Users, Trophy, Target, Timer, CheckCircle2, Download, RefreshCw } from 'lucide-react';

export const QuizReportPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${quizId}`);
        if (res.data.success) {
          setReport(res.data);
        }
      } catch (err) {
        setError('Failed to load performance analytics for this quiz set.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [quizId]);

  const handleExportCSV = () => {
    if (!report || report.studentsAnalysis.length === 0) return;

    // Convert students analysis to simple CSV string
    const headers = ['Student Name', 'Email', 'Score (XP)', 'Accuracy (%)', 'Time Taken (s)', 'Date'];
    const rows = report.studentsAnalysis.map((s: any) => [
      s.studentName,
      s.studentEmail,
      s.score,
      s.accuracy,
      s.timeTaken,
      new Date(s.completedAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz_report_${quizId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-dark-800 rounded-xl" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-red-50 text-danger p-6 rounded-2xl border border-red-200 text-center max-w-md mx-auto mt-12">
        <h3 className="font-bold">Error Loading Report</h3>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/teacher/dashboard" className="text-xs font-bold text-primary-500 underline mt-2 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { summary, questionsAnalysis, studentsAnalysis } = report;

  return (
    <div className="space-y-8 pb-16 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-dark-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link to="/teacher/dashboard" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Quiz Analytics Report
            </h1>
            <p className="text-xs text-slate-400">Detailed overview of student results and incorrect trends.</p>
          </div>
        </div>
        
        {studentsAnalysis.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {studentsAnalysis.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-12 rounded-3xl text-center text-slate-400">
          No attempts recorded for this quiz yet. Invite students to play using a live session code or Practice Browser.
        </div>
      ) : (
        <>
          {/* Summary counters grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Participants */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase">Attempts</p>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{summary.participantsCount} Players</h3>
              </div>
            </div>

            {/* Average Accuracy */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase">Avg Accuracy</p>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{summary.averageAccuracy}%</h3>
              </div>
            </div>

            {/* Highest Score */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl flex items-center justify-center font-bold">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase">Highest Score</p>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{summary.highestScore} pts</h3>
              </div>
            </div>

            {/* Average Duration */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-xl flex items-center justify-center font-bold">
                <Timer size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase">Avg Duration</p>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{summary.averageTime}s</h3>
              </div>
            </div>
          </div>

          {/* Recharts accuracy per question */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
              Accuracy Breakdown by Question Card
            </h3>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionsAnalysis} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="questionText" stroke="#94a3b8" tickFormatter={(v) => v.substring(0, 12) + '...'} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student details list */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm space-y-3 p-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
              Student Performance Logs
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-dark-850 text-slate-500 font-bold uppercase border-b border-slate-100 dark:border-dark-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Student</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Accuracy</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800/80">
                  {studentsAnalysis.map((s: any, idx: number) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-850/50">
                      <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-dark-100">{s.studentName}</td>
                      <td className="p-3 text-center font-bold text-primary-500">{s.score}</td>
                      <td className="p-3 text-center font-extrabold text-emerald-500">{s.accuracy}%</td>
                      <td className="p-3 text-center text-slate-400">{s.timeTaken}s</td>
                      <td className="p-3 text-slate-400">{new Date(s.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
