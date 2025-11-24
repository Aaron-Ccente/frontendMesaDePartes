import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary" id="modal-title">
          {title}
        </h3>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:hover:bg-dark-border"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
