// src/services/userService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { User } from 'firebase/auth';
import type { 
  UserProfile, 
  IndividualGoal, 
  TeamGoal, 
  QuickListItem, 
  CreateIndividualGoal, 
  CreateTeamGoal,
  CreateQuickListItem,
  SubGoal,
  CreateSubGoal,
  IndividualGoalWithSubGoals
} from '../types';

// Servicios para el perfil de usuario
export const userService = {
  // Crear o actualizar perfil de usuario
  async createOrUpdateProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Crear nuevo perfil
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        totalSavings: 0,
        activeGoals: 0,
      });
    } else {
      // Actualizar información básica
      await updateDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        photoURL: user.photoURL,
      });
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  }
};

// Servicios para metas individuales (como subcolección)
export const goalService = {
  // Crear nueva meta individual
  async createIndividualGoal(userId: string, goalData: CreateIndividualGoal): Promise<string> {
    // Crear subcolección 'goals' dentro del documento del usuario
    const goalsRef = collection(db, 'users', userId, 'goals');
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      savedAmount: 0,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Actualizar contador de metas activas en el documento del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activeGoals: increment(1)
    });
    
    return docRef.id;
  },

  // Obtener metas individuales del usuario
  async getUserIndividualGoals(userId: string): Promise<IndividualGoal[]> {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const querySnapshot = await getDocs(goalsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      userId,
      ...doc.data()
    })) as IndividualGoal[];
  },

  // Obtener metas individuales con sus sub-metas
  async getUserIndividualGoalsWithSubGoals(userId: string): Promise<IndividualGoalWithSubGoals[]> {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const querySnapshot = await getDocs(goalsRef);
    
    const goalsWithSubGoals: IndividualGoalWithSubGoals[] = [];
    
    for (const goalDoc of querySnapshot.docs) {
      const goalData = {
        id: goalDoc.id,
        userId,
        ...goalDoc.data()
      } as IndividualGoal;
      
      // Obtener sub-metas de cada meta usando subGoalService directamente
      const subGoals = await subGoalService.getSubGoals(userId, goalDoc.id);
      
      goalsWithSubGoals.push({
        ...goalData,
        subGoals
      });
    }
    
    return goalsWithSubGoals;
  },

  // Agregar ahorro a una meta individual
  async addSavingToGoal(userId: string, goalId: string, amount: number): Promise<void> {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const goalData = goalSnap.data() as Omit<IndividualGoal, 'id' | 'userId'>;
      const newSavedAmount = goalData.savedAmount + amount;
      const isCompleted = newSavedAmount >= goalData.targetAmount;
      
      await updateDoc(goalRef, {
        savedAmount: newSavedAmount,
        isCompleted,
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar total de ahorros del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalSavings: increment(amount)
      });
      
      // Si se completó la meta, decrementar metas activas
      if (isCompleted && !goalData.isCompleted) {
        await updateDoc(userRef, {
          activeGoals: increment(-1)
        });
      }
    }
  },

  // Eliminar una meta
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const goalData = goalSnap.data();
      
      // Eliminar todas las sub-metas primero
      const subGoalsRef = collection(db, 'users', userId, 'goals', goalId, 'subGoals');
      const subGoalsSnap = await getDocs(subGoalsRef);
      
      for (const subGoalDoc of subGoalsSnap.docs) {
        await deleteDoc(subGoalDoc.ref);
      }
      
      // Luego eliminar la meta principal
      await deleteDoc(goalRef);
      
      // Si no estaba completada, decrementar metas activas
      if (!goalData.isCompleted) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          activeGoals: increment(-1)
        });
      }
    }
  }
};

// Servicios para sub-metas
export const subGoalService = {
  // Crear nueva sub-meta
  async createSubGoal(userId: string, goalId: string, subGoalData: CreateSubGoal): Promise<string> {
    const subGoalsRef = collection(db, 'users', userId, 'goals', goalId, 'subGoals');
    const docRef = await addDoc(subGoalsRef, {
      ...subGoalData,
      savedAmount: 0,
      completed: false,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  },

  // Obtener sub-metas de una meta específica
  async getSubGoals(userId: string, goalId: string): Promise<SubGoal[]> {
    const subGoalsRef = collection(db, 'users', userId, 'goals', goalId, 'subGoals');
    const querySnapshot = await getDocs(subGoalsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      goalId,
      ...doc.data()
    })) as SubGoal[];
  },

  // Agregar ahorro a una sub-meta
  async addSavingToSubGoal(userId: string, goalId: string, subGoalId: string, amount: number): Promise<void> {
    const subGoalRef = doc(db, 'users', userId, 'goals', goalId, 'subGoals', subGoalId);
    const subGoalSnap = await getDoc(subGoalRef);
    
    if (subGoalSnap.exists()) {
      const subGoalData = subGoalSnap.data() as Omit<SubGoal, 'id' | 'goalId'>;
      const newSavedAmount = subGoalData.savedAmount + amount;
      const isCompleted = newSavedAmount >= subGoalData.amount;
      
      await updateDoc(subGoalRef, {
        savedAmount: newSavedAmount,
        completed: isCompleted,
      });
      
      // También actualizar la meta principal
      await goalService.addSavingToGoal(userId, goalId, amount);
    }
  },

  // Eliminar sub-meta
  async deleteSubGoal(userId: string, goalId: string, subGoalId: string): Promise<void> {
    const subGoalRef = doc(db, 'users', userId, 'goals', goalId, 'subGoals', subGoalId);
    await deleteDoc(subGoalRef);
  },

  // Actualizar sub-meta
  async updateSubGoal(userId: string, goalId: string, subGoalId: string, updates: Partial<SubGoal>): Promise<void> {
    const subGoalRef = doc(db, 'users', userId, 'goals', goalId, 'subGoals', subGoalId);
    await updateDoc(subGoalRef, updates);
  }
};



// Servicios para metas en equipo (mantener como colección raíz ya que involucran múltiples usuarios)
export const teamGoalService = {
  // Crear nueva meta en equipo
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

  // Obtener metas en equipo del usuario
  async getUserTeamGoals(userId: string): Promise<TeamGoal[]> {
    const teamGoalsRef = collection(db, 'teamGoals');
    // Necesitamos consultar todas las metas de equipo y filtrar en cliente
    // o crear un índice compuesto para esta consulta
    const querySnapshot = await getDocs(teamGoalsRef);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as TeamGoal)
      .filter(goal => goal.members.includes(userId));
  },

  // Aportar a una meta en equipo
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
  }
};

// Servicios para lista rápida (como subcolección 'items')
export const quickListService = {
  // Crear item en lista rápida
  async createQuickListItem(userId: string, itemData: CreateQuickListItem): Promise<string> {
    // Crear subcolección 'items' dentro del documento del usuario
    const itemsRef = collection(db, 'users', userId, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      completed: false,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  },

  // Obtener items de lista rápida del usuario
  async getUserQuickListItems(userId: string): Promise<QuickListItem[]> {
    const itemsRef = collection(db, 'users', userId, 'items');
    const querySnapshot = await getDocs(itemsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      userId,
      ...doc.data()
    })) as QuickListItem[];
  },

  // Marcar item como completado/no completado
  async toggleQuickListItem(userId: string, itemId: string): Promise<void> {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const itemData = itemSnap.data();
      await updateDoc(itemRef, {
        completed: !itemData.completed
      });
    }
  },

  // Eliminar item de lista rápida
  async deleteQuickListItem(userId: string, itemId: string): Promise<void> {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
    await deleteDoc(itemRef);
  }
};