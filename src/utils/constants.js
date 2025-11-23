// frontend-mesa-de-partes/src/utils/constants.js

export const TIPOS_DE_MUESTRA = ['Sangre', 'Orina', 'Hisopo Ungueal', 'Visceras', 'Cabello', 'Otro'];

export const EXAMEN_A_TIPO_MUESTRA = {
  'Dosaje Etilico': 'Sangre',
  'Toxicologico': 'Orina',
  'Sarro Ungueal': 'Hisopo Ungueal',
};

export const MUESTRA_DEFAULTS = {
  'Sangre': {
    descripcion: 'Muestra de sangre venosa extraída del pliegue del codo, en tubo de ensayo tapa lila con anticoagulante EDTA.',
    cantidad: '5 ml aprox.',
  },
  'Orina': {
    descripcion: 'Muestra de orina recolectada en un frasco de plástico estéril de boca ancha y tapa rosca.',
    cantidad: '50 ml aprox.',
  },
  'Hisopo Ungueal': {
    descripcion: 'Muestra de sarro ungueal obtenida mediante raspado con hisopo estéril de las uñas de ambas manos.',
    cantidad: '2 hisopos',
  },
};

export const OBJETO_PERICIA_DEFAULTS = {
    'Dosaje Etilico': 'Cuantificación de alcohol etílico en muestra biológica.',
    'Toxicologico': 'Identificación de sustancias tóxicas y/o drogas en muestra biológica.',
    'Sarro Ungueal': 'Identificación de adherencias de drogas ilícitas en muestra de sarro ungueal.',
};
  
export const METODO_UTILIZADO_DEFAULTS = {
    'Dosaje Etilico': 'Espectrofotometría – UV VIS.',
    'Toxicologico': 'Cromatografía en capa fina, Inmunoensayo.',
    'Sarro Ungueal': 'Químico - colorimétrico.',
};
  
export const TIPOS_DROGA = [
    { key: 'cocaina', label: 'Alcaloide de cocaína' },
    { key: 'marihuana', label: 'Cannabinoides (Marihuana)' },
    { key: 'benzodiacepinas', label: 'Benzodiacepinas' },
    { key: 'fenotiacinas', label: 'Fenotiacinas' },
    { key: 'barbituricos', label: 'Barbitúricos' },
    { key: 'sarro_ungueal', label: 'Sarro Ungueal' },
];
