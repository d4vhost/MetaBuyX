// src/pages/Targets/targets.tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, PlusCircle, Search,
  Loader, Menu, X, Award, Bookmark, User, Edit3,
  Trash2, Target, Calendar, CheckCircle, Plus, ChevronDown, ChevronRight,
  List, Package, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { goalService, subGoalService } from '../../services/userService';
import type { 
  CreateIndividualGoal, 
  CreateSubGoal, 
  IndividualGoalWithSubGoals, 
  SubGoal
} from '../../types';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import {
  CreateGoalModal,
  EditGoalModal,
  CreateSubGoalModal,
  EditSubGoalModal,
  AddSavingModal,
  AddSubSavingModal
} from '../../components/targets/modals';
import './targets.css';

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Targets = () => {
  const { currentUser, logout } = useAuth();
  const { loading, addSavingToGoal } = useUserData();
  
  const refreshUserData = async () => {
    window.location.reload();
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubGoalModal, setShowSubGoalModal] = useState(false);
  const [showAddSavingModal, setShowAddSavingModal] = useState(false);
  const [showAddSubSavingModal, setShowAddSubSavingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSubGoalModal, setShowEditSubGoalModal] = useState(false);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'target'>('newest');
  
  // Estados para navegación de submetas
  const [currentSubGoalIndex, setCurrentSubGoalIndex] = useState<{[goalId: string]: number}>({});
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  
  // Estados de loading y selecciones
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedGoalForSubGoal, setSelectedGoalForSubGoal] = useState<string | null>(null);
  const [selectedGoalForSaving, setSelectedGoalForSaving] = useState<string | null>(null);
  const [selectedSubGoalForSaving, setSelectedSubGoalForSaving] = useState<{ goalId: string; subGoalId: string } | null>(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<IndividualGoalWithSubGoals | null>(null);
  const [selectedSubGoalForEdit, setSelectedSubGoalForEdit] = useState<SubGoal | null>(null);
  
  // Estado principal de metas
  const [goalsWithSubGoals, setGoalsWithSubGoals] = useState<IndividualGoalWithSubGoals[]>([]);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';
  const userAvatar = currentUser?.photoURL || null;

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL, currentUser?.uid]);

  // Cargar metas con sub-metas
  useEffect(() => {
    const loadGoalsWithSubGoals = async () => {
      if (!currentUser) return;
      
      try {
        const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
        setGoalsWithSubGoals(goalsWithSubs);
      } catch (error) {
        console.error('Error cargando metas con sub-metas:', error);
      }
    };

    loadGoalsWithSubGoals();
  }, [currentUser, loading]);

  // Función para verificar si una meta tiene sub-metas
  const hasSubGoals = (goal: IndividualGoalWithSubGoals) => {
    return goal.subGoals && goal.subGoals.length > 0;
  };

  // Funciones para manejo de modales - CREATE GOAL
  const handleCreateGoal = async (goal: CreateIndividualGoal, subGoals?: CreateSubGoal[]) => {
    if (!currentUser) return;

    setCreateLoading(true);
    try {
      const createdGoalId = await goalService.createIndividualGoal(currentUser.uid, goal);
      
      if (subGoals && createdGoalId) {
        for (const subGoal of subGoals) {
          await subGoalService.createSubGoal(currentUser.uid, createdGoalId, subGoal);
        }
      }

      await refreshUserData();
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } finally {
      setCreateLoading(false);
    }
  };

  // EDIT GOAL
  const handleEditGoal = async (goalId: string, goal: CreateIndividualGoal) => {
    if (!currentUser) return;

    setCreateLoading(true);
    try {
      await goalService.updateGoal(currentUser.uid, goalId, goal);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setSelectedGoalForEdit(null);
    } finally {
      setCreateLoading(false);
    }
  };

  // CREATE SUB GOAL
  const handleCreateSubGoal = async (subGoal: CreateSubGoal) => {
    if (!currentUser || !selectedGoalForSubGoal) return;

    setCreateLoading(true);
    try {
      await subGoalService.createSubGoal(currentUser.uid, selectedGoalForSubGoal, subGoal);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setSelectedGoalForSubGoal(null);
    } finally {
      setCreateLoading(false);
    }
  };

  // EDIT SUB GOAL
  const handleEditSubGoal = async (subGoal: CreateSubGoal) => {
    if (!currentUser || !selectedSubGoalForEdit || !selectedGoalForSubGoal) return;

    setCreateLoading(true);
    try {
      await subGoalService.updateSubGoal(
        currentUser.uid, 
        selectedGoalForSubGoal, 
        selectedSubGoalForEdit.id, 
        subGoal
      );

      // Recalcular el monto total de la meta principal
      await recalculateGoalTotal(selectedGoalForSubGoal);
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setSelectedSubGoalForEdit(null);
      setSelectedGoalForSubGoal(null);
    } finally {
      setCreateLoading(false);
    }
  };

  // ADD SAVING TO GOAL
  const handleAddSaving = async (amount: number) => {
    if (!currentUser || !selectedGoalForSaving) return;
    
    try {
      await addSavingToGoal(selectedGoalForSaving, amount);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setSelectedGoalForSaving(null);
    } catch (error) {
      console.error('Error agregando ahorro:', error);
      throw error;
    }
  };

  // ADD SAVING TO SUB GOAL
  const handleAddSavingToSubGoal = async (amount: number) => {
    if (!currentUser || !selectedSubGoalForSaving) return;
    
    try {
      await subGoalService.addSavingToSubGoal(
        currentUser.uid, 
        selectedSubGoalForSaving.goalId, 
        selectedSubGoalForSaving.subGoalId, 
        amount
      );
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setSelectedSubGoalForSaving(null);
    } catch (error) {
      console.error('Error agregando ahorro a sub-meta:', error);
      throw error;
    }
  };

  // Función para recalcular el total de la meta basado en sub-metas
  const recalculateGoalTotal = async (goalId: string) => {
    if (!currentUser) return;
    
    const subGoals = await subGoalService.getSubGoals(currentUser.uid, goalId);
    const newTotal = subGoals.reduce((total, subGoal) => total + subGoal.amount, 0);
    
    await goalService.updateGoal(currentUser.uid, goalId, {
      targetAmount: newTotal
    });
  };

  // Funciones de utilidad para montos máximos
  const getMaxAllowedAmountForGoal = (goalId: string): number => {
    const goal = goalsWithSubGoals.find(g => g.id === goalId);
    if (goal) {
      return goal.targetAmount - goal.savedAmount;
    }
    return 0;
  };

  const getMaxAllowedAmount = (goalId: string, subGoalId: string): number => {
    const goal = goalsWithSubGoals.find(g => g.id === goalId);
    const subGoal = goal?.subGoals?.find(sg => sg.id === subGoalId);
    
    if (subGoal) {
      return subGoal.amount - subGoal.savedAmount;
    }
    return 0;
  };

  // Funciones de eliminación
  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser || !window.confirm('¿Estás seguro de que quieres eliminar esta meta?')) return;
    
    try {
      await goalService.deleteGoal(currentUser.uid, goalId);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error eliminando meta:', error);
      alert('Error al eliminar la meta. Intenta de nuevo.');
    }
  };

  const handleDeleteSubGoal = async (goalId: string, subGoalId: string) => {
    if (!currentUser || !window.confirm('¿Estás seguro de que quieres eliminar esta sub-meta?')) return;
    
    try {
      await subGoalService.deleteSubGoal(currentUser.uid, goalId, subGoalId);
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error eliminando sub-meta:', error);
      alert('Error al eliminar la sub-meta. Intenta de nuevo.');
    }
  };

  // Funciones para abrir modales
  const openEditModal = (goal: IndividualGoalWithSubGoals) => {
    setSelectedGoalForEdit(goal);
    setShowEditModal(true);
  };

  const openEditSubGoalModal = (goalId: string, subGoal: SubGoal) => {
    setSelectedGoalForSubGoal(goalId);
    setSelectedSubGoalForEdit(subGoal);
    setShowEditSubGoalModal(true);
  };

  // Funciones de navegación y UI
  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const navigateSubGoal = (goalId: string, direction: 'prev' | 'next', totalSubGoals: number) => {
    const currentIndex = currentSubGoalIndex[goalId] || 0;
    let newIndex = currentIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalSubGoals - 1;
    } else {
      newIndex = currentIndex < totalSubGoals - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentSubGoalIndex({
      ...currentSubGoalIndex,
      [goalId]: newIndex
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Funciones para avatar de usuario
  const getUserAvatarUrl = (photoURL: string | null | undefined) => {
    if (!photoURL) return null;
    
    if (photoURL.includes('googleusercontent.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(photoURL)}&w=96&h=96&fit=cover&mask=circle`;
    }
    
    return photoURL;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleAvatarLoad = () => {
    setAvatarError(false);
  };

  const UserAvatar = () => {
    const processedAvatarUrl = getUserAvatarUrl(userAvatar);
    
    const getInitials = () => {
      if (userName && userName !== 'Usuario') {
        const names = userName.trim().split(' ');
        if (names.length >= 2) {
          return (names[0][0] + names[1][0]).toUpperCase();
        }
        return userName.substring(0, 2).toUpperCase();
      }
      return null;
    };

    const initials = getInitials();
    
    if (processedAvatarUrl && !avatarError) {
      return (
        <img 
          src={processedAvatarUrl} 
          alt="User Avatar" 
          className="user-avatar"
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          crossOrigin="anonymous"
        />
      );
    }
    
    return (
      <div className="user-avatar user-avatar-fallback">
        {initials ? (
          <span className="user-initials">{initials}</span>
        ) : (
          <User size={20} />
        )}
      </div>
    );
  };

  // Filtros y ordenamiento
  const filteredAndSortedGoals = goalsWithSubGoals
    .filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'active' && !goal.isCompleted) ||
                            (filterStatus === 'completed' && goal.isCompleted);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const dateA = a.createdAt?.toMillis() || 0;
          const dateB = b.createdAt?.toMillis() || 0;
          return dateB - dateA;
        }
        case 'oldest': {
          const dateA = a.createdAt?.toMillis() || 0;
          const dateB = b.createdAt?.toMillis() || 0;
          return dateA - dateB;
        }
        case 'progress': {
          const progressA = (a.savedAmount / a.targetAmount) * 100;
          const progressB = (b.savedAmount / b.targetAmount) * 100;
          return progressB - progressA;
        }
        case 'target': {
          return b.targetAmount - a.targetAmount;
        }
        default:
          return 0;
      }
    });

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/workspace' },
    { icon: Award, label: 'Mis Metas', path: '/targets' },
    { icon: Users, label: 'Metas en Equipo', path: '/teamboard' },
    { icon: CheckSquare, label: 'Listas', path: '/tasks' },
  ];

  if (loading) {
    return (
      <div className="targets-layout">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Cargando tus metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="targets-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <aside className={`targets-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src={metaBuyLogo} alt="MetaBuy Logo" className="brand-logo" />
          <span className="brand-text">MetaBuyX</span>
          <button className="sidebar-close" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`} 
              onClick={closeSidebar}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/settings" className="nav-link" onClick={closeSidebar}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
          <button onClick={handleLogout} className="nav-link logout">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
          <div className="user-profile">
            <UserAvatar />
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="targets-main">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="targets-header">
            <div className="header-content">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div className="header-info">
                <h1 className="header-title">
                  Mis Metas Individuales
                </h1>
                <p className="header-subtitle">
                  Gestiona y monitorea tus objetivos de ahorro personal con sub-metas organizadas
                </p>
              </div>
            </div>
          </header>

          <div className="targets-controls">
            <div className="search-filters">
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar metas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
                className="filter-select"
              >
                <option value="all">Todas las metas</option>
                <option value="active">Activas</option>
                <option value="completed">Completadas</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'progress' | 'target')}
                className="sort-select"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="progress">Por progreso</option>
                <option value="target">Por cantidad objetivo</option>
              </select>
            </div>
            
            <button 
              className="btn-create-goal" 
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle size={18} />
              <span>Nueva Meta</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="targets-grid"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedGoals.length === 0 ? (
            <div className="empty-state">
              <Target size={64} className="empty-icon" />
              <h3>No tienes metas aún</h3>
              <p>Crea tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros.</p>
              <button 
                className="btn-create-first" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Crear mi primera meta
              </button>
            </div>
          ) : (
            filteredAndSortedGoals.map((goal) => {
              const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
              const remainingAmount = goal.targetAmount - goal.savedAmount;
              const hasSubGoalsFlag = hasSubGoals(goal);
              const isExpanded = expandedGoals.has(goal.id);
              const currentIndex = currentSubGoalIndex[goal.id] || 0;
              const currentSubGoal = hasSubGoalsFlag ? goal.subGoals![currentIndex] : null;
              
              return (
                <motion.div 
                  key={goal.id} 
                  className={`goal-card ${goal.isCompleted ? 'completed' : ''} ${hasSubGoalsFlag ? 'has-subgoals' : ''}`}
                  variants={itemVariants}
                >
                  <div className="goal-card-header">
                    <div className="goal-icon">
                      {goal.isCompleted ? <CheckCircle size={24} /> : <Bookmark size={24} />}
                    </div>
                    <div className="goal-info">
                      <div className="goal-title-row">
                        <h3 className="goal-title">{goal.title}</h3>
                        {hasSubGoalsFlag && (
                          <button 
                            className="expand-button"
                            onClick={() => toggleGoalExpansion(goal.id)}
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <span className="subgoals-count">{goal.subGoals?.length} sub-metas</span>
                          </button>
                        )}
                      </div>
                      {goal.description && (
                        <p className="goal-description">{goal.description}</p>
                      )}
                    </div>
                    <div className="goal-actions">
                      {!hasSubGoalsFlag && (
                        <button 
                          className="btn-add-subgoal" 
                          title="Añadir sub-meta"
                          onClick={() => {
                            setSelectedGoalForSubGoal(goal.id);
                            setShowSubGoalModal(true);
                          }}
                        >
                          <List size={16} />
                        </button>
                      )}
                      <button 
                        className="btn-edit" 
                        title="Editar meta"
                        onClick={() => openEditModal(goal)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="btn-delete" 
                        title="Eliminar meta"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="saved-amount">${goal.savedAmount.toLocaleString()}</span>
                      <span className="target-amount">de ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-details">
                      <span className="progress-percentage">{progress}% completado</span>
                      {!goal.isCompleted && (
                        <span className="remaining-amount">
                          Faltan ${remainingAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-metas navegables - versión con animación rápida y fluida */}
                  {hasSubGoalsFlag && isExpanded && goal.subGoals && goal.subGoals.length > 0 && (
                  <motion.div 
                    className="subgoals-container"
                    initial={{ 
                      height: 0, 
                      opacity: 0,
                      y: -5,
                      scaleY: 0.95 // Añadimos una ligera escala para el efecto de despliegue
                    }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      y: 0,
                      scaleY: 1
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      y: -5,
                      scaleY: 0.95
                    }}
                    transition={{ 
                      duration: 0.35, // Aumentamos la duración para más suavidad
                      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                      height: { duration: 0.35 },
                      opacity: { duration: 0.3, delay: 0.05 },
                      scaleY: { duration: 0.35 }
                    }}
                  >
                    <motion.div 
                      className="subgoals-header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.2 }} // Ajustamos el delay para que aparezca después de la expansión
                    >
                      <Package size={16} />
                      <span>Desglose de gastos</span>
                      {goal.subGoals.length > 1 && (
                        <div className="subgoal-navigation">
                          <button 
                            className="nav-btn"
                            onClick={() => navigateSubGoal(goal.id, 'prev', goal.subGoals!.length)}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="subgoal-counter">
                            {currentIndex + 1} de {goal.subGoals.length}
                          </span>
                          <button
                            className="nav-btn"
                            onClick={() => navigateSubGoal(goal.id, 'next', goal.subGoals!.length)}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                    
                    {currentSubGoal && (
                      <motion.div 
                        className="subgoals-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.2 }} // Ajustamos el delay
                      >
                        <div className={`subgoal-item ${currentSubGoal.completed ? 'completed' : ''}`}>
                          <div className="subgoal-header">
                            <div className="subgoal-info">
                              <h4 className="subgoal-title">{currentSubGoal.title}</h4>
                              <div className="subgoal-amounts">
                                <span className="saved">${currentSubGoal.savedAmount.toLocaleString()}</span>
                                <span className="target">de ${currentSubGoal.amount.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="subgoal-actions">
                              {!currentSubGoal.completed && (
                                <>
                                  <button 
                                    className="btn-add-saving-sub"
                                    onClick={() => {
                                      setSelectedSubGoalForSaving({ goalId: goal.id, subGoalId: currentSubGoal.id });
                                      setShowAddSubSavingModal(true);
                                    }}
                                  >
                                    <PlusCircle size={14} />
                                    Añadir
                                  </button>
                                  <button 
                                    className="btn-edit-sub"
                                    title="Editar sub-meta"
                                    onClick={() => openEditSubGoalModal(goal.id, currentSubGoal)}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </>
                              )}
                              <button 
                                className="btn-delete-sub"
                                title="Eliminar sub-meta"
                                onClick={() => handleDeleteSubGoal(goal.id, currentSubGoal.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="subgoal-progress">
                            <div className="subprogress-bar-container">
                              <motion.div 
                                className="subprogress-bar-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.round((currentSubGoal.savedAmount / currentSubGoal.amount) * 100), 100)}%` }}
                                transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
                              />
                            </div>
                            <span className="subprogress-text">
                              {Math.round((currentSubGoal.savedAmount / currentSubGoal.amount) * 100)}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                  <div className="goal-footer">
                    <div className="goal-date">
                      <Calendar size={14} />
                      <span>
                        Creada {goal.createdAt?.toDate().toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {!goal.isCompleted && !hasSubGoalsFlag && (
                      <button 
                        className="btn-add-saving"
                        onClick={() => {
                          setSelectedGoalForSaving(goal.id);
                          setShowAddSavingModal(true);
                        }}
                      >
                        <PlusCircle size={16} />
                        Añadir dinero
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </main>

      {/* MODALES */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGoal={handleCreateGoal}
        loading={createLoading}
      />

      <EditGoalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEditGoal={handleEditGoal}
        goal={selectedGoalForEdit}
        loading={createLoading}
      />

      <CreateSubGoalModal
        isOpen={showSubGoalModal}
        onClose={() => setShowSubGoalModal(false)}
        onCreateSubGoal={handleCreateSubGoal}
        goalTitle={goalsWithSubGoals.find(g => g.id === selectedGoalForSubGoal)?.title}
        loading={createLoading}
      />

      <EditSubGoalModal
        isOpen={showEditSubGoalModal}
        onClose={() => setShowEditSubGoalModal(false)}
        onEditSubGoal={handleEditSubGoal}
        subGoal={selectedSubGoalForEdit}
        goalTitle={goalsWithSubGoals.find(g => g.id === selectedGoalForSubGoal)?.title}
        loading={createLoading}
      />

      <AddSavingModal
        isOpen={showAddSavingModal}
        onClose={() => setShowAddSavingModal(false)}
        onAddSaving={handleAddSaving}
        goalTitle={goalsWithSubGoals.find(g => g.id === selectedGoalForSaving)?.title}
        maxAmount={selectedGoalForSaving ? getMaxAllowedAmountForGoal(selectedGoalForSaving) : 0}
        loading={false}
      />

      <AddSubSavingModal
        isOpen={showAddSubSavingModal}
        onClose={() => setShowAddSubSavingModal(false)}
        onAddSubSaving={handleAddSavingToSubGoal}
        goalTitle={selectedSubGoalForSaving ? goalsWithSubGoals.find(g => g.id === selectedSubGoalForSaving.goalId)?.title : undefined}
        subGoalTitle={selectedSubGoalForSaving ? goalsWithSubGoals.find(g => g.id === selectedSubGoalForSaving.goalId)?.subGoals?.find(sg => sg.id === selectedSubGoalForSaving.subGoalId)?.title : undefined}
        maxAmount={selectedSubGoalForSaving ? getMaxAllowedAmount(selectedSubGoalForSaving.goalId, selectedSubGoalForSaving.subGoalId) : 0}
        loading={false}
      />
    </div>
  );
};

export default Targets;