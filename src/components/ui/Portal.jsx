
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Portal({ children, containerId = 'portal-root' }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      document.body.appendChild(portalContainer);
    }
    setContainer(portalContainer);

    return () => {
      if (portalContainer.childElementCount === 0) {
        portalContainer.remove();
      }
    };
  }, [containerId]);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}

export default Portal;
