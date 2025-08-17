// src/pages/Login/login.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar tu lógica de autenticación
    console.log('Form submitted:', formData);
    
    // Por ahora, simplemente redirige al dashboard o home
    // navigate('/dashboard');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Header */}
        <motion.div 
          className="login-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="login-brand" onClick={handleBackToHome}>
            <Sparkles className="brand-icon" size={20} />
            <span className="brand-text">MetaBuyX</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="login-content">
          {/* Left Side - Form */}
          <motion.div 
            className="login-form-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="form-container">
              <h1 className="form-title">
                {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}
              </h1>
              <p className="form-subtitle">
                {isLogin 
                  ? 'Continúa haciendo realidad tus planes' 
                  : 'Comienza tu viaje hacia tus metas'
                }
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="input-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="password">Contraseña</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <div className="input-with-icon">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="form-options">
                    <label className="checkbox-container">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Recordarme
                    </label>
                    <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="btn-submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                  <ArrowRight size={16} />
                </motion.button>
              </form>

              <div className="form-switch">
                <p>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="switch-button"
                  >
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>

              <div className="divider">
                <span>o continúa con</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="btn-social">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="btn-social">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Visual */}
          <motion.div 
            className="login-visual-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="visual-content">
              <h2>Tu futuro comienza aquí</h2>
              <p>Únete a miles de personas que ya están convirtiendo sus sueños en realidad con MetaBuyX</p>
              
              <div className="stats">
                <div className="stat">
                  <h3>10K+</h3>
                  <p>Metas alcanzadas</p>
                </div>
                <div className="stat">
                  <h3>$2M+</h3>
                  <p>Ahorros generados</p>
                </div>
                <div className="stat">
                  <h3>95%</h3>
                  <p>Tasa de éxito</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;