import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, PlusCircle, Search,
  Loader, Menu, X, Award, Bookmark, User, Edit3,
  Trash2, Target, Calendar, CheckCircle, Plus, ChevronDown, ChevronRight,
  List, Package, ChevronLeft, Save
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { goalService, subGoalService } from '../../services/userService';
import type { 
  CreateIndividualGoal, 
  CreateSubGoal, 
  IndividualGoalWithSubGoals, 
  SubGoal  // ← Added this import
} from '../../types';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './targets.css';

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};


type GoalType = 'simple' | 'detailed';

const Targets = () => {
  const { currentUser, logout } = useAuth();
  const { 
    loading, addSavingToGoal
  } = useUserData();
  
  const refreshUserData = async () => {
    window.location.reload();
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubGoalModal, setShowSubGoalModal] = useState(false);
  const [showAddSavingModal, setShowAddSavingModal] = useState(false);
  const [showAddSubSavingModal, setShowAddSubSavingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'target'>('newest');
  const [createLoading, setCreateLoading] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [selectedGoalForSubGoal, setSelectedGoalForSubGoal] = useState<string | null>(null);
  const [selectedGoalForSaving, setSelectedGoalForSaving] = useState<string | null>(null);
  const [selectedSubGoalForSaving, setSelectedSubGoalForSaving] = useState<{ goalId: string; subGoalId: string } | null>(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<IndividualGoalWithSubGoals | null>(null);
  const [goalsWithSubGoals, setGoalsWithSubGoals] = useState<IndividualGoalWithSubGoals[]>([]);
  const [goalType, setGoalType] = useState<GoalType>('simple');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customSubAmount, setCustomSubAmount] = useState<string>('');

  // 1. Agregar nuevo estado para editar sub-metas
  const [showEditSubGoalModal, setShowEditSubGoalModal] = useState(false);
  const [selectedSubGoalForEdit, setSelectedSubGoalForEdit] = useState<{ 
    goalId: string; 
    subGoal: SubGoal 
  } | null>(null);
  const [editSubGoal, setEditSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });

  // 2. Función para verificar si una meta tiene sub-metas
  const hasSubGoals = (goal: IndividualGoalWithSubGoals) => {
    return goal.subGoals && goal.subGoals.length > 0;
  };


  // 4. Función para abrir modal de edición de sub-meta
  const openEditSubGoalModal = (goalId: string, subGoal: SubGoal) => {
    setSelectedSubGoalForEdit({ goalId, subGoal });
    setEditSubGoal({
      title: subGoal.title,
      amount: subGoal.amount
    });
    setShowEditSubGoalModal(true);
  };

  // 5. Función para manejar edición de sub-meta
  const handleEditSubGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedSubGoalForEdit || createLoading) return;

    if (!editSubGoal.title.trim() || editSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setCreateLoading(true);
    try {
      // Actualizar la sub-meta
      await subGoalService.updateSubGoal(
        currentUser.uid, 
        selectedSubGoalForEdit.goalId, 
        selectedSubGoalForEdit.subGoal.id, 
        {
          title: editSubGoal.title,
          amount: editSubGoal.amount
        }
      );

      // Recalcular el monto total de la meta principal
      await recalculateGoalTotal(selectedSubGoalForEdit.goalId);
      
      setShowEditSubGoalModal(false);
      setSelectedSubGoalForEdit(null);
      setEditSubGoal({ title: '', amount: 0 });
      
      // Refrescar datos
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error editando sub-meta:', error);
      alert('Error al editar la sub-meta. Intenta de nuevo.');
    } finally {
      setCreateLoading(false);
    }
  };

  // 6. Función para recalcular el total de la meta basado en sub-metas
  const recalculateGoalTotal = async (goalId: string) => {
    if (!currentUser) return;
    
    const subGoals = await subGoalService.getSubGoals(currentUser.uid, goalId);
    const newTotal = subGoals.reduce((total, subGoal) => total + subGoal.amount, 0);
    
    await goalService.updateGoal(currentUser.uid, goalId, {
      targetAmount: newTotal
    });
  };

  const getMaxAllowedAmountForGoal = (goalId: string): number => {
  const goal = goalsWithSubGoals.find(g => g.id === goalId);
  
    if (goal) {
      return goal.targetAmount - goal.savedAmount;
    }
    
    return 0;
  };

  // 2. Función modificada para manejar entrada numérica con límite máximo
  const handleNumericInputWithLimit = (
    value: string, 
    setter: (value: string) => void, 
    maxAmount: number
  ) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limitar decimales a 2 dígitos
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    // Verificar si el valor excede el máximo permitido
    const numValue = parseFloat(numericValue);
    
    if (!isNaN(numValue) && numValue > maxAmount) {
      // Si excede, establecer el valor máximo permitido
      setter(maxAmount.toString());
      return;
    }
    
    setter(numericValue);
  };

  // Estados para navegación de submetas
  const [currentSubGoalIndex, setCurrentSubGoalIndex] = useState<{[goalId: string]: number}>({});

  const [newGoal, setNewGoal] = useState<CreateIndividualGoal>({
    title: '',
    description: '',
    targetAmount: 0
  });

  const [editGoal, setEditGoal] = useState<CreateIndividualGoal>({
    title: '',
    description: '',
    targetAmount: 0
  });

  const [newSubGoal, setNewSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });

  const [tempSubGoals, setTempSubGoals] = useState<CreateSubGoal[]>([]);

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

  

  const addTempSubGoal = () => {
    if (!newSubGoal.title.trim() || newSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos de la sub-meta');
      return;
    }

    setTempSubGoals([...tempSubGoals, { ...newSubGoal }]);
    setNewSubGoal({ title: '', amount: 0 });
  };

  const removeTempSubGoal = (index: number) => {
    setTempSubGoals(tempSubGoals.filter((_, i) => i !== index));
  };

  const calculateTotalFromSubGoals = () => {
    return tempSubGoals.reduce((total, subGoal) => total + subGoal.amount, 0);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || createLoading) return;

    if (!newGoal.title.trim()) {
      alert('Por favor ingresa un título para la meta');
      return;
    }

    if (goalType === 'simple' && newGoal.targetAmount <= 0) {
      alert('Por favor ingresa una cantidad objetivo válida');
      return;
    }

    if (goalType === 'detailed' && tempSubGoals.length === 0) {
      alert('Por favor agrega al menos una sub-meta');
      return;
    }

    setCreateLoading(true);
    try {
      const goalToCreate = { ...newGoal };
      
      if (goalType === 'detailed') {
        goalToCreate.targetAmount = calculateTotalFromSubGoals();
      }

      const createdGoalId = await goalService.createIndividualGoal(currentUser.uid, goalToCreate);
      
      if (goalType === 'detailed' && createdGoalId) {
        // Crear las sub-metas
        for (const subGoal of tempSubGoals) {
          await subGoalService.createSubGoal(currentUser.uid, createdGoalId, subGoal);
        }
      }

      setShowCreateModal(false);
      setNewGoal({ title: '', description: '', targetAmount: 0 });
      setTempSubGoals([]);
      setGoalType('simple');
      await refreshUserData();
    } catch (error) {
      console.error('Error creando meta:', error);
      alert('Error al crear la meta. Intenta de nuevo.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedGoalForEdit || createLoading) return;

    if (!editGoal.title.trim()) {
      alert('Por favor ingresa un título para la meta');
      return;
    }

    if (editGoal.targetAmount <= 0) {
      alert('Por favor ingresa una cantidad objetivo válida');
      return;
    }

    setCreateLoading(true);
    try {
      await goalService.updateGoal(currentUser.uid, selectedGoalForEdit.id, editGoal);
      
      setShowEditModal(false);
      setSelectedGoalForEdit(null);
      setEditGoal({ title: '', description: '', targetAmount: 0 });
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error editando meta:', error);
      alert('Error al editar la meta. Intenta de nuevo.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateSubGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedGoalForSubGoal || createLoading) return;

    if (!newSubGoal.title.trim() || newSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setCreateLoading(true);
    try {
      await subGoalService.createSubGoal(currentUser.uid, selectedGoalForSubGoal, newSubGoal);
      setShowSubGoalModal(false);
      setNewSubGoal({ title: '', amount: 0 });
      setSelectedGoalForSubGoal(null);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error creando sub-meta:', error);
      alert('Error al crear la sub-meta. Intenta de nuevo.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddSaving = async (goalId: string, amount?: number) => {
    if (!currentUser) return;
    
    const finalAmount = amount || parseFloat(customAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }
  
  // Validar que no exceda el monto máximo de la meta
  const goal = goalsWithSubGoals.find(g => g.id === goalId);
    if (goal) {
      const maxAllowed = goal.targetAmount - goal.savedAmount;
      if (finalAmount > maxAllowed) {
        alert(`No puedes agregar más de $${maxAllowed.toLocaleString()}. Esta meta solo necesita $${maxAllowed.toLocaleString()} más para completarse.`);
        return;
      }
    }
    
    try {
      await addSavingToGoal(goalId, finalAmount);
      await refreshUserData();
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setShowAddSavingModal(false);
      setCustomAmount('');
      setSelectedGoalForSaving(null);
    } catch (error) {
      console.error('Error agregando ahorro:', error);
      alert('Error al agregar ahorro. Intenta de nuevo.');
    }
  };

  const handleAddSavingToSubGoal = async (goalId: string, subGoalId: string, amount?: number) => {
    if (!currentUser || !selectedSubGoalForSaving) return;
    
    const finalAmount = amount || parseFloat(customSubAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    // Validar que no exceda el monto de la sub-meta
    const goal = goalsWithSubGoals.find(g => g.id === goalId);
    const subGoal = goal?.subGoals?.find(sg => sg.id === subGoalId);
    
    if (subGoal) {
      const maxAllowed = subGoal.amount - subGoal.savedAmount;
      if (finalAmount > maxAllowed) {
        alert(`No puedes agregar más de $${maxAllowed.toLocaleString()}. Esta sub-meta solo necesita $${maxAllowed.toLocaleString()} más para completarse.`);
        return;
      }
    }
    
    try {
      await subGoalService.addSavingToSubGoal(currentUser.uid, goalId, subGoalId, finalAmount);
      
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
      
      setShowAddSubSavingModal(false);
      setCustomSubAmount('');
      setSelectedSubGoalForSaving(null);
    } catch (error) {
      console.error('Error agregando ahorro a sub-meta:', error);
      alert('Error al agregar ahorro a la sub-meta. Intenta de nuevo.');
    }
  };

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

  // 3. Función modificada para abrir el modal de edición
  const openEditModal = (goal: IndividualGoalWithSubGoals) => {
    setSelectedGoalForEdit(goal);
    setEditGoal({
      title: goal.title,
      description: goal.description || '',
      // Solo permitir editar monto si NO tiene sub-metas
      targetAmount: hasSubGoals(goal) ? goal.targetAmount : goal.targetAmount
    });
    setShowEditModal(true);
  };


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

  // Función para obtener monto máximo permitido en sub-meta
  const getMaxAllowedAmount = (goalId: string, subGoalId: string): number => {
    const goal = goalsWithSubGoals.find(g => g.id === goalId);
    const subGoal = goal?.subGoals?.find(sg => sg.id === subGoalId);
    
    if (subGoal) {
      return subGoal.amount - subGoal.savedAmount;
    }
    
    return 0;
  };

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
                  <Target size={28} className="title-icon" />
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
              const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;
              const isExpanded = expandedGoals.has(goal.id);
              const currentIndex = currentSubGoalIndex[goal.id] || 0;
              const currentSubGoal = hasSubGoals ? goal.subGoals![currentIndex] : null;
              
              return (
                <motion.div 
                  key={goal.id} 
                  className={`goal-card ${goal.isCompleted ? 'completed' : ''} ${hasSubGoals ? 'has-subgoals' : ''}`}
                  variants={itemVariants}
                >
                  <div className="goal-card-header">
                    <div className="goal-icon">
                      {goal.isCompleted ? <CheckCircle size={24} /> : <Bookmark size={24} />}
                    </div>
                    <div className="goal-info">
                      <div className="goal-title-row">
                        <h3 className="goal-title">{goal.title}</h3>
                        {hasSubGoals && (
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
                      {!hasSubGoals && (
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

                  {/* Sub-metas navegables */}
                  {hasSubGoals && isExpanded && goal.subGoals && goal.subGoals.length > 0 && (
                    <motion.div 
                      className="subgoals-container"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="subgoals-header">
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
                      </div>
                      
                      {currentSubGoal && (
                        <div className="subgoals-list">
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
                                <div 
                                  className="subprogress-bar-fill" 
                                  style={{ width: `${Math.min(Math.round((currentSubGoal.savedAmount / currentSubGoal.amount) * 100), 100)}%` }}
                                ></div>
                              </div>
                              <span className="subprogress-text">
                                {Math.round((currentSubGoal.savedAmount / currentSubGoal.amount) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
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
                    {!goal.isCompleted && !hasSubGoals && (
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

      {/* Modal para crear meta */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Crear Nueva Meta</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="modal-form">
              <div className="form-group">
                <label>Tipo de meta</label>
                <div className="goal-type-selector">
                  <button
                    type="button"
                    className={`type-option ${goalType === 'simple' ? 'active' : ''}`}
                    onClick={() => setGoalType('simple')}
                  >
                    <Target size={20} />
                    <div>
                      <span className="type-title">Meta Simple</span>
                      <span className="type-desc">Un objetivo con cantidad fija (ej: comprar una PS5)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`type-option ${goalType === 'detailed' ? 'active' : ''}`}
                    onClick={() => setGoalType('detailed')}
                  >
                    <Package size={20} />
                    <div>
                      <span className="type-title">Meta Detallada</span>
                      <span className="type-desc">Objetivo con múltiples gastos (ej: viaje con hotel, comida, etc.)</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Título de la meta *</label>
                <input
                  type="text"
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder={goalType === 'simple' ? 'Ej: Comprar iPhone 16' : 'Ej: Viaje a Japón'}
                  required
                />
              </div>
              
              {goalType === 'simple' && (
                <div className="form-group">
                  <label htmlFor="targetAmount">Cantidad objetivo *</label>
                  <div className="amount-input">
                    <span className="currency">$</span>
                    <input
                      type="text"
                      id="targetAmount"
                      value={newGoal.targetAmount || ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = numericValue.split('.');
                        if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                          setNewGoal({...newGoal, targetAmount: parseFloat(numericValue) || 0});
                        }
                      }}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              )}

              {goalType === 'detailed' && (
                <div className="form-group">
                  <label>Sub-metas (gastos estimados)</label>
                  
                  <div className="subgoal-form">
                    <div className="subgoal-input-row">
                      <input
                        type="text"
                        value={newSubGoal.title}
                        onChange={(e) => setNewSubGoal({...newSubGoal, title: e.target.value})}
                        placeholder="Ej: Hotel"
                      />
                      <div className="amount-input">
                        <span className="currency">$</span>
                        <input
                          type="text"
                          value={newSubGoal.amount || ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = numericValue.split('.');
                            if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                              setNewSubGoal({...newSubGoal, amount: parseFloat(numericValue) || 0});
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-add-temp"
                        onClick={addTempSubGoal}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {tempSubGoals.length > 0 && (
                    <div className="temp-subgoals-list">
                      <h4>Sub-metas agregadas:</h4>
                      {tempSubGoals.map((subGoal, index) => (
                        <div key={index} className="temp-subgoal-item">
                          <span className="temp-subgoal-title">{subGoal.title}</span>
                          <span className="temp-subgoal-amount">${subGoal.amount.toLocaleString()}</span>
                          <button
                            type="button"
                            className="btn-remove-temp"
                            onClick={() => removeTempSubGoal(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="temp-total">
                        <strong>Total: ${calculateTotalFromSubGoals().toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setTempSubGoals([]);
                    setGoalType('simple');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={createLoading || (goalType === 'detailed' && tempSubGoals.length === 0)}
                >
                  {createLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Crear Meta
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal para editar meta */}
      {showEditModal && selectedGoalForEdit && (
  <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
    <motion.div 
      className="modal-content"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>Editar Meta</h2>
        <button 
          className="modal-close"
          onClick={() => setShowEditModal(false)}
        >
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleEditGoal} className="modal-form">
        <div className="form-group">
          <label htmlFor="editTitle">Título de la meta *</label>
          <input
            type="text"
            id="editTitle"
            value={editGoal.title}
            onChange={(e) => setEditGoal({...editGoal, title: e.target.value})}
            placeholder="Ej: Comprar iPhone 16"
            required
          />
        </div>
        
        {/* Solo mostrar campo de monto si NO tiene sub-metas */}
        {!hasSubGoals(selectedGoalForEdit) && (
          <div className="form-group">
            <label htmlFor="editTargetAmount">Cantidad objetivo *</label>
            <div className="amount-input">
              <span className="currency">$</span>
              <input
                type="text"
                id="editTargetAmount"
                value={editGoal.targetAmount || ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = numericValue.split('.');
                  if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                    setEditGoal({...editGoal, targetAmount: parseFloat(numericValue) || 0});
                  }
                }}
                placeholder="0"
                required
              />
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={createLoading}
          >
            {createLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
)}

{showEditSubGoalModal && selectedSubGoalForEdit && (
  <div className="modal-overlay" onClick={() => setShowEditSubGoalModal(false)}>
    <motion.div 
      className="modal-content"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>Editar Sub-Meta</h2>
        <button 
          className="modal-close"
          onClick={() => setShowEditSubGoalModal(false)}
        >
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleEditSubGoal} className="modal-form">
        <div className="form-group">
          <label htmlFor="editSubGoalTitle">Nombre del gasto *</label>
          <input
            type="text"
            id="editSubGoalTitle"
            value={editSubGoal.title}
            onChange={(e) => setEditSubGoal({...editSubGoal, title: e.target.value})}
            placeholder="Ej: Costo del hotel, Comida, Vuelos"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="editSubGoalAmount">Cantidad estimada *</label>
          <div className="amount-input">
            <span className="currency">$</span>
            <input
              type="text"
              id="editSubGoalAmount"
              value={editSubGoal.amount || ''}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                const parts = numericValue.split('.');
                if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                  setEditSubGoal({...editSubGoal, amount: parseFloat(numericValue) || 0});
                }
              }}
              placeholder="0"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowEditSubGoalModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={createLoading}
          >
            {createLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
)}

      {/* Modal para crear sub-meta */}
      {showSubGoalModal && (
        <div className="modal-overlay" onClick={() => setShowSubGoalModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Añadir Sub-Meta</h2>
              <button 
                className="modal-close"
                onClick={() => setShowSubGoalModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubGoal} className="modal-form">
              <div className="form-group">
                <label htmlFor="subGoalTitle">Nombre del gasto *</label>
                <input
                  type="text"
                  id="subGoalTitle"
                  value={newSubGoal.title}
                  onChange={(e) => setNewSubGoal({...newSubGoal, title: e.target.value})}
                  placeholder="Ej: Costo del hotel, Comida, Vuelos"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subGoalAmount">Cantidad estimada *</label>
                <div className="amount-input">
                  <span className="currency">$</span>
                  <input
                    type="text"
                    id="subGoalAmount"
                    value={newSubGoal.amount || ''}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = numericValue.split('.');
                      if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                        setNewSubGoal({...newSubGoal, amount: parseFloat(numericValue) || 0});
                      }
                    }}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowSubGoalModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Crear Sub-Meta
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal para añadir ahorro a meta principal - MODIFICADO */}
      {showAddSavingModal && selectedGoalForSaving && (
        <div className="modal-overlay" onClick={() => setShowAddSavingModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Añadir Dinero</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddSavingModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="customAmount">¿Cuánto quieres añadir? *</label>
                <div className="amount-input">
                  <span className="currency">$</span>
                  <input
                    type="text"
                    id="customAmount"
                    value={customAmount}
                    onChange={(e) => handleNumericInputWithLimit(
                      e.target.value, 
                      setCustomAmount, 
                      getMaxAllowedAmountForGoal(selectedGoalForSaving)
                    )}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <small className="amount-hint">
                  Máximo permitido: ${getMaxAllowedAmountForGoal(selectedGoalForSaving).toLocaleString()}
                </small>
              </div>
              
              <div className="quick-amounts">
                <span className="quick-label">Montos rápidos:</span>
                <div className="quick-buttons">
                  {/* Generar botones dinámicos basados en el máximo permitido */}
                  {(() => {
                    const maxAllowed = getMaxAllowedAmountForGoal(selectedGoalForSaving);
                    const quickAmounts = [25, 50, 100, 200].filter(amount => amount <= maxAllowed);
                    
                    // Si no hay montos rápidos menores al máximo, mostrar el máximo
                    if (quickAmounts.length === 0 && maxAllowed > 0) {
                      quickAmounts.push(Math.floor(maxAllowed));
                    }
                    
                    return quickAmounts.map(amount => (
                      <button 
                        key={amount}
                        type="button" 
                        className="btn-quick-amount"
                        onClick={() => setCustomAmount(amount.toString())}
                      >
                        ${amount}
                      </button>
                    ));
                  })()}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddSavingModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={() => selectedGoalForSaving && handleAddSaving(selectedGoalForSaving)}
                  disabled={!customAmount || parseFloat(customAmount) <= 0}
                >
                  <PlusCircle size={16} />
                  Añadir ${parseFloat(customAmount || '0').toLocaleString()}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Modal para añadir ahorro a sub-meta - MODIFICADO */}
      {showAddSubSavingModal && selectedSubGoalForSaving && (
        <div className="modal-overlay" onClick={() => setShowAddSubSavingModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Añadir Dinero a Sub-Meta</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddSubSavingModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="customSubAmount">¿Cuánto quieres añadir? *</label>
                <div className="amount-input">
                  <span className="currency">$</span>
                  <input
                    type="text"
                    id="customSubAmount"
                    value={customSubAmount}
                    onChange={(e) => handleNumericInputWithLimit(
                      e.target.value, 
                      setCustomSubAmount, 
                      getMaxAllowedAmount(selectedSubGoalForSaving.goalId, selectedSubGoalForSaving.subGoalId)
                    )}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <small className="amount-hint">
                  Máximo permitido: ${getMaxAllowedAmount(selectedSubGoalForSaving.goalId, selectedSubGoalForSaving.subGoalId).toLocaleString()}
                </small>
              </div>
              
              <div className="quick-amounts">
                <span className="quick-label">Montos rápidos:</span>
                <div className="quick-buttons">
                  {/* Generar botones dinámicos basados en el máximo permitido para sub-meta */}
                  {(() => {
                    const maxAllowed = getMaxAllowedAmount(selectedSubGoalForSaving.goalId, selectedSubGoalForSaving.subGoalId);
                    const quickAmounts = [15, 25, 50, 100].filter(amount => amount <= maxAllowed);
                    
                    // Si no hay montos rápidos menores al máximo, mostrar el máximo
                    if (quickAmounts.length === 0 && maxAllowed > 0) {
                      quickAmounts.push(Math.floor(maxAllowed));
                    }
                    
                    return quickAmounts.map(amount => (
                      <button 
                        key={amount}
                        type="button" 
                        className="btn-quick-amount"
                        onClick={() => setCustomSubAmount(amount.toString())}
                      >
                        ${amount}
                      </button>
                    ));
                  })()}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddSubSavingModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={() => handleAddSavingToSubGoal(
                    selectedSubGoalForSaving.goalId, 
                    selectedSubGoalForSaving.subGoalId
                  )}
                  disabled={!customSubAmount || parseFloat(customSubAmount) <= 0}
                >
                  <PlusCircle size={16} />
                  Añadir ${parseFloat(customSubAmount || '0').toLocaleString()}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Targets;