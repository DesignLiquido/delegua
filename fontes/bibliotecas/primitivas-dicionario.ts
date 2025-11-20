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
            nomePrimitiva: string,
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
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            valor: object
        ): Promise<any> => {
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
    }
} as { [nome: string]: PrimitivaInterface };
