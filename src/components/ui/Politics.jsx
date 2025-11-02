import { useState } from "react";

function Politics({ nombre_usuario=null }) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl p-8 text-gray-800 max-h-4/5 overflow-auto">
        <h2 className="text-3xl font-bold text-center text-[#2eacd1] mb-6">
          CARTILLA DE SEGURIDAD INFORMÁTICA.
        </h2>

        <p className="mb-2">
          <strong>Señor:</strong> <span className="font-semibold">{nombre_usuario}</span>
        </p>
        <p className="mb-4">
          Nos dirigimos a Ud. para hacerle recordar la importancia de la Seguridad y Confidencialidad
          de la información que proporciona este <strong>Plataforma Digital de Gestión de Oficios - OFICRI Huancayo</strong>, 
          para ello tenga en consideración lo siguiente:
        </p>

        <p className="font-semibold mb-2">La contraseña constituye el elemento de acceso, identificación y autorización al sistema, por ello tenga en cuenta que debe:</p>

        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Ser de carácter secreto e intransferible</strong></li>
          <span className="ml-6">Que no constituya un dato fácil de deducir para otras personas.</span>
          <li><strong>Ser cambiado a menudo</strong></li>
          <span className="ml-6">Solicitarlo al Área de Informática de la OFICRI - HUANCAYO.</span>
          <li><strong>Ser larga</strong></li>
          <span className="ml-6">La extensión de la contraseña garantiza mayor seguridad, un mínimo de 7 dígitos.</span>
          <li><strong>No ser guardadas en lugares de fácil acceso</strong></li>
          <span className="ml-6">Es conveniente guardar la contraseña pero que no sea accesible a otras personas.</span>
          <li><strong>No ser compartida</strong></li>
          <span className="ml-6">Es personal e intransferible por lo que Ud. es el único responsable de ella y de su uso.</span>
        </ul>

        <p className="mb-4">
          La vulneración de la reserva de la información clasificada constituye una conducta violatoria que atenta
          contra los bienes jurídicos cautelados por Ley.
        </p>

        <h3 className="text-[#2eacd1] font-bold text-lg mb-2 text-center">
          Ley N° 30714-2017, Ley que regula RD PNP.
        </h3>

        <p className="mb-4 italic text-justify">
          <strong>Infracción Grave (G-38) CONTRA EL SERVICIO POLICIAL:</strong> “Fracasar en el cumplimiento de la misión o incumplir la responsabilidad funcional asignada, por desidia, imprevisión o carencia de iniciativa”;
          <strong> Infracción Muy Grave (MG-5) CONTRA LA DISCIPLINA:</strong> “Entregar o divulgar información sin las formalidades legales, incluyendo la relacionada con la salud del personal de la Policía Nacional del Perú y sus familiares”;
          <strong> Infracción Muy Grave (MG-52) CONTRA EL SERVICIO POLICIAL:</strong> “Contravenir deliberadamente los procedimientos operativos y administrativos establecidos en los planes de operaciones, órdenes de operaciones u otros documentos relacionados con el cumplimiento del servicio policial establecidos en la normatividad vigente”.
        </p>

        <h3 className="text-[#2eacd1] font-bold text-lg mb-2 text-center">
          DL. N° 1094-2010 “Código Penal Militar Policial”
        </h3>

        <p className="mb-2 italic">
        </p>

        <div className="mb-2 italic text-justify">
          <strong>Art. 70° - INFIDENCIA:</strong> “El militar o el policía que se apropie, divulgue o publique, de cualquier forma o medio, sin autorización, o facilite información clasificada o de interés militar o policial, que atente contra la defensa nacional, orden interno o seguridad ciudadana, será reprimido con pena privativa de libertad no menor de cinco ni mayor de diez años, con la accesoria de inhabilitación”.
          <strong>Art. 71° - POSESIÓN NO AUTORIZADA DE INFORMACIÓN:</strong> “El militar o el policía que posea u obtenga sin autorización, información clasificada o de interés militar o policial, será reprimido con pena privativa de libertad no menor de dos ni mayor de cinco años”.
          <strong>INFIDENCIA CULPOSA:</strong> “El militar o el policía que por culpa, desatienda su deber, extravíe o permita que otros se apoderen de información clasificada o de interés militar o policial, que atente contra la defensa nacional, orden interno o seguridad ciudadana, será sancionado con pena privativa de libertad no menor de dos ni mayor de cuatro años”.
          <strong className="text-[#2eacd1]">Directiva N°19-01-2017-DIRGEN/SUB-DGPNP/DIRASADM-B</strong> - (<strong>RD N°151-2015-DIR-DGPNP del 24FEB2017</strong>), 
          “Lineamientos para el uso adecuado de las redes sociales que utiliza el personal PNP y para la gestión de las redes oficiales de la PNP”: 
          donde se indica la no utilización de las redes sociales personales (correos electrónicos, Facebook, Twitter, WhatsApp, etc.) para difundir
          información de las intervenciones policiales, emitir pronunciamientos, hacer comentarios o difundir información funcional de funcionarios policiales, 
          así como formular imputaciones tendenciosas que denigren, calumnien, difamen o deshonren al personal de la PNP, medios de prensa, escritos o cualquier otro medio.
        </div>

        <p className="text-center text-red-700 font-bold mt-6">
          OFICINA DE INFORMÁTICA DE LA OFICRI - HUANCAYO
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShow(false)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
          >
            HE LEÍDO LA PRESENTE CARTILLA
          </button>
        </div>
      </div>
    </div>
  );
}

export default Politics;
