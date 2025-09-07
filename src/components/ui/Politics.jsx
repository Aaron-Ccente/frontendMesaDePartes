import { useState } from "react";

function Politics() {
  const [show, setShow] = useState(true); // se muestra desde el inicio

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl p-6">
        <h2 className="text-3xl font-bold text-red-700 mb-4 text-center">
          Políticas y Condiciones de Uso
        </h2>
        {/* Aqui va el mensaje preciso para las politicas y condiciones de uso */}
        <div className="text-gray-700 text-xl space-y-3">
          <p>
            El acceso a este sistema está restringido exclusivamente al
            personal autorizado de la{" "}
            <span className="font-semibold">Oficina de Criminalística</span>.
          </p>
          <p>
            La información contenida es de carácter reservado y su salida,
            copia, distribución o divulgación a personas no autorizadas está{" "}
            <span className="font-bold text-red-600">
              terminantemente prohibida
            </span>.
          </p>
          <p>
            Todo uso de la plataforma queda registrado y bajo la absoluta
            responsabilidad del usuario que accede. Cualquier uso indebido será
            sujeto a sanciones administrativas, civiles y/o penales.
          </p>
          <p className="font-semibold text-center text-red-700">
            Al continuar, usted acepta y asume la responsabilidad del uso de
            este sistema.
          </p>
        </div>

        {/* Botón para aceptar los terminos y condiciones*/}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShow(false)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Politics;
