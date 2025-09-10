// src/pages/Tasks/tasks.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, Plus, Trash2, Edit3, Target, User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './tasks.css';

const Tasks: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { quickListItems, addQuickListItem, toggleQuickListItem, deleteQuickListItem, updateQuickListItem, loading } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para el sidebar y formulario
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [editText, setEditText] = useState('');
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
          className="avatar"
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          crossOrigin="anonymous"
        />
      );
    }
    
    // Fallback: mostrar las iniciales del usuario o icono de usuario
    return (
      <div className="avatar avatar-fallback">
        {initials ? (
          <span className="user-initials">{initials}</span>
        ) : (
          <User size={20} />
        )}
      </div>
    );
  };

  // Manejar envío del formulario
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    try {
      await addQuickListItem(newItemText.trim(), 0);
      setNewItemText('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error agregando item:', error);
    }
  };

  // Manejar toggle de item
  const handleToggleItem = async (itemId: string) => {
    try {
      await toggleQuickListItem(itemId);
    } catch (error) {
      console.error('Error cambiando estado del item:', error);
    }
  };

  // Manejar eliminación de item
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        await deleteQuickListItem(itemId);
      } catch (error) {
        console.error('Error eliminando item:', error);
      }
    }
  };

  // Iniciar edición
  const startEditing = (item: { id: string; text: string; completed: boolean; price: number }) => {
    setEditingItem(item.id);
    setEditText(item.text);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingItem(null);
    setEditText('');
  };

  // Guardar edición
  const saveEdit = async (itemId: string) => {
    if (!editText.trim()) return;
    
    try {
      await updateQuickListItem(itemId, editText.trim());
      setEditingItem(null);
      setEditText('');
    } catch (error) {
      console.error('Error actualizando item:', error);
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
      <div className="tasks-layout">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="tasks-layout">
      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={metaBuyLogo} alt="MetaBuy" className="logo" />
          <span className="brand">MetaBuyX</span>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="nav">
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
          <div className="user-info">
            <UserAvatar />
            <div>
              <div className="name">{userName}</div>
              <div className="email">{userEmail}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div>
            <h1>Listas Rápidas</h1>
            <p>Organiza tus notas y tareas</p>
          </div>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Agregar
          </button>
        </header>

        <div className="content">
          {quickListItems.length === 0 ? (
            <div className="empty">
              <CheckSquare size={48} />
              <h3>Lista vacía</h3>
              <p>Agrega elementos para comenzar</p>
              <button className="create-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} />
                Crear primer elemento
              </button>
            </div>
          ) : (
            <div className="list">
              {quickListItems.map((item) => (
                <motion.div 
                  key={item.id}
                  className={`item ${item.completed ? 'completed' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <div className="item-content">
                    <button 
                      className="checkbox"
                      onClick={() => handleToggleItem(item.id)}
                    >
                      {item.completed && <CheckSquare size={16} />}
                      {!item.completed && <div className="empty-check" />}
                    </button>
                    
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEdit(item.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        onBlur={() => saveEdit(item.id)}
                        autoFocus
                        className="edit-input"
                      />
                    ) : (
                      <span className="text">{item.text}</span>
                    )}
                  </div>
                  
                  <div className="actions">
                    {editingItem === item.id ? (
                      <>
                        <button onClick={() => saveEdit(item.id)} className="save-btn">
                          <CheckSquare size={16} />
                        </button>
                        <button onClick={cancelEditing} className="cancel-btn">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(item)}
                          className="edit-btn"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal para agregar elemento */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Elemento</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Elemento</label>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Escribe aquí..."
                  required
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit">
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;