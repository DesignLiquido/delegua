import { VisitanteComumInterface } from '../interfaces';

export default {
    aparar: (interpretador: VisitanteComumInterface, texto: string): Promise<string> => Promise.resolve(texto.trim()),
    apararFim: (interpretador: VisitanteComumInterface, texto: string): Promise<string> =>
        Promise.resolve(texto.trimEnd()),
    apararInicio: (interpretador: VisitanteComumInterface, texto: string): Promise<string> =>
        Promise.resolve(texto.trimStart()),
    concatenar: (interpretador: VisitanteComumInterface, ...texto: string[]): Promise<string> =>
        Promise.resolve(''.concat(...texto)),
    dividir: (
        interpretador: VisitanteComumInterface,
        texto: string,
        divisor: any,
        limite?: number
    ): Promise<string[]> => {
        if (limite) {
            return Promise.resolve(texto.split(divisor, limite));
        }
        return Promise.resolve(texto.split(divisor));
    },
    fatiar: (interpretador: VisitanteComumInterface, texto: string, inicio: number, fim: number): Promise<string> =>
        Promise.resolve(texto.slice(inicio, fim)),
    inclui: (interpretador: VisitanteComumInterface, texto: string, elemento: any): Promise<boolean> =>
        Promise.resolve(texto.includes(elemento)),
    inverter: (interpretador: VisitanteComumInterface, texto: string): Promise<string> =>
        Promise.resolve(texto.split('').reduce((texto, caracter) => (texto = caracter + texto), '')),
    maiusculo: (interpretador: VisitanteComumInterface, texto: string): Promise<string> =>
        Promise.resolve(texto.toUpperCase()),
    minusculo: (interpretador: VisitanteComumInterface, texto: string): Promise<string> =>
        Promise.resolve(texto.toLowerCase()),
    substituir: (
        interpretador: VisitanteComumInterface,
        texto: string,
        elemento: string,
        substituto: string
    ): Promise<string> => Promise.resolve(texto.replace(elemento, substituto)),
    subtexto: (interpretador: VisitanteComumInterface, texto: string, inicio: number, fim: number): Promise<string> =>
        Promise.resolve(texto.slice(inicio, fim)),
    tamanho: (interpretador: VisitanteComumInterface, texto: string): Promise<number> => Promise.resolve(texto.length),
};
