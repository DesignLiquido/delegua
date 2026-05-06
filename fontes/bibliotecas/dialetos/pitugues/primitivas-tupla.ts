import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { TuplaN } from '../../../construtos';
import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';

const obterValoresPuros = (
    interpretador: InterpretadorInterface,
    tupla: any,
    nomeMetodo: string
): any[] => {
    const objetoTupla = interpretador.resolverValor(tupla);

    if (!(objetoTupla instanceof TuplaN)) {
        throw new ErroEmTempoDeExecucao(
            null,
            `A função "${nomeMetodo}" só pode ser chamada em tuplas.`,
            interpretador.linhaDeclaracaoAtual
        );
    }

    return objetoTupla.elementos.map((elemento: any) =>
        interpretador.resolverValor(elemento)
    );
};

export default {
    juntar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'separador',
                'texto',
                false,
                [],
                'O texto usado para separar os elementos. O padrão é uma vírgula.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            tupla: TuplaN,
            separador?: string
        ): Promise<string> => {
            const valores = obterValoresPuros(interpretador, tupla, 'juntar');
            const sep = separador !== undefined
                ? interpretador.resolverValor(separador)
                : ',';

            return Promise.resolve(valores.join(sep));
        },
        assinaturaFormato: 'tupla.juntar(separador?)',
        documentacao:
            '# `tupla.juntar(separador)` \n \n' +
            'Junta todos os elementos da tupla em um único texto, separados pelo separador fornecido.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nt = ("A", "B", "C")\n' +
            'escreva(t.juntar("-")) // "A-B-C"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'tupla.juntar("-")',
    },
} as { [nome: string]: PrimitivaInterface };
