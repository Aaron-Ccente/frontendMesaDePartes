import { DocManager } from './GeneradorActa'; // Reutilizamos el DocManager

/**
 * Genera el PDF para el Acta de Apertura de Muestra, replicando el formato oficial.
 * @param {object} datos - Contiene { oficio, perito, aperturaData, muestrasAnalizadas }
 * @returns {Promise<string>} URL del Blob del PDF generado.
 */
export const generarActaApertura = async (datos) => {
  const { oficio, perito, aperturaData, muestrasAnalizadas } = datos;
  const manager = new DocManager({ oficio, perito });
  await manager.init();

  manager.addTitle('ACTA DE APERTURA DE MUESTRA');

  const now = new Date();
  const introText = `--- En la Ciudad de Huancayo siendo las ${now.toLocaleTimeString('es-ES')} horas del día ${now.toLocaleDateString('es-ES')}, en el Laboratorio de Toxicología Forense de la OFICRI-PNP-HYO, presentes: El perito del área de Toxicología Forense ${perito.grado} ${perito.nombre_completo} y en condición de testigo el "[NOMBRE Y GRADO DEL TESTIGO]", procediéndose con la presente diligencia de apertura de muestras como a continuación se detalla:`;
  manager.addParagraph(introText, { align: 'justify' });
  manager.addSpace(5);

  const paqueteText = `Un (01) ${aperturaData.descripcion_paquete || '[DESCRIPCIÓN DEL PAQUETE]'}, lacrado con cinta de embalaje, lleva firma e impresión dactilar de "${oficio.examinado_incriminado}", firma y postfirma del que toma la que muestra "[PERITO QUE TOMÓ LA MUESTRA]"; aperturado se encontró la siguiente muestra:`;
  manager.addParagraph(paqueteText, { align: 'justify' });
  manager.addSpace(5);

  // Describir las muestras encontradas
  if (muestrasAnalizadas && muestrasAnalizadas.length > 0) {
    muestrasAnalizadas.forEach((muestra, index) => {
        const muestraText = `M${index + 1}: Un (01) frasco de plástico transparente, boca ancha, con tapa rosca de plástico de color azul asegurado en todo el contorno con cinta de embalaje transparente, lleva etiqueta adherida con manuscrito que se lee: "${oficio.examinado_incriminado}", conteniendo ${muestra.tipo_muestra ? muestra.tipo_muestra.toLowerCase() : '[tipo no especificado]'} en volumen Aprox. de ${muestra.cantidad || '[cantidad no especificada]'}.`;
        manager.addParagraph(muestraText, { indent: 5, align: 'justify' });
        manager.addSpace(2);
    });
  }
  manager.addSpace(5);
  
  const cierreText = `--- Siendo las ${new Date(now.getTime() + 10 * 60000).toLocaleTimeString('es-ES')} horas del mismo día se concluye con la presente diligencia, firmando a continuación los presentes en señal de conformidad:`;
  manager.addParagraph(cierreText, { align: 'justify' });

  manager.drawSignatures(['perito', 'testigo']);

  return manager.render();
};


/**
 * Genera el PDF para el Informe de Resultados de Sarro Ungueal, replicando el formato oficial.
 * @param {object} datos - Contiene { oficio, perito, muestrasAnalizadas }
 * @returns {Promise<string>} URL del Blob del PDF generado.
 */
export const generarInformeSarroUngueal = async (datos) => {
    const { oficio, perito, muestrasAnalizadas } = datos;
    const manager = new DocManager({ oficio, perito });
    await manager.init();

    // --- Título del Informe ---
    manager.doc.setFontSize(11);
    manager.doc.setFont('helvetica', 'bold');
    manager.doc.text('INFORME PERICIAL TOXICOLOGICO – SARRO UNGUEAL', manager.doc.internal.pageSize.getWidth() / 2, manager.yPos, { align: 'center' });
    manager.yPos += 6;
    manager.doc.text(`          ${oficio.numero_oficio}-2025`, manager.doc.internal.pageSize.getWidth() / 2, manager.yPos, { align: 'center' });
    manager.yPos += 10;
    
    manager.doc.setFont('helvetica', 'normal');
    manager.doc.setFontSize(11);

    // --- Helper para layout lado a lado ---
    const addSectionLine = (letter, title, content) => {
        const label = `${letter}.\t${title}:`;
        const labelWidth = 35;
        const contentX = 15 + labelWidth;
        const contentWidth = manager.doc.internal.pageSize.getWidth() - 15 - contentX;
        
        const contentLines = manager.doc.splitTextToSize(content || '', contentWidth);
        const neededHeight = contentLines.length * 5.5;

        manager._checkPageBreak(neededHeight);
        
        const yPosBefore = manager.yPos;
        manager.doc.setFont('helvetica', 'bold');
        manager.doc.text(label, 15, yPosBefore);
        
        manager.doc.setFont('helvetica', 'normal');
        manager.doc.text(contentLines, contentX, yPosBefore);
        
        manager.yPos = yPosBefore + neededHeight + 2;
    };

    // --- Construcción del cuerpo del informe ---
    addSectionLine('A', 'PROCEDENCIA', oficio.dependencia_solicitante || '[PROCEDENCIA NO ESPECIFICADA]');
    addSectionLine('B', 'ANTECEDENTE', `OF. N°${oficio.numero_oficio}`);
    addSectionLine('C', 'DATOS DEL PERITO', `${perito.grado || ''} ${perito.nombre_completo}, identificado con CIP: ${perito.CIP} y DNI: ${perito.dni}, Químico Farmacéutico C.Q.F.P N° [N° COLEGiatura], con domicilio laboral en Jirón Cuzco N° 666- Huancayo.`);
    addSectionLine('D', 'OBJETO DE LA PERICIA', 'Identificación de sustancias tóxicas y adherencias de drogas ilícitas en muestra\nbiológica.');
    addSectionLine('E', 'HORA DEL INCIDENTE', '[HORA] FECHA: [FECHA]');
    addSectionLine('F', 'HORA DE TOMA DE MUESTRA', '[HORA] FECHA: [FECHA]');
    addSectionLine('G', 'CONDUCTOR', '[NOMBRE DEL CONDUCTOR]');
    addSectionLine('H', 'MUESTRA TOMADA A', oficio.examinado_incriminado);

    manager.addParagraph('I.\tMUESTRAS:', {fontStyle: 'bold'});
    if (muestrasAnalizadas && muestrasAnalizadas.length > 0) {
        muestrasAnalizadas.forEach((m, i) => {
            manager.addParagraph(`M${i+1}: UN (01) frasco de plástico transparente... conteniendo ${m.tipo_muestra ? m.tipo_muestra.toLowerCase() : '[tipo no especificado]'} en volumen Aprox. de ${m.cantidad || '[cantidad no especificada]'}.`, { indent: 5 });
        });
    }
    manager.addSpace(2);

    manager.addParagraph('J.\tEXAMEN:', {fontStyle: 'bold'});
    manager.addParagraph('Análisis Toxicológico', { indent: 5 });
    manager.addParagraph('Alcaloide de cocaína\t: NEGATIVO en (M1)', { indent: 10 });
    manager.addParagraph('Cannabinoides (Marihuana)\t: POSITIVO en (M1)', { indent: 10 });
    manager.addParagraph('Benzodiacepinas\t\t: NEGATIVO en (M1)', { indent: 10 });
    manager.addParagraph('Sarro Ungueal: NEGATIVO.', { indent: 5 });
    manager.addSpace(2);
    
    manager.addParagraph('K.\tCONCLUSIONES:', {fontStyle: 'bold'});
    manager.addParagraph('1.\tLa muestra M1 analizada de la persona: “Elvin Elmer CASTILLO JONAS (29)”, dieron resultado: POSITIVO para CANNABINOIDES (MARIHUANA) en el análisis toxicológico y NEGATIVO para ADHERENCIAS DE DROGAS ILICITAS en muestra de SARRO UNGUEAL. --------------------------------------');
    manager.addParagraph('2.\tMuestras agotadas en los análisis. -----------------------------------------------------------------------------------------------');
    manager.addSpace(2);

    addSectionLine('L', 'MUESTRA TOMADA POR', '[NOMBRE DEL EXTRACTOR]');
    addSectionLine('M', 'METODO UTILIZADO', 'Experimental.\nToxicológico\t:  - Cromatografía en capa fina.\n\t\t   - Inmunoensayo\nSarro ungueal\t: Químico - colorimétrico.');

    manager.addSpace(10);
    const now = new Date();
    manager.addParagraph(`Huancayo, ${now.toLocaleDateString('es-ES')}.`, { align: 'right' });

    manager.drawSignatures(['perito']);

    return manager.render();
};
