// js/formal-mode.js

import { NumberConverter, SpeechService } from './utils.js';

/**
 * Gestiona el modo de aprendizaje formal (con SVG).
 */
export const FormalMode = {
    element: null,
    placeholder: '<span class="placeholder-text">Representación gráfica...</span>',
    
    init(selector) {
        this.element = document.querySelector(selector);
        this.reset();
    },

    reset() {
        this.element.innerHTML = this.placeholder;
    },

    /**
     * RENDERIZADO DEL SVG MEJORADO
     * - Coordenadas y viewBox ajustados para un diseño más compacto.
     * - Uso de text-anchor="middle" para un centrado de texto robusto.
     * - Lógica de espaciado simplificada.
     */
    render(pEnteraStr, pDecimalStr) {
        this.element.innerHTML = '';
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.element.appendChild(svg);

        // --- CONSTANTES DE DISEÑO AJUSTADAS ---
        const digitWidth = 55;
        const startX = 40; // Aumentado para dar más espacio a la izquierda
        const numY = 160; // Subido para reducir espacio vertical
        const mainLabelY = 100; // Posición Y para la etiqueta principal
        const verticalLabelY = 80; // Posición Y para etiquetas de decimales
        const fontSize = 72;
        const viewBoxHeight = 220; // Altura del viewBox reducida drásticamente

        let currentX = startX;

        // --- PARTE ENTERA ---
        const integerBlockWidth = pEnteraStr.length * digitWidth;
        const integerBlockCenterX = currentX + (integerBlockWidth / 2);

        // "PARTE ENTERA" Label - Centrado con text-anchor
        svg.innerHTML += `<text x="${integerBlockCenterX}" y="${mainLabelY}" class="svg-etiqueta-principal" text-anchor="middle">PARTE ENTERA</text>`;

        // Rectángulo de fondo para la parte entera
        svg.innerHTML += `<rect x="${currentX - 5}" y="${numY - fontSize + 10}" width="${integerBlockWidth + 10}" height="${fontSize}" fill="var(--color-fondo)" />`;
        
        // Número entero (también centrado en su bloque para mejor apariencia)
        svg.innerHTML += `<text id="svg-entero-texto" x="${integerBlockCenterX}" y="${numY}" class="svg-numero" style="fill: var(--color-entero)" text-anchor="middle">${pEnteraStr}</text>`;
        
        currentX += integerBlockWidth + 10; // Actualizamos la posición

        // Coma decimal
        if (pEnteraStr && pDecimalStr) {
            svg.innerHTML += `<text x="${currentX + 5}" y="${numY - 10}" class="svg-numero" style="fill: var(--color-coma)">,</text>`;
            currentX += 25;
        }
        
        // --- PARTE DECIMAL ---
        const gDecimales = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gDecimales.id = "svg-decimales-g";
        const gEtiquetas = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gEtiquetas.id = "svg-etiquetas-g";
        svg.appendChild(gDecimales);
        svg.appendChild(gEtiquetas);
        
        let startDecimalX = currentX;
        const decimalPlaces = NumberConverter._decimalPlaces;

        pDecimalStr.split('').forEach((digit, index) => {
            if (index < decimalPlaces.length - 1) {
                const digitCenterX = currentX + (digitWidth / 2);
                
                // Rectángulo, número y etiquetas
                gDecimales.innerHTML += `<rect x="${currentX}" y="${numY - fontSize + 10}" width="${digitWidth}" height="${fontSize}" fill="var(--color-fondo)" />`;
                gDecimales.innerHTML += `<text x="${digitCenterX}" y="${numY}" class="svg-numero" style="fill: var(--color-decimal)" text-anchor="middle">${digit}</text>`;
                gEtiquetas.innerHTML += `<line x1="${currentX + digitWidth}" y1="40" x2="${currentX + digitWidth}" y2="${viewBoxHeight}" stroke="#ccc" stroke-dasharray="5,5" />`;
                gEtiquetas.innerHTML += `<text x="${digitCenterX}" y="${verticalLabelY}" class="svg-etiqueta-vertical" transform="rotate(-90 ${digitCenterX},${verticalLabelY})">${decimalPlaces[index + 1].replace("_", "")}</text>`;
                
                currentX += digitWidth;
            }
        });

        // Línea vertical principal que separa entero de decimal
        gEtiquetas.innerHTML += `<line x1="${startDecimalX - 10}" y1="40" x2="${startDecimalX - 10}" y2="${viewBoxHeight}" stroke="var(--color-entero)" stroke-width="3" stroke-dasharray="8,4" />`;
        
        // --- VIEWBOX FINAL ---
        // Se ajusta dinámicamente al ancho y usa la altura compacta
        svg.setAttribute('viewBox', `0 0 ${currentX + 20} ${viewBoxHeight}`);
    },

    play({ fullText, integerText, decimalText, unitText }) {
        if (!fullText) return;
        
        const enteroSVG = document.getElementById('svg-entero-texto');
        const decimalSVG = document.getElementById('svg-decimales-g');
        const etiquetaSVG = document.getElementById('svg-etiquetas-g');

        const onBoundary = (e) => {
            if (e.name !== 'word') return;

            const currentText = fullText.substring(0, e.charIndex + e.charLength);
            [enteroSVG, decimalSVG, etiquetaSVG].forEach(el => el && el.classList.remove('highlight'));
            if(decimalSVG) Array.from(decimalSVG.children).forEach(el => el.classList.remove('highlight'));

            if (enteroSVG && integerText && currentText.includes(integerText)) {
                enteroSVG.classList.add('highlight');
            }
            if (decimalSVG && decimalText && currentText.includes(decimalText)) {
                decimalSVG.querySelectorAll('text').forEach(el => el.classList.add('highlight'));
            }
            if (etiquetaSVG && unitText && currentText.includes(unitText)) {
                decimalSVG.querySelectorAll('text').forEach(el => el.classList.remove('highlight'));
                etiquetaSVG.classList.add('highlight');
            }
        };
        const onEnd = () => [enteroSVG, decimalSVG, etiquetaSVG].forEach(el => el && el.classList.remove('highlight'));
        
        SpeechService.speak(fullText, 'es-ES', onBoundary, onEnd);
    }
};