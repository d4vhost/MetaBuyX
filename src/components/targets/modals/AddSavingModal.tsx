// src/components/targets/modals/AddSavingModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle } from 'lucide-react';
import './AddSavingModal.css'

interface AddSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSaving: (amount: number) => Promise<void>;
  goalTitle?: string;
  maxAmount: number;
  loading?: boolean;
}

const AddSavingModal: React.FC<AddSavingModalProps> = ({
  isOpen,
  onClose,
  onAddSaving,
  goalTitle,
  maxAmount,
  loading = false
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');

  const resetForm = () => {
    setCustomAmount('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNumericInputWithLimit = (value: string) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limitar decimales a 2 dígitos
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    // Verificar si el valor excede el máximo permitido
    const numValue = parseFloat(numericValue);
    
    if (!isNaN(numValue) && numValue > maxAmount) {
      // Si excede, establecer el valor máximo permitido
      setCustomAmount(maxAmount.toString());
      return;
    }
    
    setCustomAmount(numericValue);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const finalAmount = parseFloat(customAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    if (finalAmount > maxAmount) {
      alert(`No puedes agregar más de $${maxAmount.toLocaleString()}. Esta meta solo necesita $${maxAmount.toLocaleString()} más para completarse.`);
      return;
    }

    try {
      await onAddSaving(finalAmount);
      handleClose();
    } catch (error) {
      console.error('Error agregando ahorro:', error);
      alert('Error al agregar ahorro. Intenta de nuevo.');
    }
  };

  // Generar botones de montos rápidos
  const generateQuickAmounts = () => {
    const quickAmounts = [25, 50, 100, 200].filter(amount => amount <= maxAmount);
    
    // Si no hay montos rápidos menores al máximo, mostrar el máximo
    if (quickAmounts.length === 0 && maxAmount > 0) {
      quickAmounts.push(Math.floor(maxAmount));
    }
    
    return quickAmounts;
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
          <h2>Añadir Dinero</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {goalTitle && (
          <div className="modal-info">
            <p><strong>Meta:</strong> {goalTitle}</p>
          </div>
        )}
        
        <div className="modal-form">
          <div className="form-group">
            <label htmlFor="customAmount">¿Cuánto quieres añadir? *</label>
            <div className="amount-input">
              <span className="currency">$</span>
              <input
                type="text"
                id="customAmount"
                value={customAmount}
                onChange={(e) => handleNumericInputWithLimit(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <small className="amount-hint">
              Máximo permitido: ${maxAmount.toLocaleString()}
            </small>
          </div>
          
          <div className="quick-amounts">
            <span className="quick-label">Montos rápidos:</span>
            <div className="quick-buttons">
              {generateQuickAmounts().map(amount => (
                <button 
                  key={amount}
                  type="button" 
                  className="btn-quick-amount"
                  onClick={() => setCustomAmount(amount.toString())}
                >
                  ${amount}
                </button>
              ))}
            </div>
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
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!customAmount || parseFloat(customAmount) <= 0 || loading}
            >
              <PlusCircle size={16} />
              Añadir ${parseFloat(customAmount || '0').toLocaleString()}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddSavingModal;