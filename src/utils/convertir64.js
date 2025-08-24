// Utilidades para convertir imágenes a WebP y Base64

export const convertImageToWebP = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calcular el tamaño máximo permitido
      let { width, height } = img;
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;
      
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a WebP con calidad 0.8
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Error al convertir la imagen a WebP"));
          }
        },
        "image/webp",
        0.8
      );
    };

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const convertToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Cambiar el tipo MIME a WebP
        const base64 = reader.result;
        const webpBase64 = base64.replace('data:image/png', 'data:image/webp');
        resolve(webpBase64);
      } else {
        reject(new Error("Error al convertir a Base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };
    reader.readAsDataURL(blob);
  });
};

// Función combinada para convertir imagen a WebP Base64
export const convertImageToWebPBase64 = async (file) => {
  try {
    const webpBlob = await convertImageToWebP(file);
    const webpBase64 = await convertToBase64(webpBlob);
    return webpBase64;
  } catch (error) {
    console.error('Error en conversión:', error);
    throw error;
  }
};
