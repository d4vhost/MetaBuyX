// src/pages/Home.tsx

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Users, Wallet, CheckSquare } from "lucide-react";

// Importa los estilos desde un archivo CSS externo.
import "./home.css";

// Define la interfaz para las props, esto es crucial para evitar errores de TypeScript.
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

// Componente para las tarjetas de características con su propio estado de animación
const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94], 
        delay 
      },
    },
  };

  return (
    <motion.div 
      variants={cardVariants} 
      className="feature-card"
      whileHover={{ 
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <div className="feature-icon-wrapper">
        <div className="feature-icon">{icon}</div>
        <div className="icon-glow"></div>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="card-shine"></div>
    </motion.div>
  );
};

function Home() {
  // --- Variantes de Animación ---
  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const liquidScale: Variants = {
    hidden: { scale: 0.8, opacity: 0, filter: "blur(12px)" },
    visible: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="home-wrapper">
      {/* Navbar con efecto glassmorphism */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-text">MetaBuyX</span>
            <div className="logo-reflection"></div>
          </div>
          <motion.button
            className="btn-primary"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.25)",
              backdropFilter: "blur(24px)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            ¡Comenzar!
            <div className="btn-shine"></div>
          </motion.button>
        </div>
        <div className="navbar-blur"></div>
      </nav>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="home-container"
      >
        {/* --- Sección Hero con efectos líquidos --- */}
        <motion.header variants={fadeInUp} className="home-hero">
          <div className="hero-background">
            <div className="liquid-orb orb-1"></div>
            <div className="liquid-orb orb-2"></div>
            <div className="liquid-orb orb-3"></div>
          </div>
          
          <h1 className="hero-title">
            Planifica, Ahorra, <span className="gradient-text">Conquista</span>.
            <div className="title-reflection"></div>
          </h1>
          
          <p className="hero-subtitle">
            MetaBuyX es tu socio inteligente para alcanzar cualquier meta de compra.
            Simula tu ahorro, organiza tus objetivos y haz realidad tus sueños, solo o en equipo.
          </p>
          
          <motion.button
            variants={liquidScale}
            whileHover={{ 
              scale: 1.08, 
              boxShadow: "0px 16px 48px rgba(59, 130, 246, 0.4)",
              backdropFilter: "blur(24px)"
            }}
            whileTap={{ scale: 0.95 }}
            className="btn-cta"
          >
            <span>Empieza tu plan ahora</span>
            <ArrowRight size={20} />
            <div className="btn-liquid-bg"></div>
            <div className="btn-shine-effect"></div>
          </motion.button>
        </motion.header>

        {/* --- Sección de Características con Glass Effect --- */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="features-section"
        >
          <motion.h2 variants={fadeInUp} className="section-title">
            Todo lo que necesitas para alcanzar tus metas
            <div className="title-glass-bg"></div>
          </motion.h2>
          
          <div className="features-grid">
            <FeatureCard
              icon={<Wallet size={32} />}
              title="Simulación de Ahorros"
              description="Simula tus depósitos y observa cómo se acumula tu progreso hacia cualquier meta. Desde gadgets hasta viajes, cada centavo cuenta."
              delay={0.1}
            />
            <FeatureCard
              icon={<CheckSquare size={32} />}
              title="Buscador Inteligente"
              description="Encuentra productos con nuestro buscador que te sugiere opciones al escribir. Si no lo encuentras, agrégalo manualmente con su precio."
              delay={0.25}
            />
            <FeatureCard
              icon={<Users size={32} />}
              title="Metas Colaborativas"
              description="Comparte objetivos con amigos o familiares. Planifiquen juntos ese viaje soñado o ese regalo especial que quieren conseguir."
              delay={0.4}
            />
          </div>
        </motion.section>

        {/* --- Secciones con Windows Glassmorphism --- */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="simulation-section"
        >
          <motion.div variants={fadeInUp} className="simulation-text">
            <h2 className="section-title">Organiza tus compras como una lista</h2>
            <p>
              Crea listas de todo lo que necesitas comprar. Marca cada elemento conforme 
              lo adquieras y mantén un control visual de tu progreso de compras.
            </p>
          </motion.div>
          
          <motion.div variants={liquidScale} className="simulation-visual">
            <div className="glass-window">
              <div className="glass-header">
                <div className="traffic-lights">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
              </div>
              
              <div className="glass-content">
                <h4 className="window-title">Lista de Compras</h4>
                <div className="checklist">
                  <motion.div 
                    className="checklist-item completed"
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="glass-checkbox checked">
                      <div className="check-mark"></div>
                    </div>
                    <span>iPhone 16 - $800</span>
                    <div className="item-shine"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="checklist-item completed"
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                  >
                    <div className="glass-checkbox checked">
                      <div className="check-mark"></div>
                    </div>
                    <span>Mouse Gaming - $45</span>
                    <div className="item-shine"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="checklist-item"
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="glass-checkbox">
                      <div className="checkbox-glow"></div>
                    </div>
                    <span>Auriculares - $120</span>
                    <div className="item-shine"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="checklist-item"
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.65, duration: 0.6 }}
                  >
                    <div className="glass-checkbox">
                      <div className="checkbox-glow"></div>
                    </div>
                    <span>Laptop - $1200</span>
                    <div className="item-shine"></div>
                  </motion.div>
                </div>
              </div>
              
              <div className="window-reflection"></div>
              <div className="window-border-glow"></div>
            </div>
          </motion.div>
        </motion.section>

        {/* --- Progreso con Liquid Glass --- */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="simulation-section reverse"
        >
          <motion.div variants={liquidScale} className="simulation-visual">
            <div className="glass-window">
              <div className="glass-header">
                <div className="traffic-lights">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
              </div>
              
              <div className="glass-content">
                <p className="window-product-name">iPhone 16</p>
                <div className="liquid-progress-container">
                  <motion.div
                    className="liquid-progress-fill"
                    initial={{ width: "5%" }}
                    whileInView={{ width: "65%" }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="progress-liquid-wave"></div>
                    <div className="progress-shine"></div>
                  </motion.div>
                  <div className="progress-track-glow"></div>
                </div>
                <div className="progress-details">
                  <span>$520 / $800</span>
                  <span>65%</span>
                </div>
              </div>
              
              <div className="window-reflection"></div>
              <div className="window-border-glow"></div>
            </div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="simulation-text">
            <h2 className="section-title">Progreso visual que motiva</h2>
            <p>
              Observa en tiempo real cómo cada depósito simulado te acerca más a tu objetivo. 
              La barra de progreso te mantiene motivado y enfocado en tu meta.
            </p>
          </motion.div>
        </motion.section>

        {/* --- Todo List con Glass Effect --- */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="simulation-section"
        >
          <motion.div variants={fadeInUp} className="simulation-text">
            <h2 className="section-title">Planifica como un profesional</h2>
            <p>
              Organiza todas tus metas en listas inteligentes. Desde compras diarias 
              hasta grandes objetivos, todo en un solo lugar y completamente organizado.
            </p>
          </motion.div>
          
          <motion.div variants={liquidScale} className="simulation-visual">
            <div className="glass-window">
              <div className="glass-header">
                <div className="traffic-lights">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
              </div>
              
              <div className="glass-content">
                <h4 className="window-title">Mis Objetivos</h4>
                <div className="todo-list-glass">
                  <motion.div 
                    className="todo-item-glass priority-high"
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="priority-indicator high"></div>
                    <div className="todo-content-glass">
                      <span className="todo-title">Viaje a París</span>
                      <span className="todo-amount">$2,500</span>
                    </div>
                    <div className="todo-item-glow"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="todo-item-glass priority-medium"
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.35, duration: 0.7 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="priority-indicator medium"></div>
                    <div className="todo-content-glass">
                      <span className="todo-title">Nueva Laptop</span>
                      <span className="todo-amount">$1,200</span>
                    </div>
                    <div className="todo-item-glow"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="todo-item-glass priority-low"
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="priority-indicator low"></div>
                    <div className="todo-content-glass">
                      <span className="todo-title">Curso Online</span>
                      <span className="todo-amount">$299</span>
                    </div>
                    <div className="todo-item-glow"></div>
                  </motion.div>
                </div>
              </div>
              
              <div className="window-reflection"></div>
              <div className="window-border-glow"></div>
            </div>
          </motion.div>
        </motion.section>

        {/* --- CTA Final con Liquid Glass --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="final-cta-section"
        >
          <div className="cta-glass-bg">
            <div className="cta-orb-1"></div>
            <div className="cta-orb-2"></div>
          </div>
          
          <h2 className="section-title">¿Listo para alcanzar todas tus metas?</h2>
          <p>Crea tu cuenta gratis y comienza a simular tus ahorros hoy mismo.</p>
          
          <motion.button
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0px 20px 60px rgba(59, 130, 246, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            className="btn-cta"
          >
            <span>¡Únete a MetaBuyX!</span>
            <div className="btn-liquid-bg"></div>
            <div className="btn-shine-effect"></div>
          </motion.button>
          
          <div className="cta-reflection"></div>
        </motion.section>

      </motion.div>

      {/* Footer con Glass Effect */}
      <footer className="footer-glass">
        <div className="footer-content-glass">
          <div className="footer-brand-glass">
            <h3 className="footer-logo-glass">
              MetaBuyX
              <div className="logo-glass-effect"></div>
            </h3>
            <p className="footer-description-glass">
              Tu socio inteligente para alcanzar cualquier meta de compra.
            </p>
            <div className="footer-social-glass">
              <a href="#" aria-label="Twitter" className="social-glass-btn">📱</a>
              <a href="#" aria-label="Instagram" className="social-glass-btn">📧</a>
              <a href="#" aria-label="LinkedIn" className="social-glass-btn">💬</a>
            </div>
          </div>
          
          <div className="footer-links-glass">
            <div className="footer-column-glass">
              <h4>Producto</h4>
              <ul>
                <li><a href="#" className="footer-link-glass">Características</a></li>
                <li><a href="#" className="footer-link-glass">Planes</a></li>
                <li><a href="#" className="footer-link-glass">Seguridad</a></li>
              </ul>
            </div>
            <div className="footer-column-glass">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#" className="footer-link-glass">Ayuda</a></li>
                <li><a href="#" className="footer-link-glass">Contacto</a></li>
                <li><a href="#" className="footer-link-glass">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-column-glass">
              <h4>Legal</h4>
              <ul>
                <li><a href="#" className="footer-link-glass">Privacidad</a></li>
                <li><a href="#" className="footer-link-glass">Términos</a></li>
                <li><a href="#" className="footer-link-glass">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom-glass">
          <p>&copy; {new Date().getFullYear()} MetaBuyX. Todos los derechos reservados.</p>
          <p className="footer-tagline-glass">Hecho con 💙 para que alcances tus metas</p>
        </div>
        
        <div className="footer-glass-overlay"></div>
      </footer>
    </div>
  );
}

export default Home;