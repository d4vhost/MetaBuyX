// src/types/team.ts
import { Timestamp } from 'firebase/firestore';

export interface TeamGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  createdBy: string;
  members: string[];
  memberContributions: { [userId: string]: number };
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  isCompleted: boolean;
  membersInfo?: TeamMember[]; // Información detallada de los miembros
}

export interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  joinedAt: Timestamp;
}

export interface TeamInvitation {
  id: string;
  fromUserId: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
}

export type CreateTeamGoal = Omit<TeamGoal, 'id' | 'createdBy' | 'members' | 'memberContributions' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'savedAmount' | 'membersInfo'>;

export type CreateTeamInvitation = Omit<TeamInvitation, 'id' | 'status' | 'createdAt' | 'acceptedAt'>;