// src/services/teamService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { 
  TeamGoal,
  TeamInvitation,
  CreateTeamGoal
} from '../types/team';

// Servicios para metas de equipo
export const teamService = {
  // Crear nueva meta de equipo
  async createTeamGoal(creatorId: string, goalData: CreateTeamGoal): Promise<string> {
    const teamGoalsRef = collection(db, 'teamGoals');
    const docRef = await addDoc(teamGoalsRef, {
      ...goalData,
      createdBy: creatorId,
      members: [creatorId],
      memberContributions: { [creatorId]: 0 },
      savedAmount: 0,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  },

  // Obtener metas de equipo del usuario
  async getUserTeamGoals(userId: string): Promise<TeamGoal[]> {
    const teamGoalsRef = collection(db, 'teamGoals');
    const q = query(
      teamGoalsRef,
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamGoal[];
  },

  // Contribuir a una meta de equipo
  async contributeToTeamGoal(goalId: string, userId: string, amount: number): Promise<void> {
    const goalRef = doc(db, 'teamGoals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const goalData = goalSnap.data() as TeamGoal;
      const currentContribution = goalData.memberContributions[userId] || 0;
      const newSavedAmount = goalData.savedAmount + amount;
      const isCompleted = newSavedAmount >= goalData.targetAmount;
      
      await updateDoc(goalRef, {
        savedAmount: newSavedAmount,
        [`memberContributions.${userId}`]: currentContribution + amount,
        isCompleted,
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar total de ahorros del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalSavings: increment(amount)
      });
    }
  },

  // Agregar miembro a meta de equipo
  async addMemberToTeamGoal(goalId: string, userId: string): Promise<void> {
    const goalRef = doc(db, 'teamGoals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const goalData = goalSnap.data() as TeamGoal;
      
      if (!goalData.members.includes(userId)) {
        await updateDoc(goalRef, {
          members: [...goalData.members, userId],
          [`memberContributions.${userId}`]: 0,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }
};

// Servicios para invitaciones de equipo
export const invitationService = {
  // Enviar invitación
  async sendInvitation(fromUserId: string, fromName: string, toEmail: string): Promise<string> {
    const invitationsRef = collection(db, 'teamInvitations');
    
    // Verificar si ya existe una invitación pendiente
    const q = query(
      invitationsRef,
      where('fromUserId', '==', fromUserId),
      where('toEmail', '==', toEmail),
      where('status', '==', 'pending')
    );
    const existingInvitations = await getDocs(q);
    
    if (existingInvitations.docs.length > 0) {
      throw new Error('INVITATION_EXISTS');
    }
    
    // Obtener email del remitente
    const userRef = doc(db, 'users', fromUserId);
    const userSnap = await getDoc(userRef);
    const fromEmail = userSnap.exists() ? userSnap.data().email : '';
    
    const docRef = await addDoc(invitationsRef, {
      fromUserId,
      fromEmail,
      fromName,
      toEmail,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  },

  // Obtener invitaciones de un usuario
  async getUserInvitations(userEmail: string): Promise<TeamInvitation[]> {
    const invitationsRef = collection(db, 'teamInvitations');
    const q = query(
      invitationsRef,
      where('toEmail', '==', userEmail),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamInvitation[];
  },

  // Aceptar invitación
  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const invitationRef = doc(db, 'teamInvitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);
    
    if (invitationSnap.exists()) {
      const invitationData = invitationSnap.data() as TeamInvitation;
      
      // Actualizar estado de la invitación
      await updateDoc(invitationRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });
      
      // Crear una relación de equipo (puedes expandir esto para crear metas automáticamente)
      const teamMembersRef = collection(db, 'teamMembers');
      await addDoc(teamMembersRef, {
        userId1: invitationData.fromUserId,
        userId2: userId,
        createdAt: serverTimestamp(),
      });
    }
  },

  // Rechazar invitación
  async rejectInvitation(invitationId: string): Promise<void> {
    const invitationRef = doc(db, 'teamInvitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'rejected',
    });
  }
};