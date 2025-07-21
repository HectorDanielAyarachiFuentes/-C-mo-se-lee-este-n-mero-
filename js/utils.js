// js/utils.js

/**
 * Convierte números a su representación en palabras en español.
 */
export const NumberConverter = {
    // ... (el código completo de NumberConverter va aquí, sin cambios)
    _unidades: ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
    _especiales: ["diez", "once", "doce", "trece", "catorce", "quince"],
    _decenas: ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"],
    _centenas: ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"],
    _decimalPlaces: ["", "DÉCIMOS", "CENTÉSIMOS", "MILÉSIMOS", "DIEZMILÉSIMOS", "CIENMILÉSIMOS", "MILLONÉSIMOS"],

    toLetters(n) {
        if (isNaN(n) || n === null) return "";
        if (n === 0) return "cero";
        if (n < 0) return "menos " + this.toLetters(Math.abs(n));

        let t = "";
        if (n >= 1e6) {
            const o = Math.floor(n / 1e6);
            t += (1 === o ? "un millón" : this.toLetters(o) + " millones");
            n %= 1e6;
            if (n > 0) t += " ";
        }
        if (n >= 1e3) {
            const o = Math.floor(n / 1e3);
            if (1 === o) {
                t += "mil";
            } else {
                let e = this.toLetters(o);
                if (e.endsWith("uno")) e = e.slice(0, -1) + "ún";
                t += e + " mil";
            }
            n %= 1e3;
            if (n > 0) t += " ";
        }
        if (n >= 100) {
            const o = Math.floor(n / 100);
            t += (1 === o && n % 100 > 0 ? "ciento" : this._centenas[o]);
            n %= 100;
            if (n > 0) t += " ";
        }
        if (n > 0) {
            if (n >= 10 && n <= 15) t += this._especiales[n - 10];
            else if (n >= 16 && n <= 19) t += "dieci" + this._unidades[n - 10];
            else if (n === 20) t += "veinte";
            else if (n > 20 && n < 30) t += "veinti" + this._unidades[n - 20];
            else if (n >= 30) {
                const o = Math.floor(n / 10);
                t += this._decenas[o];
                if ((n %= 10) > 0) t += " y " + this._unidades[n];
            } else {
                t += this._unidades[n];
            }
        }
        return t.trim();
    },

    formalDecimalsToLetters(d) {
        if (!d) return { texto: "", unidad: "" };
        const n = parseInt(d, 10);
        const l = d.length;
        let t = this.toLetters(n);
        let u = this._decimalPlaces[l] ? this._decimalPlaces[l].toLowerCase().replace("_", "") : "";
        if (n === 1 && u.endsWith("s")) {
            u = u.slice(0, -1);
        }
        return { texto: t, unidad: u };
    },

    simpleDecimalsToLetters(d) {
        return d.split('').map(c => this._unidades[parseInt(c, 10)]).join(' ');
    }
};

/**
 * Divide una palabra en español en sílabas.
 */
export const Syllabifier = {
    // ... (el código completo de Syllabifier va aquí, sin cambios)
    syllabify(p) {
        p = p.toLowerCase().trim();
        if (p.length <= 3) return [p];
        p = p.replace(/y/g, "i");
        let s = [], i = 0;
        while (i < p.length) {
            let t = i;
            while (t < p.length && !/[aeiouáéíóú]/.test(p[t])) t++;
            while (t < p.length && /[aeiouáéíóú]/.test(p[t])) t++;
            let c = t;
            if (t < p.length - 1) {
                const e = p.substring(t).match(/^[^aeiouáéíóú]+/);
                if (e) {
                    const n = e[0];
                    if (n.length === 1 || (n.length === 2 && /^(ll|rr|ch|[bcdfghprt]l|[bcdfghprt]r)$/.test(n))) {
                        c = t;
                    } else if (n.length >= 2) {
                        c = t + 1;
                    }
                }
            } else {
                c = p.length;
            }
            s.push(p.substring(i, c));
            i = c;
        }
        return s.filter(Boolean);
    }
};

/**
 * Servicio para manejar la síntesis de voz del navegador.
 */
export const SpeechService = {
    // ... (el código completo de SpeechService va aquí, sin cambios)
    speak(text, lang = 'es-ES', onBoundaryCallback = null, onEndCallback = null) {
        if (!text || typeof window.speechSynthesis === 'undefined') {
            if(onEndCallback) onEndCallback();
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        if (onBoundaryCallback) {
            utterance.onboundary = onBoundaryCallback;
        }
        if (onEndCallback) {
            utterance.onend = onEndCallback;
        }

        window.speechSynthesis.speak(utterance);
    }
};