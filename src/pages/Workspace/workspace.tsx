// src/pages/Workspace/workspace.tsx
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  PlusCircle,
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  Plane,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './workspace.css';

const summaryData = [
  {
    title: 'Ahorro Total',
    value: '$1,250.00',
    icon: DollarSign,
    color: 'var(--color-progress)',
  },
  {
    title: 'Metas Activas',
    value: '4',
    icon: Target,
    color: 'var(--color-accent)',
  },
  {
    title: 'Progreso Promedio',
    value: '62%',
    icon: TrendingUp,
    color: 'var(--color-success)',
  },
];

const individualGoals = [
  {
    id: 1,
    title: 'iPhone 16 Pro',
    icon: CreditCard,
    saved: 450,
    total: 999,
  },
  {
    id: 2,
    title: 'Regalo de Cumpleaños',
    icon: Gift,
    saved: 120,
    total: 150,
  },
];

const teamGoals = [
  {
    id: 3,
    title: 'Viaje a Cancún',
    icon: Plane,
    saved: 2800,
    total: 4000,
    members: ['https://i.pravatar.cc/150?u=user1', 'https://i.pravatar.cc/150?u=user2'],
  },
];

const quickListItems = [
    { id: 1, text: 'Comprar monitor nuevo', price: '$250', completed: false },
    { id: 2, text: 'Suscripción anual a Figma', price: '$144', completed: true },
    { id: 3, text: 'Renovar dominio web', price: '$15', completed: false },
]

// Variante para animaciones de lista
const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const Workspace = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Extraer información del usuario
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

  return (
    <div className="workspace-layout">
      {/* --- BARRA LATERAL --- */}
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <Target className="brand-icon" size={28} />
          <span className="brand-text">MetaBuyX</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-link active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-link">
            <Target size={20} />
            <span>Mis Metas</span>
          </a>
          <a href="#" className="nav-link">
            <Users size={20} />
            <span>Metas en Equipo</span>
          </a>
          <a href="#" className="nav-link">
            <CheckSquare size={20} />
            <span>Listas</span>
          </a>
        </nav>
        <div className="sidebar-footer">
           <a href="#" className="nav-link">
             <Settings size={20} />
             <span>Configuración</span>
           </a>
           <button 
             onClick={handleLogout}
             className="nav-link logout"
             style={{
               background: 'none',
               border: 'none',
               padding: '0',
               cursor: 'pointer',
               width: '100%',
               textAlign: 'left',
               display: 'flex',
               alignItems: 'center',
               gap: '12px',
               color: 'inherit',
               fontSize: 'inherit'
             }}
           >
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

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="workspace-main">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            {/* --- CABECERA --- */}
            <header className="workspace-header">
                <div>
                    <h1 className="header-title">Bienvenida de nuevo, {userName.split(' ')[0]} 👋</h1>
                    <p className="header-subtitle">Aquí tienes un resumen de tus planes de ahorro.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Buscar una meta..." />
                    </div>
                    <button className="btn-cta">
                        <PlusCircle size={18} />
                        <span>Añadir Nueva Meta</span>
                    </button>
                </div>
            </header>

            {/* --- TARJETAS DE RESUMEN --- */}
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
            {/* --- SECCIÓN DE METAS --- */}
            <motion.div 
                className="goals-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="section-header">
                    <h2>Mis Metas Individuales</h2>
                    <a href="#">Ver todas</a>
                </div>
                <div className="goals-list">
                    {individualGoals.map(goal => {
                        const progress = Math.round((goal.saved / goal.total) * 100);
                        return (
                            <div className="goal-card" key={goal.id}>
                                <div className="goal-card-header">
                                    <div className="goal-card-icon">
                                        <goal.icon size={20} />
                                    </div>
                                    <span className="goal-card-title">{goal.title}</span>
                                </div>
                                <div className="goal-card-progress">
                                    <p className="progress-text">
                                        <span>${goal.saved.toLocaleString()}</span> / ${goal.total.toLocaleString()}
                                    </p>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <button className="btn-add-saving">Añadir Ahorro</button>
                            </div>
                        )
                    })}
                </div>
                
                <div className="section-header">
                    <h2>Metas en Equipo</h2>
                </div>
                 <div className="goals-list">
                    {teamGoals.map(goal => {
                        const progress = Math.round((goal.saved / goal.total) * 100);
                        return (
                            <div className="goal-card team" key={goal.id}>
                                <div className="goal-card-header">
                                    <div className="goal-card-icon">
                                        <goal.icon size={20} />
                                    </div>
                                    <span className="goal-card-title">{goal.title}</span>
                                    <div className="team-avatars">
                                        {goal.members.map((avatarUrl, index) => <img key={index} src={avatarUrl} alt="member"/>)}
                                    </div>
                                </div>
                                <div className="goal-card-progress">
                                    <p className="progress-text">
                                        <span>${goal.saved.toLocaleString()}</span> / ${goal.total.toLocaleString()}
                                    </p>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <button className="btn-add-saving">Aportar al Grupo</button>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
            
            {/* --- SECCIÓN DE LISTA RÁPIDA --- */}
            <motion.div 
                className="quick-list-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="section-header">
                    <h2>Lista Rápida</h2>
                    <a href="#">Ver detalles</a>
                </div>
                <div className="quick-list-card">
                    {quickListItems.map(item => (
                         <div className={`checklist-item ${item.completed ? 'completed' : ''}`} key={item.id}>
                            <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                                {item.completed && <div className="check-mark"></div>}
                            </div>
                            <span className="item-text">{item.text}</span>
                            <span className="item-price">{item.price}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

      </main>
    </div>
  );
};

export default Workspace;