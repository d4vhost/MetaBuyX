// src/types/index.ts
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp | null;
  totalSavings: number;
  activeGoals: number;
}

export interface IndividualGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  category: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  isCompleted: boolean;
}

export interface TeamGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  category: string;
  createdBy: string;
  members: string[];
  memberContributions: { [userId: string]: number };
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  isCompleted: boolean;
}

export interface QuickListItem {
  id: string;
  userId: string;
  text: string;
  price: number;
  completed: boolean;
  createdAt: Timestamp | null;
}

// Tipos para crear nuevos elementos
export type CreateIndividualGoal = Omit<IndividualGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'savedAmount'>;
export type CreateTeamGoal = Omit<TeamGoal, 'id' | 'createdBy' | 'members' | 'memberContributions' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'savedAmount'>;
export type CreateQuickListItem = Omit<QuickListItem, 'id' | 'userId' | 'createdAt' | 'completed'>;

// Tipo para estadísticas del usuario
export interface UserStatistics {
  totalSavings: number;
  activeGoals: number;
  averageProgress: number;
}