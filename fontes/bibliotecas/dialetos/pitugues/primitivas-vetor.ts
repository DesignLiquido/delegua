import { DeleguaFuncao } from '../../../interpretador/estruturas';
import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';
import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

const contem_comum = (nome: string) => {
    return {
        tipoRetorno: 'lógico',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento a ser verificado se está presente no vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            elemento: any
        ): Promise<any> => {
            const elementoResolvido = interpretador.resolverValor(elemento);
            return Promise.resolve(vetor.includes(elementoResolvido))
        },
        assinaturaFormato: `vetor.${nome}(elemento: qualquer)`,
        documentacao:
            `# \`vetor.${nome}(elemento)\`\n\n` +
            'Verifica se o elemento existe no vetor. Devolve `verdadeiro` se existe, e `falso` em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'v = [1, 2, 3]\n' +
            `escreva(v.${nome}(2)) // verdadeiro\n` +
            `escreva(v.${nome}(4)) // falso\n\`\`\`` +
            '\n\n## Formas de uso\n',
        exemploCodigo: `vetor.${nome}(elemento)`,
    };
};

export default {
    adicionar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'Os elementos a serem adicionados ao vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...elementos: any[]
        ): Promise<any> => {
            for (const elemento of elementos) {
                vetor.push(interpretador.resolverValor(elemento));
            }

            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.adicionar(...elemento: qualquer)',
        documentacao:
            '# `vetor.adicionar(elemento)` \n \n' +
            'Adiciona um ou mais elementos em um vetor.' +
            '\n\n ## Exemplo de Código\n' +
            '```pitugues\nv.adicionar(7)\n' +
            'v.adicionar(5)\n' +
            'v.adicionar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.adicionar(elemento)',
    },
    clonar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any[]> => Promise.resolve([...vetor]),
        assinaturaFormato: 'vetor.clonar()',
        documentacao:
            '# `vetor.clonar()` \n \n' +
            'Cria e retorna uma cópia exata do vetor original. Muito útil para quando você precisa modificar uma lista sem alterar a variável original na memória.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nv1 = [1, 2, 3]\n' +
            'v2 = v1.clonar()\n' +
            'v2.adicionar(4)\n\n' +
            'escreva(v1) // [1, 2, 3]\n' +
            'escreva(v2) // [1, 2, 3, 4]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.clonar()',
    },
    concatenar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'outroVetor',
                'qualquer[]',
                true,
                [],
                'O outro vetorm ou outros vetores, a serem concatenados a este vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...outrosVetores: any
        ): Promise<any> => {
            let vetorResultado = [...vetor];

            for (const outro of outrosVetores) {
                const resolvido = interpretador.resolverValor(outro);
                if (Array.isArray(resolvido)) {
                    vetorResultado = vetorResultado.concat(resolvido);
                } else {
                    vetorResultado.push(resolvido);
                }
            }

            return Promise.resolve(vetorResultado);
        },
        assinaturaFormato: 'vetor.concatenar(...outroVetor: qualquer[])',
        documentacao:
            '# `vetor.concatenar(outroVetor)` \n \n' +
            'Adiciona ao conteúdo do vetor um ou mais elementos' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nv = [7, 5, 3]\n' +
            'escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.concatenar(...argumentos)',
    },
    estender: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'outrosVetores',
                'qualquer[]',
                true,
                [],
                'Um ou mais vetores (ou dicionários) cujos elementos serão adicionados ao final deste vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...iteraveis: any[]
        ): Promise<any[]> => {
            if (iteraveis.length === 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        'A função "estender" espera pelo menos um argumento (vetor ou dicionário).',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            for (const argumento of iteraveis) {
                const itemResolvido = interpretador.resolverValor(argumento);

                // É um vetor
                if (Array.isArray(itemResolvido)) {
                    vetor.push(...itemResolvido);
                    continue;
                }

                // É um dicionário
                if (typeof itemResolvido === 'object' && itemResolvido !== null) {
                    vetor.push(...Object.keys(itemResolvido));
                    continue;
                }

                // Não é iterável
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        'O argumento da função "estender" deve ser um vetor ou um dicionário.',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.estender(...iteravel: qualquer[])',
        documentacao:
            '# `vetor.estender(iteravel)`\n\nAdiciona elementos de um vetor ou chaves de um dicionário ao final do vetor atual.',
        exemploCodigo: 'vetor.estender([1, 2])',
    },
    fatiar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'inicio',
                'inteiro',
                false,
                [],
                'A posição de início do vetor a ser fatiado. Se não fornecido, retorna o vetor inteiro.'
            ),
            new InformacaoElementoSintatico(
                'fim',
                'inteiro',
                false,
                [],
                'A posição de fim do vetor a ser fatiado.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            inicio: number,
            fim: number
        ): Promise<any> => Promise.resolve(vetor.slice(inicio, fim)),
        assinaturaFormato: 'vetor.fatiar(inicio?: número, fim?: número)',
        documentacao:
            '# `vetor.fatiar(inicio, fim)` \n \n' +
            'Extrai uma fatia do vetor, dadas posições de início e fim. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nv = [1, 2, 3, 4, 5]\n' +
            'escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            'escreva(v.fatiar(2, 4)) // "[3, 4]"\n' +
            'escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, extrai trecho da 3ª posição até o final do vetor.\n```' +
            '\n\n ### Formas de uso \n' +
            'Fatiar suporta sobrecarga do método.\n\n',
        exemploCodigo:
            'vetor.fatiar(<a partir desta posição>)\n' +
            'vetor.fatiar(<a partir desta posição>, <até esta posição>)',
    },
    indice: {
        tipoRetorno: 'inteiro',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento cuja posição (índice) será buscada no vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            elemento: any
        ): Promise<any> => {
            if (elemento === undefined) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(null, '', interpretador.linhaDeclaracaoAtual)
                );
            }

            if (elemento === 'nulo') return Promise.reject(-1);

            const valorProcurado = interpretador.resolverValor(elemento);
            const index = vetor.findIndex(
                (item) => interpretador.resolverValor(item) === valorProcurado
            );

            return Promise.resolve(index);
        },
        assinaturaFormato: 'vetor.indice(elemento: qualquer)',
        documentacao:
            '# `vetor.indice(elemento)` \n \n' +
            'Retorna a posição (índice) da primeira ocorrência do elemento no vetor. \n' +
            'Caso o elemento não seja encontrado, devolve `-1`.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'v = ["maçã", "banana", "uva"]\n' +
            'escreva(v.indice("banana")) // 1\n' +
            'escreva(v.indice("abacaxi")) // -1\n' +
            '```',
        exemploCodigo: 'vetor.indice(elemento)',
    },
    inserir: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'índice',
                'inteiro',
                true,
                [],
                'O índice onde o elemento será inserido.'
            ),
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento a ser inserido.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...args: any[]
        ): Promise<any> => {
            if (args.length !== 2) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        `A função "inserir" espera exatamente 2 argumentos (índice e elemento), mas recebeu ${args.length}.`,
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            const idx = interpretador.resolverValor(args[0]);
            const item = interpretador.resolverValor(args[1]);

            if (typeof idx !== 'number') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        'O primeiro argumento da função "inserir" (índice) deve ser um número.',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            if (idx < 0 || idx > vetor.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        `Índice ${idx} fora dos limites do vetor. O tamanho atual é ${vetor.length}.`,
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            vetor.splice(idx, 0, item);
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.inserir(indice: numero, elemento: qualquer)',
        documentacao:
            '# `vetor.inserir(indice, elemento)` \n \n' +
            'Insere um elemento em uma posição específica do vetor, deslocando os elementos existentes para a direita. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'v = [1, 2, 4, 5]\n' +
            'v.inserir(2, 3) \n' +
            'escreva(v) // "[1, 2, 3, 4, 5]"\n' +
            '```',
        exemploCodigo: 'vetor.inserir(indice, elemento)',
    },
    juntar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'separador',
                'texto',
                true,
                [],
                'O separador entre elementos do vetor para o texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            separador: string
        ): Promise<any> => Promise.resolve(vetor.join(separador)),
        assinaturaFormato: 'vetor.juntar(separador: texto)',
        documentacao:
            '# `vetor.juntar(separador = ",")` \n \n' +
            'Junta todos os elementos de um vetor em um texto, separando cada elemento pelo separador passado como parâmetro.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nv = [1, 2, 3]\n' +
            'escreva(v.juntar(":")) // "1:2:3"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.juntar()\n' + 'vetor.juntar(<separador>)',
    },
    limpar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [],
        implementacao: async (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            vetor.splice(0, vetor.length);
            return Promise.resolve();
        },
        assinaturaFormato: 'vetor.limpar()',
        documentacao:
            '# `vetor.limpar()`\n\nRemove todos os elementos do vetor original, deixando-o vazio.',
        exemploCodigo: 'vetor.limpar()',
    },
    ordenar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'funcaoOrdenacao',
                'função',
                false,
                [],
                '(Opcional) Função para guiar a ordenação.'
            ),
        ],
        implementacao: async (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            funcaoOrdenacao: DeleguaFuncao
        ): Promise<any> => {
            if (funcaoOrdenacao !== undefined && funcaoOrdenacao !== null) {
                for (let i = 0; i < vetor.length - 1; i++) {
                    for (let j = 1; j < vetor.length; j++) {
                        const valorComparacao = await funcaoOrdenacao.chamar(interpretador, [
                            vetor[j - 1],
                            vetor[j],
                        ]);
                        const valorComparacaoResolvido =
                            interpretador.resolverValor(valorComparacao);

                        if (valorComparacaoResolvido > 0) {
                            const aux = vetor[j];
                            vetor[j] = vetor[j - 1];
                            vetor[j - 1] = aux;
                        }
                    }
                }

                return vetor;
            }

            if (!vetor.every((v) => typeof v === 'number')) {
                vetor.sort();
            } else {
                vetor.sort((a, b) => a - b);
            }

            return vetor;
        },
        assinaturaFormato: 'vetor.ordenar()',
        documentacao:
            '# `vetor.ordenar()` \n \n' +
            'Ordena valores de um vetor em ordem crescente.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n// A ordenação padrão é ascendente, ou seja, para o caso de números, a ordem fica do menor para o maior.\n' +
            'v = [4, 2, 12, 5]\n' +
            'escreva(v.ordenar()) // [2, 4, 5, 12]\n' +
            '// Para o caso de textos, a ordenação é feita em ordem alfabética, caractere a caractere.\n' +
            'v = ["aaa", "a", "aba", "abb", "abc"]\n' +
            'escreva(v.ordenar()) // ["a", "aaa", "aba", "abb", "abc"]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.ordenar()',
    },
    remover: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento a ser removido do vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            elemento: any
        ): Promise<any> => {
            const elementoResolvido = interpretador.resolverValor(elemento);
            const index = vetor.indexOf(elementoResolvido);
            if (index !== -1) vetor.splice(index, 1);
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.remover(elemento: qualquer)',
        documentacao:
            '# `vetor.remover(elemento)` \n \n' +
            'Remove um elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvetor = [1, 2, 3]\n' +
            'vetor.remover(2)\n' +
            'escreva(vetor) // [1, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover(elemento)',
    },
    remover_primeiro: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> => {
            let elemento = vetor.shift();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.remover_primeiro()',
        documentacao:
            '# `vetor.remover_primeiro()` \n \n' +
            'Remove o primeiro elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvetor = [1, 2, 3]\n' +
            'primeiroElemento = vetor.remover_primeiro()\n' +
            'escreva(primeiroElemento) // 1\n' +
            'escreva(vetor) // [2, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_primeiro()',
    },
    remover_todos: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento a ser removido do vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            elemento: any
        ): Promise<any[]> => {
            const elementoResolvido = interpretador.resolverValor(elemento);
            const filtrado = vetor.filter(
                v => interpretador.resolverValor(v) !== elementoResolvido
            );

            vetor.length = 0;
            vetor.push(...filtrado);

            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.remover_todos(elemento: qualquer)',
        documentacao:
            '# `vetor.remover_todos(elemento)` \n \n' +
            'Remove todas as ocorrências de um elemento específico dentro do vetor.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nv = [1, 2, 3, 2, 4, 2]\n' +
            'v.remover_todos(2)\n' +
            'escreva(v) // [1, 3, 4]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_todos(elemento)',
    },
    remover_ultimo: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> => {
            let elemento = vetor.pop();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.remover_ultimo()',
        documentacao:
            '# `vetor.remover_ultimo()` \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvetor = [1, 2, 3]\n' +
            'ultimoElemento = vetor.remover_ultimo()\n' +
            'escreva(ultimoElemento) // 3\n' +
            'escreva(vetor) // [1, 2]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_ultimo()',
    },
    somar: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            if (vetor.length === 0) return Promise.resolve(0);

            const valoresPuros = vetor.map(
                item => interpretador.resolverValor(item)
            );

            return Promise.resolve(
                valoresPuros.reduce((acc, item) => {
                    const val = typeof item === 'object' &&
                        item?.valor ? item.valor : item;

                    return acc + val;
                })
            );
        },
        assinaturaFormato: 'vetor.somar()',
        documentacao:
            '# `vetor.somar()` \n \n' +
            'Soma ou concatena todos os elementos do vetor (de acordo com o tipo de dados desses elementos) e retorna o resultado.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvetor = [1, 2, 3, 4, 5]\n' +
            'escreva(vetor.somar()) // 15\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.somar()',
    },
    contem: contem_comum('contem'),
    contém: contem_comum('contém'),
} as { [nome: string]: PrimitivaInterface };
