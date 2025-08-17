// src/pages/Home.tsx

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./home.css";

// Iconos minimalistas
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a2 2 0 0 1 0 4H5a2 2 0 0 1 0 4h13a1 1 0 0 0 1-1v-3"></path>
    <path d="M16 12h2"></path>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const CollaborateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <path d="M20 8v6M23 11h-6"></path>
  </svg>
);

// Datos para las demos
const checklistItems = [
  { text: "MacBook Pro 16\"", price: "$2,499", completed: true },
  { text: "AirPods Pro", price: "$249", completed: true },
  { text: "Monitor 4K", price: "$599", completed: false },
  { text: "Escritorio Standing", price: "$899", completed: false }
];

const goalItems = [
  { title: "Viaje a Tokio", amount: "$3,200", progress: 78 },
  { title: "Curso de Programación", amount: "$449", progress: 45 },
  { title: "Cámara Profesional", amount: "$1,899", progress: 23 }
];

const ChecklistItem = ({ text, price, completed, delay }: { text: string; price: string; completed?: boolean; delay: number }) => (
  <motion.div
    className={`checklist-item ${completed ? 'completed' : ''}`}
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className={`checkbox ${completed ? 'checked' : ''}`}>
      {completed && <div className="check-mark" />}
    </div>
    <span className="item-text">{text}</span>
    <span className="item-price">{price}</span>
  </motion.div>
);

const GoalItem = ({ title, amount, progress, delay }: { title: string; amount: string; progress: number; delay: number }) => (
  <motion.div
    className="goal-item"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
  >
    <div className="goal-header">
      <span className="goal-title">{title}</span>
      <span className="goal-amount">{amount}</span>
    </div>
    <div className="goal-progress">
      <motion.div 
        className="goal-progress-fill"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: delay + 0.3 }}
      />
    </div>
    <div className="goal-percentage">{progress}% completado</div>
  </motion.div>
);

const AnimatedDemoCards = () => {
  const [currentCard, setCurrentCard] = useState(0);

  const demoCards = [
    {
      title: "Mi Lista de Trabajo",
      type: "checklist",
      content: (
        <div className="demo-content">
          {checklistItems.map((item: { text: string; price: string; completed: boolean }, index: number) => (
            <ChecklistItem
              key={item.text}
              {...item}
              delay={0.1 + (index * 0.1)}
            />
          ))}
        </div>
      )
    },
    {
      title: "Progreso Visual",
      type: "progress",
      content: (
        <div className="progress-demo">
          <div className="progress-header">
            <span>iPhone 16 Pro</span>
            <span>$1,199</span>
          </div>
          <div className="progress-container">
            <motion.div
              className="progress-fill"
              initial={{ width: "0%" }}
              animate={{ width: "72%" }}
              transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
            />
          </div>
          <div className="progress-details">
            <span>$863 ahorrados</span>
            <span>72%</span>
          </div>
        </div>
      )
    },
    {
      title: "Mis Objetivos",
      type: "goals",
      content: (
        <div className="goals-list">
          {goalItems.map((goal: { title: string; amount: string; progress: number }, index: number) => (
            <GoalItem
              key={goal.title}
              {...goal}
              delay={0.1 + (index * 0.1)}
            />
          ))}
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % demoCards.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [demoCards.length]);

  return (
    <div className="demo-card-wrapper">
      <motion.div 
        className="demo-card"
        key={currentCard}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h4 className="demo-title">{demoCards[currentCard].title}</h4>
        {demoCards[currentCard].content}
      </motion.div>
      
      <div className="demo-indicators">
        {demoCards.map((_, index) => (
          <motion.button
            key={index}
            className={`demo-indicator ${index === currentCard ? 'active' : ''}`}
            onClick={() => setCurrentCard(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
};

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const animations: { [key: string]: Variants } = {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    scaleIn: {
      hidden: { scale: 0.95, opacity: 0 },
      visible: {
        scale: 1, opacity: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    }
  };

  return (
    <div className="home-wrapper">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <Sparkles className="brand-icon" size={20} />
            <span className="brand-text">MetaBuyX</span>
          </div>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetStarted}
          >
            Comenzar
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="main-container"
      >
        {/* Hero Section with Side Layout */}
        <section className="hero-section-split">
          <div className="hero-content-left">
            <motion.div variants={animations.fadeInUp}>
              <h1 className="hero-title">
                ¿Imposible?<br />
                <span className="hero-title-accent">Posible.</span>
              </h1>
              <p className="hero-subtitle">
                Tu asistente inteligente para convertir sueños en planes alcanzables
              </p>
              <div className="hero-features">
                <div className="hero-feature">
                  <WalletIcon />
                  <span>Simulación Inteligente</span>
                </div>
                <div className="hero-feature">
                  <SearchIcon />
                  <span>Búsqueda Avanzada</span>
                </div>
                <div className="hero-feature">
                  <CollaborateIcon />
                  <span>Objetivos Compartidos</span>
                </div>
              </div>
              <motion.button
                variants={animations.scaleIn}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-cta"
                onClick={handleGetStarted}
              >
                <span>Crear mi primer plan</span>
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </div>
          
          <motion.div 
            className="hero-demo-right"
            variants={animations.scaleIn}
          >
            <AnimatedDemoCards />
          </motion.div>
        </section>
      </motion.div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="brand-footer">
                <Sparkles size={18} />
                <span>MetaBuyX</span>
              </div>
              <p>Tu asistente inteligente para convertir sueños en planes alcanzables</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Producto</h4>
                <ul>
                  <li><a href="#">Características</a></li>
                  <li><a href="#">Precios</a></li>
                  <li><a href="#">Seguridad</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Recursos</h4>
                <ul>
                  <li><a href="#">Documentación</a></li>
                  <li><a href="#">Guías</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Soporte</h4>
                <ul>
                  <li><a href="#">Centro de ayuda</a></li>
                  <li><a href="#">Contacto</a></li>
                  <li><a href="#">Estado del servicio</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} MetaBuyX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;