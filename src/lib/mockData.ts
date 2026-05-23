export type TaskStatus = "pending" | "in_progress" | "done" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskSource = "voice" | "text" | "ai_extracted";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string;
  dueTime: string;
  completedAt?: string;
  source: TaskSource;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood?: string | null;
  source: "voice" | "text";
  readTime: string;
  createdAt: string;
  date: string;
}

export interface AccountabilityLog {
  id: string;
  taskId: string;
  sender: "ai" | "user";
  message: string;
  timestamp: string;
}

export const mockUser = {
  id: "1",
  name: "Alex",
  fullName: "Alex Rivers",
  email: "alex@example.com",
  avatarUrl: "/avatar.jpg",
  plan: "pro" as const,
  accountabilityScore: 98,
};

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Q3 Financial Audit",
    description:
      "Finalize the comprehensive review of internal expenditure and revenue streams for executive board presentation.",
    status: "overdue",
    priority: "urgent",
    category: "Deep Work",
    dueDate: "2024-10-24",
    dueTime: "2:00 PM",
    source: "voice",
    createdAt: "2024-10-20T09:00:00Z",
  },
  {
    id: "2",
    title: "Client Strategy Meeting",
    description: "Prepare and attend the quarterly client strategy review.",
    status: "pending",
    priority: "high",
    category: "Quick Action",
    dueDate: "2024-10-23",
    dueTime: "10:00 AM",
    source: "voice",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "3",
    title: "System Architecture Review",
    description: "Review the updated system architecture with the engineering team.",
    status: "pending",
    priority: "medium",
    category: "Deep Work",
    dueDate: "2024-10-23",
    dueTime: "2:30 PM",
    source: "text",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "4",
    title: "Draft Annual Budget",
    description: "Create initial draft of annual budget for CFO review.",
    status: "pending",
    priority: "medium",
    category: "Deep Work",
    dueDate: "2024-10-23",
    dueTime: "4:00 PM",
    source: "ai_extracted",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "5",
    title: "Morning Focus Session",
    description: "Complete the morning deep work block.",
    status: "done",
    priority: "medium",
    category: "Personal",
    dueDate: "2024-10-23",
    dueTime: "9:00 AM",
    completedAt: "2024-10-23T09:30:00Z",
    source: "voice",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "6",
    title: "Morning Sync with DevOps",
    description: "Daily standup with the DevOps team.",
    status: "done",
    priority: "low",
    category: "Quick Action",
    dueDate: "2024-10-23",
    dueTime: "8:30 AM",
    completedAt: "2024-10-23T08:45:00Z",
    source: "text",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "7",
    title: "Inbox Zero Sweep",
    description: "Clear and organize email inbox.",
    status: "pending",
    priority: "low",
    category: "Quick Action",
    dueDate: "2024-10-23",
    dueTime: "4:00 PM",
    source: "ai_extracted",
    createdAt: "2024-10-22T08:00:00Z",
  },
  {
    id: "8",
    title: "Call David regarding client feedback loop",
    description: "Follow up on the client feedback discussion from last meeting.",
    status: "pending",
    priority: "high",
    category: "Quick Action",
    dueDate: "2024-10-23",
    dueTime: "3:00 PM",
    source: "voice",
    createdAt: "2024-10-23T07:00:00Z",
  },
  {
    id: "9",
    title: "Pick up architectural magazines",
    description: "Pick up architectural magazines for the moodboard.",
    status: "pending",
    priority: "low",
    category: "Personal",
    dueDate: "2024-10-23",
    dueTime: "6:00 PM",
    source: "voice",
    createdAt: "2024-10-23T07:00:00Z",
  },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: "1",
    title: "Reflection for Monday",
    content:
      "Started the week with a sense of clarity. The deep work session this morning felt effortless. I need to maintain this rhythm...",
    tags: ["focus", "morning"],
    mood: "motivated",
    source: "voice",
    readTime: "4 min read",
    createdAt: "2024-10-23T08:45:00Z",
    date: "Today",
  },
  {
    id: "2",
    title: "Why I struggled today",
    content:
      "Environmental noise peaked around 2 PM. My flow state was broken three times in an hour. Next time, I must utilize the isolation chamber or white noise earlier...",
    tags: ["obstacle"],
    mood: "struggling",
    source: "text",
    readTime: "12 min read",
    createdAt: "2024-10-22T18:00:00Z",
    date: "Yesterday",
  },
  {
    id: "3",
    title: "The quiet power of saying no",
    content:
      "Declining that extra meeting freed up 90 minutes of uninterrupted time...",
    tags: ["habit", "clarity"],
    mood: "motivated",
    source: "voice",
    readTime: "5 min read",
    createdAt: "2024-10-21T20:00:00Z",
    date: "Oct 24",
  },
  {
    id: "4",
    title: "Reflection on Friction and Focus",
    content:
      "Today I noticed a recurring resistance when moving from deep work to administrative tasks. The mental gear shift felt unusually heavy. I need to investigate if this is a scheduling issue or an underlying fatigue fro...",
    tags: ["focus", "strategy"],
    mood: "neutral",
    source: "text",
    readTime: "4 min read",
    createdAt: "2024-10-23T09:00:00Z",
    date: "Monday, Oct 23",
  },
  {
    id: "5",
    title: "Quarterly review: Growth & Friction",
    content:
      "Looking back at the past quarter, there were clear patterns of productivity cycles...",
    tags: ["growth", "future"],
    mood: "motivated",
    source: "text",
    readTime: "20 min read",
    createdAt: "2024-10-20T14:00:00Z",
    date: "Oct 20",
  },
];

export const mockAccountabilityChat: AccountabilityLog[] = [
  {
    id: "1",
    taskId: "1",
    sender: "ai",
    message:
      "Greetings. I've noted that the \"Q3 Financial Audit\" task is now 24 hours overdue. According to our last session, you mentioned needing the budget figures from Sarah before finalizing. Have those been received?",
    timestamp: "09:12 AM",
  },
  {
    id: "2",
    taskId: "1",
    sender: "user",
    message:
      "No, Sarah hasn't sent them yet. I'm stuck until I get those numbers. I might need to push the deadline again.",
    timestamp: "09:14 AM",
  },
  {
    id: "3",
    taskId: "1",
    sender: "ai",
    message:
      "Understood. However, delaying this proposal will impact the Q4 roadmap. Shall I draft a nudge email to Sarah, or would you like to use the estimated figures we discussed on Monday to complete a preliminary draft now?",
    timestamp: "09:15 AM",
  },
];

export const mockAccountabilityHistory = [
  {
    type: "sms",
    title: "SMS Reminder",
    description: '"Alex, you have 2 hours to submit the draft."',
    time: "09:00 AM Today",
  },
  {
    type: "call",
    title: "AI Voice Check-in",
    description: "Callio AI called to discuss focus roadblocks.",
    time: "11:15 AM Today",
  },
  {
    type: "lockout",
    title: "Browser Lockout",
    description: "Entertainment sites restricted per Focus Protocol.",
    time: "Yesterday",
  },
];
