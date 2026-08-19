import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Quiz from './models/Quiz';
import Class from './models/Class';
import Attempt from './models/Attempt';

dotenv.config();

const SEED_PASSWORD = 'password123';

const subjects = [
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Computer Networks',
  'DBMS',
  'Python',
  'C++',
  'Java',
  'Web Development',
  'Computer Architecture'
];

const generateQuestions = (subject: string, quizIndex: number) => {
  // Return different questions based on subject & index to generate 20 quizzes
  if (subject === 'Data Structures') {
    if (quizIndex === 0) {
      return [
        {
          type: 'multiple_choice',
          question: 'Which of the following data structures is LIFO?',
          options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
          correctAnswer: 'Stack',
          explanation: 'Stack works on Last-In-First-Out principles (LIFO) while Queue is FIFO.',
          points: 100,
          difficulty: 'easy',
          order: 1
        },
        {
          type: 'true_false',
          question: 'A linked list allows O(1) random access.',
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'Arrays allow O(1) random access. Linked lists require traversing nodes, resulting in O(n) access time.',
          points: 100,
          difficulty: 'easy',
          order: 2
        },
        {
          type: 'multiple_select',
          question: 'Which of the following are linear data structures? (Select all that apply)',
          options: ['Stack', 'Queue', 'Graph', 'Array'],
          correctAnswer: ['Stack', 'Queue', 'Array'],
          explanation: 'Stack, Queue, and Array are linear data structures. Graph is a non-linear data structure.',
          points: 150,
          difficulty: 'medium',
          order: 3
        },
        {
          type: 'fill_in_the_blank',
          question: 'The time complexity of looking up a value in a hash table on average is O(____).',
          options: ['1'],
          correctAnswer: '1',
          explanation: 'Hash tables offer O(1) constant search time complexity on average.',
          points: 100,
          difficulty: 'medium',
          order: 4
        }
      ];
    } else {
      return [
        {
          type: 'multiple_choice',
          question: 'What is the maximum number of children a binary tree node can have?',
          options: ['1', '2', '3', 'Unlimited'],
          correctAnswer: '2',
          explanation: 'A binary tree node can have at most 2 children (left and right).',
          points: 100,
          difficulty: 'easy',
          order: 1
        },
        {
          type: 'multiple_choice',
          question: 'Which tree structure is self-balancing?',
          options: ['Binary Search Tree', 'AVL Tree', 'Trie', 'B-Tree'],
          correctAnswer: 'AVL Tree',
          explanation: 'An AVL tree is a self-balancing binary search tree where the height difference of left and right subtrees is at most 1.',
          points: 100,
          difficulty: 'medium',
          order: 2
        }
      ];
    }
  }

  if (subject === 'Algorithms') {
    if (quizIndex === 0) {
      return [
        {
          type: 'multiple_choice',
          question: 'What is the worst-case time complexity of Quick Sort?',
          options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
          correctAnswer: 'O(n²)',
          explanation: 'Quick Sort degrades to O(n²) in the worst case when the pivot splits the array into sizes 0 and n-1.',
          points: 100,
          difficulty: 'medium',
          order: 1
        },
        {
          type: 'true_false',
          question: 'Merge Sort is a stable sorting algorithm.',
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'Yes, Merge Sort is stable since it preserves the relative order of identical elements.',
          points: 100,
          difficulty: 'easy',
          order: 2
        },
        {
          type: 'multiple_choice',
          question: 'Which search algorithm requires the array to be sorted beforehand?',
          options: ['Linear Search', 'Binary Search', 'Breadth-First Search', 'Depth-First Search'],
          correctAnswer: 'Binary Search',
          explanation: 'Binary search splits the range in half, which relies on the elements being in sorted order.',
          points: 100,
          difficulty: 'easy',
          order: 3
        }
      ];
    } else {
      return [
        {
          type: 'multiple_choice',
          question: 'Which algorithmic paradigm does Dijkstra shortest path use?',
          options: ['Dynamic Programming', 'Greedy', 'Divide and Conquer', 'Backtracking'],
          correctAnswer: 'Greedy',
          explanation: 'Dijkstra chooses the local optimum (closest unvisited node) at each step, making it a greedy algorithm.',
          points: 100,
          difficulty: 'medium',
          order: 1
        }
      ];
    }
  }

  if (subject === 'Operating Systems') {
    return [
      {
        type: 'multiple_choice',
        question: 'Which of the following is NOT a process state in OS?',
        options: ['New', 'Running', 'Waiting', 'Compiling'],
        correctAnswer: 'Compiling',
        explanation: 'Process states are New, Ready, Running, Waiting, and Terminated. Compiling is not a process state.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'true_false',
        question: 'Virtual memory allows execution of processes larger than physical memory.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Virtual memory maps virtual addresses to disk space and RAM, enabling large programs to execute in chunks.',
        points: 100,
        difficulty: 'medium',
        order: 2
      }
    ];
  }

  if (subject === 'Computer Networks') {
    return [
      {
        type: 'multiple_choice',
        question: 'How many layers are in the OSI model?',
        options: ['4', '5', '7', '9'],
        correctAnswer: '7',
        explanation: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'fill_in_the_blank',
        question: 'Which protocol is used to translate domain names to IP addresses?',
        options: ['DNS', 'dns'],
        correctAnswer: 'DNS',
        explanation: 'Domain Name System (DNS) maps human-readable names to IP addresses.',
        points: 100,
        difficulty: 'easy',
        order: 2
      }
    ];
  }

  if (subject === 'DBMS') {
    return [
      {
        type: 'multiple_choice',
        question: 'What does ACID stand for in databases?',
        options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Control, Integration, Design', 'Access, Compression, Indexes, Deployment', 'None of the above'],
        correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
        explanation: 'ACID properties ensure reliable transaction processing in database management systems.',
        points: 100,
        difficulty: 'medium',
        order: 1
      },
      {
        type: 'true_false',
        question: 'A primary key can contain null values.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Primary keys must contain unique, non-null values to identify each row uniquely.',
        points: 100,
        difficulty: 'easy',
        order: 2
      }
    ];
  }

  if (subject === 'Python') {
    return [
      {
        type: 'multiple_choice',
        question: 'Which keyword is used to create a function generator in Python?',
        options: ['return', 'yield', 'lambda', 'generator'],
        correctAnswer: 'yield',
        explanation: 'Functions containing the "yield" keyword return a generator object instead of executing immediately.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'multiple_select',
        question: 'Which of the following are mutable data types in Python? (Select all)',
        options: ['List', 'Dictionary', 'Tuple', 'Set'],
        correctAnswer: ['List', 'Dictionary', 'Set'],
        explanation: 'Lists, dictionaries, and sets are mutable. Tuples are immutable.',
        points: 150,
        difficulty: 'medium',
        order: 2
      }
    ];
  }

  if (subject === 'C++') {
    return [
      {
        type: 'multiple_choice',
        question: 'Which symbol is used for the address-of operator in C++?',
        options: ['*', '&', '->', '#'],
        correctAnswer: '&',
        explanation: 'The ampersand (&) operator retrieves the memory address of a variable.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'true_false',
        question: 'C++ supports multiple inheritance directly.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Yes, C++ allows a class to inherit from more than one base class.',
        points: 100,
        difficulty: 'medium',
        order: 2
      }
    ];
  }

  if (subject === 'Java') {
    return [
      {
        type: 'multiple_choice',
        question: 'Which memory area stores Java objects?',
        options: ['Stack', 'Heap', 'Method Area', 'Registers'],
        correctAnswer: 'Heap',
        explanation: 'All instances/objects in Java are dynamically allocated on the Garbage-collected Heap.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'true_false',
        question: 'String class is mutable in Java.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Strings are immutable in Java. For mutable character strings, use StringBuilder or StringBuffer.',
        points: 100,
        difficulty: 'easy',
        order: 2
      }
    ];
  }

  if (subject === 'Web Development') {
    return [
      {
        type: 'multiple_choice',
        question: 'What is the default value of the CSS position property?',
        options: ['relative', 'absolute', 'static', 'fixed'],
        correctAnswer: 'static',
        explanation: 'HTML elements are positioned static by default, meaning they flow naturally in the page document.',
        points: 100,
        difficulty: 'easy',
        order: 1
      },
      {
        type: 'multiple_choice',
        question: 'In React, which Hook allows you to share state globally without props drilling?',
        options: ['useContext', 'useReducer', 'useCallback', 'useMemo'],
        correctAnswer: 'useContext',
        explanation: 'The useContext hook retrieves state from React Context, removing the need for intermediary component props.',
        points: 100,
        difficulty: 'medium',
        order: 2
      }
    ];
  }

  // Computer Architecture
  return [
    {
      type: 'multiple_choice',
      question: 'Which type of cache is typically built directly into the CPU processor chip?',
      options: ['L1 Cache', 'L2 Cache', 'L3 Cache', 'System RAM'],
      correctAnswer: 'L1 Cache',
      explanation: 'L1 cache is the smallest, fastest cache, and is embedded directly inside individual CPU cores.',
      points: 100,
      difficulty: 'medium',
      order: 1
    },
    {
      type: 'true_false',
      question: 'Pipelining increases the overall throughput of instruction execution.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Pipelining overlaps stages of instruction executions, increasing instruction throughput.',
      points: 100,
      difficulty: 'hard',
      order: 2
    }
  ];
};

export const seedDatabase = async (skipConn = false) => {
  try {
    if (!skipConn) {
      const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizarena';
      console.log(`Connecting to database for seeding: ${connString}`);
      await mongoose.connect(connString);
    }
    console.log('Connected to Database. Cleaning up collections...');

    // Clear old data
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Class.deleteMany({});
    await Attempt.deleteMany({});

    console.log('Collections cleared. Inserting Users...');

    // Create Hashed passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);

    // Create Teacher
    const teacher = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'teacher@quizarena.com',
      passwordHash,
      role: 'teacher',
      institution: 'MIT Computer Science Department',
      subject: 'Computer Science',
      avatar: 'teacher_avatar_1',
      xp: 0,
      level: 1,
      streak: 0
    });

    console.log(`Teacher created: ${teacher.name} (${teacher.email})`);

    // Create Students
    const studentData = [
      { name: 'Suhas Kumar', email: 'student@quizarena.com', avatar: 'avatar1', xp: 1250, streak: 5 },
      { name: 'Rahul Sharma', email: 'rahul@quizarena.com', avatar: 'avatar2', xp: 850, streak: 3 },
      { name: 'Ananya Patel', email: 'ananya@quizarena.com', avatar: 'avatar3', xp: 2100, streak: 12 },
      { name: 'Arjun Das', email: 'arjun@quizarena.com', avatar: 'avatar4', xp: 50, streak: 1 },
      { name: 'Sagar Sen', email: 'sagar@quizarena.com', avatar: 'avatar5', xp: 620, streak: 0 }
    ];

    const students = await Promise.all(
      studentData.map(async (stud) => {
        return User.create({
          name: stud.name,
          email: stud.email,
          passwordHash,
          role: 'student',
          institution: 'LPU Engineering College',
          class: 'B.Tech CSE',
          subject: '3rd Year',
          avatar: stud.avatar,
          xp: stud.xp,
          level: Math.floor(stud.xp / 1000) + 1,
          streak: stud.streak,
          lastStreakUpdate: new Date()
        });
      })
    );

    console.log(`${students.length} Student accounts created successfully.`);

    // Create Class
    const classObj = await Class.create({
      teacherId: teacher._id,
      name: 'Data Structures - Section C',
      subject: 'Data Structures',
      joinCode: 'DSA309',
      students: [students[0]._id, students[1]._id, students[2]._id]
    });
    console.log(`Class created: ${classObj.name} (Code: ${classObj.joinCode})`);

    // Generate 20 Quizzes
    console.log('Generating 20 quizzes...');
    const quizzesToInsert = [];

    // Loop through subjects and create 2 quizzes per subject to reach exactly 20 quizzes
    for (let i = 0; i < 20; i++) {
      const subject = subjects[i % subjects.length];
      const quizIndexInSubject = Math.floor(i / subjects.length); // 0 or 1
      const quizNum = i + 1;
      
      const title = `${subject} - Practice Set #${quizIndexInSubject + 1}`;
      const description = `Master core concepts in ${subject} through QuizArena interactive exercises. Covered items: Quiz #${quizNum}.`;
      
      const quizDifficulty = quizNum % 3 === 0 ? 'hard' : quizNum % 2 === 0 ? 'medium' : 'easy';
      const topic = `Module ${quizIndexInSubject + 1}`;

      const questions = generateQuestions(subject, quizIndexInSubject);

      quizzesToInsert.push({
        creatorId: teacher._id,
        title,
        description,
        subject,
        topic,
        difficulty: quizDifficulty,
        coverImage: `https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=80`,
        questions,
        settings: {
          shuffleQuestions: false,
          shuffleAnswers: false,
          timerMode: 'question',
          timerDuration: 30,
          showCorrectAnswers: 'immediately',
          showExplanations: 'immediately',
          enableLeaderboard: true,
          enableSpeedBonus: true,
          allowRetry: true,
          allowLateJoining: true
        },
        published: true
      });
    }

    const seededQuizzes = await Quiz.insertMany(quizzesToInsert);
    console.log(`${seededQuizzes.length} Quizzes successfully seeded!`);

    // Create mock student attempts for progress graphs
    console.log('Seeding mock attempts for analytics...');
    const attemptData = [
      {
        studentId: students[0]._id,
        quizId: seededQuizzes[0]._id,
        score: 350,
        accuracy: 100,
        timeTaken: 45
      },
      {
        studentId: students[0]._id,
        quizId: seededQuizzes[1]._id,
        score: 180,
        accuracy: 50,
        timeTaken: 25
      },
      {
        studentId: students[1]._id,
        quizId: seededQuizzes[0]._id,
        score: 220,
        accuracy: 75,
        timeTaken: 55
      },
      {
        studentId: students[2]._id,
        quizId: seededQuizzes[0]._id,
        score: 380,
        accuracy: 100,
        timeTaken: 38
      }
    ];

    await Promise.all(
      attemptData.map(async (att) => {
        // Find quiz questions to compile answers structures
        const q = seededQuizzes.find(sq => sq._id.toString() === att.quizId.toString());
        const ans = q ? q.questions.map((quest, idx) => ({
          questionIndex: idx,
          questionId: (quest as any)._id,
          studentAnswer: quest.options[0] || 'A',
          isCorrect: idx === 0 || att.accuracy === 100,
          pointsEarned: (idx === 0 || att.accuracy === 100) ? quest.points : 0,
          timeTaken: 10
        })) : [];

        return Attempt.create({
          studentId: att.studentId,
          quizId: att.quizId,
          answers: ans,
          score: att.score,
          accuracy: att.accuracy,
          timeTaken: att.timeTaken,
          completedAt: new Date(Date.now() - (Math.random() * 5 * 24 * 60 * 60 * 1000)) // within 5 days
        });
      })
    );

    console.log('Analytics attempts seeded successfully.');
    console.log('Database Seeding Completed Successfully! You can log in using:');
    console.log('TEACHER: teacher@quizarena.com / password123');
    console.log('STUDENT: student@quizarena.com / password123');
    
    if (!skipConn) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error during seeding:', err);
    if (!skipConn) {
      process.exit(1);
    }
    throw err;
  }
};

// Check if run directly
if (require.main === module || (process.argv[1] && process.argv[1].includes('seed.ts'))) {
  seedDatabase();
}
