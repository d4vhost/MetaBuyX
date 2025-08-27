// src/pages/Targets/targets.tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, PlusCircle, Search,
  Loader, Menu, X, Award, Bookmark, User, Edit3,
  Trash2, Target, Calendar, CheckCircle, Plus, ChevronDown, ChevronRight,
  List, Package
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { goalService, subGoalService } from '../../services/userService';
import type { CreateIndividualGoal, CreateSubGoal, IndividualGoalWithSubGoals, SubGoal } from '../../types';
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

const Targets = () => {
  const { currentUser, logout } = useAuth();
  const { 
    loading, addSavingToGoal // Se eliminó 'individualGoals' que no se usaba
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'target'>('newest');
  const [createLoading, setCreateLoading] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [selectedGoalForSubGoal, setSelectedGoalForSubGoal] = useState<string | null>(null);
  const [goalsWithSubGoals, setGoalsWithSubGoals] = useState<IndividualGoalWithSubGoals[]>([]);

  const [newGoal, setNewGoal] = useState<CreateIndividualGoal>({
    title: '',
    description: '',
    targetAmount: 0
  });

  const [newSubGoal, setNewSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });

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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || createLoading) return;

    if (!newGoal.title.trim() || newGoal.targetAmount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setCreateLoading(true);
    try {
      await goalService.createIndividualGoal(currentUser.uid, newGoal);
      setShowCreateModal(false);
      setNewGoal({ title: '', description: '', targetAmount: 0 });
      await refreshUserData();
    } catch (error) {
      console.error('Error creando meta:', error);
      alert('Error al crear la meta. Intenta de nuevo.');
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
      
      // Recargar metas con sub-metas
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error creando sub-meta:', error);
      alert('Error al crear la sub-meta. Intenta de nuevo.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddSaving = async (goalId: string, amount: number = 50) => {
    if (!currentUser) return;
    
    try {
      await addSavingToGoal(goalId, amount);
      await refreshUserData();
      
      // Recargar metas con sub-metas
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error agregando ahorro:', error);
      alert('Error al agregar ahorro. Intenta de nuevo.');
    }
  };

  const handleAddSavingToSubGoal = async (goalId: string, subGoalId: string, amount: number = 25) => {
    if (!currentUser) return;
    
    try {
      await subGoalService.addSavingToSubGoal(currentUser.uid, goalId, subGoalId, amount);
      
      // Recargar metas con sub-metas
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
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
      
      // Recargar metas con sub-metas
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
      
      // Recargar metas con sub-metas
      const goalsWithSubs = await goalService.getUserIndividualGoalsWithSubGoals(currentUser.uid);
      setGoalsWithSubGoals(goalsWithSubs);
    } catch (error) {
      console.error('Error eliminando sub-meta:', error);
      alert('Error al eliminar la sub-meta. Intenta de nuevo.');
    }
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Usar goalsWithSubGoals para el filtrado
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
                      <button className="btn-edit" title="Editar meta">
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

                  {/* Sub-metas expandibles */}
                  {hasSubGoals && isExpanded && (
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
                      </div>
                      <div className="subgoals-list">
                        {goal.subGoals?.map((subGoal: SubGoal) => {
                          const subProgress = Math.round((subGoal.savedAmount / subGoal.amount) * 100);
                          
                          return (
                            <div key={subGoal.id} className={`subgoal-item ${subGoal.completed ? 'completed' : ''}`}>
                              <div className="subgoal-header">
                                <div className="subgoal-info">
                                  <h4 className="subgoal-title">{subGoal.title}</h4>
                                  <div className="subgoal-amounts">
                                    <span className="saved">${subGoal.savedAmount.toLocaleString()}</span>
                                    <span className="target">de ${subGoal.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="subgoal-actions">
                                  {!subGoal.completed && (
                                    <button 
                                      className="btn-add-saving-sub"
                                      onClick={() => handleAddSavingToSubGoal(goal.id, subGoal.id, 25)}
                                    >
                                      <PlusCircle size={14} />
                                      +$25
                                    </button>
                                  )}
                                  <button 
                                    className="btn-delete-sub"
                                    onClick={() => handleDeleteSubGoal(goal.id, subGoal.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="subgoal-progress">
                                <div className="subprogress-bar-container">
                                  <div 
                                    className="subprogress-bar-fill" 
                                    style={{ width: `${Math.min(subProgress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="subprogress-text">{subProgress}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                    {!goal.isCompleted && (
                      <button 
                        className="btn-add-saving"
                        onClick={() => handleAddSaving(goal.id)}
                      >
                        <PlusCircle size={16} />
                        Añadir $50
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
                <label htmlFor="title">Título de la meta *</label>
                <input
                  type="text"
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Ej: Viaje a Japón o Comprar iPhone 16"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción (opcional)</label>
                <textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Ej: Vacaciones soñadas o Para trabajo y fotografía"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="targetAmount">Cantidad objetivo *</label>
                <div className="amount-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    id="targetAmount"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
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
                      Crear Meta
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
                    type="number"
                    id="subGoalAmount"
                    value={newSubGoal.amount || ''}
                    onChange={(e) => setNewSubGoal({...newSubGoal, amount: Number(e.target.value)})}
                    placeholder="0"
                    min="1"
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
    </div>
  );
};

export default Targets;