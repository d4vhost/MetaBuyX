// src/components/targets/modals/EditGoalModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader } from 'lucide-react';
import type { CreateIndividualGoal, IndividualGoalWithSubGoals } from '../../../types';
import './EditGoalModal.css'

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditGoal: (goalId: string, goal: CreateIndividualGoal) => Promise<void>;
  goal: IndividualGoalWithSubGoals | null;
  loading?: boolean;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({
  isOpen,
  onClose,
  onEditGoal,
  goal,
  loading = false
}) => {
  const [editGoal, setEditGoal] = useState<CreateIndividualGoal>({
    title: '',
    description: '',
    targetAmount: 0
  });

  // Función para verificar si una meta tiene sub-metas
  const hasSubGoals = (goal: IndividualGoalWithSubGoals | null) => {
    return goal && goal.subGoals && goal.subGoals.length > 0;
  };

  useEffect(() => {
    if (goal) {
      setEditGoal({
        title: goal.title,
        description: goal.description || '',
        targetAmount: goal.targetAmount
      });
    }
  }, [goal]);

  const resetForm = () => {
    setEditGoal({
      title: '',
      description: '',
      targetAmount: 0
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !goal) return;

    if (!editGoal.title.trim()) {
      alert('Por favor ingresa un título para la meta');
      return;
    }

    if (editGoal.targetAmount <= 0) {
      alert('Por favor ingresa una cantidad objetivo válida');
      return;
    }

    try {
      await onEditGoal(goal.id, editGoal);
      handleClose();
    } catch (error) {
      console.error('Error editando meta:', error);
      alert('Error al editar la meta. Intenta de nuevo.');
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Editar Meta</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="editTitle">Título de la meta *</label>
            <input
              type="text"
              id="editTitle"
              value={editGoal.title}
              onChange={(e) => setEditGoal({...editGoal, title: e.target.value})}
              placeholder="Ej: Comprar iPhone 16"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="editDescription">Descripción (opcional)</label>
            <textarea
              id="editDescription"
              value={editGoal.description}
              onChange={(e) => setEditGoal({...editGoal, description: e.target.value})}
              placeholder="Describe tu meta..."
              rows={3}
            />
          </div>
          
          {/* Solo mostrar campo de monto si NO tiene sub-metas */}
          {!hasSubGoals(goal) && (
            <div className="form-group">
              <label htmlFor="editTargetAmount">Cantidad objetivo *</label>
              <div className="amount-input">
                <span className="currency">$</span>
                <input
                  type="text"
                  id="editTargetAmount"
                  value={editGoal.targetAmount || ''}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = numericValue.split('.');
                    if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                      setEditGoal({...editGoal, targetAmount: parseFloat(numericValue) || 0});
                    }
                  }}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          )}

          {/* Mostrar información si tiene sub-metas */}
          {hasSubGoals(goal) && (
            <div className="form-group">
              <div className="info-box">
                <p><strong>Nota:</strong> Esta meta tiene sub-metas. El monto total se calcula automáticamente basado en las sub-metas.</p>
                <p><strong>Monto total actual:</strong> ${goal.targetAmount.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditGoalModal;