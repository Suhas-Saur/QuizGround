import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useMobileMode } from '../context/MobileModeContext';
import { Play, QrCode, Sparkles, ShieldAlert, ArrowLeft, Camera, Delete, Smartphone } from 'lucide-react';

export const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useMobileMode();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQrSim, setShowQrSim] = useState(false);

  const handleJoin = async (pinToSubmit?: string) => {
    const finalCode = pinToSubmit || code;
    if (finalCode.length !== 6 || isNaN(Number(finalCode))) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post(`/rooms/${finalCode}/join`);
      if (res.data.success) {
        navigate(`/student/live/${finalCode}`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin();
  };

  const handleKeypadPress = (digit: string) => {
    if (code.length < 6) {
      const nextCode = code + digit;
      setCode(nextCode);
      setError(null);
      // If completed 6 digits, auto-join after slight delay
      if (nextCode.length === 6) {
        handleJoin(nextCode);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setCode(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleKeypadClear = () => {
    setCode('');
    setError(null);
  };

  const handleSimulateQrScan = async () => {
    setShowQrSim(true);
    setError(null);

    setTimeout(() => {
      setCode('482731');
      setShowQrSim(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-8 sm:py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition">
              <ArrowLeft size={18} />
            </Link>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join Game Lobby</span>
          </div>
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
            <Smartphone size={12} />
            <span>Mobile Ready</span>
          </span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Enter Room PIN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter the 6-digit code displayed on the teacher's projector screen.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800/40 p-3 rounded-xl text-xs sm:text-sm">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showQrSim ? (
          /* QR Camera Simulator Drawer */
          <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-800 text-white animate-pulse">
            <Camera size={36} className="text-indigo-400" />
            <h4 className="text-sm font-bold">Scanning Room Code...</h4>
            <p className="text-xs text-slate-400">Aligning with projector QR code</p>
            <div className="w-40 h-40 border-2 border-indigo-500 border-dashed rounded-xl flex items-center justify-center text-[10px] text-slate-500">
              [ CAMERA SCANNER ]
            </div>
            <button
              onClick={() => setShowQrSim(false)}
              className="text-xs text-red-400 hover:underline"
            >
              Cancel Scan
            </button>
          </div>
        ) : (
          <div>
            {/* Visual 6-Digit PIN Boxes */}
            <div className="flex justify-center items-center gap-2 sm:gap-2.5 my-3 select-none">
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const digit = code[i] || '';
                const isCurrent = i === code.length;
                return (
                  <div
                    key={i}
                    className={`w-11 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-xl sm:text-2xl transition-all shadow-sm ${
                      digit
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 scale-105'
                        : isCurrent
                        ? 'border-primary-500 bg-white dark:bg-dark-900 animate-pulse'
                        : 'border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {digit || '•'}
                  </div>
                );
              })}
            </div>

            {/* Hidden / standard input for physical keyboards */}
            <form onSubmit={handleSubmit} className="mb-4">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Type 6 digits..."
                className="w-full text-center text-xs py-1.5 opacity-60 hover:opacity-100 bg-transparent text-slate-500 focus:outline-none transition"
              />
            </form>

            {/* Tactile Mobile Touch Keypad (Optimized for one-handed thumb entry on mobile) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto select-none pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  disabled={loading}
                  className="h-12 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 active:scale-95 text-slate-800 dark:text-white font-bold text-lg sm:text-xl transition flex items-center justify-center shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadClear}
                disabled={loading || code.length === 0}
                className="h-12 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 active:scale-95 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center disabled:opacity-40"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                disabled={loading}
                className="h-12 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 active:scale-95 text-slate-800 dark:text-white font-bold text-lg sm:text-xl transition flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                disabled={loading || code.length === 0}
                className="h-12 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 active:scale-95 text-slate-600 dark:text-slate-300 font-bold transition flex items-center justify-center disabled:opacity-40"
              >
                <Delete size={18} />
              </button>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => handleJoin()}
              disabled={loading || code.length !== 6}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
            >
              <Play size={15} fill="white" />
              <span>{loading ? 'Entering Arena...' : 'Join Game Lobby'}</span>
            </button>
          </div>
        )}

        {!showQrSim && (
          <div className="border-t border-slate-100 dark:border-dark-800 pt-3 text-center">
            <button
              onClick={handleSimulateQrScan}
              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-500 hover:underline"
            >
              <QrCode size={16} />
              <span>Autofill Demo Room PIN</span>
            </button>
          </div>
        )}

        <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 p-3.5 rounded-2xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left space-y-1">
          <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400 font-bold">
            <Sparkles size={12} />
            <span>Multiplayer Tip</span>
          </div>
          <p>
            Log into the <strong>Teacher Dashboard</strong> in another window, select any quiz, and click <strong>Live Host</strong> to open the projector PIN!
          </p>
        </div>
      </div>
    </div>
  );
};
