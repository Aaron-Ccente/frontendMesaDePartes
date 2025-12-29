import React from 'react';

// Estilos extraídos exactamente de membrete.hbs e informe_pericial_consolidado_v2.hbs
const InformePreview = ({ data, examenesConsolidados, perito, oficio }) => {
  const {
    unidad_solicitante = '',
    documento_referencia = '',
    fecha_documento = '',
    objeto_pericia = '',
    conclusion_principal = '',
    recolector_muestra = '',
    muestras = []
  } = data;

  // Helpers de formato (mismos que en Handlebars)
  const formatLongDate = (date) => {
    if (!date) return 'No especificada';
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `Huancayo, ${d.toLocaleDateString('es-ES', options)}`;
  };
  
  // Datos del Oficio (props o data)
  const nroOficio = oficio?.numero_oficio || '...';
  const anioActual = new Date().getFullYear();
  const fechaCreacion = oficio?.fecha_creacion || new Date();
  
  // Datos del Perito
  const peritoGrado = perito?.grado || '...';
  const peritoNombre = perito?.nombre_completo || '...';
  const peritoCip = perito?.cip || '...';
  const peritoDni = perito?.dni || '...';
  const peritoCqfp = perito?.codigo_codofin || '...'; // Asumiendo mapeo

  // Simulación de página A4
  const pageStyle = {
    width: '100%',
    maxWidth: '210mm',
    aspectRatio: '210/297',
    minHeight: '297mm',
    // Márgenes exactos de la plantilla: top: 15mm, right: 25mm, bottom: 20mm, left: 25mm
    padding: '15mm 25mm 20mm 25mm', 
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    fontFamily: "'Helvetica', 'Arial', sans-serif", // De membrete.hbs
    fontSize: '9.5pt', // De .content-body en informe_v2.hbs
    lineHeight: '1.4', // De .content-body en informe_v2.hbs
    color: 'black',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative'
  };

  // --- ESTILOS MEMBRETE ---
  const headerContainerStyle = { display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' };
  const bloqueStyle = { height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', fontSize: '7pt', lineHeight: '1.3', padding: '2px', boxSizing: 'border-box', fontWeight: 'bold' };
  
  // --- ESTILOS CUERPO ---
  const labelStyle = { minWidth: '8mm', fontWeight: 'bold' };
  const fieldLabelStyle = { minWidth: '50mm', fontWeight: 'bold' };
  const fieldLabelStyleLarge = { minWidth: '52mm', fontWeight: 'bold' };
  const rowStyle = { display: 'flex', marginTop: '5px' }; // margin-top: 5px generalizado o específico según template

  // --- ESCUDO PLACEHOLDER (Para vista previa usamos uno genérico si no hay URL real) ---
  const escudoUrl = "/assets/escudo.png"; // Asegúrate de tener este asset en public/ o usa un base64

  return (
    <div className="preview-wrapper bg-gray-200 dark:bg-gray-800 p-8 rounded-xl overflow-y-auto max-h-[800px]">
        <div style={pageStyle} className="document-page">
            
            {/* --- MEMBRETE --- */}
            <div style={headerContainerStyle}>
                 {/* Escudo simulado */}
                <div style={{ width: '45px', height: '52px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <img src="/escudo.png" alt="Escudo" style={{width: '100%', height: '100%', objectFit: 'contain'}} onError={(e) => e.target.style.display = 'none'} />
                </div>
                <div style={{...bloqueStyle, backgroundColor: '#D32F2F', width: '64px'}}>PERÚ</div>
                <div style={{...bloqueStyle, backgroundColor: '#424242', width: '94px'}}>Ministerio<br/>del Interior</div>
                <div style={{...bloqueStyle, backgroundColor: '#616161', width: '94px'}}>Policía Nacional<br/>del Perú</div>
                <div style={{...bloqueStyle, backgroundColor: '#757575', width: '110px'}}>Comando de Operaciones Policiales</div>
                <div style={{...bloqueStyle, backgroundColor: '#9E9E9E', width: '110px'}}>Dirección Nacional de Orden y Seguridad</div>
                <div style={{...bloqueStyle, backgroundColor: '#BDBDBD', width: '83px'}}>Región Policial Junín</div>
            </div>

            <div style={{ borderTop: '1.5px solid #000', marginBottom: '10px' }}></div>
            <div style={{ textAlign: 'center', fontSize: '9pt', fontStyle: 'italic', margin: '5px 0 10px 0' }}>
                "Año de la Unidad, la Paz y el Desarrollo"
            </div>

            {/* --- CUERPO DEL INFORME --- */}
            <div className="content-body">
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '12pt' }}>INFORME PERICIAL CONSOLIDADO</span><br/>
                    <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>N° {nroOficio}-{anioActual}-IV-MACREPOL-JUN-DIVINCRI/OFICRI.</span>
                </div>

                <div style={{ display: 'flex' }}>
                    <span style={labelStyle}>A.</span><span style={fieldLabelStyle}>PROCEDENCIA:</span><span>{unidad_solicitante}</span>
                </div>
                <div style={{ display: 'flex' }}>
                    <span style={labelStyle}>B.</span><span style={fieldLabelStyle}>ANTECEDENTE:</span><span>OF. {documento_referencia} ({fecha_documento}).</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>C.</span><span style={fieldLabelStyle}>DATOS DEL PERITO QUE CONSOLIDA:</span>
                    <span>{peritoGrado} {peritoNombre}, CIP: {peritoCip}, DNI: {peritoDni}, C.Q.F.P N°{peritoCqfp}.</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>D.</span><span style={fieldLabelStyle}>OBJETO DE LA PERICIA:</span><span>{objeto_pericia}</span>
                </div>

                <div style={rowStyle}>
                    <span style={labelStyle}>E.</span><span style={fieldLabelStyleLarge}>HORA DEL INCIDENTE</span><span>:</span>
                    <span style={{ marginRight: '15px' }}>{data.hora_incidente}</span>
                    <strong style={{ marginRight: '5px' }}>FECHA:</strong><span>{data.fecha_incidente}</span>
                </div>
                <div style={{ display: 'flex' }}>
                    <span style={labelStyle}>F.</span><span style={fieldLabelStyleLarge}>HORA DE TOMA DE MUESTRA</span><span>:</span>
                    <span style={{ marginRight: '15px' }}>{data.hora_toma_muestra}</span>
                    <strong style={{ marginRight: '5px' }}>FECHA:</strong><span>{data.fecha_toma_muestra}</span>
                </div>
                 <div style={{ display: 'flex' }}>
                    <span style={labelStyle}>G.</span><span style={fieldLabelStyleLarge}>CONDUCTOR</span><span>:</span>
                    <span>{data.conductor}</span>
                </div>
                 <div style={{ display: 'flex' }}>
                    <span style={labelStyle}>H.</span><span style={fieldLabelStyleLarge}>MUESTRA TOMADA A</span><span>:</span>
                    <span>{data.examinado_incriminado} ({data.edad_examinado}).</span>
                </div>

                <div style={{ display: 'flex', marginTop: '5px' }}>
                    <span style={labelStyle}>I.</span><span style={{ fontWeight: 'bold' }}>MUESTRAS:</span>
                </div>
                {/* Iteración de muestras simulada si no vienen en data.muestras listo para render, usamos el array raw */}
                 {oficio?.muestras?.map((m, i) => (
                    <div key={i} style={{ marginLeft: '12mm', textAlign: 'justify', marginTop: '3px' }}>
                        <span style={{ fontWeight: 'bold' }}>M{i+1}:</span> UN (01) {m.tipo_muestra || 'frasco'} {m.cantidad ? `conteniendo ${m.cantidad}` : ''} de {m.descripcion || 'muestra sin descripción'}
                    </div>
                ))}
                
                <div style={{ display: 'flex', marginTop: '8px' }}>
                     <span style={labelStyle}>J.</span><span style={{ fontWeight: 'bold' }}>EXAMEN:</span>
                </div>
                <div style={{ marginLeft: '12mm', marginTop: '3px' }}>
                    {examenesConsolidados && examenesConsolidados.map((examen, idx) => (
                        <div key={idx}>
                             <strong style={{ textDecoration: 'underline' }}>{examen.nombre}</strong>
                             <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '8mm', marginTop: '5px' }}>
                                <tbody>
                                    {examen.resultados.map((res, i) => (
                                        <tr key={i}>
                                            <td style={{ width: '65mm', padding: '1px 0' }} dangerouslySetInnerHTML={{ __html: res.analito }}></td>
                                            <td style={{ padding: '1px 0' }}><strong>{res.resultado}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', marginTop: '8px' }}>
                     <span style={labelStyle}>K.</span><span style={{ fontWeight: 'bold' }}>CONCLUSIONES:</span>
                </div>
                <div style={{ marginLeft: '12mm', textAlign: 'justify' }}>
                     <div style={{ display: 'flex' }}><span style={{ marginRight: '5px' }}>1.</span><span>{conclusion_principal}</span></div>
                     <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                     <div style={{ display: 'flex' }}><span style={{ marginRight: '5px' }}>2.</span><span>Muestras agotadas en los análisis.</span></div>
                     <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                </div>

                <div style={{ display: 'flex', marginTop: '8px' }}>
                    <span style={labelStyle}>L.</span><span style={fieldLabelStyle}>MUESTRA TOMADA POR:</span><span>{recolector_muestra}.</span>
                </div>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>

                <div style={{ display: 'flex', marginTop: '8px' }}>
                    <span style={labelStyle}>M.</span><span style={{ fontWeight: 'bold' }}>METODO UTILIZADO:</span>
                </div>
                <div style={{ marginLeft: '12mm', textAlign: 'justify' }}>
                    {/* Hardcoded por ahora o pasar prop metodos */}
                    <div style={{ display: 'flex' }}>
                         <strong style={{ minWidth: '30mm' }}>Análisis Toxicológico</strong><span>: Cromatografía en capa fina, Inmunoensayo</span>
                    </div>
                     <div style={{ display: 'flex' }}>
                         <strong style={{ minWidth: '30mm' }}>Dosaje Etílico</strong><span>: Espectrofotometría – UV VIS</span>
                    </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    {formatLongDate(fechaCreacion)}
                </div>

                {/* Firma */}
                <div style={{ width: '40%', margin: '1cm 0 0 60%', textAlign: 'center', lineHeight: '1.2' }}>
                    <div style={{ borderTop: '1px solid #000', width: '100%', margin: '0 auto 5px auto' }}></div>
                    <p style={{ fontWeight: 'bold', margin: '5px 0 0 0' }}>{peritoNombre}</p>
                    <p style={{ margin: 0, fontSize: '9pt' }}>{peritoGrado}</p>
                    <p style={{ margin: 0, fontSize: '9pt' }}>Perito Químico Farmacéutico</p>
                </div>
            </div>

        </div>
    </div>
  );
};

export default InformePreview;