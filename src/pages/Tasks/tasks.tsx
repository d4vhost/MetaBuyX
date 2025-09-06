// src/pages/Tasks/tasks.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, User, Plus, Trash2, Check, Target, ShoppingCart,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './tasks.css';

const Tasks: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { quickListItems, addQuickListItem, toggleQuickListItem, deleteQuickListItem, loading } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para el sidebar y formulario
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';

  // Manejar envío del formulario
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const price = parseFloat(newItemPrice) || 0;
    
    try {
      await addQuickListItem(newItemText.trim(), price);
      setNewItemText('');
      setNewItemPrice('');
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

  // Estadísticas de la lista
  const totalItems = quickListItems.length;
  const completedItems = quickListItems.filter(item => item.completed).length;
  const totalValue = quickListItems.reduce((sum, item) => sum + item.price, 0);
  const completedValue = quickListItems.filter(item => item.completed).reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="tasks-layout">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando listas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`tasks-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
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
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={userName} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="tasks-main">
        <header className="tasks-header">
          <div className="header-content">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-info">
              <h1 className="header-title">Mis Listas</h1>
              <p className="header-subtitle">
                Organiza tus compras y tareas pendientes de forma rápida
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn-add-item" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Agregar Elemento
            </button>
          </div>
        </header>

        <div className="tasks-content">
          {/* Estadísticas de la lista */}
          {totalItems > 0 && (
            <section className="tasks-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <CheckSquare size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{completedItems}/{totalItems}</span>
                    <span className="stat-label">Completados</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">${totalValue.toLocaleString()}</span>
                    <span className="stat-label">Valor Total</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <ShoppingCart size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">${completedValue.toLocaleString()}</span>
                    <span className="stat-label">Ya Comprado</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Lista de elementos */}
          <section className="tasks-list-section">
            <div className="section-header">
              <h2 className="section-title">Lista Rápida</h2>
              {totalItems > 0 && (
                <span className="items-count">{totalItems} elemento{totalItems !== 1 ? 's' : ''}</span>
              )}
            </div>
            
            {quickListItems.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={64} className="empty-icon" />
                <h3>Tu lista está vacía</h3>
                <p>Agrega elementos a tu lista rápida para no olvidar nada importante.</p>
                <button 
                  className="btn-create-first"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus size={20} />
                  Agregar primer elemento
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {quickListItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    className={`task-item ${item.completed ? 'completed' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <div className="task-content">
                      <button 
                        className="task-checkbox"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        {item.completed && <Check size={16} />}
                      </button>
                      <div className="task-info">
                        <span className="task-text">{item.text}</span>
                        {item.price > 0 && (
                          <span className="task-price">${item.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="task-delete"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Eliminar elemento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal para agregar elemento */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Elemento</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label htmlFor="itemText">Elemento</label>
                <input
                  id="itemText"
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ej: Comprar leche"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemPrice">Precio estimado (opcional)</label>
                <input
                  id="itemPrice"
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="form-help">
                  Agrega un precio estimado para llevar control de tus gastos.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-add">
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