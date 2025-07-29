import { InformacaoVariavelOuConstante } from '../informacao-variavel-ou-constante';
import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    chaves: {
        tipoRetorno: 'texto[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        },
    },
    contem: {
        tipoRetorno: 'lógico',
        argumentos: [new InformacaoVariavelOuConstante('chave', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string
        ): Promise<boolean> => Promise.resolve(chave in valor),
    },
    contém: {
        tipoRetorno: 'lógico',
        argumentos: [new InformacaoVariavelOuConstante('chave', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string
        ): Promise<boolean> => Promise.resolve(chave in valor),
    },
    remover: {
        tipoRetorno: 'lógico',
        argumentos: [new InformacaoVariavelOuConstante('chave', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string
        ): Promise<boolean> => Promise.resolve(delete valor[chave]),
    },
    valores: {
        tipoRetorno: 'qualquer[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        },
    },
} as { [nome: string]: PrimitivaInterface };
