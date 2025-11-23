const InfoField = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
        <p className="text-base text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
);

const DetallesCasoHeader = ({ oficio }) => {
    if (!oficio) {
        return (
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Detalles del Caso</h3>
                <p className="text-gray-500 dark:text-gray-400">Cargando detalles del caso...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Detalles del Caso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField label="Asunto" value={oficio.asunto} />
                <InfoField label="Implicado" value={oficio.examinado_incriminado} />
                <InfoField label="Delito" value={oficio.delito} />
                <InfoField label="Tipos de Examen" value={oficio.tipos_de_examen?.join(', ')} />
                <InfoField label="Perito Asignado" value={oficio.nombre_perito_actual} />
                <InfoField label="Prioridad" value={oficio.nombre_prioridad} />
            </div>
        </div>
    );
};

export default DetallesCasoHeader;
