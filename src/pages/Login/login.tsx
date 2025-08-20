// src/pages/Login/login.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import metaBuyLogo from '../../assets/images/metabuylogo.png';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Iniciar sesión
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/workspace');
      } else {
        // Registrarse
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Actualizar el perfil del usuario con su nombre
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        
        navigate('/workspace');
      }
    } catch (error: unknown) {
      console.error('Error de autenticación:', error);
      
      // Manejar diferentes tipos de errores
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/email-already-in-use':
          setError('Ya existe una cuenta con este correo');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres');
          break;
        case 'auth/invalid-email':
          setError('Formato de correo electrónico inválido');
          break;
        default:
          setError('Error en la autenticación. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/workspace');
    } catch (error: unknown) {
      console.error('Error con Google:', error);
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GithubAuthProvider();
      // Solicitar acceso al email
      provider.addScope('user:email');
      
      await signInWithPopup(auth, provider);
      navigate('/workspace');
    } catch (error: unknown) {
      console.error('Error con GitHub:', error);
      const firebaseError = error as { code?: string; message?: string };
      
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          setError('Inicio de sesión cancelado por el usuario');
          break;
        case 'auth/popup-blocked':
          setError('Popup bloqueado. Por favor habilita popups para este sitio');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('Ya existe una cuenta con este correo usando otro método');
          break;
        default:
          setError(`Error al iniciar sesión con GitHub: ${firebaseError.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
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
              {/* Back to Home Button */}
              <motion.button
                className="back-to-home"
                onClick={handleBackToHome}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                Volver al inicio
              </motion.button>

              <h1 className="form-title">
                {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta en MetaBuyX'}
              </h1>
              <p className="form-subtitle">
                {isLogin 
                  ? 'Continúa haciendo realidad tus planes' 
                  : 'Comienza tu viaje hacia tus metas'
                }
              </p>

              {/* Mostrar errores */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="form-options">
                    <label className="checkbox-container">
                      <input type="checkbox" disabled={loading} />
                      <span className="checkmark"></span>
                      Recordarme
                    </label>
                    <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="btn-submit"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  disabled={loading}
                >
                  <span>
                    {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
                  </span>
                  {!loading && <ArrowRight size={16} />}
                </motion.button>
              </form>

              <div className="form-switch">
                <p>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="switch-button"
                    disabled={loading}
                  >
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>

              <div className="divider">
                <span>o continúa con</span>
              </div>

              <div className="social-buttons">
                <button 
                  type="button" 
                  className="btn-social"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button 
                  type="button" 
                  className="btn-social"
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
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
              {/* Logo en movimiento circular */}
              <motion.div
                className="logo-container"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <img src={metaBuyLogo} alt="MetaBuyX Logo" className="rotating-logo" />
              </motion.div>

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

      {/* Footer Simplificado */}
      <footer className="login-footer">
        <div className="footer-content">
          <p>© 2025 MetaBuyX. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;