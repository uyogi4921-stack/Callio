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
    title: "Complete Hackathon Presentation",
    description: "Finalize slides and demo flow for the hackathon pitch.",
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
    title: "Team Standup Meeting",
    description: "Daily sync with the team on progress and blockers.",
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
    title: "Submit Project Report",
    description: "Write and submit the weekly project progress report.",
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
    title: "Call David about feedback",
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
    title: "Gym session",
    description: "Evening workout at the gym.",
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
      "Hey! I noticed the \"Complete Hackathon Presentation\" task is overdue. Last time we spoke, you were waiting on the demo recording. Is that ready now?",
    timestamp: "09:12 AM",
  },
  {
    id: "2",
    taskId: "1",
    sender: "user",
    message:
      "Not yet, the demo had a bug. I fixed it but still need to re-record. Might need another hour.",
    timestamp: "09:14 AM",
  },
  {
    id: "3",
    taskId: "1",
    sender: "ai",
    message:
      "Got it. The pitch is tomorrow morning, so time is tight. Want me to remind you in 1 hour to start the recording? We can use the existing screenshots as backup slides if needed.",
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
