// src/components/targets/modals/CreateSubGoalModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, Loader } from 'lucide-react';
import type { CreateSubGoal } from '../../../types';
import './CreateSubGoalModal.css'


interface CreateSubGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSubGoal: (subGoal: CreateSubGoal) => Promise<void>;
  goalTitle?: string;
  loading?: boolean;
}

const CreateSubGoalModal: React.FC<CreateSubGoalModalProps> = ({
  isOpen,
  onClose,
  onCreateSubGoal,
  goalTitle,
  loading = false
}) => {
  const [newSubGoal, setNewSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });

  const resetForm = () => {
    setNewSubGoal({ title: '', amount: 0 });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!newSubGoal.title.trim() || newSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await onCreateSubGoal(newSubGoal);
      handleClose();
    } catch (error) {
      console.error('Error creando sub-meta:', error);
      alert('Error al crear la sub-meta. Intenta de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Añadir Sub-Meta</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {goalTitle && (
          <div className="modal-info">
            <p><strong>Meta:</strong> {goalTitle}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="subGoalTitle">Nombre del gasto *</label>
            <input
              type="text"
              id="subGoalTitle"
              value={newSubGoal.title}
              onChange={(e) => setNewSubGoal({...newSubGoal, title: e.target.value})}
              placeholder="Ej: Costo del hotel, Comida, Vuelos"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subGoalAmount">Cantidad estimada *</label>
            <div className="amount-input">
              <span className="currency">$</span>
              <input
                type="text"
                id="subGoalAmount"
                value={newSubGoal.amount || ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = numericValue.split('.');
                  if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                    setNewSubGoal({...newSubGoal, amount: parseFloat(numericValue) || 0});
                  }
                }}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="info-box">
            <p><strong>Nota:</strong> Al agregar esta sub-meta, el monto total de la meta principal se recalculará automáticamente.</p>
          </div>
          
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
                  Creando...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Crear Sub-Meta
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSubGoalModal;