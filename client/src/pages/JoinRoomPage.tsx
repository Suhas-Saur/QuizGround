import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Play, QrCode, Sparkles, ShieldAlert, ArrowLeft, Camera } from 'lucide-react';

export const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQrSim, setShowQrSim] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(Number(code))) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post(`/rooms/${code}/join`);
      if (res.data.success) {
        // Redirect to student live room page
        navigate(`/student/live/${code}`);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Room code not found or has expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQrScan = async () => {
    setShowQrSim(true);
    setError(null);

    // Simulate scanning delay
    setTimeout(async () => {
      try {
        // Query active rooms
        const axios = (await import('../services/api')).default;
        const quizRes = await axios.get('/quizzes?published=true');
        
        if (quizRes.data.success && quizRes.data.data.length > 0) {
          // Let's create an active live room code if none exists, or just query one.
          // For simplicity, we can create one dynamically or search for one.
          // Since the database seeding doesn't create live rooms (they are ephemeral),
          // let's search if any room is active, or use a default test code.
          // Here, we can create a temporary room for the student if we want,
          // but let's check: in manual testing, we typically create the room from the teacher view.
          // Let's explain to the user they can enter the code from their Teacher dashboard,
          // or simulate scanning code '482731'.
          setCode('482731');
          setShowQrSim(false);
        } else {
          setError('No quizzes available to generate mock rooms.');
          setShowQrSim(false);
        }
      } catch {
        // Fallback code
        setCode('482731');
        setShowQrSim(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-8 shadow-xl text-left space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800">
            <ArrowLeft size={16} />
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join Game Lobby</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Enter Room Code
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the 6-digit PIN shared by your teacher.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800/40 p-3.5 rounded-xl text-sm">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showQrSim ? (
          /* QR Camera Simulator Drawer */
          <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-800 text-white animate-pulse">
            <Camera size={40} className="text-indigo-400" />
            <h4 className="text-sm font-bold">Initializing Simulated Camera...</h4>
            <p className="text-xs text-slate-400">Aligning lens with virtual room code</p>
            <div className="w-48 h-48 border-2 border-indigo-500 border-dashed rounded-xl flex items-center justify-center text-[10px] text-slate-500">
              [ SCANNING AREA ]
            </div>
            <button
              onClick={() => setShowQrSim(false)}
              className="text-xs text-red-400 hover:underline"
            >
              Cancel Scan
            </button>
          </div>
        ) : (
          /* Form Code Input */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="482731"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl py-4 text-center font-extrabold text-2xl tracking-widest outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
            >
              <Play size={14} fill="white" />
              <span>{loading ? 'Entering...' : 'Join Game'}</span>
            </button>
          </form>
        )}

        {!showQrSim && (
          <div className="border-t border-slate-100 dark:border-dark-800 pt-5 text-center">
            <button
              onClick={handleSimulateQrScan}
              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-500 hover:underline"
            >
              <QrCode size={16} />
              <span>Simulate QR Code Scan</span>
            </button>
          </div>
        )}

        <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left space-y-1">
          <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400 font-bold mb-1">
            <Sparkles size={12} />
            <span>Quick Tip</span>
          </div>
          <p>
            Log in as a Teacher in another window, go to "My Quizzes", select a quiz, and click <strong>Start Live Session</strong>. That will generate a code you can paste here.
          </p>
        </div>
      </div>
    </div>
  );
};
