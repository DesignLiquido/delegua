import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';
import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';

export default {
    absoluto: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.abs(valor));
        },
        assinaturaFormato: 'número.absoluto()',
        documentacao:
            '# `número.absoluto()`\n\n' +
            'Retorna a versão absoluta de um número, ou seja, seu valor sem sinal.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = -5\n' +
            'escreva(n.absoluto()) // 5\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.absoluto()',
    },
    arredondar_para_baixo: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.floor(valor));
        },
        assinaturaFormato: 'número.arredondar_para_baixo()',
        documentacao:
            '# `número.arredondar_para_baixo()`\n\n' +
            'Retira as partes decimais de um número com partes decimais e retorna sua parte inteira. Se o número já é inteiro, devolve apenas o próprio número.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondar_para_baixo()) // 2\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondar_para_baixo()',
    },
    arredondar_para_cima: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.ceil(valor));
        },
        assinaturaFormato: 'número.arredondar_para_cima()',
        documentacao:
            '# `número.arredondar_para_cima()`\n\n' +
            'Arredonda um número com partes decimais para cima, ou seja, para o próximo número inteiro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondar_para_cima()) // 3\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondar_para_cima()',
    },
    formatar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'opcoesFormatacao',
                'dicionário',
                false,
                [],
                'Dicionário com opções de formatação, como número de casas decimais.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: number,
            opcoes: { [opcao: string]: any }
        ): Promise<string> => {
            let minimoCasasDecimais = 2;
            if (opcoes && opcoes.casasDecimais !== undefined) {
                minimoCasasDecimais = opcoes.casasDecimais;
            }

            let maximoCasasDecimais = 2;
            if (opcoes && opcoes.maximoCasasDecimais !== undefined) {
                maximoCasasDecimais = opcoes.maximoCasasDecimais;
            }

            return Promise.resolve(
                valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: minimoCasasDecimais,
                    maximumFractionDigits: maximoCasasDecimais,
                })
            );
        },
        assinaturaFormato: 'número.formatar(opcoesFormatacao)',
        documentacao:
            '# `número.formatar(opcoesFormatacao)`\n\n' +
            'Formata um número para o padrão brasileiro, com separador de milhar e vírgula como separador decimal.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 1234.56\n' +
            'escreva(n.formatar()) // 1.234,56\n' +
            'escreva(n.formatar({ minimoCasasDecimais: 2, maximoCasasDecimais: 3 })) // 1.234,568\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.formatar({ maximoCasasDecimais: 2 })',
    },
} as { [nome: string]: PrimitivaInterface };
