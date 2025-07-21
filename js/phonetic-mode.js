// js/phonetic-mode.js

import { Syllabifier, SpeechService } from './utils.js';

/**
 * Gestiona el modo de aprendizaje fonético.
 */
export const PhoneticMode = {
    // ... (el código completo de PhoneticMode va aquí, sin cambios)
    element: null,
    placeholder: '<span class="placeholder-text">Desglose fonético...</span>',
    
    init(selector) {
        this.element = document.querySelector(selector);
        this.reset();
    },

    reset() {
        this.element.innerHTML = this.placeholder;
    },
    
    render(text) {
        this.element.innerHTML = '';
        if (!text) {
            this.reset();
            return;
        }
        text.split(/\s+/).filter(Boolean).forEach((palabra, index) => {
            const span = document.createElement('span');
            span.className = 'palabra-fonetica';
            let silabas = Syllabifier.syllabify(palabra).join('-');
            span.textContent = (index === 0) ? silabas.charAt(0).toUpperCase() + silabas.slice(1) : silabas;
            this.element.appendChild(span);
        });
    },

    play(text) {
        if (!text) return;
        const syllables = Array.from(this.element.querySelectorAll('.palabra-fonetica'));
        let wordIndex = 0;

        const onBoundary = (event) => {
            if (event.name === 'word') {
                syllables.forEach(s => s.classList.remove('highlight'));
                if (syllables[wordIndex]) {
                    syllables[wordIndex].classList.add('highlight');
                }
                wordIndex++;
            }
        };
        const onEnd = () => syllables.forEach(s => s.classList.remove('highlight'));

        SpeechService.speak(text, 'es-ES', onBoundary, onEnd);
    }
};