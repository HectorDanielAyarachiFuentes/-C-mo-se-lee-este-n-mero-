// js/main.js

// Importar todos los módulos necesarios
import { NumberConverter, SpeechService } from './utils.js';
import { PhoneticMode } from './phonetic-mode.js';
import { FormalMode } from './formal-mode.js';

/**
 * CONTROLADOR PRINCIPAL (Orquesta la aplicación)
 */
const App = {
    // ... (el código completo de App va aquí, sin cambios)
     // Referencias al DOM
    elements: {
        input: null,
        simpleResultDiv: null,
        playSimpleBtn: null,
        playPhoneticBtn: null,
        playFormalBtn: null
    },
    // Estado de la aplicación
    state: {
        simpleText: "",
        formalText: "",
        integerText: "",
        decimalText: "",
        unitText: ""
    },
    // Constantes de UI
    placeholders: {
        simple: '<span class="placeholder-text">La lectura del número aparecerá aquí.</span>'
    },

    init() {
        // Asignar elementos del DOM
        this.elements.input = document.getElementById("numero");
        this.elements.simpleResultDiv = document.getElementById("resultado");
        this.elements.playSimpleBtn = document.getElementById("play-simple-btn");
        this.elements.playPhoneticBtn = document.getElementById("play-phonetic-btn");
        this.elements.playFormalBtn = document.getElementById("play-formal-btn");

        // Inicializar módulos de UI
        PhoneticMode.init("#aprendizaje-fonetico-resultado");
        FormalMode.init("#aprendizaje-formal-wrapper");

        // Configurar listeners de eventos
        this.elements.input.addEventListener("input", this.handleInput.bind(this));
        this.elements.playSimpleBtn.addEventListener("click", this.playSimple.bind(this));
        this.elements.playPhoneticBtn.addEventListener("click", this.playPhonetic.bind(this));
        this.elements.playFormalBtn.addEventListener("click", this.playFormal.bind(this));

        // Establecer el estado inicial de la UI
        this.resetUI();
    },

    handleInput() {
        // 1. Sanitizar el valor del input
        let val = this.elements.input.value.replace(/[^0-9,]/g, '').replace(/,/g, (m, o, s) => o === s.indexOf(',') ? ',' : '');
        if (this.elements.input.value !== val) {
            this.elements.input.value = val;
        }
        
        // 2. Resetear UI y estado si el input está vacío
        if (!val) {
            this.resetUI();
            return;
        }

        // 3. Procesar el número y actualizar el estado
        const parts = val.split(',');
        const pEnteraStr = parts[0] || '0';
        const pDecimalStr = parts[1] || '';
        const pEnteraNum = parseInt(pEnteraStr, 10);
        
        this.state.integerText = NumberConverter.toLetters(pEnteraNum);
        
        // Lectura simple
        const simpleDecimalText = pDecimalStr ? ` coma ${NumberConverter.simpleDecimalsToLetters(pDecimalStr)}` : "";
        this.state.simpleText = this.state.integerText + simpleDecimalText;

        // Lectura formal
        const { texto, unidad } = NumberConverter.formalDecimalsToLetters(pDecimalStr);
        this.state.decimalText = texto;
        this.state.unitText = unidad;
        
        let fraseEntera = pEnteraNum === 1 && pEnteraStr.length === 1 ? "un entero" : `${this.state.integerText} enteros`;
        if (pEnteraStr === "0" && pDecimalStr.length > 0) fraseEntera = "cero enteros";

        if (pDecimalStr) {
             this.state.formalText = `${fraseEntera} y ${this.state.decimalText} ${this.state.unitText}`;
        } else {
            this.state.formalText = this.state.integerText;
        }
       
        // 4. Actualizar la UI con el nuevo estado
        this.renderUI(pEnteraStr, pDecimalStr);
    },

    renderUI(pEnteraStr, pDecimalStr) {
        // Lector simple
        this.elements.simpleResultDiv.textContent = this.state.simpleText.charAt(0).toUpperCase() + this.state.simpleText.slice(1);
        // Modo Fonético
        PhoneticMode.render(this.state.simpleText);
        // Modo Formal
        FormalMode.render(pEnteraStr, pDecimalStr);
    },

    resetUI() {
        this.state = { simpleText: "", formalText: "", integerText: "", decimalText: "", unitText: "" };
        this.elements.simpleResultDiv.innerHTML = this.placeholders.simple;
        PhoneticMode.reset();
        FormalMode.reset();
    },
    
    // Métodos para los botones de reproducción
    playSimple() {
        if (!this.state.simpleText) { alert("Escribe un número."); return; }
        SpeechService.speak(this.state.simpleText);
    },

    playPhonetic() {
        if (!this.state.simpleText) { alert("Escribe un número."); return; }
        PhoneticMode.play(this.state.simpleText);
    },
    
    playFormal() {
        if (!this.state.formalText) { alert("Escribe un número."); return; }
        FormalMode.play({
            fullText: this.state.formalText,
            integerText: this.state.integerText,
            decimalText: this.state.decimalText,
            unitText: this.state.unitText
        });
    }
};

// Iniciar la aplicación cuando el DOM esté listo.
// El listener no es estrictamente necesario con `type="module"` porque se comporta como `defer`,
// pero es una buena práctica mantenerlo por claridad y robustez.
document.addEventListener("DOMContentLoaded", () => App.init());