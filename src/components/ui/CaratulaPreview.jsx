import React from 'react';

const CaratulaPreview = ({ data }) => {
    const {
        lugarFecha = '',
        numOficio = '',
        destCargo = '',
        destNombre = '',
        destPuesto = '',
        asuntoBase = '',
        asuntoRemite = '',
        referencia = '',
        cuerpoP1_1 = '',
        cuerpoP1_2 = '',
        cuerpoP1_3 = '',
        cuerpoP1_4 = '',
        cuerpoP1_5 = '',
        regNum = '',
        regIniciales = '',
        firmanteQS = '',
        firmanteNombre = '',
        firmanteCargo = '',
        firmanteDependencia = ''
    } = data;

    // Estilos exactos de caratula.hbs
    const pageStyle = {
        width: '100%',
        maxWidth: '210mm',
        aspectRatio: '210/297',
        minHeight: '297mm',
        padding: '15mm 25mm 20mm 25mm',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.5',
        color: 'black',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    // Estilos del encabezado (igual que en informe pero ajustados si caratula tiene variaciones)
    const headerContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '16mm', marginBottom: '2mm' };
    const headerBlockStyle = { display: 'flex', color: 'white', fontSize: '7pt', textAlign: 'center', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 5px', flexGrow: 1 };
    
    // Anchos específicos de bloques según CSS original
    // .block-1 { background-color: #D32F2F; width: 17mm; }
    // .block-2 { background-color: #424242; width: 25mm; } ...

    const sectionStyle = { display: 'flex', marginBottom: '5mm' };
    const labelStyle = { fontWeight: 'bold', width: '25mm' };
    const contentStyle = { width: '135mm' };

    return (
        <div className="preview-wrapper bg-gray-200 dark:bg-gray-800 p-8 rounded-xl overflow-y-auto max-h-[800px]">
            <div style={pageStyle} className="document-page">
                
                {/* --- ENCABEZADO --- */}
                <div style={headerContainerStyle}>
                    <div style={{ width: '12mm', height: '14mm', marginRight: '2px' }}>
                         <img src="/escudo.png" alt="Escudo" style={{width: '100%', height: '100%', objectFit: 'contain'}} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <div style={{...headerBlockStyle, backgroundColor: '#D32F2F', width: '17mm'}}>PERÚ</div>
                    <div style={{...headerBlockStyle, backgroundColor: '#424242', width: '25mm'}}>Ministerio<br/>del Interior</div>
                    <div style={{...headerBlockStyle, backgroundColor: '#616161', width: '25mm'}}>Policía Nacional<br/>del Perú</div>
                    <div style={{...headerBlockStyle, backgroundColor: '#757575', width: '29mm'}}>{data.membreteComando || 'IV MACRO REGION POLICIAL JUNIN'}</div>
                    <div style={{...headerBlockStyle, backgroundColor: '#9E9E9E', width: '29mm'}}>{data.membreteDireccion || 'REGPOL-JUNIN'}</div>
                    <div style={{...headerBlockStyle, backgroundColor: '#BDBDBD', width: '22mm'}}>{data.membreteRegion || 'DIVINCRI-HYO/OFICRI'}</div>
                </div>

                <div style={{ borderTop: '1.5px solid black', marginTop: '2mm', marginBottom: '5mm' }}></div>

                <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '9pt', marginBottom: '10mm' }}>
                    "Año de la Recuperación y Consolidación de la Economía Peruana"
                </div>

                <div style={{ position: 'relative', height: '20mm' }}>
                    <div style={{ textAlign: 'right' }}>{lugarFecha}</div>
                    <div style={{ marginTop: '2mm' }}>
                        OF. N° <b>{numOficio}</b>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={labelStyle}>SEÑOR:</div>
                    <div style={contentStyle}>
                        {destCargo}<br/>
                        {destNombre}<br/>
                        {destPuesto}
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={labelStyle}>ASUNTO:</div>
                    <div style={contentStyle}>
                        {asuntoBase} <b><u>{asuntoRemite}</u></b>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={labelStyle}>REF.:</div>
                    <div style={contentStyle}>
                        {referencia}
                    </div>
                </div>

                <div style={{ borderTop: '1.5px solid black', marginTop: '2mm', marginBottom: '5mm' }}></div>

                <div style={{ textAlign: 'justify', marginBottom: '5mm' }}>
                    {cuerpoP1_1}<b>{cuerpoP1_2}</b>{cuerpoP1_3}<b><u>{cuerpoP1_4}</u></b>{cuerpoP1_5}
                </div>

                <div style={{ textAlign: 'justify', marginBottom: '5mm' }}>
                    Le recordamos que los informes periciales constituyen el sustento científico de toda la investigación policial, por consiguiente, su omisión en la remisión a la autoridad competente, infringe normas vigentes que conllevan responsabilidad administrativa, disciplinaria y penal.
                </div>

                <div style={{ textAlign: 'justify', marginBottom: '5mm' }}>
                    Es propicia la oportunidad para reiterarle los sentimientos de mi especial consideración y deferente estima
                </div>

                <div style={{ textAlign: 'right', marginTop: '10mm' }}>
                    Dios guarde a Ud.
                </div>

                {/* --- FOOTER --- */}
                <div style={{ position: 'absolute', bottom: '30mm', width: 'calc(100% - 50mm)' }}>
                    <div style={{ position: 'relative', height: '40mm' }}>
                        <div style={{ position: 'absolute', left: 0, bottom: 0, fontSize: '9pt' }}>
                            REG: {regNum}<br/>
                            {regIniciales}
                        </div>
                        {/* Sello Placeholder */}
                        <div style={{ position: 'absolute', left: '85mm', bottom: 0, width: '30mm', height: '30mm', border: '1px dashed #ccc' }}></div>
                        
                        <div style={{ position: 'absolute', right: 0, bottom: 0, textAlign: 'left' }}>
                            <br/>
                            <b>{firmanteQS}</b><br/>
                            <b>{firmanteNombre}</b><br/>
                            {firmanteCargo}<br/>
                            {firmanteDependencia}
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '10mm', width: 'calc(100% - 50mm)', textAlign: 'center', fontSize: '8pt', borderTop: '1.5px solid black', paddingTop: '2mm' }}>
                    Oficina de Criminalística Huancayo<br/>
                    Jr. Cuzco N° 666- Teléfono: 064212453 – Cel: 980122629 – email: rpi.dic.ificri@policia.gob.pe
                </div>

            </div>
        </div>
    );
};

export default CaratulaPreview;