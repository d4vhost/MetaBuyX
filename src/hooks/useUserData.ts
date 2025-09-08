// src/hooks/useUserData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  userService, 
  goalService, 
  teamGoalService, 
  quickListService
} from '../services/userService';
import type { 
  UserProfile,
  IndividualGoal,
  TeamGoal,
  QuickListItem,
  CreateIndividualGoal,
  CreateTeamGoal,
  UserStatistics
} from '../types';

export const useUserData = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [individualGoals, setIndividualGoals] = useState<IndividualGoal[]>([]);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [quickListItems, setQuickListItems] = useState<QuickListItem[]>([]);

  // Usar useCallback para evitar recrear la función en cada render
  const loadUserData = useCallback(async (): Promise<void> => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Crear o actualizar perfil de usuario
      await userService.createOrUpdateProfile(currentUser);
      
      // Cargar datos en paralelo
      const [profile, goals, teamGoals, quickList] = await Promise.all([
        userService.getUserProfile(currentUser.uid),
        goalService.getUserIndividualGoals(currentUser.uid),
        teamGoalService.getUserTeamGoals(currentUser.uid),
        quickListService.getUserQuickListItems(currentUser.uid)
      ]);

      setUserProfile(profile);
      setIndividualGoals(goals);
      setTeamGoals(teamGoals);
      setQuickListItems(quickList);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Recargar datos cuando cambie el usuario
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Funciones para manejar metas individuales
  const addIndividualGoal = useCallback(async (goalData: CreateIndividualGoal): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await goalService.createIndividualGoal(currentUser.uid, goalData);
      await loadUserData();
    } catch (error) {
      console.error('Error creating individual goal:', error);
    }
  }, [currentUser, loadUserData]);

  const addSavingToGoal = useCallback(async (goalId: string, amount: number): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await goalService.addSavingToGoal(currentUser.uid, goalId, amount);
      await loadUserData();
    } catch (error) {
      console.error('Error adding saving to goal:', error);
    }
  }, [currentUser, loadUserData]);

  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await goalService.deleteGoal(currentUser.uid, goalId);
      await loadUserData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }, [currentUser, loadUserData]);

  // Funciones para metas en equipo
  const createTeamGoal = useCallback(async (goalData: CreateTeamGoal): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await teamGoalService.createTeamGoal(currentUser.uid, goalData);
      await loadUserData();
    } catch (error) {
      console.error('Error creating team goal:', error);
    }
  }, [currentUser, loadUserData]);

  const contributeToTeamGoal = useCallback(async (goalId: string, amount: number): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await teamGoalService.contributeToTeamGoal(goalId, currentUser.uid, amount);
      await loadUserData();
    } catch (error) {
      console.error('Error contributing to team goal:', error);
    }
  }, [currentUser, loadUserData]);

  // Funciones para lista rápida
  const addQuickListItem = useCallback(async (text: string, price: number): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await quickListService.createQuickListItem(currentUser.uid, { text, price });
      await loadUserData();
    } catch (error) {
      console.error('Error creating quick list item:', error);
    }
  }, [currentUser, loadUserData]);

  const toggleQuickListItem = useCallback(async (itemId: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await quickListService.toggleQuickListItem(currentUser.uid, itemId);
      await loadUserData();
    } catch (error) {
      console.error('Error toggling quick list item:', error);
    }
  }, [currentUser, loadUserData]);

  const updateQuickListItem = useCallback(async (itemId: string, newText: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await quickListService.updateQuickListItem(currentUser.uid, itemId, newText);
      await loadUserData();
    } catch (error) {
      console.error('Error updating quick list item:', error);
      throw error;
    }
  }, [currentUser, loadUserData]);

  const deleteQuickListItem = useCallback(async (itemId: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await quickListService.deleteQuickListItem(currentUser.uid, itemId);
      await loadUserData();
    } catch (error) {
      console.error('Error deleting quick list item:', error);
    }
  }, [currentUser, loadUserData]);

  // Calcular estadísticas
  const statistics: UserStatistics = {
    totalSavings: userProfile?.totalSavings || 0,
    activeGoals: individualGoals.filter(goal => !goal.isCompleted).length,
    averageProgress: individualGoals.length > 0 
      ? Math.round(individualGoals.reduce((acc, goal) => acc + (goal.savedAmount / goal.targetAmount * 100), 0) / individualGoals.length)
      : 0
  };

  return {
    loading,
    userProfile,
    individualGoals,
    teamGoals,
    quickListItems,
    statistics,
    // Funciones
    loadUserData,
    addIndividualGoal,
    addSavingToGoal,
    deleteGoal,
    createTeamGoal,
    contributeToTeamGoal,
    addQuickListItem,
    toggleQuickListItem,
    updateQuickListItem, // Nueva función agregada
    deleteQuickListItem
  };
};