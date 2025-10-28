import { useEffect, useState } from 'react';

function ShowToast({ type = 'success', message = '', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => close(), duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setVisible(false);
    setTimeout(() => {
      if (typeof onClose === 'function') onClose();
    }, 300);
  }

  const isSuccess = type === 'success';
  const messages = Array.isArray(message) ? message : (message ? [message] : []);

  return (
    <div
      aria-live="assertive"
      role="status"
      className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center px-4 sm:items-start sm:pt-6"
    >
      <div
        className={`pointer-events-auto w-full max-w-sm rounded-lg shadow-lg transform transition-all duration-300 ease-out
          ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
      >
        <div className={`flex items-start gap-3 p-4 rounded-lg ${isSuccess ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
          <div className="flex-shrink-0">
            {isSuccess ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.516 9.815c.75 1.334-.213 2.986-1.742 2.986H4.483c-1.529 0-2.492-1.652-1.742-2.986L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{isSuccess ? 'Éxito' : 'Error'}</p>
            <div className="mt-1 text-sm opacity-90 break-words">
              {messages.length === 0 ? null : (
                messages.length === 1 ? (
                  <p>{messages[0]}</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {messages.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                )
              )}
            </div>
          </div>

          <div className="flex items-start ml-3">
            <button
              onClick={close}
              className="inline-flex rounded-md bg-white/10 p-1 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Cerrar notificación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-1 w-full bg-white/20 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${isSuccess ? 'bg-emerald-300' : 'bg-rose-300'}`}
            style={{
              width: visible ? '100%' : '0%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ShowToast;