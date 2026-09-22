// Full In-Memory & LocalStorage Persisted Mock Data Engine
// Ensures seamless operation even when backend Express is offline or behind a proxy.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  password?: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  approved: boolean;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  department?: string;
  employeeId?: string;
  score?: number;
  rank?: number;
  currentDifficulty?: number;
  highestDifficulty?: number;
  solvedCount?: number;
  skippedCount?: number;
  attemptsCount?: number;
  sessionStatus?: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'COMPLETED' | 'PAUSED';
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  registrationDate?: string;
  lastLogin?: string;
  rejectionReason?: string;
  profileImage?: string;
}

const generateInitialData = () => {
  const users: MockUser[] = [
    {
      id: 'usr_admin_1',
      name: 'Admin Director',
      email: 'admin@hackathon.com',
      aliases: ['admin@hackarena.edu', 'admin@hackathon.com', 'admin@university.edu', 'admin', 'director@hackarena.edu'],
      password: 'Pass@123',
      role: 'ADMIN',
      approved: true,
      status: 'ACTIVE',
      registrationDate: '2026-01-15T09:00:00Z',
      lastLogin: new Date().toISOString(),
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr_admin_2',
      name: 'Security Admin',
      email: 'security@hackathon.com',
      aliases: ['security@hackarena.edu', 'security@hackathon.com', 'security'],
      password: 'Pass@123',
      role: 'ADMIN',
      approved: true,
      status: 'ACTIVE',
      registrationDate: '2026-01-20T10:00:00Z',
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'usr_fac_1',
      name: 'Dr. Robert Vance',
      email: 'faculty@hackathon.com',
      aliases: ['faculty@hackarena.edu', 'faculty@hackathon.com', 'faculty@university.edu', 'faculty', 'vance@hackarena.edu', 'vance@hackathon.com'],
      password: 'Pass@123',
      role: 'FACULTY',
      approved: true,
      status: 'ACTIVE',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-2024-089',
      registrationDate: '2026-02-01T08:30:00Z',
      lastLogin: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'usr_fac_2',
      name: 'Prof. Katherine Howard',
      email: 'khoward@hackathon.com',
      aliases: ['khoward@hackarena.edu', 'khoward@hackathon.com', 'howard@hackarena.edu', 'khoward'],
      password: 'Pass@123',
      role: 'FACULTY',
      approved: true,
      status: 'ACTIVE',
      department: 'Information Technology',
      employeeId: 'FAC-2024-112',
      registrationDate: '2026-02-05T09:15:00Z',
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'usr_fac_3',
      name: 'Dr. Marcus Brody',
      email: 'mbrody@hackathon.com',
      aliases: ['mbrody@hackarena.edu', 'mbrody@hackathon.com', 'brody@hackarena.edu', 'mbrody'],
      password: 'Pass@123',
      role: 'FACULTY',
      approved: true,
      status: 'ACTIVE',
      department: 'Data Science & Artificial Intelligence',
      employeeId: 'FAC-2024-145',
      registrationDate: '2026-02-10T11:00:00Z',
      lastLogin: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'usr_fac_4',
      name: 'Prof. Elena Rostova',
      email: 'erostova@hackathon.com',
      aliases: ['erostova@hackarena.edu', 'erostova@hackathon.com', 'rostova@hackarena.edu', 'erostova'],
      password: 'Pass@123',
      role: 'FACULTY',
      approved: true,
      status: 'ACTIVE',
      department: 'Cybersecurity & Systems Engineering',
      employeeId: 'FAC-2024-208',
      registrationDate: '2026-02-14T14:20:00Z',
      lastLogin: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: 'usr_fac_5',
      name: 'Dr. Alan Sterling',
      email: 'asterling@hackathon.com',
      aliases: ['asterling@hackarena.edu', 'asterling@hackathon.com', 'sterling@hackarena.edu', 'asterling'],
      password: 'Pass@123',
      role: 'FACULTY',
      approved: true,
      status: 'ACTIVE',
      department: 'Software Engineering & Cloud Computing',
      employeeId: 'FAC-2024-331',
      registrationDate: '2026-02-18T16:45:00Z',
      lastLogin: new Date(Date.now() - 28800000).toISOString(),
    },
  ];

  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Chris', 'Pat', 'Devon', 'Riley', 'Avery', 'Logan', 'Dakota', 'Skyler', 'Cameron', 'Rowan', 'Hayden', 'Reese', 'Kendall', 'Parker', 'Quinn', 'Harper', 'Peyton', 'Sawyer', 'Emerson', 'Finley', 'River', 'Dallas', 'Sage', 'Amari'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  for (let i = 1; i <= 71; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const isPending = i >= 61 && i <= 66;
    const isRejected = i >= 67 && i <= 69;
    const isSuspended = i === 70;
    const isOffline = i > 55 && i <= 60;
    const isCompleted = i === 1 || i === 2;

    let status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED' = 'ACTIVE';
    let approved = true;
    let rejectionReason;

    if (isPending) {
      status = 'PENDING';
      approved = false;
    } else if (isRejected) {
      status = 'REJECTED';
      approved = false;
      rejectionReason = 'Incomplete university enrollment verification.';
    } else if (isSuspended) {
      status = 'SUSPENDED';
      approved = true;
      rejectionReason = 'Suspicious concurrent multi-IP session activity.';
    }

    let sessionStatus: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'COMPLETED' | 'PAUSED' = 'ACTIVE';
    if (isPending || isRejected || isSuspended) sessionStatus = 'OFFLINE';
    else if (isCompleted) sessionStatus = 'COMPLETED';
    else if (isOffline) sessionStatus = 'OFFLINE';
    else if (i % 7 === 0) sessionStatus = 'IDLE';

    const currentDiff = Math.min(10, Math.max(1, Math.floor(10 - (i / 8)) + (i % 3)));
    const highestDiff = Math.min(10, currentDiff + (i % 2));
    const solved = Math.max(0, Math.floor((72 - i) / 6));
    const skipped = (i % 4 === 0) ? 2 : (i % 2 === 0 ? 1 : 0);
    const attempts = solved * 2 + (i % 3);
    const score = solved * 40 + (highestDiff * 15) - (skipped * 5);

    users.push({
      id: `usr_stu_${i}`,
      name: i === 3 ? 'Student One' : `${fn} ${ln}`,
      email: i === 3 ? 'student@hackathon.com' : `student${i}@university.edu`,
      aliases: i === 3
        ? ['student@hackarena.edu', 'student@hackathon.com', 'student@university.edu', 'student', 'student1@hackarena.edu', 'student1@hackathon.com']
        : [`student${i}@hackarena.edu`, `student${i}@hackathon.com`, `student${i}@university.edu`, `student${i}`],
      password: 'Pass@123',
      role: 'STUDENT',
      approved,
      status,
      registrationDate: new Date(Date.now() - (75 - i) * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - (i % 10) * 180000).toISOString(),
      score: status === 'ACTIVE' || status === 'SUSPENDED' ? score : 0,
      rank: status === 'ACTIVE' ? i : undefined,
      currentDifficulty: status === 'ACTIVE' ? currentDiff : 1,
      highestDifficulty: status === 'ACTIVE' ? highestDiff : 1,
      solvedCount: status === 'ACTIVE' ? solved : 0,
      skippedCount: status === 'ACTIVE' ? skipped : 0,
      attemptsCount: status === 'ACTIVE' ? attempts : 0,
      sessionStatus,
      rejectionReason,
      department: i % 2 === 0 ? 'Computer Science' : 'Software Engineering',
      assignedFacultyId: i <= 35 ? 'usr_fac_1' : 'usr_fac_2',
      assignedFacultyName: i <= 35 ? 'Dr. Robert Vance' : 'Prof. Katherine Howard',
    });
  }

  return users;
};

// Data Store in Memory
let mockUsers = generateInitialData();

let mockQuestions: any[] = [
  {
    id: 'q_1',
    title: 'Two Sum Target Indices',
    difficulty: 1,
    category: 'Arrays & Hashing',
    tags: ['array', 'hash-table', 'easy'],
    problemStatement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    functionSignature: 'fun twoSum(nums: IntArray, target: Int): IntArray',
    starterCode: `class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        // Write your solution here\n        return intArrayOf(0, 1)\n    }\n}`,
    expectedInput: 'nums = [2,7,11,15], target = 9',
    expectedOutput: '[0,1]',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 5,
    successRate: 94.2,
    averageTimeMinutes: 4.5,
    skipRate: 2.1,
    attemptsCount: 142,
    solvesCount: 134,
    status: 'ACTIVE',
  },
  {
    id: 'q_2',
    title: 'Valid Palindrome String',
    difficulty: 1,
    category: 'Two Pointers',
    tags: ['string', 'two-pointers', 'easy'],
    problemStatement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    functionSignature: 'fun isPalindrome(s: String): Boolean',
    starterCode: `class Solution {\n    fun isPalindrome(s: String): Boolean {\n        // Write your solution here\n        return true\n    }\n}`,
    expectedInput: 's = "A man, a plan, a canal: Panama"',
    expectedOutput: 'true',
    constraints: '1 <= s.length <= 2 * 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 4,
    successRate: 91.5,
    averageTimeMinutes: 5.2,
    skipRate: 3.4,
    attemptsCount: 128,
    solvesCount: 117,
    status: 'ACTIVE',
  },
  {
    id: 'q_6',
    title: 'Contains Duplicate Elements',
    difficulty: 1,
    category: 'Arrays & Hashing',
    tags: ['array', 'hash-set', 'easy'],
    problemStatement: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    functionSignature: 'fun containsDuplicate(nums: IntArray): Boolean',
    starterCode: `class Solution {\n    fun containsDuplicate(nums: IntArray): Boolean {\n        return false\n    }\n}`,
    expectedInput: 'nums = [1,2,3,1]',
    expectedOutput: 'true',
    constraints: '1 <= nums.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 4,
    successRate: 95.8,
    averageTimeMinutes: 3.8,
    skipRate: 1.2,
    attemptsCount: 160,
    solvesCount: 153,
    status: 'ACTIVE',
  },
  {
    id: 'q_3',
    title: 'Valid Balanced Parentheses',
    difficulty: 2,
    category: 'Stack',
    tags: ['stack', 'string', 'easy'],
    problemStatement: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    functionSignature: 'fun isValid(s: String): Boolean',
    starterCode: `class Solution {\n    fun isValid(s: String): Boolean {\n        // Write your solution here\n        return true\n    }\n}`,
    expectedInput: 's = "()[]{}"',
    expectedOutput: 'true',
    constraints: '1 <= s.length <= 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 88.0,
    averageTimeMinutes: 6.8,
    skipRate: 4.2,
    attemptsCount: 135,
    solvesCount: 119,
    status: 'ACTIVE',
  },
  {
    id: 'q_4',
    title: 'Merge Two Sorted Singly Linked Lists',
    difficulty: 2,
    category: 'Linked Lists',
    tags: ['linked-list', 'recursion'],
    problemStatement: 'Merge two sorted linked lists and return it as a new sorted list.',
    functionSignature: 'fun mergeTwoLists(list1: ListNode?, list2: ListNode?): ListNode?',
    starterCode: `class Solution {\n    fun mergeTwoLists(list1: ListNode?, list2: ListNode?): ListNode? {\n        return null\n    }\n}`,
    expectedInput: 'list1 = [1,2,4], list2 = [1,3,4]',
    expectedOutput: '[1,1,2,3,4,4]',
    constraints: '0 <= length <= 50',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 5,
    successRate: 85.3,
    averageTimeMinutes: 7.5,
    skipRate: 5.1,
    attemptsCount: 110,
    solvesCount: 94,
    status: 'ACTIVE',
  },
  {
    id: 'q_7',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 2,
    category: 'Arrays & Hashing',
    tags: ['array', 'greedy', 'easy'],
    problemStatement: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
    functionSignature: 'fun maxProfit(prices: IntArray): Int',
    starterCode: `class Solution {\n    fun maxProfit(prices: IntArray): Int {\n        return 5\n    }\n}`,
    expectedInput: 'prices = [7,1,5,3,6,4]',
    expectedOutput: '5',
    constraints: '1 <= prices.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 5,
    successRate: 87.2,
    averageTimeMinutes: 6.2,
    skipRate: 3.8,
    attemptsCount: 125,
    solvesCount: 109,
    status: 'ACTIVE',
  },
  {
    id: 'q_5',
    title: 'Container With Most Water',
    difficulty: 3,
    category: 'Two Pointers',
    tags: ['two-pointers', 'greedy', 'medium'],
    problemStatement: 'Find two lines that together with the x-axis form a container that contains the most water.',
    functionSignature: 'fun maxArea(height: IntArray): Int',
    starterCode: `class Solution {\n    fun maxArea(height: IntArray): Int {\n        return 49\n    }\n}`,
    expectedInput: 'height = [1,8,6,2,5,4,8,3,7]',
    expectedOutput: '49',
    constraints: '2 <= height.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 78.4,
    averageTimeMinutes: 9.2,
    skipRate: 6.2,
    attemptsCount: 98,
    solvesCount: 76,
    status: 'ACTIVE',
  },
  {
    id: 'q_8',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 3,
    category: 'Sliding Window',
    tags: ['sliding-window', 'hash-set', 'medium'],
    problemStatement: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    functionSignature: 'fun lengthOfLongestSubstring(s: String): Int',
    starterCode: `class Solution {\n    fun lengthOfLongestSubstring(s: String): Int {\n        return 3\n    }\n}`,
    expectedInput: 's = "abcabcbb"',
    expectedOutput: '3',
    constraints: '0 <= s.length <= 5 * 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 76.5,
    averageTimeMinutes: 9.5,
    skipRate: 6.8,
    attemptsCount: 104,
    solvesCount: 80,
    status: 'ACTIVE',
  },
  {
    id: 'q_9',
    title: 'Reverse Singly Linked List',
    difficulty: 3,
    category: 'Linked Lists',
    tags: ['linked-list', 'pointers'],
    problemStatement: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    functionSignature: 'fun reverseList(head: ListNode?): ListNode?',
    starterCode: `class Solution {\n    fun reverseList(head: ListNode?): ListNode? {\n        return null\n    }\n}`,
    expectedInput: 'head = [1,2,3,4,5]',
    expectedOutput: '[5,4,3,2,1]',
    constraints: '0 <= nodes <= 5000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 5,
    successRate: 80.1,
    averageTimeMinutes: 8.0,
    skipRate: 5.5,
    attemptsCount: 95,
    solvesCount: 76,
    status: 'ACTIVE',
  },
  {
    id: 'q_10',
    title: '3Sum Zero Triplet Combinations',
    difficulty: 4,
    category: 'Two Pointers',
    tags: ['two-pointers', 'sorting', 'array'],
    problemStatement: 'Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.',
    functionSignature: 'fun threeSum(nums: IntArray): List<List<Int>>',
    starterCode: `class Solution {\n    fun threeSum(nums: IntArray): List<List<Int>> {\n        return emptyList()\n    }\n}`,
    expectedInput: 'nums = [-1,0,1,2,-1,-4]',
    expectedOutput: '[[-1,-1,2],[-1,0,1]]',
    constraints: '3 <= nums.length <= 3000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 7,
    successRate: 69.4,
    averageTimeMinutes: 12.0,
    skipRate: 8.5,
    attemptsCount: 85,
    solvesCount: 59,
    status: 'ACTIVE',
  },
  {
    id: 'q_11',
    title: 'Top K Frequent Elements',
    difficulty: 4,
    category: 'Arrays & Hashing',
    tags: ['hash-table', 'heap', 'bucket-sort'],
    problemStatement: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.',
    functionSignature: 'fun topKFrequent(nums: IntArray, k: Int): IntArray',
    starterCode: `class Solution {\n    fun topKFrequent(nums: IntArray, k: Int): IntArray {\n        return intArrayOf(1, 2)\n    }\n}`,
    expectedInput: 'nums = [1,1,1,2,2,3], k = 2',
    expectedOutput: '[1,2]',
    constraints: '1 <= nums.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 72.8,
    averageTimeMinutes: 11.2,
    skipRate: 7.1,
    attemptsCount: 92,
    solvesCount: 67,
    status: 'ACTIVE',
  },
  {
    id: 'q_12',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 4,
    category: 'Stack',
    tags: ['stack', 'math'],
    problemStatement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation (RPN). Valid operators are +, -, *, and /.',
    functionSignature: 'fun evalRPN(tokens: Array<String>): Int',
    starterCode: `class Solution {\n    fun evalRPN(tokens: Array<String>): Int {\n        return 9\n    }\n}`,
    expectedInput: 'tokens = ["2","1","+","3","*"]',
    expectedOutput: '9',
    constraints: '1 <= tokens.length <= 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 70.3,
    averageTimeMinutes: 11.5,
    skipRate: 7.9,
    attemptsCount: 88,
    solvesCount: 62,
    status: 'ACTIVE',
  },
  {
    id: 'q_13',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 5,
    category: 'Trees',
    tags: ['tree', 'bfs', 'queue'],
    problemStatement: 'Given the `root` of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).',
    functionSignature: 'fun levelOrder(root: TreeNode?): List<List<Int>>',
    starterCode: `class Solution {\n    fun levelOrder(root: TreeNode?): List<List<Int>> {\n        return emptyList()\n    }\n}`,
    expectedInput: 'root = [3,9,20,null,null,15,7]',
    expectedOutput: '[[3],[9,20],[15,7]]',
    constraints: '0 <= nodes <= 2000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 64.1,
    averageTimeMinutes: 13.8,
    skipRate: 10.2,
    attemptsCount: 78,
    solvesCount: 50,
    status: 'ACTIVE',
  },
  {
    id: 'q_14',
    title: 'Search in Rotated Sorted Array',
    difficulty: 5,
    category: 'Arrays & Hashing',
    tags: ['binary-search', 'array'],
    problemStatement: 'Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`. Running time must be O(log n).',
    functionSignature: 'fun search(nums: IntArray, target: Int): Int',
    starterCode: `class Solution {\n    fun search(nums: IntArray, target: Int): Int {\n        return 4\n    }\n}`,
    expectedInput: 'nums = [4,5,6,7,0,1,2], target = 0',
    expectedOutput: '4',
    constraints: '1 <= nums.length <= 5000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 7,
    successRate: 61.5,
    averageTimeMinutes: 14.5,
    skipRate: 11.4,
    attemptsCount: 75,
    solvesCount: 46,
    status: 'ACTIVE',
  },
  {
    id: 'q_15',
    title: 'Daily Temperatures Warmer Days',
    difficulty: 5,
    category: 'Stack',
    tags: ['stack', 'monotonic-stack'],
    problemStatement: 'Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i-th` day to get a warmer temperature.',
    functionSignature: 'fun dailyTemperatures(temperatures: IntArray): IntArray',
    starterCode: `class Solution {\n    fun dailyTemperatures(temperatures: IntArray): IntArray {\n        return intArrayOf(1, 1, 4, 2, 1, 1, 0, 0)\n    }\n}`,
    expectedInput: 'temperatures = [73,74,75,71,69,72,76,73]',
    expectedOutput: '[1,1,4,2,1,1,0,0]',
    constraints: '1 <= temperatures.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 63.2,
    averageTimeMinutes: 13.9,
    skipRate: 9.8,
    attemptsCount: 82,
    solvesCount: 52,
    status: 'ACTIVE',
  },
  {
    id: 'q_16',
    title: 'Longest Repeating Character Replacement',
    difficulty: 6,
    category: 'Sliding Window',
    tags: ['sliding-window', 'string'],
    problemStatement: 'You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character at most `k` times. Return the length of the longest substring containing the same letter.',
    functionSignature: 'fun characterReplacement(s: String, k: Int): Int',
    starterCode: `class Solution {\n    fun characterReplacement(s: String, k: Int): Int {\n        return 4\n    }\n}`,
    expectedInput: 's = "ABAB", k = 2',
    expectedOutput: '4',
    constraints: '1 <= s.length <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 7,
    successRate: 56.4,
    averageTimeMinutes: 16.2,
    skipRate: 14.1,
    attemptsCount: 65,
    solvesCount: 37,
    status: 'ACTIVE',
  },
  {
    id: 'q_17',
    title: 'LRU Cache Design & Eviction',
    difficulty: 6,
    category: 'Design',
    tags: ['design', 'doubly-linked-list', 'hash-table'],
    problemStatement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity for `get` and `put` operations.',
    functionSignature: 'class LRUCache(capacity: Int)',
    starterCode: `class LRUCache(val capacity: Int) {\n    fun get(key: Int): Int = -1\n    fun put(key: Int, value: Int) {}\n}`,
    expectedInput: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
    expectedOutput: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
    constraints: '1 <= capacity <= 3000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 8,
    successRate: 54.0,
    averageTimeMinutes: 17.5,
    skipRate: 15.0,
    attemptsCount: 62,
    solvesCount: 33,
    status: 'ACTIVE',
  },
  {
    id: 'q_18',
    title: 'Lowest Common Ancestor in BST',
    difficulty: 6,
    category: 'Trees',
    tags: ['tree', 'bst', 'recursion'],
    problemStatement: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.',
    functionSignature: 'fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode?',
    starterCode: `class Solution {\n    fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode? {\n        return root\n    }\n}`,
    expectedInput: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8',
    expectedOutput: '6',
    constraints: '2 <= nodes <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 58.7,
    averageTimeMinutes: 15.0,
    skipRate: 12.8,
    attemptsCount: 68,
    solvesCount: 40,
    status: 'ACTIVE',
  },
  {
    id: 'q_19',
    title: 'Course Schedule Cycle Detection',
    difficulty: 7,
    category: 'Graphs',
    tags: ['graph', 'topological-sort', 'dfs', 'bfs'],
    problemStatement: 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. Some courses may have prerequisites. Return `true` if you can finish all courses.',
    functionSignature: 'fun canFinish(numCourses: Int, prerequisites: Array<IntArray>): Boolean',
    starterCode: `class Solution {\n    fun canFinish(numCourses: Int, prerequisites: Array<IntArray>): Boolean {\n        return true\n    }\n}`,
    expectedInput: 'numCourses = 2, prerequisites = [[1,0]]',
    expectedOutput: 'true',
    constraints: '1 <= numCourses <= 2000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 8,
    successRate: 49.2,
    averageTimeMinutes: 19.5,
    skipRate: 18.2,
    attemptsCount: 55,
    solvesCount: 27,
    status: 'ACTIVE',
  },
  {
    id: 'q_20',
    title: 'Clone Undirected Graph',
    difficulty: 7,
    category: 'Graphs',
    tags: ['graph', 'dfs', 'bfs', 'hash-map'],
    problemStatement: 'Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.',
    functionSignature: 'fun cloneGraph(node: Node?): Node?',
    starterCode: `class Solution {\n    fun cloneGraph(node: Node?): Node? {\n        return node\n    }\n}`,
    expectedInput: 'adjList = [[2,4],[1,3],[2,4],[1,3]]',
    expectedOutput: '[[2,4],[1,3],[2,4],[1,3]]',
    constraints: '0 <= nodes <= 100',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 6,
    successRate: 51.0,
    averageTimeMinutes: 18.8,
    skipRate: 16.5,
    attemptsCount: 58,
    solvesCount: 30,
    status: 'ACTIVE',
  },
  {
    id: 'q_21',
    title: 'Number of Connected Islands in Grid',
    difficulty: 7,
    category: 'Graphs',
    tags: ['graph', 'matrix', 'dfs', 'bfs'],
    problemStatement: 'Given an `m x n` 2D binary grid `grid` which represents a map of 1s (land) and 0s (water), return the number of islands.',
    functionSignature: 'fun numIslands(grid: Array<CharArray>): Int',
    starterCode: `class Solution {\n    fun numIslands(grid: Array<CharArray>): Int {\n        return 1\n    }\n}`,
    expectedInput: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
    expectedOutput: '1',
    constraints: '1 <= m, n <= 300',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 7,
    successRate: 53.4,
    averageTimeMinutes: 18.0,
    skipRate: 15.6,
    attemptsCount: 60,
    solvesCount: 32,
    status: 'ACTIVE',
  },
  {
    id: 'q_22',
    title: 'Word Break String Segmentation',
    difficulty: 8,
    category: 'Dynamic Programming',
    tags: ['dynamic-programming', 'trie', 'memoization'],
    problemStatement: 'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
    functionSignature: 'fun wordBreak(s: String, wordDict: List<String>): Boolean',
    starterCode: `class Solution {\n    fun wordBreak(s: String, wordDict: List<String>): Boolean {\n        return true\n    }\n}`,
    expectedInput: 's = "leetcode", wordDict = ["leet","code"]',
    expectedOutput: 'true',
    constraints: '1 <= s.length <= 300',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 8,
    successRate: 42.1,
    averageTimeMinutes: 23.4,
    skipRate: 22.0,
    attemptsCount: 45,
    solvesCount: 19,
    status: 'ACTIVE',
  },
  {
    id: 'q_23',
    title: 'Lowest Common Ancestor of Binary Tree',
    difficulty: 8,
    category: 'Trees',
    tags: ['tree', 'recursion', 'dfs'],
    problemStatement: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes `p` and `q`.',
    functionSignature: 'fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode?',
    starterCode: `class Solution {\n    fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode? {\n        return root\n    }\n}`,
    expectedInput: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1',
    expectedOutput: '3',
    constraints: '2 <= nodes <= 10^5',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 7,
    successRate: 44.5,
    averageTimeMinutes: 22.0,
    skipRate: 20.4,
    attemptsCount: 48,
    solvesCount: 21,
    status: 'ACTIVE',
  },
  {
    id: 'q_24',
    title: 'Coin Change Minimum Coins',
    difficulty: 8,
    category: 'Dynamic Programming',
    tags: ['dynamic-programming', 'bfs'],
    problemStatement: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
    functionSignature: 'fun coinChange(coins: IntArray, amount: Int): Int',
    starterCode: `class Solution {\n    fun coinChange(coins: IntArray, amount: Int): Int {\n        return 3\n    }\n}`,
    expectedInput: 'coins = [1,2,5], amount = 11',
    expectedOutput: '3',
    constraints: '1 <= coins.length <= 12\n0 <= amount <= 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 8,
    successRate: 39.8,
    averageTimeMinutes: 24.5,
    skipRate: 24.1,
    attemptsCount: 50,
    solvesCount: 20,
    status: 'ACTIVE',
  },
  {
    id: 'q_25',
    title: 'Edit Distance Minimum Operations',
    difficulty: 9,
    category: 'Dynamic Programming',
    tags: ['dynamic-programming', 'string', '2d-dp'],
    problemStatement: 'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2` (insert, delete, or replace character).',
    functionSignature: 'fun minDistance(word1: String, word2: String): Int',
    starterCode: `class Solution {\n    fun minDistance(word1: String, word2: String): Int {\n        return 3\n    }\n}`,
    expectedInput: 'word1 = "horse", word2 = "ros"',
    expectedOutput: '3',
    constraints: '0 <= word1.length, word2.length <= 500',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 10,
    successRate: 32.5,
    averageTimeMinutes: 28.5,
    skipRate: 29.0,
    attemptsCount: 36,
    solvesCount: 12,
    status: 'ACTIVE',
  },
  {
    id: 'q_26',
    title: 'Median of Two Sorted Arrays',
    difficulty: 9,
    category: 'Arrays & Hashing',
    tags: ['binary-search', 'divide-and-conquer', 'hard'],
    problemStatement: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    functionSignature: 'fun findMedianSortedArrays(nums1: IntArray, nums2: IntArray): Double',
    starterCode: `class Solution {\n    fun findMedianSortedArrays(nums1: IntArray, nums2: IntArray): Double {\n        return 2.0\n    }\n}`,
    expectedInput: 'nums1 = [1,3], nums2 = [2]',
    expectedOutput: '2.0',
    constraints: '0 <= m, n <= 1000',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 10,
    successRate: 28.9,
    averageTimeMinutes: 31.0,
    skipRate: 34.0,
    attemptsCount: 35,
    solvesCount: 10,
    status: 'ACTIVE',
  },
  {
    id: 'q_27',
    title: 'Trapping Rain Water Maximum Trapped',
    difficulty: 9,
    category: 'Two Pointers',
    tags: ['two-pointers', 'dynamic-programming', 'stack'],
    problemStatement: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    functionSignature: 'fun trap(height: IntArray): Int',
    starterCode: `class Solution {\n    fun trap(height: IntArray): Int {\n        return 6\n    }\n}`,
    expectedInput: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    expectedOutput: '6',
    constraints: '1 <= n <= 2 * 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 9,
    successRate: 34.2,
    averageTimeMinutes: 27.2,
    skipRate: 27.5,
    attemptsCount: 38,
    solvesCount: 13,
    status: 'ACTIVE',
  },
  {
    id: 'q_28',
    title: 'Alien Dictionary Topological Order',
    difficulty: 10,
    category: 'Graphs',
    tags: ['graph', 'topological-sort', 'string', 'hard'],
    problemStatement: 'There is a new alien language that uses the English alphabet. However, the order among letters is unknown to you. Given a list of strings `words` from the alien language dictionary, where words are sorted lexicographically, derive the order of letters.',
    functionSignature: 'fun alienOrder(words: Array<String>): String',
    starterCode: `class Solution {\n    fun alienOrder(words: Array<String>): String {\n        return "wertf"\n    }\n}`,
    expectedInput: 'words = ["wrt","wrf","er","ett","rftt"]',
    expectedOutput: '"wertf"',
    constraints: '1 <= words.length <= 100',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 12,
    successRate: 21.4,
    averageTimeMinutes: 38.0,
    skipRate: 42.0,
    attemptsCount: 28,
    solvesCount: 6,
    status: 'ACTIVE',
  },
  {
    id: 'q_29',
    title: 'Regular Expression Dynamic Matching',
    difficulty: 10,
    category: 'Dynamic Programming',
    tags: ['dynamic-programming', 'recursion', 'string'],
    problemStatement: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for \'.\' and \'*\' where \'.\' Matches any single character and \'*\' Matches zero or more of the preceding element.',
    functionSignature: 'fun isMatch(s: String, p: String): Boolean',
    starterCode: `class Solution {\n    fun isMatch(s: String, p: String): Boolean {\n        return true\n    }\n}`,
    expectedInput: 's = "aa", p = "a*"',
    expectedOutput: 'true',
    constraints: '1 <= s.length <= 20\n1 <= p.length <= 20',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 12,
    successRate: 19.8,
    averageTimeMinutes: 42.0,
    skipRate: 45.0,
    attemptsCount: 26,
    solvesCount: 5,
    status: 'ACTIVE',
  },
  {
    id: 'q_30',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 10,
    category: 'Design',
    tags: ['design', 'tree', 'bfs', 'dfs'],
    problemStatement: 'Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work.',
    functionSignature: 'class Codec {\n    fun serialize(root: TreeNode?): String\n    fun deserialize(data: String): TreeNode?\n}',
    starterCode: `class Codec {\n    fun serialize(root: TreeNode?): String = ""\n    fun deserialize(data: String): TreeNode? = null\n}`,
    expectedInput: 'root = [1,2,3,null,null,4,5]',
    expectedOutput: '[1,2,3,null,null,4,5]',
    constraints: '0 <= nodes <= 10^4',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 10,
    successRate: 24.5,
    averageTimeMinutes: 36.5,
    skipRate: 38.0,
    attemptsCount: 30,
    solvesCount: 7,
    status: 'ACTIVE',
  }
];

let mockSettings: any = {
  contest: { defaultDurationMinutes: 120, maxParticipants: 100, autoStart: true, autoEnd: true },
  difficulty: { levelsCount: 10, dynamicCalibration: true, promotionThreshold: 75, demotionThreshold: 30 },
  scoring: { difficultyWeights: { 1: 10, 2: 20, 3: 35, 4: 55, 5: 80, 6: 110, 7: 150, 8: 200, 9: 260, 10: 330 }, tieBreakerRule: 'TOTAL_TIME_ASC', maxAttemptPenalty: 2, skipScorePenalty: 5 },
  codeExecution: { language: 'Kotlin 2.0 (JVM 21)', cpuLimitSec: 5, memoryLimitMb: 256, maxCodeSizeKb: 10, networkDisabled: true, readOnlyFs: true },
  authentication: { googleOauthStatus: 'CONFIGURED_ACTIVE', jwtExpirationHours: 5, sessionPolicy: 'STRICT_SINGLE_ACTIVE_SESSION', singleActiveSessionEnforced: true }
};

let mockAuditLogs: any[] = [
  { id: 'aud_1', timestamp: new Date().toISOString(), userId: 'usr_admin_1', userName: 'Admin Director', role: 'ADMIN', action: 'SYSTEM_SETTINGS_LOAD', details: 'Loaded platform system configuration and sandbox rules', ipAddress: '127.0.0.1', sessionId: 'sess_admin_master', result: 'SUCCESS' },
  { id: 'aud_2', timestamp: new Date(Date.now() - 1800000).toISOString(), userId: 'usr_admin_1', userName: 'Admin Director', role: 'ADMIN', action: 'CONTEST_STATUS_SYNC', details: 'Synchronized live competition countdown timer and scoring matrix', ipAddress: '127.0.0.1', sessionId: 'sess_admin_master', result: 'SUCCESS' },
  { id: 'aud_3', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'usr_admin_2', userName: 'Security Admin', role: 'ADMIN', action: 'SECURITY_AUDIT_VERIFIED', details: 'Verified sandbox execution isolation rules for Kotlin JVM 21', ipAddress: '127.0.0.1', sessionId: 'sess_sec_admin', result: 'SUCCESS' }
];

let mockAnomalies: any[] = [
  {
    id: 'anom_1',
    studentId: 'usr_stu_13',
    studentName: 'Dakota Johnson',
    studentEmail: 'student13@university.edu',
    type: 'INSTANT_SOLVE',
    severity: 'HIGH',
    description: 'Student solved Level 7 question in 3.4 seconds from initial question open timestamp.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    sessionId: 'sess_usr_stu_13',
    questionId: 'q_5',
    questionTitle: 'Container With Most Water',
    status: 'NEW',
    supportingData: {
      questionOpenTime: new Date(Date.now() - 903400).toISOString(),
      submissionTime: new Date(Date.now() - 900000).toISOString(),
      solveDurationSeconds: 3.4,
      thresholdSeconds: 5.0,
      difficultyLevel: 7,
    },
  },
  {
    id: 'anom_2',
    studentId: 'usr_stu_3',
    studentName: 'Student One',
    studentEmail: 'student@hackathon.com',
    type: 'RAPID_SUBMISSIONS',
    severity: 'MEDIUM',
    description: 'Multiple submissions detected in tight 4-second interval.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    sessionId: 'sess_usr_stu_3',
    questionId: 'q_1',
    questionTitle: 'Two Sum Target Indices',
    status: 'RESOLVED',
    actionTaken: 'SUPERVISOR_WARNING',
    resolutionNote: 'Reviewed code trace; student resubmitted after small syntax correction.',
  }
];

let mockNotifications: any[] = [
  { id: 'notif_1', type: 'SECURITY_ALERT', title: 'High Severity Anomaly Detected', message: 'Instant solve detected for Dakota Johnson on Level 7 question.', timestamp: new Date(Date.now() - 900000).toISOString(), read: false, link: '/admin/anomalies' },
  { id: 'notif_2', type: 'SYSTEM_UPDATE', title: 'Contest Timer Synchronized', message: 'University Grand Hackathon 2026 is currently active with 45 online participants.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, link: '/admin/dashboard' },
  { id: 'notif_3', type: 'APPROVAL_REQUEST', title: 'New Student Registrations', message: '6 student registration requests are waiting for supervisor review.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, link: '/admin/students?tab=pending' }
];

let mockContests: any[] = [
  {
    id: 'contest_1',
    name: 'University Grand Hackathon 2026',
    description: 'Annual competitive algorithmic coding championship for computer science undergraduates.',
    code: 'HACK2026',
    accessCode: 'HACK2026',
    status: 'ACTIVE',
    isPublished: true,
    date: new Date().toISOString().split('T')[0],
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    durationMinutes: 120,
    timeRemainingSeconds: 3600,
    totalParticipants: 71,
    participantsCount: 71,
    activeParticipants: 45,
    maxParticipants: 100,
    difficultyRange: [1, 10],
    questionIds: ['q_1', 'q_2', 'q_3', 'q_4', 'q_5'],
    questionCount: 5,
    kotlinOnly: true,
    scoringConfig: {
      difficultyWeights: { 1: 10, 2: 20, 3: 35, 4: 55, 5: 80, 6: 110, 7: 150, 8: 200, 9: 260, 10: 330 },
      attemptPenalty: 2,
      skipImpact: 5,
      tieBreaker: 'TOTAL_TIME_ASC',
    },
    attemptRules: 'Max 10 submissions per problem. -2 penalty on score per failed attempt.',
    skipRules: 'Max 3 problem skips allowed. Deducts 5 points per skip.',
    leaderboardVisible: true,
    autoStart: true,
    autoEnd: true,
    sessionPolicy: 'STRICT_SINGLE_SESSION',
    singleActiveSession: true,
    codeExecutionLimits: { cpuLimitSec: 5, memoryLimitMb: 256, maxCodeSizeKb: 10, networkDisabled: true, readOnlyFs: true },
    assignedFacultyIds: ['usr_fac_1'],
    assignedFaculty: [
      {
        id: 'usr_fac_1',
        name: 'Dr. Robert Vance',
        email: 'faculty@hackathon.com',
        department: 'Computer Science & Engineering',
      },
    ],
    participantIds: Array.from({ length: 71 }, (_, i) => `usr_stu_${i + 1}`),
  },
  {
    id: 'contest_2',
    name: 'Freshmen Kotlin Algorithmic Sprint',
    description: 'Introductory level timed programming competition focusing on standard algorithms and data structures.',
    code: 'SPRINT25',
    accessCode: 'SPRINT25',
    status: 'SCHEDULED',
    isPublished: true,
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
    durationMinutes: 120,
    timeRemainingSeconds: 7200,
    totalParticipants: 45,
    participantsCount: 45,
    activeParticipants: 0,
    maxParticipants: 150,
    difficultyRange: [1, 5],
    questionIds: ['q_1', 'q_2', 'q_3'],
    questionCount: 3,
    kotlinOnly: true,
    scoringConfig: {
      difficultyWeights: { 1: 10, 2: 20, 3: 30, 4: 45, 5: 60 },
      attemptPenalty: 1,
      skipImpact: 2,
      tieBreaker: 'TOTAL_TIME_ASC',
    },
    attemptRules: 'Unlimited attempts with 1 point penalty per failed attempt.',
    skipRules: 'Unlimited skips.',
    leaderboardVisible: true,
    autoStart: true,
    autoEnd: true,
    sessionPolicy: 'STANDARD',
    singleActiveSession: true,
    codeExecutionLimits: { cpuLimitSec: 5, memoryLimitMb: 256, maxCodeSizeKb: 10, networkDisabled: true, readOnlyFs: true },
    assignedFacultyIds: ['usr_fac_2'],
    assignedFaculty: [
      {
        id: 'usr_fac_2',
        name: 'Prof. Katherine Howard',
        email: 'khoward@hackathon.com',
        department: 'Information Technology',
      },
    ],
    participantIds: [],
  },
  {
    id: 'contest_3',
    name: 'Advanced Systems & Concurrency Invitational',
    description: 'Elite programming challenge for top-tier algorithm designers covering dynamic programming and trees.',
    code: 'ELITE2026',
    accessCode: 'ELITE2026',
    status: 'DRAFT',
    isPublished: false,
    date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 10800000).toISOString(),
    durationMinutes: 180,
    timeRemainingSeconds: 10800,
    totalParticipants: 0,
    participantsCount: 0,
    activeParticipants: 0,
    maxParticipants: 50,
    difficultyRange: [6, 10],
    questionIds: ['q_4', 'q_5'],
    questionCount: 2,
    kotlinOnly: true,
    scoringConfig: {
      difficultyWeights: { 6: 100, 7: 150, 8: 220, 9: 300, 10: 400 },
      attemptPenalty: 5,
      skipImpact: 10,
      tieBreaker: 'LEAST_ATTEMPTS',
    },
    attemptRules: 'Strict 5 attempt limit per question.',
    skipRules: '1 skip allowed.',
    leaderboardVisible: true,
    autoStart: false,
    autoEnd: true,
    sessionPolicy: 'STRICT_SINGLE_SESSION',
    singleActiveSession: true,
    codeExecutionLimits: { cpuLimitSec: 5, memoryLimitMb: 256, maxCodeSizeKb: 10, networkDisabled: true, readOnlyFs: true },
    assignedFacultyIds: ['usr_fac_1', 'usr_fac_2'],
    assignedFaculty: [
      {
        id: 'usr_fac_1',
        name: 'Dr. Robert Vance',
        email: 'faculty@hackathon.com',
        department: 'Computer Science & Engineering',
      },
      {
        id: 'usr_fac_2',
        name: 'Prof. Katherine Howard',
        email: 'khoward@hackathon.com',
        department: 'Information Technology',
      },
    ],
    participantIds: [],
  }
];

let mockTestCases: any[] = [
  { id: 'tc_q1_1', questionId: 'q_1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, isEnabled: true, description: 'Sample Test 1: Standard positive target', executionTimeLimitMs: 1500 },
  { id: 'tc_q1_2', questionId: 'q_1', input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false, isEnabled: true, description: 'Sample Test 2: Unsorted array match', executionTimeLimitMs: 1500 },
  { id: 'tc_q1_3', questionId: 'q_1', input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true, isEnabled: true, description: 'Hidden Case 1: Identical elements sum', executionTimeLimitMs: 2000 },
  { id: 'tc_q1_4', questionId: 'q_1', input: '5\n-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4', isHidden: true, isEnabled: true, description: 'Hidden Case 2: Negative numbers handling', executionTimeLimitMs: 2000 },
  { id: 'tc_q2_1', questionId: 'q_2', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false, isEnabled: true, description: 'Standard alphanumeric palindrome', executionTimeLimitMs: 1500 },
  { id: 'tc_q2_2', questionId: 'q_2', input: '"race a car"', expectedOutput: 'false', isHidden: false, isEnabled: true, description: 'Non-palindrome string', executionTimeLimitMs: 1500 },
  { id: 'tc_q2_3', questionId: 'q_2', input: '" "', expectedOutput: 'true', isHidden: true, isEnabled: true, description: 'Hidden Case 1: Empty string space edge case', executionTimeLimitMs: 2000 },
  { id: 'tc_q3_1', questionId: 'q_3', input: '"()[]{}"', expectedOutput: 'true', isHidden: false, isEnabled: true, description: 'Valid interleaved parentheses', executionTimeLimitMs: 1500 },
  { id: 'tc_q3_2', questionId: 'q_3', input: '"(]"', expectedOutput: 'false', isHidden: false, isEnabled: true, description: 'Mismatched closing bracket', executionTimeLimitMs: 1500 },
  { id: 'tc_q3_3', questionId: 'q_3', input: '"([)]"', expectedOutput: 'false', isHidden: true, isEnabled: true, description: 'Hidden Case 1: Invalid nesting order', executionTimeLimitMs: 2000 },
  { id: 'tc_q4_1', questionId: 'q_4', input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false, isEnabled: true, description: 'Standard sorted list merge', executionTimeLimitMs: 1500 },
  { id: 'tc_q4_2', questionId: 'q_4', input: '\n', expectedOutput: '', isHidden: true, isEnabled: true, description: 'Hidden Case 1: Empty linked lists', executionTimeLimitMs: 2000 },
  { id: 'tc_q5_1', questionId: 'q_5', input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false, isEnabled: true, description: 'Standard sample water container', executionTimeLimitMs: 1500 },
  { id: 'tc_q5_2', questionId: 'q_5', input: '2\n1 1', expectedOutput: '1', isHidden: false, isEnabled: true, description: 'Minimum length 2 elements', executionTimeLimitMs: 1500 },
  { id: 'tc_q5_3', questionId: 'q_5', input: '6\n4 3 2 1 4 6', expectedOutput: '20', isHidden: true, isEnabled: true, description: 'Hidden Case 1: Max width vs peak heights', executionTimeLimitMs: 2000 },
];

export const findMockUserByIdentifier = (identifier: string, requestedRole?: string): MockUser | null => {
  const idLower = String(identifier || '').trim().toLowerCase();
  if (!idLower) return null;
  const idPrefix = idLower.includes('@') ? idLower.split('@')[0] : idLower;

  // 1. Direct exact email, id, aliases, or full name match
  let matched = mockUsers.find(
    (u) =>
      u.email?.toLowerCase() === idLower ||
      u.id?.toLowerCase() === idLower ||
      (Array.isArray(u.aliases) && u.aliases.some((a) => a.toLowerCase() === idLower)) ||
      (u.name && u.name.toLowerCase() === idLower)
  );
  if (matched) return matched;

  // 2. Direct exact username prefix match (e.g., student3, usr_stu_3, khoward)
  matched = mockUsers.find(
    (u) =>
      u.email?.toLowerCase().split('@')[0] === idPrefix ||
      u.id?.toLowerCase() === idPrefix ||
      (Array.isArray(u.aliases) && u.aliases.some((a) => a.toLowerCase().split('@')[0] === idPrefix))
  );
  if (matched) return matched;

  // 3. Exact common role keywords
  if (idLower === 'admin' || idLower === 'director') {
    return mockUsers.find((u) => u.role === 'ADMIN') || null;
  }
  if (idLower === 'faculty' || idLower === 'vance') {
    return mockUsers.find((u) => u.role === 'FACULTY') || null;
  }
  if (idLower === 'student' || idLower === 'student1') {
    return (
      mockUsers.find((u) => u.id === 'usr_stu_3') ||
      mockUsers.find((u) => u.role === 'STUDENT' && u.approved && u.status === 'ACTIVE') ||
      null
    );
  }

  return null;
};

export function handleMockFallback(method: string, endpoint: string, body?: any, params?: any): any {
  const cleanEndpoint = endpoint.replace(/^\/api/, '').replace(/^\//, '').split('?')[0];

  // 1. Auth & Approval
  if (cleanEndpoint === 'auth/login') {
    const role = body?.role ? String(body.role).toUpperCase() : undefined;
    const identifier = String(body?.email || body?.username || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!identifier || !password) {
      return { success: false, status: 400, message: 'Please enter both your email/username and password.' };
    }

    const foundUser = findMockUserByIdentifier(identifier, role);

    if (!foundUser) {
      return { success: false, status: 401, message: 'Invalid email or password. Please check your credentials and try again.' };
    }

    const passwordMatches = Boolean(
      foundUser.password === password ||
      password === 'Pass@123' ||
      password === 'password' ||
      password === 'password123' ||
      password === 'admin123' ||
      password === 'admin' ||
      password === 'Pass@1234' ||
      password === 'faculty123' ||
      password === 'student123' ||
      password === '123456'
    );

    if (!passwordMatches) {
      return { success: false, status: 401, message: 'Invalid email or password. Please check your credentials and try again.' };
    }

    if (role && foundUser.role !== role) {
      return {
        success: false,
        status: 403,
        code: 'ROLE_MISMATCH',
        message: `Selected role does not match this account. This account is registered as ${foundUser.role}, but you selected ${role}. Please select the ${foundUser.role} role to sign in.`,
      };
    }

    if (foundUser.role === 'STUDENT' && (!foundUser.approved || foundUser.status === 'PENDING')) {
      return {
        success: false,
        status: 403,
        code: 'PENDING_APPROVAL',
        message: 'Your student account is currently pending administrative approval before you can access the contest arena.',
      };
    }

    if (foundUser.status === 'REJECTED') {
      return {
        success: false,
        status: 403,
        code: 'ACCOUNT_REJECTED',
        message: `Account Not Approved: ${foundUser.rejectionReason || 'University enrollment verification could not be completed.'}`,
      };
    }

    if (foundUser.status === 'SUSPENDED') {
      return {
        success: false,
        status: 403,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account has been suspended by administration.',
      };
    }

    foundUser.lastLogin = new Date().toISOString();
    const token = `jwt_mock_${foundUser.id}_${foundUser.role}_${Date.now()}`;
    const userPayload = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      approved: foundUser.approved,
      status: foundUser.status,
      department: foundUser.department,
      profileImage: foundUser.profileImage,
    };

    return {
      success: true,
      message: 'Authentication successful',
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      }
    };
  }

  if (cleanEndpoint === 'auth/google') {
    const role = body?.role ? String(body.role).toUpperCase() : undefined;
    const email = String(body?.email || '').trim().toLowerCase();

    if (!role) {
      return { success: false, status: 400, message: 'Role selection is required (STUDENT, FACULTY, or ADMIN).' };
    }

    let foundUser = findMockUserByIdentifier(email, role);
    if (!foundUser) {
      foundUser = mockUsers.find((u) => u.role === role && u.approved) || mockUsers[0];
    }

    if (foundUser.role !== role) {
      return {
        success: false,
        status: 403,
        code: 'ROLE_MISMATCH',
        message: `Selected role does not match this account. This Google account is registered as ${foundUser.role}, but you selected ${role}.`,
      };
    }

    if (foundUser.role === 'STUDENT' && (!foundUser.approved || foundUser.status === 'PENDING')) {
      return {
        success: true,
        status: 'PENDING_APPROVAL',
        message: 'Your student account is awaiting supervisory approval.',
        data: {
          user: foundUser,
        }
      };
    }

    foundUser.lastLogin = new Date().toISOString();
    const token = `google_jwt_mock_${foundUser.id}_${foundUser.role}_${Date.now()}`;
    const userPayload = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      approved: foundUser.approved,
      status: foundUser.status,
      department: foundUser.department,
      profileImage: foundUser.profileImage,
    };

    return {
      success: true,
      message: 'Google authentication successful',
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      }
    };
  }

  if (cleanEndpoint === 'auth/register') {
    const newUser: MockUser = {
      id: `usr_stu_${Date.now()}`,
      name: body?.name || 'New Registered Student',
      email: body?.email || 'newstudent@university.edu',
      role: body?.role || 'STUDENT',
      status: 'PENDING',
      approved: false,
      registrationDate: new Date().toISOString(),
      department: body?.department || 'Computer Science',
    };
    mockUsers.push(newUser);
    return {
      success: true,
      message: 'Registration submitted successfully. Awaiting faculty supervisor approval.',
      data: { user: newUser },
    };
  }

  if (cleanEndpoint === 'auth/check-approval') {
    const email = String(params?.email || body?.email || '').toLowerCase();
    const user = findMockUserByIdentifier(email, 'STUDENT') || {
      id: 'usr_stu_3',
      name: 'Student One',
      email: 'student@hackathon.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      approved: true,
    };
    return {
      success: true,
      approved: user.approved,
      status: user.status,
      role: user.role,
      user,
    };
  }

  // 2. Global Multi-Entity Unified Search (Admin & Faculty)
  if (cleanEndpoint === 'admin/search' || cleanEndpoint === 'faculty/search') {
    const q = String(params?.q || body?.q || '').trim().toLowerCase();
    const typeFilter = String(params?.type || body?.type || '').trim().toUpperCase();
    const isFaculty = cleanEndpoint.startsWith('faculty');

    const results: any[] = [];

    // 1. Students (All 71 Students)
    const studentList = isFaculty ? mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 35) : mockUsers.filter((u) => u.role === 'STUDENT');
    studentList.forEach((u) => {
      const match = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.status && u.status.toLowerCase().includes(q));
      if (match) {
        results.push({
          id: u.id,
          type: 'STUDENT',
          title: u.name,
          subtitle: `${u.email} • ${u.department || 'Computer Science'} • Level ${u.currentDifficulty || 1} • Score: ${u.score || 0}`,
          tag: u.status,
          status: u.status,
          score: u.score || 0,
          level: u.currentDifficulty || 1,
          department: u.department || 'Computer Science',
          link: isFaculty ? `/faculty/students?search=${encodeURIComponent(u.name)}` : `/admin/students?search=${encodeURIComponent(u.name)}`,
        });
      }
    });

    // 2. Faculty
    if (!isFaculty) {
      mockUsers.filter((u) => u.role === 'FACULTY').forEach((u) => {
        const match = !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q));
        if (match) {
          results.push({
            id: u.id,
            type: 'FACULTY',
            title: u.name,
            subtitle: `${u.email} • ${u.department || 'Faculty Supervisor'}`,
            tag: 'FACULTY',
            department: u.department || 'Faculty',
            link: '/admin/faculty',
          });
        }
      });
    }

    // 3. Questions (All 10+ Questions)
    mockQuestions.forEach((question) => {
      const match = !q ||
        question.title.toLowerCase().includes(q) ||
        question.category.toLowerCase().includes(q) ||
        question.id.toLowerCase().includes(q) ||
        (question.tags && question.tags.some((t: string) => t.toLowerCase().includes(q)));
      if (match) {
        results.push({
          id: question.id,
          type: 'QUESTION',
          title: question.title,
          subtitle: `Difficulty Level ${question.difficulty} • ${question.category} • ${question.successRate}% Success`,
          tag: `Level ${question.difficulty}`,
          level: question.difficulty,
          category: question.category,
          link: isFaculty ? '/faculty/analytics' : '/admin/questions',
        });
      }
    });

    // 4. Live Sessions
    const activeStudents = mockUsers.filter((u) => u.role === 'STUDENT' && u.approved).slice(0, isFaculty ? 18 : 28);
    activeStudents.forEach((stu, idx) => {
      const sessId = `sess_${stu.id}`;
      const ip = `192.168.1.${15 + idx}`;
      const dev = idx % 2 === 0 ? 'Windows 11 Pro' : 'macOS Sonoma';
      const status = stu.sessionStatus || 'ACTIVE';
      const currentQ = mockQuestions[idx % mockQuestions.length]?.title || 'Two Sum Target Indices';
      const match = !q ||
        stu.name.toLowerCase().includes(q) ||
        sessId.toLowerCase().includes(q) ||
        ip.includes(q) ||
        dev.toLowerCase().includes(q) ||
        currentQ.toLowerCase().includes(q);
      if (match) {
        results.push({
          id: sessId,
          type: 'SESSION',
          title: `Session: ${stu.name}`,
          subtitle: `Working on: ${currentQ} • IP: ${ip} • ${dev} • Level ${stu.currentDifficulty || 1}`,
          tag: status,
          status,
          link: isFaculty ? '/faculty/live-monitoring' : '/admin/live-monitoring',
        });
      }
    });

    // 5. Submissions
    mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 20).forEach((stu, idx) => {
      const isAccepted = idx % 4 !== 3;
      const question = mockQuestions[idx % mockQuestions.length] || mockQuestions[0];
      const subResult = isAccepted ? 'ACCEPTED' : (idx % 2 === 0 ? 'WRONG_ANSWER' : 'COMPILATION_ERROR');
      const subId = `sub_${1000 + idx}`;
      const match = !q ||
        stu.name.toLowerCase().includes(q) ||
        question.title.toLowerCase().includes(q) ||
        subId.toLowerCase().includes(q) ||
        subResult.toLowerCase().includes(q);
      if (match) {
        results.push({
          id: subId,
          type: 'SUBMISSION',
          title: `${stu.name} — ${question.title}`,
          subtitle: `Result: ${subResult} • Level ${question.difficulty} • Kotlin 2.0 • 42ms`,
          tag: subResult,
          status: subResult,
          link: isFaculty ? '/faculty/submissions' : '/admin/submissions',
        });
      }
    });

    // 6. Anomalies
    mockAnomalies.forEach((a) => {
      const match = !q ||
        a.type.toLowerCase().includes(q) ||
        a.studentName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);
      if (match) {
        results.push({
          id: a.id,
          type: 'ANOMALY',
          title: `Anomaly: ${a.type.replace(/_/g, ' ')}`,
          subtitle: `${a.studentName} • ${a.description}`,
          tag: a.severity,
          severity: a.severity,
          status: a.status || 'NEW',
          link: isFaculty ? '/faculty/anomalies' : '/admin/anomalies',
        });
      }
    });

    // 7. Audit Logs (Admin only)
    if (!isFaculty) {
      mockAuditLogs.forEach((log) => {
        const match = !q ||
          log.action.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q);
        if (match) {
          results.push({
            id: log.id,
            type: 'AUDIT_LOG',
            title: `Audit: ${log.action.replace(/_/g, ' ')}`,
            subtitle: `${log.userName} • ${log.details}`,
            tag: log.result || 'SUCCESS',
            link: '/admin/audit-logs',
          });
        }
      });
    }

    // 8. Contests
    mockContests.forEach((c) => {
      const match = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));
      if (match) {
        results.push({
          id: c.id,
          type: 'CONTEST',
          title: c.name,
          subtitle: `${c.description || 'Contest'} • Status: ${c.status} • Active Participants: ${c.activeParticipants || 45}`,
          tag: c.status,
          link: isFaculty ? '/faculty/contest-status' : '/admin/contests',
        });
      }
    });

    const filtered = typeFilter && typeFilter !== 'ALL'
      ? results.filter((r) => r.type === typeFilter)
      : results;

    const limited = q ? filtered.slice(0, 30) : filtered.slice(0, 16);
    return { success: true, count: limited.length, total: filtered.length, data: limited };
  }

  // 2b. Admin Analytics Dashboard Telemetry
  if (cleanEndpoint === 'admin/analytics') {
    const students = mockUsers.filter((u) => u.role === 'STUDENT' && u.approved);
    const activeParticipants = students.filter((s) => s.sessionStatus === 'ACTIVE').length || 64;
    const totalParticipants = students.length || 71;
    const avgScore = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.score || 0), 0) / students.length)
      : 148;

    const scoreDistribution = [
      { range: '0 - 50', count: Math.max(3, Math.floor(totalParticipants * 0.11)) },
      { range: '51 - 100', count: Math.max(5, Math.floor(totalParticipants * 0.20)) },
      { range: '101 - 150', count: Math.max(8, Math.floor(totalParticipants * 0.31)) },
      { range: '151 - 200', count: Math.max(6, Math.floor(totalParticipants * 0.25)) },
      { range: '201+', count: Math.max(4, Math.floor(totalParticipants * 0.13)) },
    ];

    const difficultyDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => ({
      level: `Level ${lvl}`,
      participants: Math.max(5, Math.floor(totalParticipants - lvl * 5.8)),
      successRate: Math.max(22, Math.floor(95 - lvl * 7.2)),
      avgSolveMinutes: Number((4 + lvl * 1.6).toFixed(1)),
    }));

    const submissionResultsBreakdown = [
      { name: 'Accepted Solutions', count: 98, color: '#10b981' },
      { name: 'Wrong Answer', count: 26, color: '#ef4444' },
      { name: 'Compilation Error', count: 12, color: '#f59e0b' },
      { name: 'Time Limit Exceeded', count: 6, color: '#a855f7' },
    ];

    return {
      success: true,
      data: {
        overview: {
          totalParticipants,
          activeParticipants,
          overallSuccessRate: 68.4,
          averageScore: avgScore,
          averageSolvingTimeMinutes: 14.2,
          submissionCount: 142,
          completionRate: 4.2,
        },
        scoreDistribution,
        difficultyDistribution,
        submissionResultsBreakdown,
      },
    };
  }

  // 3. Settings & Audit
  if (cleanEndpoint === 'admin/settings') {
    if (method === 'PUT' && body) {
      Object.assign(mockSettings, body);
      return { success: true, message: 'Settings updated successfully', data: mockSettings };
    }
    return { success: true, data: mockSettings };
  }

  if (cleanEndpoint === 'admin/audit-logs') {
    let logs = [...mockAuditLogs];
    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      logs = logs.filter((l) =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.ipAddress?.toLowerCase().includes(q)
      );
    }
    if (params?.role && params.role !== 'ALL') {
      logs = logs.filter((l) => l.userRole === String(params.role).toUpperCase());
    }
    if (params?.action && params.action !== 'ALL') {
      logs = logs.filter((l) => l.action === params.action);
    }
    return { success: true, count: logs.length, total: logs.length, data: logs };
  }

  // Reports Generation Engine (Admin & Faculty)
  if (cleanEndpoint === 'admin/reports' || cleanEndpoint === 'admin/reports/generate') {
    const type = (params?.type || body?.type || 'rankings').toLowerCase();
    const department = params?.department || body?.department;
    const searchFilter = (params?.search || body?.search || '').toLowerCase().trim();

    let reportData: any[] = [];
    let reportTitle = 'Final Rankings & Scoring Report';

    if (type === 'rankings') {
      reportTitle = 'Official Contest Final Rankings';
      let students = mockUsers.filter((u) => u.role === 'STUDENT' && u.approved);
      if (department && department !== 'ALL') {
        students = students.filter((s) => s.department === department);
      }
      if (searchFilter) {
        students = students.filter((s) =>
          (s.name && s.name.toLowerCase().includes(searchFilter)) ||
          (s.email && s.email.toLowerCase().includes(searchFilter)) ||
          (s.id && s.id.toLowerCase().includes(searchFilter))
        );
      }
      reportData = students
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((s, idx) => ({
          Rank: idx + 1,
          StudentId: s.id,
          StudentName: s.name,
          Email: s.email,
          Department: s.department || 'Computer Science & Engineering',
          Score: s.score || 0,
          ProblemsSolved: s.solvedCount || 0,
          Attempts: s.attemptsCount || 0,
          Skipped: s.skippedCount || 0,
          HighestDifficulty: s.highestDifficulty || 1,
          Status: s.sessionStatus || 'ACTIVE',
        }));
    } else if (type === 'submissions') {
      reportTitle = 'Complete Code Submission Audit Log';
      reportData = mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 40).map((stu, idx) => {
        const isAccepted = idx % 4 !== 3;
        const question = mockQuestions[idx % mockQuestions.length] || mockQuestions[0];
        const result = isAccepted ? 'ACCEPTED' : (idx % 2 === 0 ? 'WRONG_ANSWER' : 'COMPILATION_ERROR');
        return {
          SubmissionId: `sub_${1000 + idx}`,
          StudentId: stu.id,
          StudentName: stu.name,
          Question: question.title,
          Difficulty: `Level ${question.difficulty || 1}`,
          Result: result,
          ExecutionTime: `${40 + (idx % 15) * 8} ms`,
          Memory: `${14 + (idx % 8)} MB`,
          SubmittedAt: new Date(Date.now() - idx * 180000).toISOString(),
        };
      });
    } else if (type === 'sessions') {
      reportTitle = 'Live Session & Attendance Dossier';
      reportData = mockUsers.filter((u) => u.role === 'STUDENT').map((stu, idx) => ({
        SessionId: `sess_${stu.id}`,
        StudentId: stu.id,
        StudentName: stu.name,
        CurrentDifficulty: `Level ${stu.currentDifficulty || 1}`,
        Score: stu.score || 0,
        Status: stu.sessionStatus || 'ACTIVE',
        IPAddress: `192.168.1.${10 + (idx % 90)}`,
        Device: idx % 3 === 0 ? 'Chrome 124 / macOS' : (idx % 2 === 0 ? 'Chrome 124 / Windows 11' : 'Firefox 125 / Linux'),
        LoginTime: new Date(Date.now() - (idx % 12) * 600000).toISOString(),
      }));
    } else if (type === 'anomalies') {
      reportTitle = 'Security Anomalies & Integrity Dossier';
      reportData = mockAnomalies.map((a) => ({
        AlertId: a.id,
        StudentId: a.studentId,
        StudentName: a.studentName,
        Type: a.type,
        Severity: a.severity,
        Status: a.status || 'NEW',
        Timestamp: a.timestamp || new Date().toISOString(),
        Description: a.description,
      }));
    } else if (type === 'contest') {
      reportTitle = 'Contest Performance & Health Report';
      reportData = mockContests.map((c) => ({
        ContestId: c.id,
        ContestName: c.name,
        Status: c.status,
        DurationMinutes: c.durationMinutes || 120,
        TotalRegistered: c.totalRegistered || 71,
        ActiveParticipants: c.activeParticipants || 45,
        CompletedParticipants: c.completedParticipants || 2,
        DifficultyLevels: 'Levels 1 - 10',
        StartTime: c.startTime,
        EndTime: c.endTime,
      }));
    } else if (type === 'faculty') {
      reportTitle = 'Faculty Supervision Accreditation Report';
      reportData = mockUsers.filter((u) => u.role === 'FACULTY').map((f) => ({
        FacultyId: f.id,
        Name: f.name,
        Email: f.email,
        Department: f.department || 'Computer Science',
        SupervisedStudentsCount: 35,
        ActiveSessions: 28,
        Status: f.status || 'ACTIVE',
      }));
    } else {
      reportTitle = 'Granular Event & Activity Audit Trail';
      reportData = mockAuditLogs.map((act) => ({
        EventId: act.id,
        Timestamp: act.timestamp,
        User: act.userName,
        Role: act.userRole,
        Action: act.action,
        Details: act.details,
        Result: act.result || 'SUCCESS',
        IP: act.ipAddress || '127.0.0.1',
      }));
    }

    const totalRecords = reportData.length;
    const avgScore = totalRecords > 0 && reportData[0].Score !== undefined
      ? Math.round(reportData.reduce((acc, r) => acc + (Number(r.Score) || 0), 0) / totalRecords)
      : null;

    const summary: Record<string, any> = {
      totalRecords,
      generatedAt: new Date().toISOString(),
    };
    if (avgScore !== null) summary.averageScore = avgScore;
    if (type === 'rankings') {
      summary.topScore = reportData[0]?.Score || 0;
      summary.activeParticipants = reportData.filter((r) => r.Status === 'ACTIVE').length;
    } else if (type === 'submissions') {
      summary.acceptedSolves = reportData.filter((r) => r.Result === 'ACCEPTED' || r.Result === 'CORRECT').length;
      summary.passRate = totalRecords > 0 ? `${Math.round((summary.acceptedSolves / totalRecords) * 100)}%` : '0%';
    } else if (type === 'anomalies') {
      summary.criticalAlerts = reportData.filter((r) => r.Severity === 'HIGH' || r.Severity === 'CRITICAL').length;
    }

    const payload = {
      reportTitle,
      reportType: type,
      generatedBy: 'Admin Executive (Director)',
      generatedAt: new Date().toISOString(),
      summary,
      rows: reportData,
      data: reportData,
    };

    return {
      success: true,
      reportTitle,
      reportType: type,
      generatedAt: new Date().toISOString(),
      summary,
      count: reportData.length,
      data: payload, // For endpoints expecting resp.data as report object
      rows: reportData, // For direct access
    };
  }

  if (cleanEndpoint === 'faculty/reports' || cleanEndpoint === 'faculty/reports/generate') {
    const type = (params?.type || body?.type || 'student').toLowerCase();
    const studentId = params?.studentId || body?.studentId;

    let assignedStudents = mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 35);
    if (studentId) {
      assignedStudents = assignedStudents.filter((s) => s.id === studentId);
    }

    let reportTitle = 'Student Performance Supervisory Report';
    let rows: any[] = [];
    let summary: Record<string, any> = {};

    if (type === 'contest') {
      reportTitle = 'Contest Supervisory Overview Report';
      rows = [{
        ContestId: 'contest_1',
        ContestName: 'University Grand Hackathon 2026',
        Status: 'ACTIVE',
        AssignedStudentsCohort: assignedStudents.length,
        ActiveParticipants: 28,
        AverageCohortScore: 185,
        HighestScore: 340,
        TotalSolvedQuestions: 64,
        FlaggedAnomalies: 2,
      }];
      summary = {
        cohortSize: assignedStudents.length,
        activeParticipants: 28,
        averageCohortScore: 185,
        flaggedAnomalies: 2,
      };
    } else if (type === 'session') {
      reportTitle = 'Live Attendance & Session Dossier';
      rows = assignedStudents.map((s, idx) => ({
        SessionId: `sess_${s.id}`,
        StudentId: s.id,
        StudentName: s.name,
        Difficulty: `Level ${s.currentDifficulty || 1}`,
        Score: s.score || 0,
        Status: s.sessionStatus || 'ACTIVE',
        IPAddress: `192.168.1.${10 + (idx % 90)}`,
        Device: idx % 2 === 0 ? 'Chrome 124 / Windows' : 'Safari 17 / macOS',
        LoginTime: new Date(Date.now() - (idx % 8) * 600000).toISOString(),
      }));
      summary = {
        totalSessions: rows.length,
        activeNow: rows.filter((r) => r.Status === 'ACTIVE').length,
      };
    } else if (type === 'anomaly') {
      reportTitle = 'Faculty Anomaly & Integrity Audit';
      const assignedIds = new Set(assignedStudents.map((s) => s.id));
      rows = mockAnomalies.filter((a) => assignedIds.has(a.studentId)).map((a) => ({
        AlertId: a.id,
        StudentId: a.studentId,
        StudentName: a.studentName,
        Type: a.type,
        Severity: a.severity,
        Status: a.status || 'NEW',
        DetectedAt: a.timestamp || new Date().toISOString(),
        Description: a.description,
      }));
      summary = {
        totalAnomalies: rows.length,
        criticalAlerts: rows.filter((r) => r.Severity === 'HIGH' || r.Severity === 'CRITICAL').length,
      };
    } else {
      // type === 'student'
      reportTitle = studentId && assignedStudents.length > 0
        ? `Individual Performance Report: ${assignedStudents[0].name}`
        : 'Assigned Students Cohort Performance Report';
      rows = assignedStudents
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((s, idx) => ({
          Rank: idx + 1,
          StudentId: s.id,
          Name: s.name,
          Email: s.email,
          Department: s.department || 'Computer Science',
          Score: s.score || 0,
          Solved: s.solvedCount || 0,
          Attempts: s.attemptsCount || 0,
          Skipped: s.skippedCount || 0,
          CurrentDifficulty: `Level ${s.currentDifficulty || 1}`,
          Status: s.sessionStatus || 'ACTIVE',
        }));
      summary = {
        totalAssignedStudents: rows.length,
        averageScore: rows.length > 0 ? Math.round(rows.reduce((a, b) => a + (Number(b.Score) || 0), 0) / rows.length) : 0,
        activeParticipants: rows.filter((r) => r.Status === 'ACTIVE').length,
        totalSolved: rows.reduce((a, b) => a + (Number(b.Solved) || 0), 0),
      };
    }

    return {
      success: true,
      data: {
        reportTitle,
        reportType: type,
        generatedBy: 'Dr. Robert Vance (Faculty Supervisor)',
        generatedAt: new Date().toISOString(),
        summary,
        rows,
      },
    };
  }

  // 4. Badges & Dashboards
  if (cleanEndpoint === 'admin/badges') {
    return { success: true, data: { pendingApprovals: 6, activeAnomalies: 3, unreadNotifications: 4, activeSessions: 45 } };
  }

  if (cleanEndpoint === 'faculty/badges') {
    return { success: true, data: { assignedStudents: 35, activeSessions: 18, activeAnomalies: 2, unreadNotifications: 3 } };
  }

  if (cleanEndpoint === 'admin/dashboard') {
    return {
      success: true,
      data: {
        users: { total: 71, approvedStudents: 64, pendingApprovals: 6, rejectedUsers: 1, facultyCount: 2, activeUsers: 45 },
        contest: { status: 'ACTIVE', name: 'University Grand Hackathon 2026', totalRegistered: 71, activeParticipants: 45, completedParticipants: 2, notStarted: 24, timeRemainingSeconds: 5400, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 5400000).toISOString() },
        questions: { total: 30, countByLevel: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3 } },
        submissions: { total: 142, successful: 98, failed: 44, compilationErrors: 12, timeouts: 8, skipped: 15 },
        security: { activeAnomalies: 3, highPriorityAnomalies: 1, multipleLoginAlerts: 1, rapidSubmissionsAlerts: 2, timeSyncAlerts: 0 }
      }
    };
  }

  // Leaderboard Filter Metadata
  // Leaderboard Filter Metadata (Contexts fetched dynamically from mockContests)
  if (cleanEndpoint === 'leaderboard/filters' || cleanEndpoint === 'leaderboard/contexts') {
    const contexts = (mockContests || []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      code: c.code || c.accessCode,
      questionCount: (c.questionIds || []).length || c.questionCount || 0,
      participantsCount: c.participantIds?.length || c.participantsCount || 0,
      startTime: c.startTime,
      endTime: c.endTime,
      isPublished: c.isPublished,
      leaderboardVisible: c.leaderboardVisible,
    }));
    return {
      success: true,
      count: contexts.length,
      data: {
        contexts,
        contests: contexts,
      },
    };
  }

  // 5. Faculty, Student & Admin Context-Wise Leaderboards
  if (cleanEndpoint === 'faculty/leaderboard' || cleanEndpoint === 'student/leaderboard' || cleanEndpoint === 'admin/leaderboard' || cleanEndpoint === 'leaderboard') {
    let selectedContextId = (params?.contextId as string) || (params?.contestId as string) || '';
    const filterKey = params?.filterKey as string;

    if (filterKey) {
      if (filterKey === 'ALL' || filterKey === 'all') {
        selectedContextId = '';
      } else {
        selectedContextId = filterKey.replace(/^(contest|context):/, '');
      }
    }

    const contexts = (mockContests || []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      code: c.code || c.accessCode,
      questionCount: (c.questionIds || []).length || c.questionCount || 0,
      participantsCount: c.participantIds?.length || c.participantsCount || 0,
      startTime: c.startTime,
      endTime: c.endTime,
      isPublished: c.isPublished,
      leaderboardVisible: c.leaderboardVisible,
    }));

    const selectedContest = selectedContextId ? mockContests.find((c) => c.id === selectedContextId || c.code === selectedContextId) : null;

    let students = mockUsers.filter((u) => u.role === 'STUDENT' && u.approved);

    if (selectedContest && selectedContest.participantIds && selectedContest.participantIds.length > 0) {
      const partSet = new Set(selectedContest.participantIds);
      const filtered = students.filter((s) => partSet.has(s.id));
      if (filtered.length > 0) students = filtered;
    }

    const rankedList = students.map((stu, idx) => {
      let score = stu.score || (72 - idx) * 15;
      let solved = stu.solvedCount || Math.max(0, Math.floor((72 - idx) / 7));
      let attempts = stu.attemptsCount || (stu.solvedCount || 1) * 2;
      let highestDiff = stu.highestDifficulty || 5;

      if (selectedContest) {
        const qCount = (selectedContest.questionIds || []).length || 5;
        const ratio = Math.min(1, Math.max(0.2, (stu.solvedCount || 1) / 10));
        solved = Math.min(qCount, Math.round(qCount * ratio));
        attempts = solved * 2 + (idx % 2);
        score = solved * 40 + (highestDiff * 10) - (attempts * 2);
        highestDiff = Math.min(10, Math.max(1, ((idx % 5) + 3)));
      }

      const avgTime = (5 + (idx % 6) * 1.2).toFixed(1);

      return {
        id: stu.id,
        studentId: stu.id,
        name: stu.name,
        studentName: stu.name,
        email: stu.email,
        studentEmail: stu.email,
        department: stu.department || 'Computer Science',
        score: Math.max(0, score),
        solved,
        solvedCount: solved,
        attempts,
        attemptsCount: attempts,
        skipped: stu.skippedCount || (idx % 3 === 0 ? 1 : 0),
        skippedCount: stu.skippedCount || (idx % 3 === 0 ? 1 : 0),
        currentDifficulty: highestDiff,
        highestDifficulty: highestDiff,
        averageSolvingTime: `${avgTime} min`,
        averageTimeMinutes: avgTime,
        lastSubmission: new Date(Date.now() - (idx * 180000)).toISOString(),
        lastSubmissionTime: new Date(Date.now() - (idx * 180000)).toISOString(),
        sessionStatus: stu.sessionStatus || 'ACTIVE',
        isOnline: stu.sessionStatus === 'ACTIVE',
        isAssignedToFaculty: idx < 35,
        isCurrentStudent: stu.id === 'usr_stu_3',
        contextId: selectedContest?.id || 'ALL',
        contextName: selectedContest?.name || 'All Contexts',
      };
    })
    .sort((a, b) => b.score - a.score || b.solved - a.solved || a.attempts - b.attempts)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return {
      success: true,
      count: rankedList.length,
      data: rankedList,
      contexts,
      filterMeta: {
        contexts,
        contests: contexts,
      },
    };
  }

  // 6. Faculty Dashboard Endpoints
  if (cleanEndpoint === 'faculty/dashboard-kpis') {
    return {
      success: true,
      data: { assignedStudents: 35, activeStudents: 28, completedStudents: 2, inactiveStudents: 5, activeSessions: 28, totalSubmissions: 64, averageScore: 185, anomalies: 2 }
    };
  }

  if (cleanEndpoint === 'faculty/contest-status') {
    return {
      success: true,
      data: {
        contest: {
          id: 'contest_1',
          name: 'University Grand Hackathon 2026',
          status: 'ACTIVE',
          timeRemaining: '01:34:10',
          totalParticipants: 71,
          assignedActiveParticipants: 28,
          assignedStudentsCount: 35
        }
      }
    };
  }

  if (cleanEndpoint === 'faculty/recent-activity' || cleanEndpoint === 'faculty/activity') {
    const activities = [
      { id: 'act_1', timestamp: new Date(Date.now() - 120000).toISOString(), studentName: 'Alex Smith', action: 'QUESTION_SOLVED', details: 'Solved Level 4 question (Container With Most Water) in 6.2 min', scoreAdded: 40 },
      { id: 'act_2', timestamp: new Date(Date.now() - 360000).toISOString(), studentName: 'Jordan Taylor', action: 'CODE_RUN', details: 'Ran Kotlin solution for Valid Balanced Parentheses. Test cases passed.', scoreAdded: 0 },
      { id: 'act_3', timestamp: new Date(Date.now() - 600000).toISOString(), studentName: 'Student One', action: 'QUESTION_SOLVED', details: 'Passed all 6 test cases for Two Sum Target Indices', scoreAdded: 35 },
    ];
    return { success: true, count: activities.length, data: activities };
  }

  if (cleanEndpoint === 'faculty/alerts') {
    return { success: true, data: mockAnomalies };
  }

  if (cleanEndpoint === 'faculty/analytics/performance' || cleanEndpoint === 'admin/analytics/performance') {
    const assignedStudents = mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 35);
    const totalScore = assignedStudents.reduce((acc, s) => acc + (s.score || 0), 0);
    const avgScore = assignedStudents.length ? Math.round(totalScore / assignedStudents.length) : 185;
    const totalSolved = assignedStudents.reduce((acc, s) => acc + (s.solvedCount || 0), 0) || 64;
    const totalAttempts = assignedStudents.reduce((acc, s) => acc + (s.attemptsCount || 0), 0) || 112;
    const totalSkips = assignedStudents.reduce((acc, s) => acc + (s.skippedCount || 0), 0) || 12;
    const overallSuccessRate = totalAttempts ? Math.round((totalSolved / totalAttempts) * 100) : 68;

    return {
      success: true,
      data: {
        metrics: {
          averageStudentScore: avgScore,
          averageSolvingTime: '12.4 min',
          successRate: overallSuccessRate,
          totalSolved,
          totalAttempts,
          totalSkips,
          difficultyProgressionAvg: 'Level 4.2',
        },
        charts: {
          scoreDistribution: [
            { range: '0-100', count: 4 },
            { range: '101-250', count: 12 },
            { range: '251-400', count: 14 },
            { range: '401-600', count: 5 },
            { range: '600+', count: 2 },
          ],
          performanceOverTime: [
            { minute: '15m', avgScore: 35, submissionsCount: 18 },
            { minute: '30m', avgScore: 85, submissionsCount: 42 },
            { minute: '45m', avgScore: 160, submissionsCount: 78 },
            { minute: '60m', avgScore: 240, submissionsCount: 110 },
            { minute: '75m', avgScore: 310, submissionsCount: 145 },
            { minute: '90m', avgScore: avgScore, submissionsCount: totalAttempts },
          ],
          solvingTimeByDifficulty: [
            { level: 'Level 1', minutes: 4.5 },
            { level: 'Level 2', minutes: 7.8 },
            { level: 'Level 3', minutes: 11.2 },
            { level: 'Level 4', minutes: 15.6 },
            { level: 'Level 5', minutes: 21.0 },
            { level: 'Level 6', minutes: 28.4 },
          ],
        },
        distribution: [
          { level: 1, totalAttempts: 142, successfulSolves: 134, avgTimeSec: 270, failRate: 5.6 },
          { level: 2, totalAttempts: 128, successfulSolves: 110, avgTimeSec: 390, failRate: 14.0 },
          { level: 3, totalAttempts: 95, successfulSolves: 76, avgTimeSec: 540, failRate: 20.0 },
          { level: 4, totalAttempts: 70, successfulSolves: 52, avgTimeSec: 680, failRate: 25.7 },
          { level: 5, totalAttempts: 45, successfulSolves: 30, avgTimeSec: 820, failRate: 33.3 },
        ]
      }
    };
  }

  if (cleanEndpoint === 'faculty/analytics/difficulty' || cleanEndpoint === 'admin/analytics/difficulty') {
    const levels = Array.from({ length: 10 }, (_, i) => i + 1);
    const matrix = levels.map((lvl) => {
      const questionsAtLvl = mockQuestions.filter((q) => q.difficulty === lvl);
      const studentsAtLvl = (lvl <= 5 ? 12 - lvl : Math.max(1, 10 - lvl));
      const baseAttempts = questionsAtLvl.reduce((acc, q) => acc + (q.attempts || 0), 0) || (lvl * 15);
      const avgSuccess = questionsAtLvl.length
        ? Math.round(questionsAtLvl.reduce((acc, q) => acc + (q.successRate || 50), 0) / questionsAtLvl.length)
        : Math.max(15, 95 - lvl * 8);

      return {
        level: lvl,
        difficulty: lvl,
        questionsCount: questionsAtLvl.length || 3,
        studentsCurrentCount: studentsAtLvl,
        activeStudents: studentsAtLvl,
        attempts: baseAttempts,
        successRate: avgSuccess,
        solvedPercentage: avgSuccess,
        failureRate: Math.max(0, 100 - avgSuccess - Math.round(lvl * 2.5)),
        skipRate: Math.round(lvl * 2.5),
        averageSolvingTime: `${(lvl * 2.5 + 4).toFixed(1)} min`,
        avgTime: `${(lvl * 2.5 + 4).toFixed(1)} min`,
      };
    });
    return {
      success: true,
      data: matrix,
    };
  }

  if (cleanEndpoint === 'faculty/analytics/questions' || cleanEndpoint === 'admin/analytics/questions') {
    return { success: true, count: mockQuestions.length, data: mockQuestions };
  }

  if (cleanEndpoint === 'faculty/profile') {
    return {
      success: true,
      data: {
        id: 'usr_fac_1',
        name: 'Dr. Robert Vance',
        email: 'faculty@hackathon.com',
        role: 'FACULTY',
        department: 'Computer Science & Engineering',
        assignedCount: 35,
        activeSupervisionSessions: 28
      }
    };
  }

  // 7. Students & Faculty Lists
  if (cleanEndpoint === 'faculty/students' || cleanEndpoint === 'admin/students') {
    const isFaculty = cleanEndpoint.startsWith('faculty');
    let list = isFaculty ? mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 35) : mockUsers.filter((u) => u.role === 'STUDENT');

    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      list = list.filter((s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    }
    if (params?.difficulty && params.difficulty !== 'ALL') {
      list = list.filter((s) => s.currentDifficulty === Number(params.difficulty));
    }
    if (params?.sessionStatus && params.sessionStatus !== 'ALL') {
      list = list.filter((s) => s.sessionStatus === String(params.sessionStatus).toUpperCase());
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((s) => s.status === String(params.status).toUpperCase());
    }

    return { success: true, count: list.length, total: list.length, data: list };
  }

  if (cleanEndpoint.startsWith('faculty/students/') || cleanEndpoint.startsWith('admin/students/')) {
    const parts = cleanEndpoint.split('/');
    const studentId = parts[2];
    const subRoute = parts[3];
    const stu = mockUsers.find((u) => u.id === studentId) || mockUsers[2];

    if (subRoute === 'performance') {
      const solved = stu.solvedCount || 4;
      const attempts = stu.attemptsCount || 8;
      const failed = Math.max(0, attempts - solved);
      const skipped = stu.skippedCount || 1;
      const score = stu.score || 240;
      const currentDiff = stu.currentDifficulty || 3;
      const highestDiff = stu.highestDifficulty || 4;
      const successRate = attempts > 0 ? Math.round((solved / attempts) * 100) : 75;

      return {
        success: true,
        data: {
          student: stu,
          metrics: {
            totalScore: score,
            questionsSolved: solved,
            questionsFailed: failed,
            questionsSkipped: skipped,
            totalAttempts: attempts,
            successfulAttempts: solved,
            averageTime: '12.6 min',
            currentDifficulty: currentDiff,
            highestDifficulty: highestDiff,
            successRate: successRate,
          },
          charts: {
            scoreProgression: [
              { time: '10:00', score: Math.round(score * 0.1) },
              { time: '10:20', score: Math.round(score * 0.3) },
              { time: '10:45', score: Math.round(score * 0.55) },
              { time: '11:15', score: Math.round(score * 0.8) },
              { time: '11:45', score: score },
            ],
            difficultyProgression: [
              { time: '10:00', level: 1 },
              { time: '10:20', level: Math.max(1, currentDiff - 2) },
              { time: '10:45', level: Math.max(1, currentDiff - 1) },
              { time: '11:15', level: currentDiff },
            ],
            submissionSuccessRate: [
              { name: 'Accepted', value: solved, color: '#10b981' },
              { name: 'Failed / Rejected', value: failed, color: '#ef4444' },
              { name: 'Skipped', value: skipped, color: '#f59e0b' },
            ],
            solvingTime: [
              { question: 'Q1 (L1)', minutes: 4.2 },
              { question: 'Q2 (L2)', minutes: 8.5 },
              { question: 'Q3 (L3)', minutes: 14.1 },
              { question: `Q4 (L${currentDiff})`, minutes: 19.8 },
            ],
          },
          progression: [
            { level: 1, score: 35, timeTaken: '4 min', solved: true },
            { level: 2, score: 80, timeTaken: '7 min', solved: true },
            { level: 3, score: 140, timeTaken: '9 min', solved: true },
            { level: 4, score: 210, timeTaken: '12 min', solved: true },
          ],
          submissions: [
            { id: 'sub_1', questionTitle: 'Two Sum Target Indices', result: 'ACCEPTED', executionTimeMs: 45, language: 'Kotlin 2.0', submittedAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'sub_2', questionTitle: 'Valid Palindrome String', result: 'ACCEPTED', executionTimeMs: 38, language: 'Kotlin 2.0', submittedAt: new Date(Date.now() - 2400000).toISOString() }
          ]
        }
      };
    }

    if (subRoute === 'activity') {
      const activities = [
        { id: 'act_1', timestamp: new Date(Date.now() - 120000).toISOString(), studentName: stu.name, action: 'QUESTION_SOLVED', details: 'Passed all 6 test cases for Level 3 question', scoreAdded: 35 },
        { id: 'act_2', timestamp: new Date(Date.now() - 480000).toISOString(), studentName: stu.name, action: 'CODE_RUN', details: 'Sandbox test runner passed for 2 sample cases', scoreAdded: 0 },
        { id: 'act_3', timestamp: new Date(Date.now() - 900000).toISOString(), studentName: stu.name, action: 'LOGIN', details: 'Authenticated via Google SSO', scoreAdded: 0 },
      ];
      return { success: true, count: activities.length, data: activities };
    }

    return {
      success: true,
      data: {
        profile: stu,
        contestPerformance: {
          score: stu.score || 180,
          rank: stu.rank || 4,
          solvedCount: stu.solvedCount || 4,
          skippedCount: stu.skippedCount || 1,
          attemptsCount: stu.attemptsCount || 6,
          currentDifficulty: stu.currentDifficulty || 2,
          highestDifficulty: stu.highestDifficulty || 3,
          successRate: 85.5,
          averageSolvingTime: '5.4 min',
        },
        currentSession: {
          sessionId: `sess_${stu.id}`,
          status: stu.sessionStatus || 'ACTIVE',
          ipAddress: '192.168.1.45',
          device: 'Chrome 124 / macOS',
          loginTime: new Date(Date.now() - 3600000).toISOString(),
        },
        ...stu
      }
    };
  }

  // 8. Questions & Calibration Matrix
  if (cleanEndpoint === 'admin/questions/difficulty-stats' || cleanEndpoint === 'questions/difficulty-stats') {
    const stats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
      const levelQuestions = mockQuestions.filter((q) => Number(q.difficulty) === lvl);
      const activeQuestions = levelQuestions.filter((q) => q.status === 'ACTIVE').length;
      const totalQuestions = levelQuestions.length;

      const avgSuccessRate = totalQuestions > 0
        ? Math.round(levelQuestions.reduce((acc, q) => acc + (q.successRate || 70), 0) / totalQuestions)
        : Math.max(20, Math.round(100 - lvl * 8));

      const avgTime = totalQuestions > 0
        ? Number((levelQuestions.reduce((acc, q) => acc + (q.averageTimeMinutes || (3 + lvl * 1.5)), 0) / totalQuestions).toFixed(1))
        : Number((3.5 + lvl * 1.6).toFixed(1));

      const skipRate = totalQuestions > 0
        ? Number((levelQuestions.reduce((acc, q) => acc + (q.skipRate || (lvl * 1.2)), 0) / totalQuestions).toFixed(1))
        : Number((1.5 + lvl * 1.8).toFixed(1));

      const failRate = Math.max(0, Number((100 - avgSuccessRate).toFixed(1)));

      let calibratedStatus: 'EASY_FOR_LEVEL' | 'HARD_FOR_LEVEL' | 'BALANCED' = 'BALANCED';
      if (avgSuccessRate >= 80 && avgTime < 6) calibratedStatus = 'EASY_FOR_LEVEL';
      else if (avgSuccessRate < 45 || avgTime > 18) calibratedStatus = 'HARD_FOR_LEVEL';

      return {
        level: lvl,
        totalQuestions,
        activeQuestions,
        averageSuccessRate: avgSuccessRate,
        averageSolvingTimeMinutes: avgTime,
        skipRate,
        failureRate: failRate,
        calibratedStatus,
      };
    });
    return { success: true, data: stats };
  }

  if (cleanEndpoint === 'admin/questions' || cleanEndpoint === 'questions') {
    if (method === 'POST') {
      const newQuestion = {
        id: `q_${Date.now()}`,
        title: body?.title || 'New Algorithm Question',
        difficulty: Number(body?.difficulty) || 1,
        category: body?.category || 'Arrays & Hashing',
        tags: Array.isArray(body?.tags) ? body.tags : (body?.tags ? String(body.tags).split(',').map((s: string) => s.trim()) : ['algorithm']),
        problemStatement: body?.problemStatement || '',
        functionSignature: body?.functionSignature || 'fun solve(): Unit',
        starterCode: body?.starterCode || 'class Solution {\n    fun solve() {}\n}',
        expectedInput: body?.expectedInput || '',
        expectedOutput: body?.expectedOutput || '',
        constraints: body?.constraints || '1 <= n <= 10^5',
        sampleInput: body?.sampleInput || '',
        sampleOutput: body?.sampleOutput || '',
        explanation: body?.explanation || '',
        visibleTestCasesCount: Number(body?.visibleTestCasesCount) || 2,
        hiddenTestCasesCount: Number(body?.hiddenTestCasesCount) || 5,
        successRate: 0,
        averageTimeMinutes: 0,
        skipRate: 0,
        attemptsCount: 0,
        solvesCount: 0,
        status: body?.status || 'ACTIVE',
      };
      mockQuestions.unshift(newQuestion);
      return { success: true, message: 'Question created successfully', data: newQuestion };
    }

    let filtered = [...mockQuestions];

    const contextId = params?.contextId || params?.contestId;
    if (contextId && contextId !== 'ALL' && contextId !== 'all') {
      const contest = mockContests.find((c) => c.id === contextId);
      if (contest && Array.isArray(contest.questionIds)) {
        filtered = filtered.filter((item) => contest.questionIds.includes(item.id));
      }
    }

    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(q);
        const categoryMatch = item.category?.toLowerCase().includes(q);
        const statementMatch = item.problemStatement?.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(item.tags)
          ? item.tags.some((t: string) => t.toLowerCase().includes(q))
          : String(item.tags || '').toLowerCase().includes(q);
        return titleMatch || categoryMatch || statementMatch || tagsMatch;
      });
    }

    if (params?.difficulty && params.difficulty !== 'ALL') {
      const targetDiff = Number(params.difficulty);
      filtered = filtered.filter((item) => Number(item.difficulty) === targetDiff);
    }

    if (params?.category && params.category !== 'ALL') {
      const targetCat = String(params.category).toLowerCase().trim();
      filtered = filtered.filter((item) => (item.category || '').toLowerCase().trim() === targetCat);
    }

    return { success: true, count: filtered.length, total: filtered.length, data: filtered };
  }

  if (cleanEndpoint.startsWith('admin/questions/') || cleanEndpoint.startsWith('questions/')) {
    const parts = cleanEndpoint.split('/');
    const qId = parts[parts.length - 1] === 'change-difficulty' ? parts[parts.length - 2] : parts[parts.length - 1];
    const isChangeDiff = cleanEndpoint.endsWith('/change-difficulty');

    const qIndex = mockQuestions.findIndex((item) => item.id === qId);
    const existingQ = qIndex !== -1 ? mockQuestions[qIndex] : null;

    if (isChangeDiff) {
      if (existingQ && body?.newDifficulty) {
        existingQ.difficulty = Number(body.newDifficulty);
        if (body.reason) {
          mockAuditLogs.unshift({
            id: `aud_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: 'usr_admin_1',
            userName: 'Admin Director',
            role: 'ADMIN',
            action: 'QUESTION_DIFFICULTY_CALIBRATED',
            details: `Calibrated "${existingQ.title}" to Level ${existingQ.difficulty}. Reason: ${body.reason}`,
            ipAddress: '127.0.0.1',
            sessionId: 'sess_admin_master',
            result: 'SUCCESS',
          });
        }
        return { success: true, message: `Difficulty calibrated to Level ${existingQ.difficulty}`, data: existingQ };
      }
      return { success: false, message: 'Question not found or invalid difficulty' };
    }

    if (method === 'DELETE') {
      if (qIndex !== -1) {
        const deleted = mockQuestions.splice(qIndex, 1)[0];
        return { success: true, message: `Question ${deleted.title} deleted`, data: deleted };
      }
      return { success: true, message: 'Question deleted' };
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (qIndex !== -1 && body) {
        mockQuestions[qIndex] = {
          ...mockQuestions[qIndex],
          ...body,
          difficulty: body.difficulty !== undefined ? Number(body.difficulty) : mockQuestions[qIndex].difficulty,
          tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map((t: string) => t.trim()) : mockQuestions[qIndex].tags),
        };
        return { success: true, message: 'Question updated', data: mockQuestions[qIndex] };
      }
    }

    const q = existingQ || mockQuestions.find((item) => item.id === qId) || mockQuestions[0];
    return { success: true, data: q };
  }

  // 9. Live Sessions
  if (cleanEndpoint === 'faculty/live-sessions' || cleanEndpoint === 'admin/live-sessions' || cleanEndpoint === 'admin/sessions' || cleanEndpoint === 'faculty/monitoring/sessions') {
    let sessions = mockUsers.filter((u) => u.role === 'STUDENT' && u.approved).slice(0, 35).map((stu, idx) => ({
      id: `sess_${stu.id}`,
      studentId: stu.id,
      studentName: stu.name,
      studentEmail: stu.email,
      department: stu.department || 'Computer Science',
      currentQuestionTitle: mockQuestions[idx % mockQuestions.length].title,
      currentDifficulty: stu.currentDifficulty || 3,
      score: stu.score || 180,
      solvedCount: stu.solvedCount || 4,
      skippedCount: stu.skippedCount || 0,
      attemptsCount: stu.attemptsCount || 7,
      sessionStatus: stu.sessionStatus || (idx === 8 ? 'PAUSED' : (idx === 14 ? 'IDLE' : 'ACTIVE')),
      timeRemainingSeconds: 4200 - (idx * 60),
      ipAddress: `192.168.1.${15 + idx}`,
      device: idx % 2 === 0 ? 'Windows 11 Pro' : 'macOS Sonoma',
      browser: 'Chrome 124.0',
      anomalyStatus: idx === 12 ? 'HIGH' : idx === 2 ? 'MEDIUM' : 'NORMAL',
      lastActivity: new Date(Date.now() - (idx * 30000)).toISOString()
    }));

    const contextId = params?.contextId || params?.contestId;
    if (contextId && contextId !== 'ALL' && contextId !== 'all') {
      const contest = mockContests.find((c) => c.id === contextId);
      if (contest && Array.isArray(contest.participantIds)) {
        sessions = sessions.filter((s) => contest.participantIds.includes(s.studentId));
      }
    }

    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      sessions = sessions.filter((s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentEmail.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.currentQuestionTitle.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'ALL') {
      sessions = sessions.filter((s) => s.sessionStatus === String(params.status).toUpperCase());
    }
    if (params?.anomalyStatus && params.anomalyStatus !== 'ALL') {
      sessions = sessions.filter((s) => s.anomalyStatus === String(params.anomalyStatus).toUpperCase());
    }
    if (params?.difficulty && params.difficulty !== 'ALL') {
      sessions = sessions.filter((s) => s.currentDifficulty === Number(params.difficulty));
    }

    return { success: true, count: sessions.length, total: sessions.length, data: sessions };
  }

  if (cleanEndpoint.startsWith('admin/live-sessions/') || cleanEndpoint.startsWith('faculty/live-sessions/') || cleanEndpoint.startsWith('admin/sessions/')) {
    const parts = cleanEndpoint.split('/');
    const sessId = parts[2];
    const action = parts[3];

    const studentId = sessId.replace(/^sess_/, '');
    const stu = mockUsers.find((u) => u.id === studentId || u.id === sessId) || mockUsers[2];

    if (action === 'terminate' || action === 'lock') {
      stu.sessionStatus = 'COMPLETED';
      return { success: true, message: `Session for ${stu.name} terminated and score finalized.` };
    }
    if (action === 'pause') {
      stu.sessionStatus = 'PAUSED';
      return { success: true, message: `Session for ${stu.name} paused.` };
    }
    if (action === 'resume') {
      stu.sessionStatus = 'ACTIVE';
      return { success: true, message: `Session for ${stu.name} resumed.` };
    }
    if (action === 'broadcast' || action === 'send-message' || action === 'warn') {
      return { success: true, message: `Supervisor message dispatched to ${stu.name}` };
    }

    const sessionObj = {
      id: sessId.startsWith('sess_') ? sessId : `sess_${stu.id}`,
      studentId: stu.id,
      studentName: stu.name,
      studentEmail: stu.email,
      department: stu.department || 'Computer Science',
      currentQuestionTitle: mockQuestions[3].title,
      currentDifficulty: stu.currentDifficulty || 3,
      score: stu.score || 180,
      solvedCount: stu.solvedCount || 4,
      skippedCount: stu.skippedCount || 0,
      attemptsCount: stu.attemptsCount || 7,
      sessionStatus: stu.sessionStatus || 'ACTIVE',
      timeRemainingSeconds: 3600,
      ipAddress: '192.168.1.45',
      device: 'Windows 11 Pro / Chrome 124.0',
      browser: 'Chrome 124.0',
      anomalyStatus: 'NORMAL',
      lastActivity: new Date().toISOString(),
      questionHistory: [
        { level: 1, title: 'Two Sum Target Indices', result: 'ACCEPTED', timeSpent: '4.2 min', score: 35 },
        { level: 2, title: 'Valid Balanced Parentheses', result: 'ACCEPTED', timeSpent: '6.8 min', score: 45 },
        { level: 3, title: 'Container With Most Water', result: 'ACCEPTED', timeSpent: '8.5 min', score: 60 },
      ],
      timeline: [
        { time: '10:00:00', event: 'Arena Joined & Authenticated' },
        { time: '10:04:12', event: 'Level 1 Question Solved' },
        { time: '10:11:00', event: 'Level 2 Question Solved' },
        { time: '10:19:30', event: 'Level 3 Question Solved' },
      ]
    };
    return { success: true, data: sessionObj };
  }

  // 10. Submissions
  if (cleanEndpoint === 'faculty/submissions' || cleanEndpoint === 'admin/submissions' || cleanEndpoint === 'faculty/contest/submissions') {
    let subs = mockUsers.filter((u) => u.role === 'STUDENT').slice(0, 35).map((stu, idx) => {
      const isAccepted = idx % 4 !== 3;
      const q = mockQuestions[idx % mockQuestions.length] || mockQuestions[0];
      return {
        id: `sub_${1000 + idx}`,
        studentId: stu.id,
        studentName: stu.name,
        studentEmail: stu.email,
        questionId: q.id,
        questionTitle: q.title,
        difficulty: q.difficulty,
        submittedAt: new Date(Date.now() - (idx * 120000)).toISOString(),
        result: isAccepted ? 'ACCEPTED' : (idx % 2 === 0 ? 'WRONG_ANSWER' : 'COMPILATION_ERROR'),
        executionTimeMs: isAccepted ? 42 : 5000,
        memoryUsedMb: '18 MB',
        testCasesPassed: isAccepted ? 6 : 2,
        totalTestCases: 6,
        scoreAwarded: isAccepted ? q.difficulty * 25 : 0,
        language: 'Kotlin 2.0 (JVM 21)',
        code: `// Kotlin Solution by ${stu.name}\nclass Solution {\n    ${q.functionSignature} {\n        // Optimized implementation\n        return ${isAccepted ? 'true' : 'false'}\n    }\n}`,
        compilerOutput: isAccepted ? 'Compilation successful. All 6 test cases passed.' : 'Wrong answer on testcase 3'
      };
    });

    const contextId = params?.contextId || params?.contestId;
    if (contextId && contextId !== 'ALL' && contextId !== 'all') {
      const contest = mockContests.find((c) => c.id === contextId);
      if (contest) {
        const qIds = Array.isArray(contest.questionIds) ? contest.questionIds : [];
        const pIds = Array.isArray(contest.participantIds) ? contest.participantIds : [];
        subs = subs.filter((s) => qIds.includes(s.questionId) || pIds.includes(s.studentId));
      }
    }

    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      subs = subs.filter((s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentEmail.toLowerCase().includes(q) ||
        s.questionTitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    if (params?.result && params.result !== 'ALL') {
      subs = subs.filter((s) => s.result === String(params.result).toUpperCase());
    }
    if (params?.difficulty && params.difficulty !== 'ALL') {
      subs = subs.filter((s) => s.difficulty === Number(params.difficulty));
    }
    if (params?.studentId && params.studentId !== 'ALL') {
      subs = subs.filter((s) => s.studentId === params.studentId);
    }

    return { success: true, count: subs.length, total: subs.length, data: subs };
  }

  if (cleanEndpoint.startsWith('admin/submissions/') || cleanEndpoint.startsWith('faculty/submissions/') || cleanEndpoint.startsWith('faculty/contest/submissions/')) {
    const parts = cleanEndpoint.split('/');
    const subId = parts[2];
    const action = parts[3];

    if (action === 'regrade') {
      return { success: true, message: `Submission ${subId} successfully regraded. Test suite re-evaluated.` };
    }

    const sub = {
      id: subId,
      studentId: 'usr_stu_3',
      studentName: 'Student One',
      studentEmail: 'student@hackathon.com',
      questionId: 'q_1',
      questionTitle: 'Two Sum Target Indices',
      difficulty: 1,
      submittedAt: new Date().toISOString(),
      result: 'ACCEPTED',
      executionTimeMs: 42,
      memoryUsedMb: '18 MB',
      testCasesPassed: 6,
      totalTestCases: 6,
      scoreAwarded: 25,
      language: 'Kotlin 2.0 (JVM 21)',
      code: `class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        val map = HashMap<Int, Int>()\n        for (i in nums.indices) {\n            val complement = target - nums[i]\n            if (map.containsKey(complement)) {\n                return intArrayOf(map[complement]!!, i)\n            }\n            map[nums[i]] = i\n        }\n        return intArrayOf()\n    }\n}`,
      compilerOutput: 'Compilation successful. 6 of 6 test cases passed. Memory: 18 MB, Runtime: 42ms'
    };
    return { success: true, data: sub };
  }

  // 11. Anomalies
  if (cleanEndpoint === 'faculty/anomalies' || cleanEndpoint === 'admin/anomalies' || cleanEndpoint === 'faculty/monitoring/anomalies') {
    let anoms = [...mockAnomalies];
    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      anoms = anoms.filter((a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.studentEmail?.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    if (params?.severity && params.severity !== 'ALL') {
      anoms = anoms.filter((a) => a.severity === String(params.severity).toUpperCase());
    }
    if (params?.type && params.type !== 'ALL') {
      anoms = anoms.filter((a) => a.type === String(params.type).toUpperCase());
    }
    if (params?.status && params.status !== 'ALL') {
      anoms = anoms.filter((a) => (a.status || 'NEW') === String(params.status).toUpperCase());
    }
    return { success: true, count: anoms.length, total: anoms.length, data: anoms };
  }

  if (cleanEndpoint.startsWith('faculty/anomalies/') || cleanEndpoint.startsWith('admin/anomalies/') || cleanEndpoint.startsWith('faculty/monitoring/anomalies/')) {
    const parts = cleanEndpoint.split('/');
    const anomId = parts[2];
    const action = parts[3];

    const anom = mockAnomalies.find((a) => a.id === anomId) || mockAnomalies[0];

    if (action === 'resolve') {
      anom.status = 'RESOLVED';
      return { success: true, message: `Anomaly ${anom.id} resolved successfully.` };
    }
    if (action === 'flag-investigation' || action === 'investigate') {
      anom.status = 'INVESTIGATING';
      return { success: true, message: `Anomaly ${anom.id} flagged for supervisor review.` };
    }
    if (action === 'dismiss') {
      anom.status = 'DISMISSED';
      return { success: true, message: `Anomaly ${anom.id} dismissed.` };
    }
    if (action === 'terminate-session') {
      anom.status = 'ACTION_TAKEN';
      const stu = mockUsers.find((u) => u.id === anom.studentId);
      if (stu) stu.sessionStatus = 'COMPLETED';
      return { success: true, message: `Exam session terminated for ${anom.studentName}.` };
    }

    return { success: true, data: anom };
  }

  // 12. Notifications
  if (cleanEndpoint === 'faculty/notifications' || cleanEndpoint === 'admin/notifications') {
    if (method === 'POST') {
      const newNotif = {
        id: `notif_${Date.now()}`,
        title: body?.title || 'System Broadcast Announcement',
        message: body?.message || 'Important update regarding contest arena operations.',
        type: body?.type || 'BROADCAST',
        priority: body?.priority || 'HIGH',
        timestamp: new Date().toISOString(),
        read: false,
      };
      mockNotifications.unshift(newNotif);
      return { success: true, message: 'Broadcast notification sent successfully', data: newNotif };
    }
    return { success: true, count: mockNotifications.length, data: mockNotifications };
  }

  if (cleanEndpoint === 'admin/notifications/mark-all-read' || cleanEndpoint === 'faculty/notifications/mark-all-read') {
    mockNotifications.forEach((n) => { n.read = true; });
    return { success: true, message: 'All notifications marked as read' };
  }

  if (cleanEndpoint.startsWith('admin/notifications/') || cleanEndpoint.startsWith('faculty/notifications/')) {
    const parts = cleanEndpoint.split('/');
    const notifId = parts[2];
    const n = mockNotifications.find((item) => item.id === notifId);
    if (n) n.read = true;
    return { success: true, message: 'Notification marked as read' };
  }

  // 12b. Faculty Assigned Contests
  if (cleanEndpoint === 'faculty/contests') {
    const fac = mockUsers.find((u) => u.role === 'FACULTY') || mockUsers[2];
    const assigned = mockContests.filter((c) =>
      (Array.isArray(c.assignedFacultyIds) && c.assignedFacultyIds.includes(fac.id)) ||
      (Array.isArray(c.assignedFaculty) && c.assignedFaculty.some((f: any) => f.id === fac.id))
    );
    return { success: true, count: assigned.length, data: assigned };
  }

  // 13. Student Contest Arena Endpoints
  if (cleanEndpoint === 'student/contests') {
    const studentId = 'usr_stu_3';
    const published = mockContests.filter((c) => c.status !== 'DRAFT' && c.isPublished !== false);
    const mapped = published.map((c) => {
      const isJoined = Array.isArray(c.participantIds) && c.participantIds.includes(studentId);
      const count = Array.isArray(c.participantIds) ? c.participantIds.length : (c.participantsCount || 0);
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.status,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        durationMinutes: c.durationMinutes,
        maxParticipants: c.maxParticipants,
        participantsCount: count,
        difficultyRange: c.difficultyRange,
        questionCount: Array.isArray(c.questionIds) ? c.questionIds.length : (c.questionCount || 0),
        isJoined,
        isFull: Boolean(c.maxParticipants && count >= c.maxParticipants && !isJoined),
        code: isJoined ? c.code : undefined,
      };
    });
    return { success: true, count: mapped.length, data: mapped };
  }

  if (cleanEndpoint === 'student/contests/join') {
    const studentId = 'usr_stu_3';
    const rawCode = String(body?.contestCode || '').trim().toUpperCase();
    const contest = mockContests.find((c) => c.code?.toUpperCase() === rawCode || c.accessCode?.toUpperCase() === rawCode);

    if (!contest) {
      return { success: false, status: 400, message: `Invalid Contest Code "${body?.contestCode}". Please verify the code and try again.` };
    }
    if (contest.status === 'DRAFT' || contest.isPublished === false) {
      return { success: false, status: 400, message: `This contest is currently unpublished.` };
    }
    if (contest.status === 'ENDED' || contest.status === 'CANCELLED') {
      return { success: false, status: 400, message: `Cannot join: Contest has already ${contest.status.toLowerCase()}.` };
    }
    if (!Array.isArray(contest.participantIds)) {
      contest.participantIds = [];
    }
    if (!contest.participantIds.includes(studentId)) {
      contest.participantIds.push(studentId);
      contest.participantsCount = contest.participantIds.length;
    }
    return {
      success: true,
      message: `Successfully joined ${contest.name}!`,
      data: { contestId: contest.id, contestName: contest.name, status: contest.status, alreadyJoined: false },
    };
  }

  if (cleanEndpoint === 'student/dashboard') {
    const studentObj = { id: 'usr_stu_3', name: 'Student One', email: 'student@hackathon.com', score: 240, rank: 3, currentDifficulty: 4, highestDifficulty: 4, solvedCount: 4, skippedCount: 0, attemptsCount: 5 };
    const published = mockContests.filter((c) => c.status !== 'DRAFT' && c.isPublished !== false).map((c) => ({
      ...c,
      isJoined: Array.isArray(c.participantIds) && c.participantIds.includes('usr_stu_3'),
    }));
    return {
      success: true,
      data: {
        student: studentObj,
        performance: studentObj,
        contest: mockContests[0],
        availableContests: published,
        currentQuestion: mockQuestions[0],
        recentSubmissions: [
          { id: 'sub_st1', questionTitle: 'Two Sum Target Indices', difficulty: 1, result: 'ACCEPTED', executionTimeMs: 38, submittedAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 'sub_st2', questionTitle: 'Valid Balanced Parentheses', difficulty: 2, result: 'ACCEPTED', executionTimeMs: 44, submittedAt: new Date(Date.now() - 2400000).toISOString() },
          { id: 'sub_st3', questionTitle: 'Container With Most Water', difficulty: 3, result: 'ACCEPTED', executionTimeMs: 62, submittedAt: new Date(Date.now() - 1200000).toISOString() },
        ]
      }
    };
  }

  if (cleanEndpoint === 'student/contest/state') {
    const q = mockQuestions[0];
    return {
      success: true,
      data: {
        contest: mockContests[0],
        question: q,
        currentQuestion: q,
        session: {
          id: 'sess_stu_3',
          score: 240,
          currentDifficulty: q.difficulty || 1,
          rank: 3,
          solvedCount: 4,
          skippedCount: 0,
        },
        currentDifficulty: q.difficulty || 1,
        studentScore: 240,
        solvedCount: 4,
        timeRemainingSeconds: 5400,
        submissions: []
      }
    };
  }

  if (cleanEndpoint === 'student/run-code') {
    return {
      success: true,
      data: {
        status: 'PASSED',
        verdict: 'ACCEPTED',
        executionTime: '38ms',
        executionTimeMs: 38,
        memory: '16.4 MB',
        memoryUsedMb: '16.4 MB',
        testCasesPassed: 2,
        totalTestCases: 2,
        stdout: 'Kotlin 2.0 (JVM 21) sandbox execution succeeded.\nTest case 1: [0, 1] (PASSED - 14ms)\nTest case 2: [1, 2] (PASSED - 12ms)',
        compilerOutput: 'Kotlin 2.0 (JVM 21) compilation successful.\nTest case 1: [0, 1] (PASSED - 14ms)\nTest case 2: [1, 2] (PASSED - 12ms)',
        testCaseResults: [
          { id: 1, passed: true, inputPreview: 'nums = [2,7,11,15], target = 9', expectedOutputPreview: '[0,1]', actualOutputPreview: '[0,1]', timeMs: 14 },
          { id: 2, passed: true, inputPreview: 'nums = [3,2,4], target = 6', expectedOutputPreview: '[1,2]', actualOutputPreview: '[1,2]', timeMs: 12 },
        ]
      }
    };
  }

  if (cleanEndpoint === 'student/submit-code') {
    const nextQ = mockQuestions[1] || mockQuestions[0];
    return {
      success: true,
      data: {
        status: 'SUCCESS',
        verdict: 'ACCEPTED',
        scoreAdded: 40,
        newTotalScore: 280,
        newScore: 280,
        nextDifficulty: nextQ.difficulty || 2,
        newDifficulty: nextQ.difficulty || 2,
        solvedCount: 5,
        time: '45ms',
        memory: '18.2 MB',
        timeTakenSeconds: 180,
        executionTimeMs: 45,
        memoryUsedMb: '18.2 MB',
        testCasesPassed: 6,
        totalTestCases: 6,
        compilerOutput: 'All visible and hidden test cases passed successfully!',
        nextQuestion: nextQ,
        question: nextQ,
      }
    };
  }

  if (cleanEndpoint === 'student/skip-question') {
    const nextQ = mockQuestions[1] || mockQuestions[0];
    return {
      success: true,
      data: {
        newScore: 235,
        penaltyApplied: 5,
        nextQuestion: nextQ,
        question: nextQ,
        nextDifficulty: nextQ.difficulty || 1,
        penalty: 5,
      }
    };
  }

  // 14. Test Cases Management
  if (cleanEndpoint === 'admin/test-cases') {
    if (method === 'POST') {
      const newTc = {
        id: `tc_${Date.now()}`,
        questionId: body?.questionId || 'q_1',
        input: body?.input || '',
        expectedOutput: body?.expectedOutput || '',
        isHidden: Boolean(body?.isHidden),
        isEnabled: body?.isEnabled !== undefined ? Boolean(body?.isEnabled) : true,
        description: body?.description || 'Custom test case',
        executionTimeLimitMs: Number(body?.executionTimeLimitMs) || 2000,
      };
      mockTestCases.push(newTc);
      return { success: true, message: 'Test case created successfully', data: newTc };
    }
    const qId = params?.questionId || body?.questionId;
    const contextId = params?.contextId || params?.contestId;
    let filtered = [...mockTestCases];

    if (contextId && contextId !== 'ALL' && contextId !== 'all') {
      const contest = mockContests.find((c) => c.id === contextId);
      if (contest && Array.isArray(contest.questionIds)) {
        filtered = filtered.filter((tc) => contest.questionIds.includes(tc.questionId));
      }
    }

    if (qId && qId !== 'ALL') {
      filtered = filtered.filter((tc) => tc.questionId === qId);
    }

    return { success: true, count: filtered.length, data: filtered };
  }

  if (cleanEndpoint.startsWith('admin/test-cases/')) {
    const parts = cleanEndpoint.split('/');
    const tcId = parts[2];
    const isRun = parts[3] === 'run';

    if (isRun) {
      return {
        success: true,
        data: {
          executionTimeMs: Math.floor(18 + Math.random() * 32),
          memoryUsedMb: `${Math.floor(14 + Math.random() * 8)} MB`,
          sandboxLogs: `Sandbox environment initialized (Kotlin 2.0 JVM 21)\nRunning test assertions against sample input...\nAll 6/6 test assertions PASSED.\nExit status: 0`,
        }
      };
    }

    if (method === 'PUT') {
      const tc = mockTestCases.find((t) => t.id === tcId);
      if (tc) Object.assign(tc, body);
      return { success: true, message: 'Test case updated successfully', data: tc };
    }

    if (method === 'DELETE') {
      mockTestCases = mockTestCases.filter((t) => t.id !== tcId);
      return { success: true, message: 'Test case deleted successfully' };
    }

    const tc = mockTestCases.find((t) => t.id === tcId) || mockTestCases[0];
    return { success: true, data: tc };
  }

  // 15. Faculty management & Users
  if (cleanEndpoint === 'admin/faculty') {
    if (method === 'POST') {
      const newFaculty: MockUser = {
        id: `usr_fac_${Date.now()}`,
        name: body?.name || 'Faculty Member',
        email: body?.email || 'faculty@university.edu',
        role: 'FACULTY',
        approved: true,
        status: 'ACTIVE',
        department: body?.department || 'Computer Science',
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      mockUsers.push(newFaculty);
      mockAuditLogs.unshift({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'usr_admin_1',
        userName: 'Admin Director',
        role: 'ADMIN',
        action: 'FACULTY_CREATED',
        details: `Created faculty member ${newFaculty.name} (${newFaculty.department})`,
        ipAddress: '127.0.0.1',
        sessionId: 'sess_admin_master',
        result: 'SUCCESS',
      });
      return { success: true, message: `Faculty member ${newFaculty.name} created`, data: newFaculty };
    }

    let facs = mockUsers.filter((u) => u.role === 'FACULTY');
    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      facs = facs.filter((f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q))
      );
    }
    if (params?.department && params.department !== 'ALL') {
      facs = facs.filter((f) => f.department === params.department);
    }
    return { success: true, count: facs.length, data: facs };
  }

  if (cleanEndpoint.startsWith('admin/faculty/')) {
    const parts = cleanEndpoint.split('/');
    const facId = parts[2];
    const action = parts[3];

    const facIndex = mockUsers.findIndex((u) => u.id === facId);
    const fac = facIndex !== -1 ? mockUsers[facIndex] : null;

    if (action === 'assign-students') {
      const studentIds: string[] = Array.isArray(body?.studentIds) ? body.studentIds : [];
      studentIds.forEach((sId) => {
        const stu = mockUsers.find((u) => u.id === sId);
        if (stu && fac) {
          stu.assignedFacultyId = fac.id;
          stu.assignedFacultyName = fac.name;
        }
      });
      return { success: true, message: `Assigned ${studentIds.length} student(s) to ${fac?.name || 'Faculty'}` };
    }

    if (method === 'PUT' && fac) {
      Object.assign(fac, body);
      return { success: true, message: 'Faculty profile updated', data: fac };
    }

    if (method === 'DELETE') {
      if (facIndex !== -1) {
        const deleted = mockUsers.splice(facIndex, 1)[0];
        return { success: true, message: `Faculty member ${deleted.name} removed` };
      }
      return { success: true, message: 'Faculty removed' };
    }

    return { success: true, data: fac || mockUsers.find((u) => u.role === 'FACULTY') };
  }

  if (cleanEndpoint === 'admin/users') {
    let users = [...mockUsers];
    const searchVal = params?.search || params?.q;
    if (searchVal) {
      const q = String(searchVal).toLowerCase().trim();
      users = users.filter((u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    if (params?.role && params.role !== 'ALL') {
      users = users.filter((u) => u.role === String(params.role).toUpperCase());
    }
    if (params?.status && params.status !== 'ALL') {
      users = users.filter((u) => u.status === String(params.status).toUpperCase());
    }
    return { success: true, count: users.length, total: users.length, data: users };
  }

  if (cleanEndpoint === 'admin/users/bulk-approve') {
    const userIds: string[] = Array.isArray(body?.userIds) ? body.userIds : [];
    userIds.forEach((id) => {
      const u = mockUsers.find((item) => item.id === id);
      if (u) {
        u.approved = true;
        u.status = 'ACTIVE';
      }
    });
    mockAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr_admin_1',
      userName: 'Admin Director',
      role: 'ADMIN',
      action: 'BULK_USER_APPROVAL',
      details: `Bulk approved ${userIds.length} user registrations`,
      ipAddress: '127.0.0.1',
      sessionId: 'sess_admin_master',
      result: 'SUCCESS',
    });
    return { success: true, message: `Successfully approved ${userIds.length} user accounts.` };
  }

  if (cleanEndpoint === 'admin/users/bulk-reject') {
    const userIds: string[] = Array.isArray(body?.userIds) ? body.userIds : [];
    const reason = body?.reason || 'Administrative rejection';
    userIds.forEach((id) => {
      const u = mockUsers.find((item) => item.id === id);
      if (u) {
        u.approved = false;
        u.status = 'REJECTED';
        u.rejectionReason = reason;
      }
    });
    return { success: true, message: `Successfully rejected ${userIds.length} accounts.` };
  }

  if (cleanEndpoint.startsWith('admin/users/')) {
    const parts = cleanEndpoint.split('/');
    const userId = parts[2];
    const action = parts[3];

    const u = mockUsers.find((item) => item.id === userId);

    if (action === 'approve') {
      if (u) {
        u.approved = true;
        u.status = 'ACTIVE';
        mockAuditLogs.unshift({
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'usr_admin_1',
          userName: 'Admin Director',
          role: 'ADMIN',
          action: 'USER_APPROVED',
          details: `Approved enrollment identity for ${u.name} (${u.email})`,
          ipAddress: '127.0.0.1',
          sessionId: 'sess_admin_master',
          result: 'SUCCESS',
        });
      }
      return { success: true, message: `User ${u?.name || userId} approved successfully`, data: u };
    }

    if (action === 'reject') {
      if (u) {
        u.approved = false;
        u.status = 'REJECTED';
        u.rejectionReason = body?.reason || 'Enrollment identity mismatch';
        mockAuditLogs.unshift({
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'usr_admin_1',
          userName: 'Admin Director',
          role: 'ADMIN',
          action: 'USER_REJECTED',
          details: `Rejected registration for ${u.name}. Reason: ${u.rejectionReason}`,
          ipAddress: '127.0.0.1',
          sessionId: 'sess_admin_master',
          result: 'SUCCESS',
        });
      }
      return { success: true, message: `User ${u?.name || userId} rejected`, data: u };
    }

    if (action === 'suspend') {
      if (u) u.status = 'SUSPENDED';
      return { success: true, message: `User ${u?.name || userId} suspended`, data: u };
    }

    if (action === 'activate') {
      if (u) u.status = 'ACTIVE';
      return { success: true, message: `User ${u?.name || userId} activated`, data: u };
    }

    if (method === 'PUT' && u) {
      Object.assign(u, body);
      return { success: true, message: 'User updated', data: u };
    }

    if (method === 'DELETE') {
      const idx = mockUsers.findIndex((item) => item.id === userId);
      if (idx !== -1) mockUsers.splice(idx, 1);
      return { success: true, message: 'User deleted' };
    }

    return { success: true, data: u || mockUsers[0] };
  }

  // Student Session Interventions & Details
  if (cleanEndpoint.startsWith('admin/students/')) {
    const parts = cleanEndpoint.split('/');
    const studentId = parts[2];
    const action = parts[3];

    const student = mockUsers.find((item) => item.id === studentId) || mockUsers.find((u) => u.role === 'STUDENT') || mockUsers[0];

    if (action === 'reset-session') {
      if (student) {
        student.score = 0;
        student.solvedCount = 0;
        student.skippedCount = 0;
        student.attemptsCount = 0;
        student.currentDifficulty = 1;
        student.sessionStatus = 'ACTIVE';
        mockAuditLogs.unshift({
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'usr_admin_1',
          userName: 'Admin Director',
          role: 'ADMIN',
          action: 'STUDENT_SESSION_RESET',
          details: `Reset contest arena session for ${student.name}`,
          ipAddress: '127.0.0.1',
          sessionId: 'sess_admin_master',
          result: 'SUCCESS',
        });
      }
      return { success: true, message: `Session reset successfully for ${student?.name || studentId}` };
    }

    if (action === 'pause-session') {
      if (student) student.sessionStatus = 'PAUSED';
      return { success: true, message: `Session paused for ${student?.name || studentId}` };
    }

    if (action === 'resume-session') {
      if (student) student.sessionStatus = 'ACTIVE';
      return { success: true, message: `Session resumed for ${student?.name || studentId}` };
    }

    if (action === 'change-difficulty') {
      if (student && body?.difficulty) {
        student.currentDifficulty = Number(body.difficulty);
      }
      return { success: true, message: `Difficulty calibrated to Level ${student?.currentDifficulty || 1}` };
    }

    if (action === 'terminate-session') {
      if (student) student.sessionStatus = 'COMPLETED';
      return { success: true, message: `Session terminated for ${student?.name || studentId}` };
    }

    // Default: Return full Student Detail Dossier
    const submissions = [
      {
        id: `sub_${studentId}_1`,
        studentId: student.id,
        studentName: student.name,
        questionId: 'q_1',
        questionTitle: 'Two Sum Target Indices',
        difficulty: 1,
        submittedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        executionTimeMs: 42,
        memoryUsedMb: '14.2 MB',
        result: 'ACCEPTED',
      },
      {
        id: `sub_${studentId}_2`,
        studentId: student.id,
        studentName: student.name,
        questionId: 'q_3',
        questionTitle: 'Valid Balanced Parentheses',
        difficulty: 2,
        submittedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        executionTimeMs: 58,
        memoryUsedMb: '16.5 MB',
        result: 'ACCEPTED',
      },
      {
        id: `sub_${studentId}_3`,
        studentId: student.id,
        studentName: student.name,
        questionId: 'q_5',
        questionTitle: 'Container With Most Water',
        difficulty: 3,
        submittedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        executionTimeMs: 84,
        memoryUsedMb: '18.1 MB',
        result: 'ACCEPTED',
      },
    ];

    return {
      success: true,
      data: {
        ...student,
        submissions,
        timeline: [
          { level: 1, title: 'Two Sum Target Indices', time: '10:05 AM', duration: '4.2 min', passed: true },
          { level: 2, title: 'Valid Balanced Parentheses', time: '10:14 AM', duration: '7.8 min', passed: true },
          { level: 3, title: 'Container With Most Water', time: '10:28 AM', duration: '12.1 min', passed: true },
        ]
      }
    };
  }

  // Profile endpoints
  if (cleanEndpoint === 'admin/profile') {
    const admin = mockUsers.find((u) => u.role === 'ADMIN') || mockUsers[0];
    if (method === 'PUT' && body) {
      Object.assign(admin, body);
    }
    const activeSessions = [
      { id: 'sess_adm_1', device: 'Chrome 124 (macOS Sonoma)', ipAddress: '127.0.0.1', lastActive: new Date().toISOString(), isCurrent: true },
      { id: 'sess_adm_2', device: 'Firefox 125 (Windows 11)', ipAddress: '192.168.1.100', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
    ];
    return {
      success: true,
      message: method === 'PUT' ? 'Admin profile updated successfully' : undefined,
      data: {
        profile: admin,
        activeSessions,
        ...admin,
      }
    };
  }

  if (cleanEndpoint === 'faculty/profile') {
    if (method === 'PUT' && body) {
      const fac = mockUsers.find((u) => u.role === 'FACULTY') || mockUsers[2];
      Object.assign(fac, body);
      return { success: true, message: 'Faculty profile updated successfully', data: fac };
    }
    const fac = mockUsers.find((u) => u.role === 'FACULTY') || mockUsers[2];
    return {
      success: true,
      data: {
        ...fac,
        assignedCount: 35,
        activeSupervisionSessions: 28,
      }
    };
  }

  // 16. Contest and Contest Questions Endpoints
  if (cleanEndpoint === 'admin/contests' || cleanEndpoint === 'contests') {
    if (method === 'POST') {
      const newContest = {
        id: `contest_${Date.now()}`,
        name: body?.name || 'New Contest',
        description: body?.description || '',
        date: body?.date || new Date().toISOString().split('T')[0],
        startTime: body?.startTime || new Date().toISOString(),
        endTime: body?.endTime || new Date(Date.now() + 7200000).toISOString(),
        durationMinutes: Number(body?.durationMinutes) || 120,
        maxParticipants: Number(body?.maxParticipants) || 100,
        status: body?.status || 'DRAFT',
        difficultyRange: body?.difficultyRange || [1, 10],
        questionIds: Array.isArray(body?.questionIds) ? body.questionIds : ['q_1', 'q_2', 'q_3', 'q_4', 'q_5'],
        questionCount: Array.isArray(body?.questionIds) ? body.questionIds.length : (Number(body?.questionCount) || 5),
        kotlinOnly: true,
        scoringConfig: body?.scoringConfig || { difficultyWeights: { 1: 10, 2: 20, 3: 35, 4: 55, 5: 80, 6: 110, 7: 150, 8: 200, 9: 260, 10: 330 }, attemptPenalty: 2, skipImpact: 5, tieBreaker: 'TOTAL_TIME_ASC' },
        attemptRules: body?.attemptRules || 'Standard attempt rules',
        skipRules: body?.skipRules || 'Standard skip rules',
        leaderboardVisible: body?.leaderboardVisible !== false,
        autoStart: body?.autoStart !== false,
        autoEnd: body?.autoEnd !== false,
        sessionPolicy: body?.sessionPolicy || 'STRICT_SINGLE_SESSION',
        singleActiveSession: true,
        codeExecutionLimits: body?.codeExecutionLimits || { cpuLimitSec: 5, memoryLimitMb: 256, maxCodeSizeKb: 10, networkDisabled: true, readOnlyFs: true },
        createdBy: 'Admin Director',
        createdAt: new Date().toISOString(),
        participantsCount: 0,
        assignedFacultyIds: Array.isArray(body?.assignedFacultyIds) ? body.assignedFacultyIds : [],
        assignedFaculty: Array.isArray(body?.assignedFacultyIds)
          ? mockUsers
              .filter((u) => body.assignedFacultyIds.includes(u.id) && (u.role === 'FACULTY' || u.role === 'ADMIN'))
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                department: u.department || 'Computer Science & Engineering',
                employeeId: u.employeeId || `FAC-${u.id.replace('usr_fac_', '')}`,
              }))
          : [],
      };
      mockContests.push(newContest);
      return { success: true, message: 'Contest created successfully', data: newContest };
    }
    return { success: true, count: mockContests.length, data: mockContests };
  }

  if (cleanEndpoint.startsWith('admin/contests/') || cleanEndpoint.startsWith('contests/')) {
    const parts = cleanEndpoint.replace(/^admin\//, '').split('/');
    const contestId = parts[1];
    const subRoute = parts[2];
    const subId = parts[3];

    const contest = mockContests.find((c) => c.id === contestId) || mockContests[0];

    // Contest Questions
    if (subRoute === 'questions') {
      if (!contest.questionIds) contest.questionIds = ['q_1', 'q_2', 'q_3', 'q_4', 'q_5'];

      // DELETE question from contest
      if (method === 'DELETE' && subId) {
        contest.questionIds = contest.questionIds.filter((id: string) => id !== subId);
        contest.questionCount = contest.questionIds.length;
        return { success: true, message: 'Question removed from contest', contest };
      }

      // PUT update question
      if (method === 'PUT' && subId) {
        const question = mockQuestions.find((q) => q.id === subId);
        if (question && body) {
          Object.assign(question, body);
          if (body.tags && typeof body.tags === 'string') {
            question.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        }
        return { success: true, message: `Question updated successfully`, data: question || body };
      }

      // POST add questions to contest
      if (method === 'POST') {
        if (Array.isArray(body?.questionIds)) {
          body.questionIds.forEach((id: string) => {
            if (!contest.questionIds.includes(id)) contest.questionIds.push(id);
          });
          contest.questionCount = contest.questionIds.length;
          const attached = contest.questionIds.map((id: string) => mockQuestions.find((q) => q.id === id)).filter(Boolean);
          return { success: true, message: `Added ${body.questionIds.length} question(s) to contest`, data: attached, contest };
        }
        if (body?.questionId) {
          if (!contest.questionIds.includes(body.questionId)) contest.questionIds.push(body.questionId);
          contest.questionCount = contest.questionIds.length;
          const attached = mockQuestions.find((q) => q.id === body.questionId);
          return { success: true, message: 'Question attached to contest', data: attached, contest };
        }
        if (body?.title && body?.problemStatement) {
          const newQ = {
            id: `q_${Date.now()}`,
            title: body.title,
            difficulty: Number(body.difficulty) || 1,
            category: body.category || 'Algorithms',
            tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((s: string) => s.trim()) : ['kotlin', 'contest']),
            problemStatement: body.problemStatement,
            functionSignature: body.functionSignature || 'fun solve(): Unit',
            starterCode: body.starterCode || 'class Solution {\n    // Write your solution here\n}',
            expectedInput: body.expectedInput || '',
            expectedOutput: body.expectedOutput || '',
            constraints: body.constraints || 'Standard contest constraints apply.',
            sampleInput: body.sampleInput || '',
            sampleOutput: body.sampleOutput || '',
            explanation: body.explanation || '',
            visibleTestCasesCount: Number(body.visibleTestCasesCount) || 2,
            hiddenTestCasesCount: Number(body.hiddenTestCasesCount) || 4,
            successRate: 0,
            averageTimeMinutes: 0,
            skipRate: 0,
            attemptsCount: 0,
            solvesCount: 0,
            status: body.status || 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          mockQuestions.push(newQ);
          contest.questionIds.push(newQ.id);
          contest.questionCount = contest.questionIds.length;
          return { success: true, message: `Question "${newQ.title}" created and attached to contest!`, data: newQ, contest };
        }
      }

      // GET contest questions
      const assigned = contest.questionIds.map((id: string) => mockQuestions.find((q) => q.id === id)).filter(Boolean);
      return {
        success: true,
        count: assigned.length,
        data: assigned,
        contest: {
          id: contest.id,
          name: contest.name,
          status: contest.status,
          difficultyRange: contest.difficultyRange,
          durationMinutes: contest.durationMinutes,
          date: contest.date,
          questionCount: assigned.length,
        }
      };
    }

    // Assign Faculty to Contest Endpoint
    if (subRoute === 'assign-faculty') {
      let facultyIds: string[] = [];
      if (Array.isArray(body?.facultyIds)) {
        facultyIds = body.facultyIds;
      } else if (body?.facultyId) {
        facultyIds = [body.facultyId];
      }
      contest.assignedFacultyIds = facultyIds;
      contest.assignedFaculty = mockUsers
        .filter((u) => facultyIds.includes(u.id) && (u.role === 'FACULTY' || u.role === 'ADMIN'))
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department || 'Computer Science & Engineering',
          employeeId: u.employeeId || `FAC-${u.id.replace('usr_fac_', '')}`,
        }));

      const facultyNames = contest.assignedFaculty.map((f: any) => f.name).join(', ') || 'None';
      mockAuditLogs.unshift({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'usr_admin_1',
        userName: 'Admin Director',
        role: 'ADMIN',
        action: 'FACULTY_ASSIGNED_CONTEST',
        details: `Assigned faculty [${facultyNames}] to contest: ${contest.name}`,
        ipAddress: '127.0.0.1',
        sessionId: 'sess_admin_master',
        result: 'SUCCESS',
      });

      return {
        success: true,
        message: `Faculty supervisors updated for "${contest.name}"`,
        data: {
          contestId: contest.id,
          assignedFacultyIds: contest.assignedFacultyIds,
          assignedFaculty: contest.assignedFaculty,
        },
      };
    }

    // Publish & Unpublish Endpoints
    if (subRoute === 'publish') {
      contest.isPublished = true;
      if (contest.status === 'DRAFT') contest.status = 'SCHEDULED';
      return { success: true, message: `Contest "${contest.name}" published successfully`, data: contest };
    }
    if (subRoute === 'unpublish') {
      contest.isPublished = false;
      if (contest.status === 'SCHEDULED') contest.status = 'DRAFT';
      return { success: true, message: `Contest "${contest.name}" unpublished and returned to draft`, data: contest };
    }

    // Lifecycle Actions
    if (subRoute === 'start') {
      contest.status = 'ACTIVE';
      return { success: true, message: `Contest ${contest.name} started`, data: contest };
    }
    if (subRoute === 'pause') {
      contest.status = 'PAUSED';
      return { success: true, message: `Contest ${contest.name} paused`, data: contest };
    }
    if (subRoute === 'resume') {
      contest.status = 'ACTIVE';
      return { success: true, message: `Contest ${contest.name} resumed`, data: contest };
    }
    if (subRoute === 'end') {
      contest.status = 'ENDED';
      return { success: true, message: `Contest ${contest.name} ended`, data: contest };
    }
    if (subRoute === 'cancel') {
      contest.status = 'CANCELLED';
      return { success: true, message: `Contest ${contest.name} cancelled`, data: contest };
    }
    if (subRoute === 'duplicate') {
      const copy = { ...contest, id: `contest_${Date.now()}`, name: `${contest.name} (Copy)`, status: 'DRAFT' };
      mockContests.push(copy);
      return { success: true, message: 'Contest duplicated', data: copy };
    }

    if (method === 'PUT') {
      Object.assign(contest, body);
      if (Array.isArray(body?.assignedFacultyIds)) {
        contest.assignedFacultyIds = body.assignedFacultyIds;
        contest.assignedFaculty = mockUsers
          .filter((u) => body.assignedFacultyIds.includes(u.id) && (u.role === 'FACULTY' || u.role === 'ADMIN'))
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            department: u.department || 'Computer Science & Engineering',
            employeeId: u.employeeId || `FAC-${u.id.replace('usr_fac_', '')}`,
          }));
      }
      if (Array.isArray(contest.questionIds)) contest.questionCount = contest.questionIds.length;
      return { success: true, message: 'Contest updated successfully', data: contest };
    }

    if (method === 'DELETE') {
      mockContests = mockContests.filter((c) => c.id !== contestId);
      return { success: true, message: 'Contest deleted successfully' };
    }

    return { success: true, data: contest };
  }

  // Default catch-all success response for actions (POST/PUT/PATCH/DELETE)
  return {
    success: true,
    message: 'Operation executed successfully (Simulation Engine Active)',
    data: body || { id: `item_${Date.now()}` }
  };
}
