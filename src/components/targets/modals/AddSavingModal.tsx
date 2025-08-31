import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle } from 'lucide-react';
import './AddSavingModal.css';

interface AddSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSaving: (amount: number) => Promise<void>;
  goalTitle?: string;
  maxAmount: number;
  loading?: boolean;
}

// Usamos React.memo para evitar renders innecesarios si las props no cambian
const AddSavingModal: React.FC<AddSavingModalProps> = React.memo(({
  isOpen,
  onClose,
  onAddSaving,
  goalTitle,
  maxAmount,
  loading = false
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');

  // useCallback para memorizar la función y evitar que se recree
  const handleClose = useCallback(() => {
    setCustomAmount('');
    onClose();
  }, [onClose]);

  // useCallback para optimizar el manejador de entrada
  const handleNumericInputWithLimit = useCallback((value: string) => {
    // Permite solo números y un único punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

    // Limita a dos decimales
    const parts = numericValue.split('.');
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    // Si el valor excede el máximo, lo establece al máximo
    const numValue = parseFloat(numericValue);
    if (!isNaN(numValue) && numValue > maxAmount) {
      setCustomAmount(maxAmount.toString());
      return;
    }

    setCustomAmount(numericValue);
  }, [maxAmount]);

  // useCallback para memorizar la función de envío
  const handleSubmit = useCallback(async () => {
    if (loading) return;

    const finalAmount = parseFloat(customAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Por favor ingresa una cantidad válida.');
      return;
    }

    if (finalAmount > maxAmount) {
      alert(`No puedes agregar más de $${maxAmount.toLocaleString()}. Esta meta solo necesita $${maxAmount.toLocaleString()} para completarse.`);
      return;
    }

    try {
      await onAddSaving(finalAmount);
      handleClose();
    } catch (error) {
      console.error('Error agregando ahorro:', error);
      alert('Error al agregar ahorro. Intenta de nuevo.');
    }
  }, [customAmount, loading, maxAmount, onAddSaving, handleClose]);

  // useMemo para calcular los montos rápidos solo cuando maxAmount cambia
  const quickAmounts = useMemo(() => {
    const amounts = [25, 50, 100, 200].filter(amount => amount <= maxAmount);
    if (amounts.length === 0 && maxAmount > 0) {
      // Si ningún monto rápido es viable, ofrece el máximo posible (redondeado hacia abajo)
      return [Math.floor(maxAmount)];
    }
    return amounts;
  }, [maxAmount]);

  // Variable para mejorar la legibilidad en el JSX
  const amountToAdd = parseFloat(customAmount || '0');
  const buttonText = amountToAdd > 0 ? `Añadir $${amountToAdd.toLocaleString()}` : 'Añadir';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        className="modal-content add-saving-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Añadir Dinero</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Cerrar modal">
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
                inputMode="decimal" // Mejora la experiencia en móviles
                id="customAmount"
                value={customAmount}
                onChange={(e) => handleNumericInputWithLimit(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <small className="amount-hint">
              Puedes añadir hasta ${maxAmount.toLocaleString()}
            </small>
          </div>

          <div className="quick-amounts">
            <span className="quick-label">Montos rápidos:</span>
            <div className="quick-buttons">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  className="btn-quick-amount"
                  onClick={() => handleNumericInputWithLimit(amount.toString())}
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
              disabled={amountToAdd <= 0 || loading}
            >
              <PlusCircle size={16} />
              {buttonText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default AddSavingModal;
