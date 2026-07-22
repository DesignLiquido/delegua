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
            valor: object,
            chave: any
        ): Promise<boolean> => Promise.resolve(chave in valor),
        assinaturaFormato: `dicionário.${nome}(chave: qualquer)`,
        documentacao:
            `# \`dicionário.${nome}(chave)\`\n\n` +
            'Retorna verdadeiro se o elemento passado como parâmetro existe como chave do dicionário. Devolve falso em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
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
            'd = {"a": 1, "b": 2, "c": 3}\n' +
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
            valor: object
        ): Promise<any> => {
            const pares = Object.entries(valor).map(
                ([chave, valor]) => [chave, valor]
            );

            return Promise.resolve(pares);
        },
        assinaturaFormato: 'dicionário.itens()',
        documentacao:
            '# `dicionário.itens()`\n\n' +
            'Retorna um vetor contendo pares `[chave, valor]` de um dicionário. ' +
            'Funciona de maneira semelhante à função `items()` da linguagem Python.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.itens())\n' +
            '// [["a", 1], ["b", 2], ["c", 3]]\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.itens()',
    },
    limpar: {
        tipoRetorno: 'nulo',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object
        ): Promise<any> => {
            for (const chave in valor) {
                delete valor[chave];
            }

            return Promise.resolve();
        },
        assinaturaFormato: 'dicionário.limpar()',
        documentacao:
            '# `dicionário.limpar()`\n\n' +
            'Remove todas as entradas do dicionário, deixando-o vazio.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
            'd.limpar()\n' +
            'escreva(d) // {}\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.limpar()',
    },
    mesclar: {
        tipoRetorno: 'dicionário',
        argumentos: [
            new InformacaoElementoSintatico(
                'outro',
                'dicionário',
                true,
                [],
                'O dicionário a ser mesclado.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            outro: object
        ): Promise<object> => {
            return Promise.resolve(Object.assign(valor, outro));
        },
        assinaturaFormato: 'dicionário.mesclar(outro: dicionário)',
        documentacao:
            '# `dicionário.mesclar(outro)`\n\n' +
            'Copia todas as entradas do dicionário passado como parâmetro para o dicionário atual. ' +
            'Em caso de chaves duplicadas, os valores do parâmetro sobrescrevem os do dicionário original.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
            'd.mesclar({"b": 99, "c": 3})\n' +
            'escreva(d) // {"a": 1, "b": 99, "c": 3}\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.mesclar(outro)',
    },
    obter: {
        tipoRetorno: 'qualquer',
        argumentos: [
            new InformacaoElementoSintatico(
                'chave',
                'texto',
                true,
                [],
                'A chave a ser buscada no dicionário.'
            ),
            new InformacaoElementoSintatico(
                'padrao',
                'qualquer',
                false,
                [],
                'Valor retornado caso a chave não exista. Padrão: nulo.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string,
            padrao: any = null
        ): Promise<any> => {
            return Promise.resolve(chave in valor ? valor[chave] : padrao);
        },
        assinaturaFormato: 'dicionário.obter(chave: texto, padrao?: qualquer)',
        documentacao:
            '# `dicionário.obter(chave, padrao?)`\n\n' +
            'Retorna o valor associado à chave. Se a chave não existir, retorna o valor padrão ' +
            '(ou nulo se nenhum padrão for fornecido).\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2}\n' +
            'escreva(d.obter("a", 0)) // 1\n' +
            'escreva(d.obter("z", 0)) // 0\n' +
            'escreva(d.obter("z")) // nulo\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.obter("minhaChave", valorPadrao)',
    },
    popular: {
        tipoRetorno: 'qualquer',
        argumentos: [
            new InformacaoElementoSintatico(
                'chave',
                'texto',
                true,
                [],
                'A chave a ser verificada ou inserida.'
            ),
            new InformacaoElementoSintatico(
                'padrao',
                'qualquer',
                true,
                [],
                'O valor a ser inserido caso a chave não exista.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object,
            chave: string,
            padrao: any
        ): Promise<any> => {
            if (!(chave in valor)) valor[chave] = padrao;

            return Promise.resolve(valor[chave]);
        },
        assinaturaFormato: 'dicionário.popular(chave: texto, padrao: qualquer)',
        documentacao:
            '# `dicionário.popular(chave, padrao)`\n\n' +
            'Se a chave não existir no dicionário, insere-a com o valor padrão. ' +
            'Retorna o valor atual da chave (seja ele preexistente ou recém-inserido).\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1}\n' +
            'escreva(d.popular("a", 99)) // 1 (chave já existia)\n' +
            'escreva(d.popular("b", 99)) // 99 (chave foi inserida)\n' +
            'escreva(d) // {"a": 1, "b": 99}\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.popular("minhaChave", valorPadrao)',
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
        documentacao:
            '# `dicionário.remover(chave)`\n\n' +
            'Remove uma chave do dicionário. ' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.remover("b")) // verdadeiro\n' +
            'escreva(d) // {"a": 1, "c": 3}\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.remover(chave)',
    },
    valores: {
        tipoRetorno: '<T>[]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            valor: object
        ): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        },
        assinaturaFormato: `dicionário.valores()`,
        documentacao:
            '# `dicionário.valores()`\n\n' +
            'Retorna os valores de cada chave do dicionário. ' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'd = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.valores()) // [1, 2, 3]\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.valores()',
    },
} as { [nome: string]: PrimitivaInterface };
