import { InterpretadorInterface, VisitanteComumInterface } from '../interfaces';
import { PrimitivaInterface } from '../interfaces/primitiva-interface';

export default {
    aparar: { 
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> => Promise.resolve(texto.trim())
    },
    apararFim: { 
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimEnd())
    },
    apararInicio: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimStart())
    },
    concatenar: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, ...texto: string[]): Promise<string> =>
            Promise.resolve(''.concat(...texto))
    },
    dividir: {
        tipoRetorno: 'texto[]',
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            divisor: any,
            limite?: number
        ): Promise<string[]> => {
            if (limite) {
                return Promise.resolve(texto.split(divisor, limite));
            }
            return Promise.resolve(texto.split(divisor));
        }
    },
    fatiar: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string, inicio: number, fim: number): Promise<string> =>
            Promise.resolve(texto.slice(inicio, fim))
    },
    inclui: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string, elemento: any): Promise<boolean> =>
            Promise.resolve(texto.includes(elemento))
    },
    inverter: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.split('').reduce((texto, caracter) => (texto = caracter + texto), ''))
    },
    maiusculo: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toUpperCase())
    },
    minusculo: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toLowerCase())
    },
    substituir: {
        tipoRetorno: 'texto',
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            elemento: string,
            substituto: string
        ): Promise<string> => Promise.resolve(texto.replace(elemento, substituto))
    },
    subtexto: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, texto: string, inicio: number, fim: number): Promise<string> =>
            Promise.resolve(texto.slice(inicio, fim))
    },
    tamanho: {
        tipoRetorno: 'número',
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<number> => Promise.resolve(texto.length)
    }
} as {[key: string]: PrimitivaInterface };
