// Utilidades para manejo de archivos (fotos y firmas)

// Convertir archivo a Base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Convertir imagen a WebP y luego a Base64
export const convertToWebPAndBase64 = async (file) => {
  try {
    // Crear canvas para convertir a WebP
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Mantener proporción de aspecto
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a WebP con calidad 0.8
        canvas.toBlob((blob) => {
          if (blob) {
            // Convertir WebP a Base64
            const reader = new FileReader();
            reader.onload = () => {
              // Cambiar el tipo MIME a WebP
              const base64 = reader.result;
              const webpBase64 = base64.replace('data:image/png', 'data:image/webp');
              resolve(webpBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('No se pudo convertir a WebP'));
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.log(error)
    return fileToBase64(file);
  }
};

// Convertir archivo a Blob
export const fileToBlob = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Validar tipo de archivo de imagen
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'El archivo es demasiado grande. Máximo 5MB'
    };
  }

  return { isValid: true };
};

// Comprimir imagen antes de enviar
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob con calidad especificada
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Crear vista previa de imagen
export const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

// Validar archivo de firma (SVG, PNG)
export const validateSignatureFile = (file) => {
  const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Solo se permiten archivos SVG, PNG o JPEG para firmas'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'El archivo de firma es demasiado grande. Máximo 2MB'
    };
  }

  return { isValid: true };
};

// Convertir canvas de firma a archivo
export const canvasToFile = (canvas, filename = 'signature.png', type = 'image/png') => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], filename, { type });
      resolve(file);
    }, type);
  });
};
