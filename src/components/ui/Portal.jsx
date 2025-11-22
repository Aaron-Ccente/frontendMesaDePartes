import { createPortal } from 'react-dom';

function Portal({ children, containerId = 'portal-root' }) {
  // Busca o crea el contenedor de forma síncrona en cada renderizado.
  // Esto es más seguro en el ciclo de vida de React que usar useEffect.
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  return createPortal(children, container);
}

export default Portal;
