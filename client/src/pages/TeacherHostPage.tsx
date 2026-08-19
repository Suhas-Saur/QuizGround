import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { Play, SkipForward, Power, Users, Clock, Award, ShieldAlert, AwardIcon, Trophy } from 'lucide-react';

interface LobbyStudent {
  studentId: string;
  name: string;
  avatar: string;
  score: number;
}

export const TeacherHostPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  // Socket sync states
  const [status, setStatus] = useState<'WAITING' | 'STARTING' | 'QUESTION_ACTIVE' | 'QUESTION_ENDED' | 'COMPLETED'>('WAITING');
  const [participants, setParticipants] = useState<LobbyStudent[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // QR join URL
  const joinUrl = `${window.location.origin}/join?code=${roomCode}`;

  useEffect(() => {
    if (!roomCode) return;

    connectSocket();
    const socket = getSocket();

    // Join room lobby as Teacher host
    socket.emit('room:join', { roomCode });

    socket.on('room:joined', (data: any) => {
      setStatus(data.status);
      setParticipants(data.participants);
    });

    socket.on('room:participant-update', (data: { participants: LobbyStudent[] }) => {
      setParticipants(data.participants);
    });

    socket.on('room:status-update', (data: { status: any }) => {
      setStatus(data.status);
    });

    socket.on('quiz:question', (data: any) => {
      setStatus('QUESTION_ACTIVE');
      setCurrentQuestion(data);
      setTimer(data.timerDuration);
      setAnsweredCount(0);
    });

    socket.on('quiz:progress-update', (data: { answeredCount: number }) => {
      setAnsweredCount(data.answeredCount);
    });

    socket.on('quiz:question-ended', (data: any) => {
      setStatus('QUESTION_ENDED');
      setLeaderboard(data.leaderboard);
    });

    socket.on('quiz:game-over', (data: any) => {
      setStatus('COMPLETED');
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    socket.on('error', (data: { message: string }) => {
      setErrorMsg(data.message);
    });

    // Local clock sync
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [roomCode]);

  const handleStartQuiz = () => {
    const socket = getSocket();
    socket.emit('room:start');
  };

  const handleNextQuestion = () => {
    const socket = getSocket();
    socket.emit('room:next-question');
  };

  const handleEndQuiz = () => {
    if (!window.confirm('Are you sure you want to end this quiz room session early?')) return;
    const socket = getSocket();
    socket.emit('room:end');
    navigate('/teacher/dashboard');
  };

  if (errorMsg) {
    return (
      <div className="bg-red-50 text-danger p-6 rounded-2xl border border-red-200 text-center max-w-md mx-auto mt-12">
        <ShieldAlert className="mx-auto mb-2" size={32} />
        <h3 className="font-bold">Lobby Error</h3>
        <p className="text-sm mt-1">{errorMsg}</p>
        <Link to="/teacher/dashboard" className="text-xs font-bold text-primary-500 underline mt-2 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // LOBBY WAITING SCREEN (Optimized for classroom projector)
  if (status === 'WAITING' || status === 'STARTING') {
    return (
      <div className="min-h-[85vh] bg-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col justify-between text-center border border-slate-800">
        
        {/* Top Info banner */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Multiplayer Room PIN</span>
            <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              {roomCode}
            </h1>
          </div>
          <div className="text-right">
            <h2 className="font-extrabold text-lg text-indigo-400">QuizArena Live</h2>
            <p className="text-xs text-slate-500">Scan to join or enter PIN code</p>
          </div>
        </div>

        {/* Center Joining details with QR Code */}
        <div className="grid md:grid-cols-2 gap-12 items-center my-8">
          
          {/* Join Directions & PIN */}
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold">How to participate:</h3>
              <p className="text-sm text-slate-400">
                1. Go to <strong className="text-indigo-400">{window.location.origin}/join</strong> on your phone.
              </p>
              <p className="text-sm text-slate-400">
                2. Enter room PIN code: <strong className="text-amber-400 text-lg">{roomCode}</strong>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-350">
                <Users size={14} />
                <span>Lobby participants ({participants.length})</span>
              </div>
              {participants.length === 0 ? (
                <p className="text-xs text-slate-500 animate-pulse">Waiting for students to join...</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {participants.map(p => (
                    <span key={p.studentId} className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QR Box */}
          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl w-64 h-64 mx-auto shadow-lg border border-slate-800">
            <QRCodeSVG value={joinUrl} size={200} />
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wide">Instant Scan QR code</p>
          </div>
        </div>

        {/* Bottom Control Trigger */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-6">
          <button
            onClick={handleEndQuiz}
            className="bg-red-650/20 hover:bg-red-650/40 text-danger border border-red-800/40 py-3 px-6 rounded-2xl text-xs font-bold transition"
          >
            Cancel Session
          </button>
          
          <button
            onClick={handleStartQuiz}
            disabled={status === 'STARTING' || participants.length === 0}
            className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-8 rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-40 transition"
          >
            <Play size={14} fill="white" />
            <span>{status === 'STARTING' ? 'Starting...' : 'Launch Quiz'}</span>
          </button>
        </div>

      </div>
    );
  }

  // ACTIVE QUESTION SCREEN (No answers listed to prevent peaking)
  if (status === 'QUESTION_ACTIVE') {
    return (
      <div className="min-h-[85vh] bg-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col justify-between text-left border border-slate-800">
        
        {/* Top bar progress */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question {currentQuestion.questionIndex + 1} of {currentQuestion.questionCount}</span>
            <h1 className="text-2xl font-extrabold text-indigo-400 mt-1">{currentQuestion.questionText}</h1>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Timer</span>
            <span className={`text-xl font-extrabold ${timer < 7 ? 'text-danger animate-pulse' : 'text-amber-400'}`}>⏱️ {timer}s</span>
          </div>
        </div>

        {/* Center Progress updates */}
        <div className="grid md:grid-cols-2 gap-8 items-center my-12">
          {/* Submissions count */}
          <div className="space-y-4 text-center py-8 bg-slate-900/40 rounded-3xl border border-slate-900">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Answers Submitted</p>
            <h2 className="text-8xl font-black text-white tracking-tight">
              {answeredCount} <span className="text-2xl font-medium text-slate-500">/ {participants.length}</span>
            </h2>
            <p className="text-xs text-slate-500">Waiting for other players to submit...</p>
          </div>

          {/* Participant list with sub state indicators */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 h-64 overflow-y-auto">
            <h4 className="text-xs text-slate-400 font-bold uppercase mb-3">Lobby Progress Status</h4>
            <div className="grid grid-cols-2 gap-3">
              {participants.map((player) => (
                <div
                  key={player.studentId}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-300 truncate mr-2">{player.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-6">
          <button
            onClick={handleEndQuiz}
            className="bg-red-650/20 hover:bg-red-650/40 text-danger border border-red-800/40 py-3 px-6 rounded-2xl text-xs font-bold transition"
          >
            End Live Game
          </button>
          
          <button
            onClick={handleNextQuestion}
            className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md transition"
          >
            <span>Lock & Show Standings</span>
            <SkipForward size={14} />
          </button>
        </div>

      </div>
    );
  }

  // QUESTION RESULTS STANDING STATE
  if (status === 'QUESTION_ENDED') {
    return (
      <div className="min-h-[85vh] bg-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col justify-between text-left border border-slate-800">
        
        {/* Header standings */}
        <div className="border-b border-slate-900 pb-6 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Closed</span>
            <h1 className="text-3xl font-extrabold text-indigo-400 mt-1">Lobby Rankings</h1>
          </div>
          <span className="bg-indigo-900/40 border border-indigo-700 text-indigo-300 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase">
            Leaderboard
          </span>
        </div>

        {/* Standings table */}
        <div className="max-w-xl w-full mx-auto my-8 space-y-3">
          {leaderboard.slice(0, 5).map((row, idx) => (
            <div
              key={row.name}
              className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-4">
                <span className="w-6 font-bold text-slate-500">{idx + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center font-bold text-xs">
                  {row.name.charAt(0)}
                </div>
                <span className="font-extrabold text-slate-200">{row.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-indigo-300">{row.score} pts</span>
                {row.streak > 0 && (
                  <span className="text-[10px] text-amber-500 font-bold uppercase">🔥 {row.streak} Streak</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-6">
          <button
            onClick={handleEndQuiz}
            className="bg-red-650/20 hover:bg-red-650/40 text-danger border border-red-800/40 py-3 px-6 rounded-2xl text-xs font-bold transition"
          >
            End Quiz
          </button>
          
          <button
            onClick={handleNextQuestion}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md transition"
          >
            <span>Advance next question</span>
            <SkipForward size={14} />
          </button>
        </div>

      </div>
    );
  }

  // FINAL COMPLETED RESULTS podium
  if (status === 'COMPLETED') {
    return (
      <div className="min-h-[85vh] bg-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col justify-between text-center border border-slate-800">
        
        <div className="border-b border-slate-900 pb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quiz arena complete</span>
          <h1 className="text-3xl font-extrabold text-amber-400 mt-1">Podium Standings</h1>
        </div>

        {/* Podium visualization */}
        <div className="flex justify-center items-end space-x-6 my-16 max-w-md mx-auto">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center">
              <span className="font-bold text-xs text-slate-400 mb-2 truncate max-w-[80px]">{leaderboard[1].name}</span>
              <div className="w-20 bg-slate-800 border border-slate-700 h-28 rounded-t-2xl flex items-center justify-center text-slate-300 font-extrabold text-2xl shadow-lg shadow-slate-800/10">
                2nd
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5">{leaderboard[1].score} pts</span>
            </div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <div className="flex flex-col items-center">
              <Trophy className="text-amber-400 mb-1.5 animate-bounce" size={28} />
              <span className="font-extrabold text-sm text-amber-400 mb-2 truncate max-w-[90px]">{leaderboard[0].name}</span>
              <div className="w-24 bg-indigo-900 border border-indigo-700 h-36 rounded-t-2xl flex items-center justify-center text-amber-400 font-black text-3xl shadow-lg shadow-indigo-900/10">
                1st
              </div>
              <span className="text-xs text-slate-400 mt-1.5 font-bold">{leaderboard[0].score} pts</span>
            </div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center">
              <span className="font-bold text-xs text-slate-450 mb-2 truncate max-w-[80px]">{leaderboard[2].name}</span>
              <div className="w-20 bg-slate-900 border border-slate-800 h-20 rounded-t-2xl flex items-center justify-center text-amber-600 font-bold text-xl shadow-lg shadow-slate-900/10">
                3rd
              </div>
              <span className="text-[10px] text-slate-550 mt-1.5">{leaderboard[2].score} pts</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-900 pt-6">
          <Link
            to="/teacher/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl text-xs shadow-md transition"
          >
            Finish & Return to Dashboard
          </Link>
        </div>

      </div>
    );
  }

  return null;
};
