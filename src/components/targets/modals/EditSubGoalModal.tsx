// src/components/targets/modals/EditSubGoalModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader } from 'lucide-react';
import type { CreateSubGoal, SubGoal } from '../../../types';
import './EditSubGoalModal.css'

interface EditSubGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSubGoal: (updatedSubGoal: CreateSubGoal) => Promise<void>;
  subGoal: SubGoal | null;
  goalTitle?: string;
  loading?: boolean;
}

const EditSubGoalModal: React.FC<EditSubGoalModalProps> = ({
  isOpen,
  onClose,
  onEditSubGoal,
  subGoal,
  goalTitle,
  loading = false
}) => {
  const [editSubGoal, setEditSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });

  useEffect(() => {
    if (subGoal) {
      setEditSubGoal({
        title: subGoal.title,
        amount: subGoal.amount
      });
    }
  }, [subGoal]);

  const resetForm = () => {
    setEditSubGoal({ title: '', amount: 0 });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !subGoal) return;

    if (!editSubGoal.title.trim() || editSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que el nuevo monto no sea menor al ya ahorrado
    if (editSubGoal.amount < subGoal.savedAmount) {
      alert(`El monto no puede ser menor a $${subGoal.savedAmount.toLocaleString()} que ya has ahorrado para esta sub-meta.`);
      return;
    }

    try {
      await onEditSubGoal(editSubGoal);
      handleClose();
    } catch (error) {
      console.error('Error editando sub-meta:', error);
      alert('Error al editar la sub-meta. Intenta de nuevo.');
    }
  };

  if (!isOpen || !subGoal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Editar Sub-Meta</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {goalTitle && (
          <div className="modal-info">
            <p><strong>Meta:</strong> {goalTitle}</p>
            <p><strong>Sub-meta actual:</strong> {subGoal.title}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="editSubGoalTitle">Nombre del gasto *</label>
            <input
              type="text"
              id="editSubGoalTitle"
              value={editSubGoal.title}
              onChange={(e) => setEditSubGoal({...editSubGoal, title: e.target.value})}
              placeholder="Ej: Costo del hotel, Comida, Vuelos"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="editSubGoalAmount">Cantidad estimada *</label>
            <div className="amount-input">
              <span className="currency">$</span>
              <input
                type="text"
                id="editSubGoalAmount"
                value={editSubGoal.amount || ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = numericValue.split('.');
                  if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                    setEditSubGoal({...editSubGoal, amount: parseFloat(numericValue) || 0});
                  }
                }}
                placeholder="0"
                required
              />
            </div>
            <small className="amount-hint">
              Mínimo permitido: ${subGoal.savedAmount.toLocaleString()} (cantidad ya ahorrada)
            </small>
          </div>

          <div className="info-box">
            <p><strong>Progreso actual:</strong> ${subGoal.savedAmount.toLocaleString()} de ${subGoal.amount.toLocaleString()}</p>
            <p><strong>Nota:</strong> Al cambiar el monto, se recalculará el total de la meta principal.</p>
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

export default EditSubGoalModal;