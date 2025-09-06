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
  increment,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { 
  TeamGoal,
  TeamInvitation,
  CreateTeamGoal,
  TeamMember
} from '../types/team';

// Servicios para metas de equipo
export const teamService = {
  // Crear nueva meta de equipo
  async createTeamGoal(creatorId: string, goalData: CreateTeamGoal): Promise<string> {
    const teamGoalsRef = collection(db, 'teamGoals');
    
    // Obtener todos los miembros del equipo del usuario
    const teamMembers = await this.getTeamMembers(creatorId);
    const allMemberIds = [creatorId, ...teamMembers.map(member => member.uid)];
    
    // Crear contributions object para todos los miembros
    const memberContributions: { [key: string]: number } = {};
    allMemberIds.forEach(memberId => {
      memberContributions[memberId] = 0;
    });

    const docRef = await addDoc(teamGoalsRef, {
      ...goalData,
      createdBy: creatorId,
      members: allMemberIds,
      memberContributions,
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
    
    const goals: TeamGoal[] = [];
    for (const docSnap of querySnapshot.docs) {
      const goalData = { id: docSnap.id, ...docSnap.data() } as TeamGoal;
      
      // Obtener información de los miembros
      const membersInfo = await this.getGoalMembers(goalData.members);
      goals.push({
        ...goalData,
        membersInfo
      });
    }
    
    return goals;
  },

  // Obtener información de los miembros de una meta
  async getGoalMembers(memberIds: string[]): Promise<TeamMember[]> {
    const members: TeamMember[] = [];
    
    for (const memberId of memberIds) {
      try {
        const userRef = doc(db, 'users', memberId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          members.push({
            uid: memberId,
            email: userData.email || '',
            displayName: userData.displayName || userData.email?.split('@')[0] || 'Usuario',
            photoURL: userData.photoURL,
            joinedAt: userData.createdAt || serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error obteniendo info del miembro:', error);
      }
    }
    
    return members;
  },

  // Obtener miembros del equipo de un usuario
  async getTeamMembers(userId: string): Promise<TeamMember[]> {
    const teamMembersRef = collection(db, 'teamMembers');
    
    // Buscar relaciones donde el usuario es userId1 o userId2
    const q1 = query(teamMembersRef, where('userId1', '==', userId));
    const q2 = query(teamMembersRef, where('userId2', '==', userId));
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const memberIds = new Set<string>();
    
    snapshot1.docs.forEach(doc => {
      const data = doc.data();
      memberIds.add(data.userId2);
    });
    
    snapshot2.docs.forEach(doc => {
      const data = doc.data();
      memberIds.add(data.userId1);
    });
    
    // Obtener información de cada miembro
    const members: TeamMember[] = [];
    for (const memberId of memberIds) {
      const userRef = doc(db, 'users', memberId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        members.push({
          uid: memberId,
          email: userData.email || '',
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Usuario',
          photoURL: userData.photoURL,
          joinedAt: userData.createdAt || serverTimestamp()
        });
      }
    }
    
    return members;
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

  // Agregar miembro a todas las metas existentes cuando se forma un equipo
  async addMemberToAllTeamGoals(existingUserId: string, newUserId: string): Promise<void> {
    // Obtener todas las metas del usuario existente
    const existingUserGoals = await this.getUserTeamGoals(existingUserId);
    
    const batch = writeBatch(db);
    
    for (const goal of existingUserGoals) {
      if (!goal.members.includes(newUserId)) {
        const goalRef = doc(db, 'teamGoals', goal.id);
        batch.update(goalRef, {
          members: arrayUnion(newUserId),
          [`memberContributions.${newUserId}`]: 0,
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    // También obtener metas del nuevo usuario para agregarlas al usuario existente
    const newUserGoals = await this.getUserTeamGoals(newUserId);
    
    for (const goal of newUserGoals) {
      if (!goal.members.includes(existingUserId)) {
        const goalRef = doc(db, 'teamGoals', goal.id);
        batch.update(goalRef, {
          members: arrayUnion(existingUserId),
          [`memberContributions.${existingUserId}`]: 0,
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    await batch.commit();
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
      
      // Usar batch para operaciones atómicas
      const batch = writeBatch(db);
      
      // Actualizar estado de la invitación
      batch.update(invitationRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });
      
      // Crear relación de equipo
      const teamMembersRef = collection(db, 'teamMembers');
      const teamMemberDocRef = doc(teamMembersRef);
      batch.set(teamMemberDocRef, {
        userId1: invitationData.fromUserId,
        userId2: userId,
        createdAt: serverTimestamp(),
      });
      
      await batch.commit();
      
      // Agregar miembros a todas las metas existentes
      await teamService.addMemberToAllTeamGoals(invitationData.fromUserId, userId);
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