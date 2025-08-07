import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    absoluto: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, nomePrimitiva: string, valor: number): Promise<number> => {
            return Promise.resolve(Math.abs(valor));
        },
        assinaturaFormato: 'número.absoluto()',
        documentacao: '# `número.absoluto()`\n\n' +
            'Retorna a versão absoluta de um número, ou seja, seu valor sem sinal.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var n = -5\n' +
            'escreva(n.absoluto()) // 5\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.absoluto()'
    },
    arredondarParaBaixo: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, nomePrimitiva: string, valor: number): Promise<number> => {
            return Promise.resolve(Math.floor(valor));
        },
        assinaturaFormato: 'número.arredondarParaBaixo()',
        documentacao: '# `número.arredondarParaBaixo()`\n\n' +
            'Retira as partes decimais de um número com partes decimais e retorna sua parte inteira. Se o número já é inteiro, devolve apenas o próprio número.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondarParaBaixo()) // 2\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondarParaBaixo()'
    },
    arredondarParaCima: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, nomePrimitiva: string, valor: number): Promise<number> => {
            return Promise.resolve(Math.ceil(valor));
        },
        assinaturaFormato: 'número.arredondarParaCima()',
        documentacao: '# `número.arredondarParaCima()`\n\n' +
            'Arredonda um número com partes decimais para cima, ou seja, para o próximo número inteiro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondarParaCima()) // 3\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondarParaCima()'
    },
} as { [nome: string]: PrimitivaInterface };
