// src/pages/Teamboard/teamboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, User, Plus, Send, Check, Target, UserPlus, Mail, 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { teamService, invitationService } from '../../services/teamService';
import type { TeamGoal, TeamInvitation } from '../../types/team';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './teamboard.css';

const TeamBoard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados principales
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados para modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  
  // Estados para formularios
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';

  // Cargar datos
  useEffect(() => {
    const loadTeamData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const [goals, pendingInvitations] = await Promise.all([
          teamService.getUserTeamGoals(currentUser.uid),
          invitationService.getUserInvitations(currentUser.email!)
        ]);
        
        setTeamGoals(goals);
        setInvitations(pendingInvitations);
      } catch (error) {
        console.error('Error cargando datos del equipo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [currentUser]);

  // Enviar invitación
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inviteEmail.trim()) return;

    try {
      await invitationService.sendInvitation(
        currentUser.uid,
        currentUser.displayName || currentUser.email!,
        inviteEmail.trim().toLowerCase() // Normalizar email
      );
      setInviteEmail('');
      setShowInviteModal(false);
      alert('Invitación enviada correctamente');
      } catch (error: unknown) {
      console.error('Error enviando invitación:', error);
      if (error instanceof Error) {
        const errorMsg = error.message;
        if (errorMsg === 'INVITATION_EXISTS') {
          alert('Ya tienes una invitación pendiente para este usuario');
        } else if (errorMsg === 'INVALID_DATA') {
          alert('Datos inválidos. Verifica el email.');
        } else {
          alert('Error al enviar invitación. Intenta de nuevo.');
        }
      } else {
        alert('Error inesperado. Intenta de nuevo.');
      }
    }
  };

  // Aceptar invitación
  const handleAcceptInvitation = async (invitationId: string) => {
    if (!currentUser) return;

    try {
      await invitationService.acceptInvitation(invitationId, currentUser.uid);
      // Recargar datos
      const [goals, pendingInvitations] = await Promise.all([
        teamService.getUserTeamGoals(currentUser.uid),
        invitationService.getUserInvitations(currentUser.email!)
      ]);
      setTeamGoals(goals);
      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('Error aceptando invitación:', error);
      alert('Error al aceptar invitación');
    }
  };

  // Rechazar invitación
  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await invitationService.rejectInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error rechazando invitación:', error);
    }
  };

  // Crear meta de equipo
  const handleCreateTeamGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !teamName.trim() || !targetAmount) return;

    try {
      await teamService.createTeamGoal(currentUser.uid, {
        title: teamName.trim(),
        description: teamDescription.trim(),
        targetAmount: parseFloat(targetAmount)
      });
      
      // Limpiar formulario y cerrar modal
      setTeamName('');
      setTeamDescription('');
      setTargetAmount('');
      setShowCreateTeamModal(false);
      
      // Recargar metas
      const goals = await teamService.getUserTeamGoals(currentUser.uid);
      setTeamGoals(goals);
    } catch (error) {
      console.error('Error creando meta de equipo:', error);
      alert('Error al crear meta de equipo');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/workspace' },
    { icon: Target, label: 'Mis Metas', path: '/targets' },
    { icon: Users, label: 'Metas en Equipo', path: '/teamboard' },
    { icon: CheckSquare, label: 'Listas', path: '/tasks' },
  ];

  if (loading) {
    return (
      <div className="teamboard-layout">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando metas en equipo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teamboard-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`teamboard-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src={metaBuyLogo} alt="MetaBuy Logo" className="brand-logo" />
          <span className="brand-text">MetaBuyX</span>
          <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/settings" className="nav-link" onClick={() => setIsSidebarOpen(false)}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
          <button onClick={handleLogout} className="nav-link logout">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="teamboard-main">
        <header className="teamboard-header">
          <div className="header-content">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-info">
              <h1 className="header-title">Metas en Equipo</h1>
              <p className="header-subtitle">
                Colabora con otros usuarios para alcanzar objetivos compartidos
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn-invite" 
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={18} />
              Invitar Usuario
            </button>
            <button 
              className="btn-create-team" 
              onClick={() => setShowCreateTeamModal(true)}
            >
              <Plus size={18} />
              Nueva Meta de Equipo
            </button>
          </div>
        </header>

        <div className="teamboard-content">
          {/* Sección de invitaciones pendientes */}
          {invitations.length > 0 && (
            <section className="invitations-section">
              <h2 className="section-title">Invitaciones Pendientes</h2>
              <div className="invitations-grid">
                {invitations.map((invitation) => (
                  <motion.div 
                    key={invitation.id}
                    className="invitation-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="invitation-header">
                      <Mail size={20} className="invitation-icon" />
                      <div className="invitation-info">
                        <p className="invitation-from">
                          Invitación de <strong>{invitation.fromName}</strong>
                        </p>
                        <p className="invitation-email">{invitation.fromEmail}</p>
                      </div>
                    </div>
                    <div className="invitation-actions">
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <Check size={16} />
                        Aceptar
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleRejectInvitation(invitation.id)}
                      >
                        <X size={16} />
                        Rechazar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Sección de metas de equipo */}
          <section className="team-goals-section">
            <h2 className="section-title">Mis Metas de Equipo</h2>
            
            {teamGoals.length === 0 ? (
              <div className="empty-state">
                <Users size={64} className="empty-icon" />
                <h3>No tienes metas de equipo</h3>
                <p>Crea una nueva meta de equipo o acepta una invitación para comenzar.</p>
                <button 
                  className="btn-create-first"
                  onClick={() => setShowCreateTeamModal(true)}
                >
                  <Plus size={20} />
                  Crear primera meta de equipo
                </button>
              </div>
            ) : (
              <div className="team-goals-grid">
                {teamGoals.map((goal) => {
                  const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
                  const remainingAmount = goal.targetAmount - goal.savedAmount;
                  
                  return (
                    <motion.div 
                      key={goal.id}
                      className="team-goal-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="goal-header">
                        <div className="goal-icon">
                          <Users size={24} />
                        </div>
                        <div className="goal-info">
                          <h3 className="goal-title">{goal.title}</h3>
                          {goal.description && (
                            <p className="goal-description">{goal.description}</p>
                          )}
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

                      <div className="goal-members">
                        <div className="members-info">
                          <Users size={16} />
                          <span>{goal.members.length} miembro{goal.members.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal para invitar usuario */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invitar Usuario</h3>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendInvitation}>
              <div className="form-group">
                <label htmlFor="inviteEmail">Email del usuario a invitar</label>
                <input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowInviteModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-send">
                  <Send size={16} />
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear meta de equipo */}
      {showCreateTeamModal && (
        <div className="modal-overlay" onClick={() => setShowCreateTeamModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Meta de Equipo</h3>
              <button className="modal-close" onClick={() => setShowCreateTeamModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeamGoal}>
              <div className="form-group">
                <label htmlFor="teamName">Nombre de la meta</label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej: Vacaciones grupales"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="teamDescription">Descripción (opcional)</label>
                <textarea
                  id="teamDescription"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Describe el objetivo de la meta..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="targetAmount">Cantidad objetivo</label>
                <input
                  id="targetAmount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateTeamModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-create">
                  <Plus size={16} />
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBoard;