// src/pages/Workspace/workspace.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, PlusCircle, Search,
  DollarSign, TrendingUp, Star, Plane, Gift, Loader, Menu, X, Award, Bookmark,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './workspace.css';

// Interfaces para tipar los objetos
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  isCompleted?: boolean;
  members?: string[]; // Para metas de equipo
}

interface QuickListItem {
  id: string;
  text: string;
  price: number;
  completed: boolean;
}

interface GoalCardProps {
  goal: Goal;
  isTeam?: boolean;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getIconComponent = (iconName: string) => {
  const iconMap = { Star, Gift, Plane, DollarSign, Award, Bookmark };
  return iconMap[iconName as keyof typeof iconMap] || Award;
};

const Workspace = () => {
  const { currentUser, logout } = useAuth();
  const { 
    loading, individualGoals, teamGoals, quickListItems, statistics,
    addSavingToGoal, contributeToTeamGoal, toggleQuickListItem
  } = useUserData();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';
  const userAvatar = currentUser?.photoURL || `https://i.pravatar.cc/150?u=${currentUser?.uid}`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAddSaving = (goalId: string) => addSavingToGoal(goalId, 50);
  const handleContributeToTeam = (goalId: string) => contributeToTeamGoal(goalId, 100);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const summaryData = [
    { title: 'Ahorro Total', value: `$${statistics.totalSavings.toLocaleString()}`, icon: DollarSign, color: 'var(--color-progress)' },
    { title: 'Metas Activas', value: statistics.activeGoals.toString(), icon: Bookmark, color: 'var(--color-accent)' },
    { title: 'Progreso Promedio', value: `${statistics.averageProgress}%`, icon: TrendingUp, color: 'var(--color-success)' },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Award, label: 'Mis Metas' },
    { icon: Users, label: 'Metas en Equipo' },
    { icon: CheckSquare, label: 'Listas' },
  ];

  if (loading) {
    return (
      <div className="workspace-layout">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  // Componente GoalCard tipado correctamente
  const GoalCard: React.FC<GoalCardProps> = ({ goal, isTeam = false }) => {
    const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
    const IconComponent = getIconComponent(goal.icon);
    
    return (
      <div className="goal-card">
        <div className="goal-card-header">
          <div className="goal-card-icon">
            <IconComponent size={20} />
          </div>
          <span className="goal-card-title">{goal.title}</span>
          {isTeam && goal.members && (
            <div className="team-avatars">
              {goal.members.slice(0, 3).map((memberId: string, index: number) => 
                <img 
                  key={index} 
                  src={`https://i.pravatar.cc/150?u=${memberId}`} 
                  alt="member" 
                />
              )}
              {goal.members.length > 3 && (
                <span className="more-members">+{goal.members.length - 3}</span>
              )}
            </div>
          )}
          {goal.isCompleted && <span className="completed-badge">✅ Completada</span>}
        </div>
        <div className="goal-card-progress">
          <p className="progress-text">
            <span>${goal.savedAmount.toLocaleString()}</span> / ${goal.targetAmount.toLocaleString()}
          </p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        {!goal.isCompleted && (
          <button 
            className="btn-add-saving"
            onClick={() => isTeam ? handleContributeToTeam(goal.id) : handleAddSaving(goal.id)}
          >
            {isTeam ? 'Aportar al Grupo' : 'Añadir Ahorro'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="workspace-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <aside className={`workspace-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src={metaBuyLogo} alt="MetaBuy Logo" className="brand-logo" />
          <span className="brand-text">MetaBuyX</span>
          <button className="sidebar-close" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <a key={index} href="#" className={`nav-link ${item.active ? 'active' : ''}`} onClick={closeSidebar}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <a href="#" className="nav-link" onClick={closeSidebar}>
            <Settings size={20} />
            <span>Configuración</span>
          </a>
          <button onClick={handleLogout} className="nav-link logout">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
          <div className="user-profile">
            <img src={userAvatar} alt="User Avatar" className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="workspace-main">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="workspace-header">
            <div className="header-content">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div>
                <h1 className="header-title">Bienvenido, {userName.split(' ')[0]} 👋</h1>
                <p className="header-subtitle">Aquí tienes un resumen de tus planes de ahorro.</p>
              </div>
            </div>
            <div className="header-actions">
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Buscar una meta..." />
              </div>
              <button className="btn-cta">
                <PlusCircle size={18} />
                <span className="btn-text">Nueva Meta</span>
              </button>
            </div>
          </header>

          <motion.div className="summary-grid" variants={listVariants} initial="hidden" animate="visible">
            {summaryData.map((item, index) => (
              <motion.div className="summary-card" key={index} variants={itemVariants}>
                <div className="summary-icon" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  <item.icon size={22} />
                </div>
                <p className="summary-title">{item.title}</p>
                <h3 className="summary-value">{item.value}</h3>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        <div className="workspace-content-grid">
          <motion.div 
            className="goals-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="section-header">
              <h2>Mis Metas Individuales</h2>
              <a href="#" className="section-link">Ver todas</a>
            </div>
            <div className="goals-list">
              {individualGoals.length === 0 ? (
                <div className="empty-state">No tienes metas individuales aún. ¡Crea tu primera meta!</div>
              ) : (
                individualGoals.map((goal: Goal) => <GoalCard key={goal.id} goal={goal} />)
              )}
            </div>
            
            <div className="section-header">
              <h2>Metas en Equipo</h2>
            </div>
            <div className="goals-list">
              {teamGoals.length === 0 ? (
                <div className="empty-state">No tienes metas en equipo aún. ¡Crea o únete a una meta grupal!</div>
              ) : (
                teamGoals.map((goal: Goal) => <GoalCard key={goal.id} goal={goal} isTeam />)
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="quick-list-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Lista Rápida</h2>
              <a href="#" className="section-link">Ver detalles</a>
            </div>
            <div className="quick-list-card">
              {quickListItems.length === 0 ? (
                <div className="empty-state">Tu lista rápida está vacía. ¡Añade algunos elementos!</div>
              ) : (
                quickListItems.map((item: QuickListItem) => (
                  <div className={`checklist-item ${item.completed ? 'completed' : ''}`} key={item.id}>
                    <div 
                      className={`checkbox ${item.completed ? 'checked' : ''}`}
                      onClick={() => toggleQuickListItem(item.id)}
                    >
                      {item.completed && <div className="check-mark"></div>}
                    </div>
                    <span className="item-text">{item.text}</span>
                    <span className="item-price">${item.price.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;