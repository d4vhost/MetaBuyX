// src/pages/Teamboard/teamboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, User, Plus, Send, Check, Target, UserPlus, Mail, 
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { teamService, invitationService } from '../../services/teamService';
import type { TeamGoal, TeamInvitation, TeamMember } from '../../types/team';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './teamboard.css';

const TeamBoard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados principales
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados para modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  // Estados para formularios
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState('');
  
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';

  // Cargar datos
  useEffect(() => {
    const loadTeamData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const [goals, pendingInvitations, members] = await Promise.all([
          teamService.getUserTeamGoals(currentUser.uid),
          invitationService.getUserInvitations(currentUser.email!),
          teamService.getTeamMembers(currentUser.uid)
        ]);
        
        setTeamGoals(goals);
        setInvitations(pendingInvitations);
        setTeamMembers(members);
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
        inviteEmail.trim().toLowerCase()
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
      const [goals, pendingInvitations, members] = await Promise.all([
        teamService.getUserTeamGoals(currentUser.uid),
        invitationService.getUserInvitations(currentUser.email!),
        teamService.getTeamMembers(currentUser.uid)
      ]);
      setTeamGoals(goals);
      setInvitations(pendingInvitations);
      setTeamMembers(members);
      
      alert('¡Te has unido al equipo exitosamente!');
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
      
      alert('Meta de equipo creada exitosamente');
    } catch (error) {
      console.error('Error creando meta de equipo:', error);
      alert('Error al crear meta de equipo');
    }
  };

  // Contribuir a meta
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedGoalId || !contributionAmount) return;

    try {
      const amount = parseFloat(contributionAmount);
      await teamService.contributeToTeamGoal(selectedGoalId, currentUser.uid, amount);
      
      // Limpiar formulario y cerrar modal
      setContributionAmount('');
      setSelectedGoalId('');
      setShowContributeModal(false);
      
      // Recargar metas
      const goals = await teamService.getUserTeamGoals(currentUser.uid);
      setTeamGoals(goals);
      
      alert(`Has contribuido $${amount.toLocaleString()} a la meta`);
    } catch (error) {
      console.error('Error contribuyendo a la meta:', error);
      alert('Error al realizar la contribución');
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

  // Función para abrir modal de contribución
  const openContributeModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowContributeModal(true);
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
          {/* Sección de miembros del equipo */}
          {teamMembers.length > 0 && (
            <section className="team-members-section">
              <h2 className="section-title">Miembros del Equipo</h2>
              <div className="team-members-list">
                <div className="member-card current-user">
                  <div className="member-avatar">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt={userName} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{userName} (Tú)</span>
                    <span className="member-email">{userEmail}</span>
                  </div>
                </div>
                {teamMembers.map((member) => (
                  <div key={member.uid} className="member-card">
                    <div className="member-avatar">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.displayName} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{member.displayName}</span>
                      <span className="member-email">{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                  const userContribution = goal.memberContributions[currentUser!.uid] || 0;
                  
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

                      {/* Miembros de la meta */}
                      <div className="goal-members">
                        <div className="members-header">
                          <Users size={16} />
                          <span>{goal.members.length} miembro{goal.members.length !== 1 ? 's' : ''}</span>
                        </div>
                        {goal.membersInfo && goal.membersInfo.length > 0 && (
                          <div className="members-avatars">
                            {goal.membersInfo.slice(0, 4).map((member) => (
                              <div key={member.uid} className="member-avatar-small" title={member.displayName}>
                                {member.photoURL ? (
                                  <img src={member.photoURL} alt={member.displayName} />
                                ) : (
                                  <User size={12} />
                                )}
                              </div>
                            ))}
                            {goal.membersInfo.length > 4 && (
                              <div className="member-avatar-small more-members">
                                <span>+{goal.membersInfo.length - 4}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Contribución personal */}
                      <div className="personal-contribution">
                        <div className="contribution-info">
                          <span className="contribution-label">Tu contribución:</span>
                          <span className="contribution-amount">${userContribution.toLocaleString()}</span>
                        </div>
                        <div className="contribution-percentage">
                          {goal.savedAmount > 0 && (
                            <span>{Math.round((userContribution / goal.savedAmount) * 100)}% del total</span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      {!goal.isCompleted && (
                        <div className="goal-actions">
                          <button 
                            className="btn-contribute"
                            onClick={() => openContributeModal(goal.id)}
                          >
                            <DollarSign size={16} />
                            Contribuir
                          </button>
                        </div>
                      )}

                      {goal.isCompleted && (
                        <div className="goal-completed">
                          <Check size={16} />
                          <span>¡Meta completada!</span>
                        </div>
                      )}
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
                <p className="form-help">
                  Al aceptar la invitación, podrán colaborar en todas las metas existentes y futuras.
                </p>
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
              {teamMembers.length > 0 && (
                <div className="form-info">
                  <p>Esta meta será compartida automáticamente con todos los miembros de tu equipo ({teamMembers.length + 1} miembro{teamMembers.length !== 0 ? 's' : ''}).</p>
                </div>
              )}
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

      {/* Modal para contribuir */}
      {showContributeModal && (
        <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contribuir a Meta</h3>
              <button className="modal-close" onClick={() => setShowContributeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleContribute}>
              <div className="form-group">
                <label htmlFor="contributionAmount">Cantidad a contribuir</label>
                <input
                  id="contributionAmount"
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
                <p className="form-help">
                  Esta cantidad se sumará a la meta del equipo y se registrará como tu contribución.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowContributeModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-contribute-submit">
                  <DollarSign size={16} />
                  Contribuir
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