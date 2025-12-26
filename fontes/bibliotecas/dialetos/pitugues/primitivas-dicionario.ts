import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';
import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';

const contem_comum = (nome: string) => {
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
            nomePrimitiva: string,
            valor: object,
            chave: any
        ): Promise<boolean> => Promise.resolve(chave in valor),
        assinaturaFormato: `dicionário.${nome}(chave: qualquer)`,
        documentacao:
            `# \`dicionário.${nome}(chave)\`\n\n` +
            'Retorna verdadeiro se o elemento passado como parâmetro existe como chave do dicionário. Devolve falso em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            `escreva(d.${nome}("a")) // verdadeiro\n` +
            `escreva(d.${nome}("f")) // falso\n\`\`\`` +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.contem("minhaChave")',
    };
};

export default {
    chaves: {
        tipoRetorno: 'texto[]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            valor: object
        ): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        },
        assinaturaFormato: 'dicionário.chaves()',
        documentacao:
            '# `dicionário.chaves()`\n\n' +
            'Retorna um vetor de texto com todas as chaves de um dicionário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.chaves()) // ["a", "b", "c"]\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.chaves()',
    },
    contem: contem_comum('contem'),
    contém: contem_comum('contém'),
    itens: {
        tipoRetorno: '(texto|qualquer)[][]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            valor: object
        ): Promise<any> => {
            const pares = Object.entries(valor).map(([chave, valor]) => {
                return [chave, valor];
            });
            return Promise.resolve(pares);
        },
        assinaturaFormato: 'dicionário.itens()',
        documentacao:
            '# `dicionário.itens()`\n\n' +
            'Retorna um vetor contendo pares `[chave, valor]` de um dicionário. ' +
            'Funciona de maneira semelhante à função `items()` da linguagem Python.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.itens())\n' +
            '// [["a", 1], ["b", 2], ["c", 3]]\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.itens()',
    },
    remover: {
        tipoRetorno: 'lógico',
        argumentos: [new InformacaoElementoSintatico('chave', 'texto')],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            valor: object,
            chave: string
        ): Promise<boolean> => Promise.resolve(delete valor[chave]),
        assinaturaFormato: `dicionário.remover(chave: qualquer)`,
    },
    valores: {
        tipoRetorno: '<T>[]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            valor: object
        ): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        },
    },
} as { [nome: string]: PrimitivaInterface };
