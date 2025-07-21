// js/formal-mode.js

import { NumberConverter, SpeechService } from './utils.js';

/**
 * Gestiona el modo de aprendizaje formal (con SVG).
 */
export const FormalMode = {
    // ... (el código completo de FormalMode va aquí, sin cambios)
    element: null,
    placeholder: '<span class="placeholder-text">Representación gráfica...</span>',
    
    init(selector) {
        this.element = document.querySelector(selector);
        this.reset();
    },

    reset() {
        this.element.innerHTML = this.placeholder;
    },

    render(pEnteraStr, pDecimalStr) {
        this.element.innerHTML = '';
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.element.appendChild(svg);

        const digitWidth = 55, startX = 20, numY = 200, labelY = 110, fontSize = 72;
        let currentX = startX;

        // "PARTE ENTERA" Label
        svg.innerHTML += `<text x="${currentX + (pEnteraStr.length * digitWidth / 2) - 30}" y="140" class="svg-etiqueta-principal">PARTE ENTERA</text>`;

        // Entero
        svg.innerHTML += `<rect x="${currentX-5}" y="${numY - fontSize + 10}" width="${pEnteraStr.length * (digitWidth - 15) + 10}" height="${fontSize}" fill="var(--color-fondo)" />`;
        svg.innerHTML += `<text id="svg-entero-texto" x="${currentX}" y="${numY}" class="svg-numero" style="fill: var(--color-entero)">${pEnteraStr}</text>`;
        currentX += pEnteraStr.length * (digitWidth-15) + 20;

        if (pEnteraStr && pDecimalStr) {
            svg.innerHTML += `<text x="${currentX-5}" y="${numY -10}" class="svg-numero" style="fill: var(--color-coma)">,</text>`;
            currentX += 20;
        }
        
        // Contenedores para decimales y etiquetas
        const gDecimales = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gDecimales.id = "svg-decimales-g";
        const gEtiquetas = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gEtiquetas.id = "svg-etiquetas-g";
        svg.appendChild(gDecimales);
        svg.appendChild(gEtiquetas);
        
        let startDecimalX = currentX;
        const decimalPlaces = NumberConverter._decimalPlaces;
        pDecimalStr.split('').forEach((digit, index) => {
            if (index < decimalPlaces.length-1) {
                gDecimales.innerHTML += `<rect x="${currentX-5}" y="${numY - fontSize + 10}" width="${digitWidth}" height="${fontSize}" fill="var(--color-fondo)" />`;
                gDecimales.innerHTML += `<text x="${currentX + 5}" y="${numY}" class="svg-numero" style="fill: var(--color-decimal)">${digit}</text>`;
                gEtiquetas.innerHTML += `<line x1="${currentX + digitWidth - 5}" y1="50" x2="${currentX + digitWidth - 5}" y2="280" stroke="#ccc" stroke-dasharray="5,5" />`;
                gEtiquetas.innerHTML += `<text x="${currentX + digitWidth / 2}" y="${labelY}" class="svg-etiqueta-vertical" transform="rotate(-90 ${currentX + digitWidth / 2},${labelY})">${decimalPlaces[index+1].replace("_", "")}</text>`;
                currentX += digitWidth;
            }
        });

        // Línea vertical principal
        gEtiquetas.innerHTML += `<line x1="${startDecimalX - 18}" y1="50" x2="${startDecimalX - 18}" y2="280" stroke="var(--color-entero)" stroke-width="3" stroke-dasharray="8,4" />`;
        svg.setAttribute('viewBox', `0 0 ${currentX + 20} 300`);
    },

    play({ fullText, integerText, decimalText, unitText }) {
        if (!fullText) return;
        
        const enteroSVG = document.getElementById('svg-entero-texto');
        const decimalSVG = document.getElementById('svg-decimales-g');
        const etiquetaSVG = document.getElementById('svg-etiquetas-g');

        const onBoundary = (e) => {
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
                // Des-resaltar los números decimales cuando la unidad se está leyendo
                decimalSVG.querySelectorAll('text').forEach(el => el.classList.remove('highlight'));
                etiquetaSVG.classList.add('highlight');
            }
        };
        const onEnd = () => [enteroSVG, decimalSVG, etiquetaSVG].forEach(el => el && el.classList.remove('highlight'));
        
        SpeechService.speak(fullText, 'es-ES', onBoundary, onEnd);
    }
};