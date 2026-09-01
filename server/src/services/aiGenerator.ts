import { Question } from '../shared/types';

interface GenerateParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  count: number;
}

const TOPICS_DATABASE: Record<string, Omit<Question, '_id' | 'order'>[]> = {
  dsa: [
    {
      type: 'multiple_choice',
      question: 'What is the average time complexity of searching in a Hash Table?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 'O(1)',
      explanation: 'Hash tables offer constant time complexity, O(1), for search operations on average by indexing values via hash functions.',
      points: 100,
      difficulty: 'easy'
    },
    {
      type: 'true_false',
      question: 'A binary search tree can search elements in O(log n) time in the worst case if it is completely unbalanced.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'In the worst case (a skewed/unbalanced tree), a binary search tree behaves like a linked list, degrading search time to O(n).',
      points: 100,
      difficulty: 'medium'
    },
    {
      type: 'multiple_choice',
      question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correctAnswer: 'Stack',
      explanation: 'A stack is a LIFO structure where elements are pushed and popped from the same end.',
      points: 100,
      difficulty: 'easy'
    },
    {
      type: 'multiple_select',
      question: 'Which of the following are self-balancing binary search trees? (Select all that apply)',
      options: ['AVL Tree', 'Red-Black Tree', 'Splay Tree', 'Heap'],
      correctAnswer: ['AVL Tree', 'Red-Black Tree', 'Splay Tree'],
      explanation: 'AVL trees, Red-Black trees, and Splay trees are self-balancing. Heaps are binary trees but not binary search trees.',
      points: 150,
      difficulty: 'hard'
    },
    {
      type: 'fill_in_the_blank',
      question: 'The data structure used to implement Breadth-First Search (BFS) is a ______.',
      options: ['Queue', 'queue'],
      correctAnswer: 'Queue',
      explanation: 'BFS uses a FIFO Queue to track neighboring vertices. DFS uses a LIFO Stack.',
      points: 120,
      difficulty: 'medium'
    },
    {
      type: 'multiple_choice',
      question: 'What is the time complexity of Quick Sort in the worst case?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(2ⁿ)'],
      correctAnswer: 'O(n²)',
      explanation: 'Quick Sort degrades to O(n²) in the worst case when the pivot is consistently the smallest or largest element.',
      points: 100,
      difficulty: 'medium'
    },
    {
      type: 'multiple_choice',
      question: 'Which algorithm is used to find the shortest path in a weighted graph with negative edge weights but no negative cycles?',
      options: ['Dijkstra', 'Kruskal', 'Bellman-Ford', 'Prim'],
      correctAnswer: 'Bellman-Ford',
      explanation: 'Dijkstra does not work with negative edge weights. Bellman-Ford supports negative weights and can detect negative cycles.',
      points: 150,
      difficulty: 'hard'
    }
  ],
  webdev: [
    {
      type: 'multiple_choice',
      question: 'Which hook is used to perform side effects in React function components?',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      correctAnswer: 'useEffect',
      explanation: 'The useEffect hook serves the purpose of handling side effects, such as data fetching, subscriptions, or DOM mutations.',
      points: 100,
      difficulty: 'easy'
    },
    {
      type: 'true_false',
      question: 'CSS flex-direction defaults to column.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'The default value for flex-direction is "row".',
      points: 100,
      difficulty: 'easy'
    },
    {
      type: 'multiple_select',
      question: 'Which of the following are valid state-management libraries for React? (Select all that apply)',
      options: ['Redux', 'Zustand', 'Recoil', 'Mongoose'],
      correctAnswer: ['Redux', 'Zustand', 'Recoil'],
      explanation: 'Redux, Zustand, and Recoil are react state libraries. Mongoose is a MongoDB ODM for Node.js.',
      points: 150,
      difficulty: 'medium'
    },
    {
      type: 'fill_in_the_blank',
      question: 'In HTTP, the status code for "Not Found" is ______.',
      options: ['404'],
      correctAnswer: '404',
      explanation: '404 is the official HTTP response status code for Not Found.',
      points: 100,
      difficulty: 'easy'
    }
  ],
  general: [
    {
      type: 'multiple_choice',
      question: 'Which of the following is NOT an operating system?',
      options: ['Linux', 'Windows', 'Oracle', 'macOS'],
      correctAnswer: 'Oracle',
      explanation: 'Oracle is a database management system and tech company. The other three are operating systems.',
      points: 100,
      difficulty: 'easy'
    },
    {
      type: 'multiple_choice',
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Queue List', 'System Query Log', 'Standard Quantum Link'],
      correctAnswer: 'Structured Query Language',
      explanation: 'SQL stands for Structured Query Language, used to communicate with databases.',
      points: 100,
      difficulty: 'easy'
    }
  ]
};

export const generateAIQuestions = async (params: GenerateParams): Promise<Omit<Question, '_id'>[]> => {
  const { topic, difficulty, count } = params;
  console.log(`Generating AI questions: topic=${topic}, diff=${difficulty}, count=${count}`);

  // Normalizing topic key
  let categoryKey = 'general';
  const normTopic = topic.toLowerCase();
  if (normTopic.includes('data') || normTopic.includes('algorithm') || normTopic.includes('dsa') || normTopic.includes('tree') || normTopic.includes('graph')) {
    categoryKey = 'dsa';
  } else if (normTopic.includes('react') || normTopic.includes('web') || normTopic.includes('html') || normTopic.includes('css') || normTopic.includes('js') || normTopic.includes('node')) {
    categoryKey = 'webdev';
  }

  const pool = TOPICS_DATABASE[categoryKey] || TOPICS_DATABASE.general;

  // Filter pool by difficulty (fallback to any difficulty if pool is small)
  let filtered = pool.filter(q => q.difficulty === difficulty);
  if (filtered.length === 0) {
    filtered = pool;
  }

  // Shuffle and pick elements
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we need more questions than in pool, duplicate and modify titles to generate variations
  const results: Omit<Question, '_id'>[] = [];
  for (let i = 0; i < count; i++) {
    const template = selected[i % selected.length];
    results.push({
      type: template.type,
      question: count > selected.length ? `[V${Math.ceil((i + 1) / selected.length)}] ${template.question}` : template.question,
      options: [...template.options],
      correctAnswer: Array.isArray(template.correctAnswer) ? [...template.correctAnswer] : template.correctAnswer,
      explanation: template.explanation,
      points: template.points,
      difficulty: difficulty,
      order: i + 1
    });
  }

  return results;
};
