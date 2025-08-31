// src/components/targets/modals/CreateGoalModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, Loader, Plus, Target, Package } from 'lucide-react';
import type { CreateIndividualGoal, CreateSubGoal } from '../../../types';
import './CreateGoalModal.css'

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: CreateIndividualGoal, subGoals?: CreateSubGoal[]) => Promise<void>;
  loading?: boolean;
}

type GoalType = 'simple' | 'detailed';

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreateGoal,
  loading = false
}) => {
  const [goalType, setGoalType] = useState<GoalType>('simple');
  const [newGoal, setNewGoal] = useState<CreateIndividualGoal>({
    title: '',
    description: '',
    targetAmount: 0
  });
  const [newSubGoal, setNewSubGoal] = useState<CreateSubGoal>({
    title: '',
    amount: 0
  });
  const [tempSubGoals, setTempSubGoals] = useState<CreateSubGoal[]>([]);

  const resetForm = () => {
    setGoalType('simple');
    setNewGoal({ title: '', description: '', targetAmount: 0 });
    setNewSubGoal({ title: '', amount: 0 });
    setTempSubGoals([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addTempSubGoal = () => {
    if (!newSubGoal.title.trim() || newSubGoal.amount <= 0) {
      alert('Por favor completa todos los campos de la sub-meta');
      return;
    }

    setTempSubGoals([...tempSubGoals, { ...newSubGoal }]);
    setNewSubGoal({ title: '', amount: 0 });
  };

  const removeTempSubGoal = (index: number) => {
    setTempSubGoals(tempSubGoals.filter((_, i) => i !== index));
  };

  const calculateTotalFromSubGoals = () => {
    return tempSubGoals.reduce((total, subGoal) => total + subGoal.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!newGoal.title.trim()) {
      alert('Por favor ingresa un título para la meta');
      return;
    }

    if (goalType === 'simple' && newGoal.targetAmount <= 0) {
      alert('Por favor ingresa una cantidad objetivo válida');
      return;
    }

    if (goalType === 'detailed' && tempSubGoals.length === 0) {
      alert('Por favor agrega al menos una sub-meta');
      return;
    }

    try {
      const goalToCreate = { ...newGoal };
      
      if (goalType === 'detailed') {
        goalToCreate.targetAmount = calculateTotalFromSubGoals();
      }

      await onCreateGoal(goalToCreate, goalType === 'detailed' ? tempSubGoals : undefined);
      handleClose();
    } catch (error) {
      console.error('Error creando meta:', error);
      alert('Error al crear la meta. Intenta de nuevo.');
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
          <h2>Crear Nueva Meta</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tipo de meta</label>
            <div className="goal-type-selector">
              <button
                type="button"
                className={`type-option ${goalType === 'simple' ? 'active' : ''}`}
                onClick={() => setGoalType('simple')}
              >
                <Target size={20} />
                <div>
                  <span className="type-title">Meta Simple</span>
                  <span className="type-desc">Un objetivo con cantidad fija (ej: comprar una PS5)</span>
                </div>
              </button>
              <button
                type="button"
                className={`type-option ${goalType === 'detailed' ? 'active' : ''}`}
                onClick={() => setGoalType('detailed')}
              >
                <Package size={20} />
                <div>
                  <span className="type-title">Meta Detallada</span>
                  <span className="type-desc">Objetivo con múltiples gastos (ej: viaje con hotel, comida, etc.)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Título de la meta *</label>
            <input
              type="text"
              id="title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              placeholder={goalType === 'simple' ? 'Ej: Comprar iPhone 16' : 'Ej: Viaje a Japón'}
              required
            />
          </div>
          
          {goalType === 'simple' && (
            <div className="form-group">
              <label htmlFor="targetAmount">Cantidad objetivo *</label>
              <div className="amount-input">
                <span className="currency">$</span>
                <input
                  type="text"
                  id="targetAmount"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = numericValue.split('.');
                    if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                      setNewGoal({...newGoal, targetAmount: parseFloat(numericValue) || 0});
                    }
                  }}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          )}

          {goalType === 'detailed' && (
            <div className="form-group">
              <label>Sub-metas (gastos estimados)</label>
              
              <div className="subgoal-form">
                <div className="subgoal-input-row">
                  <input
                    type="text"
                    value={newSubGoal.title}
                    onChange={(e) => setNewSubGoal({...newSubGoal, title: e.target.value})}
                    placeholder="Ej: Hotel"
                  />
                  <div className="amount-input">
                    <span className="currency">$</span>
                    <input
                      type="text"
                      value={newSubGoal.amount || ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = numericValue.split('.');
                        if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                          setNewSubGoal({...newSubGoal, amount: parseFloat(numericValue) || 0});
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-add-temp"
                    onClick={addTempSubGoal}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {tempSubGoals.length > 0 && (
                <div className="temp-subgoals-list">
                  <h4>Sub-metas agregadas:</h4>
                  {tempSubGoals.map((subGoal, index) => (
                    <div key={index} className="temp-subgoal-item">
                      <span className="temp-subgoal-title">{subGoal.title}</span>
                      <span className="temp-subgoal-amount">${subGoal.amount.toLocaleString()}</span>
                      <button
                        type="button"
                        className="btn-remove-temp"
                        onClick={() => removeTempSubGoal(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="temp-total">
                    <strong>Total: ${calculateTotalFromSubGoals().toLocaleString()}</strong>
                  </div>
                </div>
              )}
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
              disabled={loading || (goalType === 'detailed' && tempSubGoals.length === 0)}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Crear Meta
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGoalModal;