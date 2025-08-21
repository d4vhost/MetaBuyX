// src/services/userService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
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
  CreateTeamGoal 
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

// Servicios para metas individuales
export const goalService = {
  // Crear nueva meta individual
  async createIndividualGoal(userId: string, goalData: CreateIndividualGoal): Promise<string> {
    const goalsRef = collection(db, 'individualGoals');
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      userId,
      savedAmount: 0,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Actualizar contador de metas activas
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activeGoals: increment(1)
    });
    
    return docRef.id;
  },

  // Obtener metas individuales del usuario
  async getUserIndividualGoals(userId: string): Promise<IndividualGoal[]> {
    const goalsRef = collection(db, 'individualGoals');
    const q = query(goalsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IndividualGoal[];
  },

  // Agregar ahorro a una meta individual
  async addSavingToGoal(goalId: string, amount: number): Promise<void> {
    const goalRef = doc(db, 'individualGoals', goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const goalData = goalSnap.data() as IndividualGoal;
      const newSavedAmount = goalData.savedAmount + amount;
      const isCompleted = newSavedAmount >= goalData.targetAmount;
      
      await updateDoc(goalRef, {
        savedAmount: newSavedAmount,
        isCompleted,
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar total de ahorros del usuario
      const userRef = doc(db, 'users', goalData.userId);
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
  }
};

// Servicios para metas en equipo
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
    const q = query(teamGoalsRef, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamGoal[];
  },

  // Unirse a una meta en equipo
  async joinTeamGoal(goalId: string, userId: string): Promise<void> {
    const goalRef = doc(db, 'teamGoals', goalId);
    await updateDoc(goalRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
    
    // Actualizar las contribuciones del nuevo miembro
    const goalSnap = await getDoc(goalRef);
    if (goalSnap.exists()) {
      await updateDoc(goalRef, {
        [`memberContributions.${userId}`]: 0,
      });
    }
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

// Servicios para lista rápida
export const quickListService = {
  // Crear item en lista rápida
  async createQuickListItem(userId: string, text: string, price: number): Promise<string> {
    const quickListRef = collection(db, 'quickListItems');
    const docRef = await addDoc(quickListRef, {
      userId,
      text,
      price,
      completed: false,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  },

  // Obtener items de lista rápida del usuario
  async getUserQuickListItems(userId: string): Promise<QuickListItem[]> {
    const quickListRef = collection(db, 'quickListItems');
    const q = query(quickListRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QuickListItem[];
  },

  // Marcar item como completado/no completado
  async toggleQuickListItem(itemId: string): Promise<void> {
    const itemRef = doc(db, 'quickListItems', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const itemData = itemSnap.data();
      await updateDoc(itemRef, {
        completed: !itemData.completed
      });
    }
  },

  // Eliminar item de lista rápida
  async deleteQuickListItem(itemId: string): Promise<void> {
    const itemRef = doc(db, 'quickListItems', itemId);
    await deleteDoc(itemRef);
  }
};