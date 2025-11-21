import { useNavigate } from "react-router-dom";
import Configuracion from "../../assets/icons/Configuracion";

const SystemConfiguration = () => {
  const navigate = useNavigate();

  const handleChangePage = (page) => {
    navigate(page);
  };

  const contendCard = [
    { 
      name: "Especialidades", 
      page: "especialidades",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
        </svg>
      )
    },
    { 
      name: "Tipos de examen", 
      page: "tipos-examen",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: "Grados", 
      page: "grados",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    { 
      name: "Turnos", 
      page: "turnos",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: "Prioridades", 
      page: "prioridades",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Encabezado */}
      <div className="max-w-8xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl dark:text-white">
              <Configuracion size={10}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Gestiona los ajustes y parámetros fundamentales del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Cards Mejorado */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {contendCard.map((element, index) => (
              <div
                key={index}
                onClick={() => handleChangePage(element.page)}
                className="
                  group
                  cursor-pointer
                  bg-white dark:bg-gray-800
                  hover:bg-[#1a4d2e] dark:hover:bg-[#1a4d2e]
                  border-2 border-gray-100 dark:border-gray-700
                  hover:border-green-200 dark:hover:border-green-800
                  p-6
                  rounded-2xl
                  shadow-sm
                  transition-all duration-300
                  transform hover:scale-105
                  flex flex-col items-center justify-center
                  text-center
                  space-y-4
                  h-96
                  
                "
              >
                <div className="
                  p-4 
                  bg-green-50 dark:bg-green-900/20 
                  group-hover:bg-green-100 dark:group-hover:bg-green-800/30
                  rounded-xl
                  dark:text-white
                  transition-colors duration-300
                ">
                  {element.icon}
                </div>
                
                <h3 className="
                  font-semibold 
                  text-gray-900 dark:text-white
                  group-hover:text-white dark:group-hover:text-green-400
                  transition-colors duration-300
                  text-lg
                ">
                  {element.name}
                </h3>
                
                <div className="
                  w-8 h-1 
                  bg-green-200 dark:bg-green-800
                  group-hover:bg-green-400 dark:group-hover:bg-green-600
                  rounded-full
                  transition-colors duration-300
                  opacity-0 group-hover:opacity-100
                " />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;