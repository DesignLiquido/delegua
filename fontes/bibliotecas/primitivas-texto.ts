import { VisitanteComumInterface } from "../interfaces";

export default {
    aparar: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.trim()),
    apararFim: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.trimEnd()),
    apararInicio: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.trimStart()),
    concatenar: (interpretador: VisitanteComumInterface, ...texto: string[]): Promise<any> => Promise.resolve("".concat(...texto)),
    dividir: (interpretador: VisitanteComumInterface, texto: string, divisor: any, limite: number): Promise<any> => Promise.resolve(texto.split(divisor || ' ', limite)),
    fatiar: (interpretador: VisitanteComumInterface, texto: string, inicio: number, fim: number): Promise<any> => Promise.resolve(texto.slice(inicio, fim)),
    inclui: (interpretador: VisitanteComumInterface, texto: string, elemento: any): Promise<any> => Promise.resolve(texto.includes(elemento)),
    inverter: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.split('').reduce((texto, caracter) => texto = caracter + texto, '')),
    maiusculo: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.toUpperCase()),
    minusculo: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.toLowerCase()),
    substituir: (interpretador: VisitanteComumInterface, texto: string, elemento: string, substituto: string): Promise<any> => Promise.resolve(texto.replace(elemento, substituto)),
    subtexto: (interpretador: VisitanteComumInterface, texto: string, inicio: number, fim: number): Promise<any> => Promise.resolve(texto.slice(inicio, fim)),
    tamanho: (interpretador: VisitanteComumInterface, texto: string): Promise<any> => Promise.resolve(texto.length),
};
