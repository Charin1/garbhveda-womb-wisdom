export enum AppTab {
  HOME = 'HOME',     // Daily Rhythm
  LEARN = 'LEARN',   // Math & Art (Brain)
  CONNECT = 'CONNECT', // Bonding & Kicks (Heart)
  SOUL = 'SOUL'      // Spirituality (Soul)
}

export enum Mood {
  HAPPY = 'HAPPY',
  CALM = 'CALM',
  TIRED = 'TIRED',
  ANXIOUS = 'ANXIOUS',
  ENERGETIC = 'ENERGETIC'
}

export enum ActivityCategory {
  MATH = 'MATH',
  ART = 'ART',
  MUSIC = 'MUSIC',
  SPIRITUALITY = 'SPIRITUALITY',
  DRAWING = 'DRAWING',
  YOGA = 'YOGA',
  BONDING = 'BONDING',
  STORY = 'STORY'
}

export interface Resource {
  title: string;
  url: string;
  description: string;
}

export interface Activity {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  durationMinutes: number;
  content: string;
  visualPrompt?: string;
  audioPrompt?: string;
  solution?: string; // For Math puzzles
  tags: string[];
  isCompleted: boolean;
  completedAt?: string;
  resources: Resource[];
}

export interface DailyCurriculum {
  sankalpa: {
    virtue: string;
    description: string;
    mantra: string;
  };
  activities: Activity[];
}

export interface Dream {
  id: string;
  date: string;
  content: string;
  interpretation?: string;
  affirmation?: string;
}

export enum UserRole {
  MOM = 'MOM',
  DAD = 'DAD'
}

export interface PromiseRecord {
  id: string;
  date: string;
  title: string;
  audioBlob?: Blob; // Stored in IndexedDB, reference kept here if needed or just ID
}

export interface PitraVaniRecord {
  id: string;
  date: string;
  storyTitle: string;
  audioBlob?: Blob;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  partnerName?: string;
  pregnancyWeek: number;
  kickCount: number;
  lastKickDate: string;
  moodHistory: { date: string; mood: Mood }[];
  dreamJournal: Dream[];
  // Dad Specific
  sevaPoints: number;
  sevaHistory: string[]; // List of completed task IDs
  promises: PromiseRecord[];
  pitraVaniHistory: PitraVaniRecord[];
}

export interface AudioTrack {
  id: string;
  title: string;
  category: 'MANTRA' | 'MEDITATION' | 'LULLABY' | 'INSTRUMENTAL' | 'NATURE' | 'RAGA' | 'STORY';
  description: string;
  text: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'MOM' | 'BABY';
  timestamp: string; // ISO string for storage
}

export interface Memory {
  id: string;
  date: string;
  title: string;
  description: string;
  image?: string;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  partnerName?: string;
  pregnancyWeek: number;
  kickCount: number;
  lastKickDate: string;
  moodHistory: { date: string; mood: Mood }[];
  dreamJournal: Dream[];
  // New Feature Persistence
  chatHistory: Message[];
  scrapbook: Memory[];
  yogaProgress: string[]; // IDs of completed poses
  dietFavorites: string[]; // IDs of favorite recipes
  // Dad Specific
  sevaPoints: number;
  sevaHistory: string[]; // List of completed task IDs
  promises: PromiseRecord[];
  pitraVaniHistory: PitraVaniRecord[];
}