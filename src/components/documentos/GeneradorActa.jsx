import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MARGIN = { top: 20, right: 25, bottom: 50, left: 25 };
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;
const FONT_SIZE = 11;
const LINE_HEIGHT = 6;

class DocManager {
    constructor(datos) {
        this.doc = new jsPDF('portrait', 'mm', 'a4');
        this.yPos = 0;
        this.datos = datos;
        this.escudoImg = null;
        this.membreteData = {
            membreteComando: "Comando de Operaciones Policiales",
            membreteDireccion: "Dirección Nacional de Orden y Seguridad",
            membreteRegion: "Región Policial Junín",
        };
        this.headerHeight = 0; // Almacena la altura del header
    }

    async init() {
        this.escudoImg = await this._cargarImagen('/assets/images/escudo.png');
        this.yPos = this._dibujarHeader(MARGIN.top);
        this.headerHeight = this.yPos; // Guardamos la altura total del header
    }

    _cargarImagen(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`No se pudo cargar la imagen: ${url}`);
                resolve(null);
            };
            img.src = url;
        });
    }

    _addPage() {
        this.doc.addPage();
        this.yPos = this._dibujarHeader(MARGIN.top);
    }

    _dibujarHeader(yPos) {
        let currentY = yPos;
        
        // Dibuja escudo
        if (this.escudoImg) {
            this.doc.addImage(this.escudoImg, 'PNG', MARGIN.left, currentY, 12, 14);
        }
        
        // Dibuja bloques de membrete
        let currentX = MARGIN.left + 13;
        const blocks = [
            { text: "PERÚ", color: "#D32F2F" },
            { text: "Ministerio\ndel Interior", color: "#424242" },
            { text: "Policía Nacional\ndel Perú", color: "#616161" },
            { text: this.membreteData.membreteComando, color: "#757575" },
            { text: this.membreteData.membreteDireccion, color: "#9E9E9E" },
            { text: this.membreteData.membreteRegion, color: "#BDBDBD" }
        ];
        const blockWidths = [17, 25, 25, 29, 29, 22];
        
        this.doc.setFontSize(7);
        this.doc.setTextColor(255, 255, 255);
        
        blocks.forEach((block, index) => {
            const blockWidth = blockWidths[index];
            this.doc.setFillColor(block.color);
            this.doc.rect(currentX, currentY, blockWidth, 16, 'F');
            this.doc.text(
                this.doc.splitTextToSize(block.text, blockWidth),
                currentX + (blockWidth / 2),
                currentY + 8,
                { align: 'center', baseline: 'middle' }
            );
            currentX += blockWidth + 0.5;
        });
        
        currentY += 16 + 2;
        
        // Línea separadora
        this.doc.setLineWidth(0.5);
        this.doc.line(MARGIN.left, currentY, PAGE_WIDTH - MARGIN.right, currentY);
        currentY += 5;
        
        // Texto del año
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(
            '"Año del Bicentenario, de la consolidación de nuestra Independencia, y de la conmemoración de las heroicas batallas de Junín y Ayacucho"',
            PAGE_WIDTH / 2,
            currentY,
            { align: 'center' }
        );
        
        // Restaurar configuración por defecto
        this.doc.setFontSize(FONT_SIZE);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        return currentY + 10;
    }

    _checkPageBreak(neededHeight) {
        if (this.yPos + neededHeight > PAGE_HEIGHT - MARGIN.bottom) {
            this._addPage();
            return true; // Indica que hubo salto de página
        }
        return false;
    }

    addTitle(text) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        const titleWidth = this.doc.getTextWidth(text);
        const lines = this.doc.splitTextToSize(text, CONTENT_WIDTH);
        const neededHeight = lines.length * LINE_HEIGHT;
        
        this._checkPageBreak(neededHeight + 10);
        
        this.doc.text(text, PAGE_WIDTH / 2, this.yPos, { align: 'center' });
        this.doc.setLineWidth(0.5);
        this.doc.line(
            PAGE_WIDTH / 2 - titleWidth / 2,
            this.yPos + 1,
            PAGE_WIDTH / 2 + titleWidth / 2,
            this.yPos + 1
        );
        
        this.yPos += neededHeight + 10;
        
        // Restaurar configuración
        this.doc.setFontSize(FONT_SIZE);
        this.doc.setFont('helvetica', 'normal');
    }

    addParagraph(text, options = {}) {
        const {
            align = 'left',
            fontStyle = 'normal',
            fontSize = FONT_SIZE,
            x = MARGIN.left,
            maxWidth = CONTENT_WIDTH
        } = options;
        
        this.doc.setFontSize(fontSize);
        this.doc.setFont('helvetica', fontStyle);
        
        const lines = this.doc.splitTextToSize(text, maxWidth);
        
        lines.forEach(line => {
            this._checkPageBreak(LINE_HEIGHT);
            this.doc.text(line, x, this.yPos, { align });
            this.yPos += LINE_HEIGHT;
        });
        
        // Restaurar configuración
        this.doc.setFontSize(FONT_SIZE);
        this.doc.setFont('helvetica', 'normal');
    }
    
    addNameValue(label, value) {
        this._checkPageBreak(LINE_HEIGHT);
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(label, MARGIN.left + 10, this.yPos);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(value, MARGIN.left + 35, this.yPos);
        
        this.yPos += LINE_HEIGHT;
    }

    addTable(head, body) {
        // SOLUCIÓN CLAVE: Guardamos si estamos en medio de la página
        const startY = this.yPos;
        
        autoTable(this.doc, {
            startY: startY,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [26, 77, 46], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 2 },
            margin: { left: MARGIN.left, right: MARGIN.right },
            
            // SOLUCIÓN: Sincronizar correctamente el yPos después de la tabla
            didDrawPage: (data) => {
                // Solo dibujar header si NO es la primera página de la tabla
                if (data.pageNumber > 1) {
                    const headerY = this._dibujarHeader(MARGIN.top);
                    // Ajustar el cursor de autoTable para que empiece después del header
                    data.settings.margin.top = headerY;
                }
            },
            
            // SOLUCIÓN: Capturar la posición final correctamente
            didParseCell: (data) => {
                // Asegurar que las celdas no se superpongan con márgenes
                if (data.row.index === 0 && data.section === 'head') {
                    data.cell.styles.minCellHeight = 8;
                }
            }
        });
        
        // SOLUCIÓN CRÍTICA: Actualizar yPos con la posición final de autoTable
        const finalY = this.doc.lastAutoTable.finalY;
        this.yPos = finalY + 5; // Añadimos un pequeño margen de seguridad
        
        // Verificar si necesitamos cambiar de página después de la tabla
        if (this.yPos > PAGE_HEIGHT - MARGIN.bottom) {
            this._addPage();
        }
    }

    addSpace(height) {
        this._checkPageBreak(height);
        this.yPos += height;
    }

    drawSignatures() {
        const { perito, oficio } = this.datos;
        const numPages = this.doc.internal.getNumberOfPages();
        this.doc.setPage(numPages);
        
        const signatureHeight = 40; // Altura necesaria para las firmas
        const minSpaceAbove = 15; // Espacio mínimo antes de las firmas
        
        // SOLUCIÓN: Calcular si hay espacio suficiente
        const spaceNeeded = minSpaceAbove + signatureHeight;
        const spaceAvailable = PAGE_HEIGHT - MARGIN.bottom - this.yPos;
        
        let signatureY;
        
        if (spaceAvailable < spaceNeeded) {
            // No hay suficiente espacio, crear nueva página
            this._addPage();
            signatureY = this.yPos + 15;
        } else if (spaceAvailable > spaceNeeded + 30) {
            // Hay mucho espacio, poner firmas al final de la página
            signatureY = PAGE_HEIGHT - MARGIN.bottom - signatureHeight + 10;
        } else {
            // Espacio justo, poner firmas después del contenido
            signatureY = this.yPos + minSpaceAbove;
        }
        
        const firmaWidth = 70;
        const startXPerito = MARGIN.left + 5;
        const startXExaminado = PAGE_WIDTH - MARGIN.right - firmaWidth - 5;
        
        // Línea de firma - Perito
        this.doc.setLineWidth(0.3);
        this.doc.line(startXPerito, signatureY, startXPerito + firmaWidth, signatureY);
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(
            perito.nombre_completo,
            startXPerito + firmaWidth / 2,
            signatureY + 5,
            { align: 'center' }
        );
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(
            `CIP: ${perito.CIP}`,
            startXPerito + firmaWidth / 2,
            signatureY + 9,
            { align: 'center' }
        );
        this.doc.text(
            'PERITO CRIMINALÍSTICO',
            startXPerito + firmaWidth / 2,
            signatureY + 13,
            { align: 'center' }
        );
        
        // Línea de firma - Examinado
        this.doc.line(startXExaminado, signatureY, startXExaminado + firmaWidth, signatureY);
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(
            oficio.examinado_incriminado,
            startXExaminado + firmaWidth / 2,
            signatureY + 5,
            { align: 'center' }
        );
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(
            `DNI: ${oficio.dni_examinado_incriminado}`,
            startXExaminado + firmaWidth / 2,
            signatureY + 9,
            { align: 'center' }
        );
        this.doc.text(
            'EL EXAMINADO',
            startXExaminado + firmaWidth / 2,
            signatureY + 13,
            { align: 'center' }
        );
        
        // Actualizar yPos final
        this.yPos = signatureY + 20;
    }

    render() {
        const blob = this.doc.output('blob');
        return URL.createObjectURL(blob);
    }
}

export const generarActaExtraccion = async (datosProcedimiento) => {
    const { oficio, perito, muestras, observaciones, fue_exitosa } = datosProcedimiento;
    const manager = new DocManager(datosProcedimiento);
    await manager.init();

    const titulo = fue_exitosa
        ? 'ACTA DE EXTRACCIÓN DE MUESTRA(S)'
        : 'ACTA DE NEGATIVA DE EXTRACCIÓN DE MUESTRA';
    manager.addTitle(titulo);

    const now = new Date();
    const introText = `En la ciudad de Huancayo, siendo las ${now.toLocaleTimeString('es-ES')} del día ${now.toLocaleDateString('es-ES')}, en las instalaciones de la Oficina de Criminalística PNP Huancayo, presente el Perito Criminalístico S.O.S PNP ${perito.nombre_completo}, con CIP N° ${perito.CIP}; se procede a realizar la presente diligencia de extracción de muestra biológica (orina), solicitada mediante Oficio N° ${oficio.numero_oficio}, a la persona de:`;
    manager.addParagraph(introText, { align: 'justify' });
    manager.addSpace(8);

    manager.addNameValue("NOMBRE:", oficio.examinado_incriminado.toUpperCase());
    manager.addNameValue("DNI:", oficio.dni_examinado_incriminado);
    manager.addSpace(8);

    if (fue_exitosa) {
        const cuerpoText = `A quien se le explica el procedimiento a realizar, accediendo voluntariamente a la extracción de la muestra, la cual se recolecta en un frasco de polietileno estéril, rotulado y lacrado para su posterior análisis. Las muestras recolectadas son las siguientes:`;
        manager.addParagraph(cuerpoText, { align: 'justify' });
        manager.addSpace(5);
        
        manager.addTable(
            [['#', 'Descripción de la Muestra', 'Cantidad / Volumen']],
            muestras.map((m, i) => [i + 1, m.descripcion, m.cantidad])
        );
        
        manager.addSpace(10);
    } else {
        const motivoText = `A quien, luego de explicarle el procedimiento a realizar, manifiesta su NEGATIVA a la extracción de la muestra, aduciendo el siguiente motivo:`;
        manager.addParagraph(motivoText, { align: 'justify' });
        manager.addSpace(8);
        
        manager.addParagraph(
            `"${observaciones || 'No se especificaron motivos.'}"`,
            {
                align: 'justify',
                fontStyle: 'italic',
                x: MARGIN.left + 10,
                maxWidth: CONTENT_WIDTH - 20
            }
        );
        manager.addSpace(10);
    }
    
    const cierreText = `Siendo las ${new Date(now.getTime() + 10 * 60000).toLocaleTimeString('es-ES')}, se da por concluida la presente diligencia, firmando a continuación el perito y el examinado en señal de conformidad.`;
    manager.addParagraph(cierreText, { align: 'justify' });

    manager.drawSignatures();

    return manager.render();
};