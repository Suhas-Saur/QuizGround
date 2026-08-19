import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import { Flame, Trophy, Award, Users, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ParticipantSummary {
  studentId: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
}

export const StudentLivePlayPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real-time Game states
  const [status, setStatus] = useState<'WAITING' | 'STARTING' | 'QUESTION_ACTIVE' | 'QUESTION_ENDED' | 'COMPLETED'>('WAITING');
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answeredState, setAnsweredState] = useState<any>(null); // Details of submitted answer
  const [timer, setTimer] = useState(30);
  const [chosenAnswer, setChosenAnswer] = useState<string | string[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizDetails, setQuizDetails] = useState<any>(null);

  useEffect(() => {
    if (!roomCode) return;

    // Connect socket
    connectSocket();
    const socket = getSocket();

    // Register connection join
    socket.emit('room:join', { roomCode });

    socket.on('room:joined', (data: any) => {
      setStatus(data.status);
      setParticipants(data.participants);
      setQuizDetails(data.settings);
    });

    socket.on('room:participant-update', (data: { participants: ParticipantSummary[] }) => {
      setParticipants(data.participants);
    });

    socket.on('room:status-update', (data: { status: any }) => {
      setStatus(data.status);
    });

    socket.on('quiz:question', (data: any) => {
      setStatus('QUESTION_ACTIVE');
      setCurrentQuestion(data);
      setTimer(data.timerDuration);
      setChosenAnswer(null);
      setAnsweredState(null);
    });

    socket.on('quiz:answer-confirmed', (data: any) => {
      // confirmed correctness from authoritative server
      setAnsweredState(data);
    });

    socket.on('quiz:question-ended', (data: any) => {
      setStatus('QUESTION_ENDED');
      setLeaderboard(data.leaderboard);
      // If student skipped or didn't answer, show correct answer now
      if (!answeredState) {
        setAnsweredState({
          isCorrect: false,
          scoreEarned: 0,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation
        });
      }
    });

    socket.on('quiz:game-over', (data: any) => {
      setStatus('COMPLETED');
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    socket.on('error', (data: { message: string }) => {
      setErrorMessage(data.message);
    });

    // Timer sync tick down locally (authoritative timer is handled on server)
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [roomCode]);

  const handleOptionSelect = (opt: string) => {
    if (chosenAnswer || status !== 'QUESTION_ACTIVE') return;

    const socket = getSocket();
    const qIndex = currentQuestion.questionIndex;

    // Support single choice for now in live room UI
    setChosenAnswer(opt);
    socket.emit('quiz:submit-answer', { questionIndex: qIndex, answer: opt });
  };

  // Render Lobby Waiting View
  if (status === 'WAITING' || status === 'STARTING') {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950/40 rounded-3xl mx-auto flex items-center justify-center font-bold text-3xl animate-bounce">
            🎉
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">You're In!</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lobby PIN: {roomCode}</p>
        </div>

        <div className="border border-slate-100 dark:border-dark-800 p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 text-xs text-slate-500 dark:text-dark-300">
          {status === 'STARTING' ? (
            <p className="text-amber-500 font-bold animate-pulse">
              GET READY! Starting the quiz in 3 seconds...
            </p>
          ) : (
            <p className="animate-pulse">Waiting for the instructor to start the quiz...</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Users size={14} />
              <span>Participants Joined ({participants.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {participants.map((player) => (
              <div
                key={player.studentId}
                className="p-3 bg-white dark:bg-dark-850 border border-slate-100 dark:border-dark-800 rounded-xl flex items-center space-x-2 text-left truncate shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center text-[10px] font-bold">
                  {player.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-dark-100 truncate">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Live Question Active View
  if (status === 'QUESTION_ACTIVE') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-left">
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
          <span>Question {currentQuestion.questionIndex + 1} of {currentQuestion.questionCount}</span>
          <div className="flex items-center space-x-1.5 text-danger font-extrabold animate-pulse">
            <Clock size={14} />
            <span>⏱️ {timer}s</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="grid gap-3">
            {currentQuestion.options.map((opt: string) => {
              const isSelected = chosenAnswer === opt;
              let style = 'bg-slate-50 border-slate-200 dark:bg-dark-950 dark:border-dark-800 hover:bg-slate-100/50';
              if (isSelected) {
                style = 'bg-primary-50 border-primary-500 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold';
              }
              if (chosenAnswer && !isSelected) {
                style = 'opacity-50 border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950';
              }

              return (
                <button
                  key={opt}
                  disabled={!!chosenAnswer}
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full border p-4 rounded-xl flex items-center justify-between transition duration-200 text-left text-sm ${style}`}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {chosenAnswer && !answeredState && (
            <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-800 p-4 rounded-xl text-center text-xs text-slate-400 animate-pulse">
              Answer submitted. Waiting for timer to expire...
            </div>
          )}

          {answeredState && (
            <div className={`p-4 rounded-2xl flex items-start space-x-3 border ${
              answeredState.isCorrect ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-red-50 border-red-250 text-red-700'
            }`}>
              {answeredState.isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
              <div>
                <p className="font-extrabold text-sm">{answeredState.isCorrect ? `Correct! (+${answeredState.scoreEarned} pts)` : 'Answer submitted.'}</p>
                <p className="text-xs opacity-90">Waiting for other players...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Intermediate Question Results screen
  if (status === 'QUESTION_ENDED') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-left">
        {/* Correct answer & Explanation Box */}
        {answeredState && (
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2">
              {answeredState.isCorrect ? (
                <span className="text-emerald-500 font-extrabold text-lg flex items-center space-x-1">
                  <CheckCircle2 size={20} />
                  <span>Correct! (+{answeredState.scoreEarned} pts)</span>
                </span>
              ) : (
                <span className="text-red-500 font-extrabold text-lg flex items-center space-x-1">
                  <XCircle size={20} />
                  <span>Incorrect</span>
                </span>
              )}
            </div>

            <div className="text-xs space-y-1.5 pl-1.5">
              <p className="text-slate-500">
                <strong>Correct Answer:</strong>{' '}
                <span className="text-emerald-600 font-bold">{answeredState.correctAnswer?.toString()}</span>
              </p>
              {answeredState.explanation && (
                <p className="text-slate-400 bg-slate-50 dark:bg-dark-950 p-3 rounded-xl border border-slate-100 dark:border-dark-800/80 leading-relaxed mt-2">
                  <strong>Explanation:</strong> {answeredState.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live Leaderboard Stands */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-3">
            <Trophy size={18} className="text-amber-500" />
            <span>Multiplayer Leaderboard Standings</span>
          </h3>

          <div className="space-y-2">
            {leaderboard.map((player, idx) => {
              const isMe = player.name === user?.name;
              return (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isMe
                      ? 'bg-primary-50 border-primary-200 dark:bg-primary-950/20 dark:border-primary-900/60'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-400">{idx + 1}.</span>
                    <span className={`font-bold ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-dark-100'}`}>{player.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-500">{player.score} pts</span>
                    {player.streak > 0 && (
                      <span className="flex items-center text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                        <Flame size={10} className="mr-0.5" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-800 p-4 rounded-xl text-center text-xs text-slate-400 animate-pulse">
          Lobby status: QUESTION CLOSED. Waiting for next question from teacher...
        </div>
      </div>
    );
  }

  // Render Final completed screen
  if (status === 'COMPLETED') {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <span className="text-5xl">🏆</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Live Game Finished!</h2>
          <p className="text-sm text-slate-400">Review final standings in the class room.</p>
        </div>

        <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl max-w-sm mx-auto flex items-center justify-between text-left border border-slate-100 dark:border-dark-800/80">
          <div className="flex items-center space-x-3">
            <Award className="text-primary-500" size={24} />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Experience Payout</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">XP Added to Profile</p>
            </div>
          </div>
          <span className="bg-primary-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg">+100 XP Bonus</span>
        </div>

        <div className="space-y-3 max-w-md mx-auto text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Scoreboard</h4>
          <div className="divide-y divide-slate-100 dark:divide-dark-800 border border-slate-100 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900">
            {leaderboard.slice(0, 5).map((player, idx) => (
              <div key={player.name} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">{idx + 1}.</span>
                  <span className="font-bold text-slate-700 dark:text-dark-100">{player.name}</span>
                </div>
                <span className="font-semibold text-slate-500">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/student/dashboard')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-md transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return null;
};
