import { Dupla, Literal } from '../construtos';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

const contemComum = (nome: string) => {
    return {
        tipoRetorno: 'lógico',
        argumentos: [
            new InformacaoElementoSintatico(
                'chave',
                'qualquer',
                true,
                [],
                'O elemento como chave do dicionário.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: any
        ): Promise<boolean> => Promise.resolve(chave in valor),
        assinaturaFormato: `dicionário.${nome}(chave: qualquer)`,
        documentacao:
            `# \`dicionário.${nome}(chave)\`\n\n` +
            'Retorna verdadeiro se o elemento passado como parâmetro existe como chave do dicionário. Devolve falso em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            `escreva(d.${nome}("a")) // verdadeiro\n` +
            `escreva(d.${nome}("f")) // falso\n\`\`\`` +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.contem("minhaChave")',
    };
};

export default {
    mesclar: {
        tipoRetorno: 'dicionário',
        argumentos: [
            new InformacaoElementoSintatico(
                'outroDicionario',
                'dicionário',
                true,
                [],
                'Outro dicionário a ser mesclado com este dicionário.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            outroDicionario: any
        ): Promise<any> => {
            if (
                !outroDicionario ||
                Array.isArray(outroDicionario) ||
                outroDicionario.constructor !== Object
            ) {
                return Promise.reject(
                    new Error('O argumento de dicionário.mesclar() deve ser um dicionário.')
                );
            }

            return Promise.resolve(Object.assign({}, valor, outroDicionario));
        },
        assinaturaFormato: 'dicionário.mesclar(outroDicionario: dicionário)',
    },

    // Compatibilidade retroativa com versões anteriores.
    concatenar: {
        tipoRetorno: 'dicionário',
        argumentos: [
            new InformacaoElementoSintatico(
                'outroDicionario',
                'dicionário',
                true,
                [],
                'Outro dicionário a ser mesclado com este dicionário.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            outroDicionario: any
        ): Promise<any> => {
            if (
                !outroDicionario ||
                Array.isArray(outroDicionario) ||
                outroDicionario.constructor !== Object
            ) {
                return Promise.reject(
                    new Error('O argumento de dicionário.mesclar() deve ser um dicionário.')
                );
            }

            return Promise.resolve(Object.assign({}, valor, outroDicionario));
        },
        assinaturaFormato: 'dicionário.concatenar(outroDicionario: dicionário)',
    },

    chaves: {
        tipoRetorno: 'texto[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        },
        assinaturaFormato: 'dicionário.chaves()',
        documentacao:
            '# `dicionário.chaves()`\n\n' +
            'Retorna um vetor de texto com todas as chaves de um dicionário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.chaves()) // ["a", "b", "c"]\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.chaves()',
    },

    contem: contemComum('contem'),
    contém: contemComum('contém'),

    itens: {
        tipoRetorno: 'Dupla[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            const hashArquivo = interpretador.hashArquivoDeclaracaoAtual;
            const linha = interpretador.linhaDeclaracaoAtual;
            const pares = Object.entries(valor).map(([chave, valor]) => {
                return new Dupla(
                    new Literal(hashArquivo, linha, chave, 'texto'),
                    new Literal(hashArquivo, linha, valor, 'qualquer')
                );
            });
            return Promise.resolve(pares);
        },
        assinaturaFormato: 'dicionário.itens()',
        documentacao:
            '# `dicionário.itens()`\n\n' +
            'Retorna um vetor contendo tuplas, sendo o primeiro valor a chave do dicionário, e o segundo valor o valor correspondente no dicionário. ' +
            'Funciona de maneira semelhante às funções `entries()` de JavaScript, e `items()` da linguagem Python.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```delegua\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.itens())\n' +
            '// [[("a", 1)], [("b", 2)], [("c", 3)]]\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.itens()',
    },

    obter: {
        tipoRetorno: 'qualquer',
        argumentos: [
            new InformacaoElementoSintatico(
                'chave',
                'qualquer',
                true,
                [],
                'A chave a ser buscada no dicionário.'
            ),
            new InformacaoElementoSintatico(
                'valorPadrao',
                'qualquer',
                false,
                [],
                'O valor devolvido quando a chave não existe. Se omitido, é `nulo`.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: any,
            valorPadrao: any
        ): Promise<any> =>
            Promise.resolve(
                Object.prototype.hasOwnProperty.call(valor, chave)
                    ? valor[chave]
                    : valorPadrao === undefined
                      ? null
                      : valorPadrao
            ),
        assinaturaFormato: 'dicionário.obter(chave: qualquer, valorPadrao?: qualquer)',
        documentacao:
            '# `dicionário.obter(chave, valorPadrao)`\n\n' +
            'Devolve o valor associado à chave. Se a chave não existe, devolve `valorPadrao`, ou `nulo` se ele for omitido.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'var d = {"a": 1}\n' +
            'escreva(d.obter("a", 0)) // 1\n' +
            'escreva(d.obter("b", 0)) // 0\n' +
            'escreva(d.obter("b")) // nulo\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.obter("minhaChave", valorPadrao)',
    },

    remover: {
        tipoRetorno: 'lógico',
        argumentos: [new InformacaoElementoSintatico('chave', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string
        ): Promise<boolean> => Promise.resolve(delete valor[chave]),
        assinaturaFormato: `dicionário.remover(chave: qualquer)`,
    },

    valores: {
        tipoRetorno: '<T>[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        },
    },
} as { [nome: string]: PrimitivaInterface };
