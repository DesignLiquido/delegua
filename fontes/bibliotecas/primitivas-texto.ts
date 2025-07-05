import { InterpretadorInterface } from '../interfaces';
import { PrimitivaInterface } from '../interfaces/primitiva-interface';
import { InformacaoVariavelOuConstante } from '../informacao-variavel-ou-constante';

export default {
    aparar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trim()),
    },
    apararFim: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimEnd()),
    },
    apararInicio: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimStart()),
    },
    concatenar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            ...texto: string[]
        ): Promise<string> => Promise.resolve(''.concat(...texto)),
    },
    dividir: {
        tipoRetorno: 'texto[]',
        argumentos: [
            new InformacaoVariavelOuConstante('divisor', 'texto'),
            new InformacaoVariavelOuConstante('limite', 'número'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            divisor: string,
            limite?: number
        ): Promise<string[]> => {
            if (limite) {
                return Promise.resolve(texto.split(divisor, limite));
            }

            return Promise.resolve(texto.split(divisor));
        },
    },
    fatiar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoVariavelOuConstante('inicio', 'número'),
            new InformacaoVariavelOuConstante('fim', 'número'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
    },
    inclui: {
        tipoRetorno: 'texto',
        argumentos: [new InformacaoVariavelOuConstante('elemento', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            elemento: string
        ): Promise<boolean> => Promise.resolve(texto.includes(elemento)),
    },
    inverter: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(
                texto.split('').reduce((texto, caracter) => (texto = caracter + texto), '')
            ),
    },
    maiusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toUpperCase()),
    },
    minusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toLowerCase()),
    },
    substituir: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoVariavelOuConstante('elemento', 'texto'),
            new InformacaoVariavelOuConstante('substituto', 'texto'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            elemento: string,
            substituto: string
        ): Promise<string> => Promise.resolve(texto.replace(elemento, substituto)),
    },
    subtexto: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoVariavelOuConstante('inicio', 'número'),
            new InformacaoVariavelOuConstante('fim', 'número'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
    },
    tamanho: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<number> =>
            Promise.resolve(texto.length),
    },
} as { [key: string]: PrimitivaInterface };
