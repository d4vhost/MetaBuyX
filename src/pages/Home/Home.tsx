// src/pages/Home.tsx

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, Wallet, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import metaBuyLogo from "../../assets/images/metabuylogo.png";
import "./home.css";

// === Datos para componentes (Data-driven UI) ===
const featuresData = [
  { icon: <Wallet size={20} />, text: "Simulación Inteligente" },
  { icon: <Search size={20} />, text: "Búsqueda Avanzada" },
  { icon: <Users size={20} />, text: "Objetivos Compartidos" },
];

const checklistItemsData = [
  { text: "MacBook Pro 16\"", price: "$2,499", completed: true },
  { text: "AirPods Pro", price: "$249", completed: true },
  { text: "Monitor 4K", price: "$599", completed: false },
  { text: "Escritorio Standing", price: "$899", completed: false },
];

const goalItemsData = [
  { title: "Viaje a Tokio", amount: "$3,200", progress: 78 },
  { title: "Curso de Programación", amount: "$449", progress: 45 },
  { title: "Cámara Profesional", amount: "$1,899", progress: 23 },
];

const footerLinksData = [
  { title: "Producto", links: ["Características", "Precios", "Seguridad"] },
  { title: "Recursos", links: ["Documentación", "Guías", "Blog"] },
  { title: "Soporte", links: ["Centro de ayuda", "Contacto", "Estado del servicio"] },
];


// === Componentes Reutilizables ===
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
    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
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

const demoCards = [
    {
      title: "Mi Lista de Trabajo",
      content: (
        <div className="demo-content">
          {checklistItemsData.map((item, index) => (
            <ChecklistItem
              key={`checklist-${item.text}-${index}`}
              {...item}
              delay={0.1 + (index * 0.1)}
            />
          ))}
        </div>
      )
    },
    {
      title: "Progreso Visual",
      content: (
        <div className="demo-content progress-demo">
          <div className="progress-item">
            <div className="progress-header">
              <span>iPhone 16 Pro</span>
              <span>$1,199</span>
            </div>
            <div className="progress-container">
              <motion.div
                className="progress-fill"
                key="progress-fill-iphone"
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
          <div className="progress-item">
            <div className="progress-header">
              <span>PlayStation 5</span>
              <span>$499</span>
            </div>
            <div className="progress-container">
              <motion.div
                className="progress-fill"
                key="progress-fill-ps5"
                initial={{ width: "0%" }}
                animate={{ width: "34%" }}
                transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 }}
              />
            </div>
            <div className="progress-details">
              <span>$170 ahorrados</span>
              <span>34%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mis Objetivos",
      content: (
        <div className="demo-content goals-list">
          {goalItemsData.map((goal, index) => (
            <GoalItem
              key={`goal-${goal.title}-${index}`}
              {...goal}
              delay={0.1 + (index * 0.1)}
            />
          ))}
        </div>
      )
    }
  ];

// === Componente del Carrusel de Demos (Lógica simplificada) ===
const AnimatedDemoCards = () => {
  const [currentCard, setCurrentCard] = useState(0);

  // Lógica de intervalo simplificada con useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % demoCards.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [currentCard]);

  const handleIndicatorClick = (index: number) => {
    if (index !== currentCard) {
      setCurrentCard(index);
    }
  };

  return (
    <div className="demo-card-wrapper">
      <div className="demo-card-container">
        <AnimatePresence mode="wait">
          <motion.div
            className="demo-card"
            key={`card-${currentCard}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h4 className="demo-title">{demoCards[currentCard].title}</h4>
            {demoCards[currentCard].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="demo-indicators">
        {demoCards.map((_, index) => (
          <motion.button
            key={`indicator-${index}`}
            className={`demo-indicator ${index === currentCard ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    </div>
  );
};

// === Componente Principal de la Página ===
function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/login');

  const animations: { [key: string]: Variants } = {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    scaleIn: {
      hidden: { scale: 0.98, opacity: 0 },
      visible: {
        scale: 1, opacity: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    }
  };

  return (
    <div className="home-wrapper">
      <motion.main
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="main-container"
      >
        <section className="hero-section-split">
          <div className="hero-content-left">
            <motion.div
              className="hero-logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <img src={metaBuyLogo} alt="MetaBuyX Logo" className="brand-logo-image" />
              <span>MetaBuyX</span>
            </motion.div>

            <motion.div variants={animations.fadeInUp}>
              <h1 className="hero-title">
                ¿Imposible?<br />
                <span className="hero-title-accent">Posible.</span>
              </h1>
              <p className="hero-subtitle">
                Tu asistente inteligente para convertir sueños en planes alcanzables
              </p>
              <div className="hero-features">
                {featuresData.map((feature, index) => (
                  <div key={index} className="hero-feature">
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              <motion.button
                variants={animations.scaleIn}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="btn btn-cta"
                onClick={handleGetStarted}
              >
                <span>Comenzar</span>
                <ArrowRight size={14} />
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
      </motion.main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="brand-footer">
                <img src={metaBuyLogo} alt="MetaBuyX Logo" className="brand-logo-image" />
                <span>MetaBuyX</span>
              </div>
              <p>Tu asistente inteligente para convertir sueños en planes alcanzables.</p>
            </div>
            <div className="footer-links">
              {footerLinksData.map((column) => (
                <div key={column.title} className="footer-column">
                  <h4>{column.title}</h4>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link}><a href="#">{link}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
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