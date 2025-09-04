// src/pages/Workspace/workspace.tsx - Versión completa con slider actualizado
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, PlusCircle, Search,
  DollarSign, TrendingUp, Loader, Menu, X, Award, Bookmark, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { IndividualGoal, TeamGoal, QuickListItem } from '../../types';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './workspace.css';

interface GoalCardProps {
  goal: IndividualGoal | TeamGoal;
  isTeam?: boolean;
}

interface SliderProps {
  children: React.ReactNode;
  title: string;
  viewAllLink: string;
  emptyMessage: string;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Workspace = () => {
  const { currentUser, logout } = useAuth();
  const { 
    loading, individualGoals, teamGoals, quickListItems, statistics,
    addSavingToGoal, contributeToTeamGoal, toggleQuickListItem
  } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';
  const userAvatar = currentUser?.photoURL || null;

  // Reset avatarError cuando cambie el usuario o su photoURL
  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL, currentUser?.uid]);

  // Función mejorada para manejar el avatar del usuario
  const getUserAvatarUrl = (photoURL: string | null | undefined) => {
    if (!photoURL) return null;
    
    // Para URLs de Google, usar un proxy CORS
    if (photoURL.includes('googleusercontent.com')) {
      // Usar el servicio weserv.nl que actúa como proxy CORS para imágenes
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

  const handleAddSaving = (goalId: string) => addSavingToGoal(goalId, 50);
  const handleContributeToTeam = (goalId: string) => contributeToTeamGoal(goalId, 100);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Función para manejar error de carga de imagen
  const handleAvatarError = () => {
    console.log('Error cargando avatar:', userAvatar);
    setAvatarError(true);
  };

  // Función para manejar carga exitosa de imagen
  const handleAvatarLoad = () => {
    console.log('Avatar cargado correctamente:', userAvatar);
    setAvatarError(false);
  };

  // Componente para el avatar del usuario
  const UserAvatar = () => {
    const processedAvatarUrl = getUserAvatarUrl(userAvatar);
    
    // Función para obtener las iniciales
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
    
    // Si hay photoURL y no ha fallado, mostrar la imagen
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
    
    // Fallback: mostrar las iniciales del usuario o icono de usuario
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

  // Componente Slider actualizado con navegación superpuesta
  const GoalsSlider: React.FC<SliderProps> = ({ children, title, viewAllLink, emptyMessage }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const childrenArray = Array.isArray(children) ? children : [children].filter(Boolean);
    const totalSlides = childrenArray.length;

    useEffect(() => {
      const updateScrollButtons = () => {
        setCanScrollLeft(currentIndex > 0);
        setCanScrollRight(currentIndex < totalSlides - 1);
      };

      updateScrollButtons();
    }, [currentIndex, totalSlides]);

    const scrollTo = (direction: 'left' | 'right') => {
      if (sliderRef.current) {
        const newIndex = direction === 'left' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(totalSlides - 1, currentIndex + 1);
        
        setCurrentIndex(newIndex);
        
        const containerWidth = sliderRef.current.clientWidth;
        const newScrollLeft = newIndex * containerWidth;

        sliderRef.current.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth'
        });
      }
    };

    // Detectar cambios en el scroll manual
    const handleScroll = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.clientWidth;
        const scrollLeft = sliderRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / containerWidth);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }
    };

    useEffect(() => {
      const slider = sliderRef.current;
      if (slider) {
        slider.addEventListener('scroll', handleScroll);
        return () => slider.removeEventListener('scroll', handleScroll);
      }
    }, [currentIndex]);

    if (childrenArray.length === 0) {
      return (
        <div className="goals-slider-section">
          <div className="section-header">
            <h2>{title}</h2>
            <Link to={viewAllLink} className="section-link">Ver todas</Link>
          </div>
          <div className="empty-state">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div className="goals-slider-section">
        <div className="section-header">
          <h2>{title}</h2>
          <Link to={viewAllLink} className="section-link">Ver todas</Link>
        </div>
        <div className="goals-slider-container-with-nav">
          {/* Flecha izquierda */}
          {totalSlides > 1 && (
            <button 
              className={`slider-nav-btn slider-nav-left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft}
              aria-label="Deslizar hacia la izquierda"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Slider */}
          <div className="goals-slider" ref={sliderRef}>
            {childrenArray.map((child, index) => (
              <div key={index} className="slider-card">
                {child}
              </div>
            ))}
          </div>

          {/* Flecha derecha */}
          {totalSlides > 1 && (
            <button 
              className={`slider-nav-btn slider-nav-right ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight}
              aria-label="Deslizar hacia la derecha"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Indicadores de posición */}
          {totalSlides > 1 && (
            <div className="slider-indicators">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`slider-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    if (sliderRef.current) {
                      const containerWidth = sliderRef.current.clientWidth;
                      sliderRef.current.scrollTo({
                        left: index * containerWidth,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  aria-label={`Ir a la diapositiva ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const summaryData = [
    { title: 'Ahorro Total', value: `$${statistics.totalSavings.toLocaleString()}`, icon: DollarSign, color: 'var(--color-progress)' },
    { title: 'Metas Activas', value: statistics.activeGoals.toString(), icon: Bookmark, color: 'var(--color-accent)' },
    { title: 'Progreso Promedio', value: `${statistics.averageProgress}%`, icon: TrendingUp, color: 'var(--color-success)' },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/workspace' },
    { icon: Award, label: 'Mis Metas', path: '/targets' },
    { icon: Users, label: 'Metas en Equipo', path: '/teamboard' },
    { icon: CheckSquare, label: 'Listas', path: '/tasks' },
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

  // Componente GoalCard
  const GoalCard: React.FC<GoalCardProps> = ({ goal, isTeam = false }) => {
    const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
    
    return (
      <div className="goal-card slider-card">
        <div className="goal-card-header">
          <div className="goal-card-icon">
            <Bookmark size={20} />
          </div>
          <span className="goal-card-title">{goal.title}</span>
          {isTeam && 'members' in goal && goal.members && (
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
          <a href="#" className="nav-link" onClick={closeSidebar}>
            <Settings size={20} />
            <span>Configuración</span>
          </a>
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

      <main className="workspace-main">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="workspace-header">
            <div className="header-content">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div>
                <h1 className="header-title">Bienvenido, {userName.split(' ')[0]} <TrendingUp size={24} className="welcome-icon float" /></h1>
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
            <GoalsSlider 
              title="Mis Metas Individuales"
              viewAllLink="/targets"
              emptyMessage="No tienes metas individuales aún. ¡Crea tu primera meta!"
            >
              {individualGoals.map((goal: IndividualGoal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </GoalsSlider>
            
            <GoalsSlider 
              title="Metas en Equipo"
              viewAllLink="/teamboard"
              emptyMessage="No tienes metas en equipo aún. ¡Crea o únete a una meta grupal!"
            >
              {teamGoals.map((goal: TeamGoal) => (
                <GoalCard key={goal.id} goal={goal} isTeam />
              ))}
            </GoalsSlider>
          </motion.div>
          
          <motion.div 
            className="quick-list-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="section-header">
              <h2>Lista Rápida</h2>
              <Link to="/tasks" className="section-link">Ver detalles</Link>
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