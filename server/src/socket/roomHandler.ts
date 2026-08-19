import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Room from '../models/Room';
import Quiz from '../models/Quiz';
import User from '../models/User';

interface DecodedToken {
  id: string;
}

export const setupSocket = (io: Server) => {
  // Middleware to authenticate socket connections using JWT
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizarena_super_secret_jwt_key_987654321') as DecodedToken;
      const user = await User.findById(decoded.id).select('name role avatar');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.data.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        avatar: user.avatar
      };
      
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.name} (${user.role}), socketId: ${socket.id}`);

    // Join room lobby
    socket.on('room:join', async ({ roomCode }: { roomCode: string }) => {
      try {
        const room = await Room.findOne({ roomCode, status: { $ne: 'COMPLETED' } });
        if (!room) {
          socket.emit('error', { message: 'Active room not found' });
          return;
        }

        socket.join(roomCode);
        socket.data.roomCode = roomCode;

        if (user.role === 'student') {
          // Check if already in room
          const existingIdx = room.participants.findIndex(p => p.studentId.toString() === user.id);
          
          if (existingIdx === -1) {
            room.participants.push({
              studentId: user.id,
              name: user.name,
              avatar: user.avatar,
              score: 0,
              correctAnswers: 0,
              streak: 0,
              joinedAt: new Date()
            });
            await room.save();
          }

          // Broadcast participant joined
          io.to(roomCode).emit('room:participant-update', {
            participants: room.participants.map(p => ({
              studentId: p.studentId,
              name: p.name,
              avatar: p.avatar,
              score: p.score,
              streak: p.streak
            }))
          });
        }

        // Send room join success details
        socket.emit('room:joined', {
          roomCode: room.roomCode,
          status: room.status,
          currentQuestionIndex: room.currentQuestionIndex,
          settings: room.settings,
          participants: room.participants.map(p => ({
            studentId: p.studentId,
            name: p.name,
            avatar: p.avatar,
            score: p.score,
            streak: p.streak
          }))
        });

        console.log(`${user.name} joined room ${roomCode}`);
      } catch (err) {
        console.error('Error in room:join socket event:', err);
        socket.emit('error', { message: 'Failed to join room lobby' });
      }
    });

    // Start Live Quiz (Teacher only)
    socket.on('room:start', async () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode || user.role !== 'teacher') return;

      try {
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room) return;

        room.status = 'STARTING';
        room.currentQuestionIndex = 0;
        room.questionStartedAt = new Date();
        await room.save();

        io.to(roomCode).emit('room:status-update', { status: room.status });

        // Countdown delay then send first question
        setTimeout(async () => {
          room.status = 'QUESTION_ACTIVE';
          room.questionStartedAt = new Date();
          await room.save();

          const quiz = room.quizId as unknown as { questions: { question: string; options: string[]; type: string; points: number }[] };
          const firstQuestion = quiz.questions[0];

          io.to(roomCode).emit('quiz:question', {
            questionIndex: 0,
            questionCount: quiz.questions.length,
            questionText: firstQuestion.question,
            options: firstQuestion.options,
            type: firstQuestion.type,
            points: firstQuestion.points,
            timerDuration: room.settings.timerDuration
          });
        }, 3000);

      } catch (err) {
        console.error('Error starting live room:', err);
      }
    });

    // Submit Answer (Student only)
    socket.on('quiz:submit-answer', async ({ questionIndex, answer }: { questionIndex: number; answer: string | string[] }) => {
      const roomCode = socket.data.roomCode;
      if (!roomCode || user.role !== 'student') return;

      try {
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room || room.status !== 'QUESTION_ACTIVE' || room.currentQuestionIndex !== questionIndex) {
          socket.emit('error', { message: 'Answer submission rejected: question is closed' });
          return;
        }

        const quiz = room.quizId as unknown as { questions: { _id: string; correctAnswer: string | string[]; points: number }[] };
        const question = quiz.questions[questionIndex];

        // Authoritative validation of answer
        let isCorrect = false;
        if (Array.isArray(question.correctAnswer)) {
          if (Array.isArray(answer)) {
            // Sort to compare arrays
            const sortedCorr = [...question.correctAnswer].sort();
            const sortedAns = [...answer].sort();
            isCorrect = sortedCorr.length === sortedAns.length && sortedCorr.every((val, idx) => val === sortedAns[idx]);
          }
        } else {
          isCorrect = typeof answer === 'string' && answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        }

        // Calculate score
        let scoreEarned = 0;
        let streakDelta = 0;
        let currentStreak = 0;

        const participant = room.participants.find(p => p.studentId.toString() === user.id);
        
        if (participant) {
          if (isCorrect) {
            scoreEarned = question.points;

            // Optional Speed Bonus
            if (room.settings.mode === 'speed_challenge' || room.settings.mode === 'classic_live') {
              const elapsedMs = Date.now() - new Date(room.questionStartedAt!).getTime();
              const limitMs = room.settings.timerDuration * 1000;
              const ratio = Math.max(0, (limitMs - elapsedMs) / limitMs);
              const speedBonus = Math.round(ratio * 50); // up to 50 bonus points
              scoreEarned += speedBonus;
            }

            participant.streak += 1;
            participant.correctAnswers += 1;
          } else {
            participant.streak = 0;
          }

          participant.score += scoreEarned;
          participant.lastAnsweredIndex = questionIndex;
          participant.isCorrect = isCorrect;
          currentStreak = participant.streak;

          await room.save();
        }

        // Confirm back to student
        socket.emit('quiz:answer-confirmed', {
          isCorrect,
          scoreEarned,
          totalScore: participant?.score || 0,
          correctAnswer: question.correctAnswer, // Safe to send now since student submitted
          streak: currentStreak
        });

        // Broadcast to teacher/lobby aggregate progress
        const answeredCount = room.participants.filter(p => p.lastAnsweredIndex === questionIndex).length;
        io.to(roomCode).emit('quiz:progress-update', {
          answeredCount,
          participantsCount: room.participants.length
        });

      } catch (err) {
        console.error('Error submitting answer:', err);
      }
    });

    // Next Question (Teacher only)
    socket.on('room:next-question', async () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode || user.role !== 'teacher') return;

      try {
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room) return;

        const quiz = room.quizId as unknown as { questions: { question: string; options: string[]; type: string; points: number }[] };
        const nextIndex = room.currentQuestionIndex + 1;

        // Show Leaderboard/Results between questions
        if (room.status === 'QUESTION_ACTIVE') {
          // Close question and reveal answers
          room.status = 'QUESTION_ENDED';
          await room.save();

          // Calculate current leaderboard standings
          const standings = [...room.participants]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, idx) => ({
              rank: idx + 1,
              name: p.name,
              score: p.score,
              correctAnswers: p.correctAnswers,
              streak: p.streak
            }));

          io.to(roomCode).emit('quiz:question-ended', {
            correctAnswer: (room.quizId as unknown as { questions: { correctAnswer: string | string[] }[] }).questions[room.currentQuestionIndex].correctAnswer,
            explanation: (room.quizId as unknown as { questions: { explanation?: string }[] }).questions[room.currentQuestionIndex].explanation || '',
            leaderboard: standings
          });
          return;
        }

        // If all questions are finished, move to completed results screen
        if (nextIndex >= quiz.questions.length) {
          room.status = 'COMPLETED';
          await room.save();

          const finalStandings = [...room.participants]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => ({
              rank: idx + 1,
              name: p.name,
              score: p.score,
              correctAnswers: p.correctAnswers
            }));

          // Save attempts into the database for each participant
          await Promise.all(
            room.participants.map(async (p) => {
              try {
                // Award XP to students
                const studUser = await User.findById(p.studentId);
                if (studUser) {
                  const xpEarned = p.score + 50; // extra 50 for finishing
                  studUser.xp += xpEarned;
                  studUser.level = Math.floor(studUser.xp / 1000) + 1;
                  await studUser.save();
                }
              } catch (err) {
                console.error('Error saving user socket XP award:', err);
              }
            })
          );

          io.to(roomCode).emit('quiz:game-over', { leaderboard: finalStandings });
          return;
        }

        // Move to next question active state
        room.status = 'QUESTION_ACTIVE';
        room.currentQuestionIndex = nextIndex;
        room.questionStartedAt = new Date();
        await room.save();

        const nextQuestion = quiz.questions[nextIndex];
        io.to(roomCode).emit('quiz:question', {
          questionIndex: nextIndex,
          questionCount: quiz.questions.length,
          questionText: nextQuestion.question,
          options: nextQuestion.options,
          type: nextQuestion.type,
          points: nextQuestion.points,
          timerDuration: room.settings.timerDuration
        });

      } catch (err) {
        console.error('Error loading next question:', err);
      }
    });

    // End Quiz Room (Teacher only)
    socket.on('room:end', async () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode || user.role !== 'teacher') return;

      try {
        const room = await Room.findOne({ roomCode });
        if (room) {
          room.status = 'COMPLETED';
          await room.save();
          io.to(roomCode).emit('quiz:game-over', { message: 'The teacher has ended this quiz room.' });
        }
      } catch (err) {
        console.error('Error ending live session:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name}, socketId: ${socket.id}`);
    });
  });
};
