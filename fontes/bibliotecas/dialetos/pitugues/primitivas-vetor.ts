import { DeleguaFuncao } from '../../../interpretador/estruturas';
import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';
import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';
import { inferirTipoVariavel } from '../../../inferenciador';
import { Literal, TuplaN } from '../../../construtos';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

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
            elemento: any
        ): Promise<any> => {
            vetor.push(elemento);
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
            outroVetor: Array<any>
        ): Promise<any> => {
            return Promise.resolve(vetor.concat(outroVetor));
        },
        assinaturaFormato: 'vetor.concatenar(...outroVetor: qualquer[])',
        documentacao:
            '# `vetor.concatenar(outroVetor)` \n \n' +
            'Adiciona ao conteúdo do vetor um ou mais elementos' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [7, 5, 3]\n' +
            'escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.concatenar(...argumentos)',
    },
    contar: {
        tipoRetorno: 'numero',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'qualquer',
                true,
                [],
                'O elemento a ser contado no vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...args: any[]
        ): Promise<any> => {
            if (args.length === 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        `A função "contar" espera um argumento.`,
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            if (args.length > 1) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        `A função "contar" espera apenas um argumento.`,
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            const elemento = args[0];
            const valorProcurado = interpretador.resolverValor(elemento);
            const total = vetor.filter(item => interpretador.resolverValor(item) === valorProcurado).length;
            return Promise.resolve(total);
        },
        assinaturaFormato: 'vetor.contar(elemento)',
        documentacao: '# `vetor.contar(elemento)`\n\nRetorna quantas vezes o elemento aparece no vetor.',
        exemploCodigo: 'vetor.contar(elemento)',
    },
    empilhar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [new InformacaoElementoSintatico('elemento', 'qualquer', true, [], '')],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            elemento: any
        ): Promise<any> => {
            vetor.push(elemento);
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.empilhar(elemento: qualquer)',
        documentacao:
            '# `vetor.empilhar(elemento)` \n \n' +
            'Adiciona um elemento ao final do vetor, como se o vetor fosse uma pilha na vertical.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = []\n' +
            'v.empilhar(7)\n' +
            'v.empilhar(5)\n' +
            'v.empilhar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.empilhar(elemento)',
    },
    estender: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'outrosVetores',
                'qualquer[]',
                true,
                [],
                'Um ou mais vetores cujos elementos serão adicionados ao final deste vetor.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            ...outrosVetores: any[]
        ): Promise<any[]> => {
            if (outrosVetores.length === 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        'A função "estender" espera pelo menos um vetor como argumento.',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            for (const argumento of outrosVetores) {
                const listaAdicional = interpretador.resolverValor(argumento);
                if (!Array.isArray(listaAdicional)) {
                    return Promise.reject(
                        new ErroEmTempoDeExecucao(
                            null,
                            'O argumento da função "estender" deve ser um vetor.',
                            interpretador.linhaDeclaracaoAtual,
                        )
                    );
                }
                vetor.push(...listaAdicional);
            }
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.estender(...outroVetor: qualquer[])',
        documentacao: '# `vetor.estender(outroVetor)`\n\nAdiciona todos os elementos de outro vetor ao final do vetor atual.',
        exemploCodigo: 'vetor.estender(...argumentos)',
    },
    fatiar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'inicio',
                'número',
                false,
                [],
                'A posição de início do vetor a ser fatiado. Se não fornecido, retorna o vetor inteiro.'
            ),
            new InformacaoElementoSintatico(
                'fim',
                'número',
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
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            'escreva(v.fatiar(2, 4)) // "[3, 4]"\n' +
            'escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, extrai trecho da 3ª posição até o final do vetor.\n```' +
            '\n\n ### Formas de uso \n' +
            'Fatiar suporta sobrecarga do método.\n\n',
        exemploCodigo:
            'vetor.fatiar(<a partir desta posição>)\n' +
            'vetor.fatiar(<a partir desta posição>, <até esta posição>)',
    },
    filtrar_por: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'funcao',
                'função',
                true,
                [],
                'A função de filtragem.'
            ),
        ],
        implementacao: async (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            funcao: DeleguaFuncao
        ): Promise<any> => {
            if (funcao === undefined || funcao === null) {
                return Promise.reject("É necessário passar uma função para o método 'filtrarPor'");
            }

            const retorno = [];
            for (let elemento of vetor) {
                const resultadoChamada = await funcao.chamar(interpretador, [elemento]);
                if (
                    resultadoChamada.hasOwnProperty('valorRetornado') &&
                    resultadoChamada.valorRetornado.valor === true
                ) {
                    retorno.push(elemento);
                }
            }

            return retorno;
        },
        assinaturaFormato: 'vetor.filtrarPor(funcao: função)',
        documentacao:
            '# `vetor.filtrar_por(funcao)` \n \n' +
            'Devolve todos os elementos de um vetor cujo resultado da execução de uma função, passada por parâmetro, seja verdadeiro.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'var funcaoNumerosImpares = funcao (n) { retorna n % 2 > 0 }\n' +
            'escreva(v.filtrar_por(funcaoNumerosImpares)) // "[1, 3, 5]"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.filtrar_por(funcao (argumento) { <corpo da função com retorna> })',
    },
    inclui: {
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
        ): Promise<any> => Promise.resolve(vetor.includes(elemento)),
        assinaturaFormato: 'vetor.inclui(elemento: qualquer)',
        documentacao:
            '# `vetor.inclui(elemento)` \n \n' +
            'Verifica se o elemento existe no vetor. Devolve `verdadeiro` se existe, e `falso` em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.inclui(2)) // verdadeiro\n' +
            'escreva(v.inclui(4)) // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inclui(elemento)'
    },
    indice: {
        tipoRetorno: 'numero',
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
                    new ErroEmTempoDeExecucao(
                        null,
                        '',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            if (elemento === 'nulo') return Promise.reject(-1);

            const valorProcurado = interpretador.resolverValor(elemento);
            const index = vetor.findIndex(item => interpretador.resolverValor(item) === valorProcurado);
            return Promise.resolve(index);
        },
        assinaturaFormato: 'vetor.indice(elemento: qualquer)',
        documentacao:
            '# `vetor.indice(elemento)` \n \n' +
            'Retorna a posição (índice) da primeira ocorrência do elemento no vetor. \n' +
            'Caso o elemento não seja encontrado, devolve `-1`.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var v = ["maçã", "banana", "uva"]\n' +
            'escreva(v.indice("banana")) // 1\n' +
            'escreva(v.indice("abacaxi")) // -1\n' +
            '```',
        exemploCodigo: 'vetor.indice(elemento)'
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
            )
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
        exemploCodigo: 'vetor.inserir(indice, elemento)'
    },
    inverter: {
        tipoRetorno: 'qualquer[]',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => Promise.resolve(vetor.reverse()),
        assinaturaFormato: 'vetor.inverter()',
        documentacao:
            '# `vetor.inverter()` \n \n' +
            'Inverte a ordem dos elementos de um vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.inverter()) // [3, 2, 1]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inverter()',
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
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.juntar(":")) // "1:2:3"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.juntar()\n' +
            'vetor.juntar(<separador>)',
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
        documentacao: '# `vetor.limpar()`\n\nRemove todos os elementos do vetor original, deixando-o vazio.',
        exemploCodigo: 'vetor.limpar()',
    },
    mapear: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'funcao',
                'função',
                true,
                [],
                'A função que transforma cada elemento de um vetor em outro elemento a ser retornado em um novo vetor.'
            ),
        ],
        implementacao: async (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            funcao: DeleguaFuncao
        ): Promise<any> => {
            if (funcao === undefined || funcao === null) {
                return Promise.reject("É necessário passar uma função para o método 'mapear'");
            }

            const retorno = [];
            for (let elemento of vetor) {
                let resultado = await funcao.chamar(interpretador, [elemento]);
                retorno.push(interpretador.resolverValor(resultado));
            }

            return retorno;
        },
        assinaturaFormato: 'vetor.mapear(funcao: função)',
        documentacao:
            '# `vetor.mapear(funcao)`\n\n' +
            'Dada uma função passada como parâmetro, executa essa função para cada elemento do vetor. \n' +
            'Cada elemento retornado por esta função é adicionado ao vetor resultante. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'var funcaoPotenciasDeDois = funcao (n) { retorna n ** 2 }\n' +
            'escreva(v.mapear(funcaoPotenciasDeDois)) // [1, 4, 9, 16, 25]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.mapear(funcao (argumento) { <corpo da função com retorna> })',
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
            'var v = [4, 2, 12, 5]\n' +
            'escreva(v.ordenar()) // [2, 4, 5, 12]\n' +
            '// Para o caso de textos, a ordenação é feita em ordem alfabética, caractere a caractere.\n' +
            'var v = ["aaa", "a", "aba", "abb", "abc"]\n' +
            'escreva(v.ordenar()) // ["a", "aaa", "aba", "abb", "abc"]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.ordenar()',
    },
    paraTupla: {
        tipoRetorno: 'tupla',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            const elementos = vetor.map(item => {
                return new Literal(
                    interpretador.hashArquivoDeclaracaoAtual,
                    interpretador.linhaDeclaracaoAtual,
                    item,
                    inferirTipoVariavel(item) as any
                );
            });

            return Promise.resolve(new TuplaN(
                interpretador.hashArquivoDeclaracaoAtual,
                interpretador.linhaDeclaracaoAtual,
                elementos
            ));
        },
        assinaturaFormato: 'vetor.paraTupla()',
        documentacao:
            '# `vetor.paraTupla()` \n \n' +
            'Converte o vetor atual em uma tupla imutável.',
        exemploCodigo: 'vetor.paraTupla()',
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
            const index = vetor.indexOf(elemento);
            if (index !== -1) vetor.splice(index, 1);
            return Promise.resolve(vetor);
        },
        assinaturaFormato: 'vetor.remover(elemento: qualquer)',
        documentacao:
            '# `vetor.remover(elemento)` \n \n' +
            'Remove um elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'vetor.remover(2)\n' +
            'escreva(vetor) // [1, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover(elemento)',
    },
    remover_primeiro: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            let elemento = vetor.shift();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.remover_primeiro()',
        documentacao:
            '# `vetor.remover_primeiro()` \n \n' +
            'Remove o primeiro elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'var primeiroElemento = vetor.remover_primeiro()\n' +
            'escreva(primeiroElemento) // 1\n' +
            'escreva(vetor) // [2, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_primeiro()',
    },
    remover_ultimo: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            let elemento = vetor.pop();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.remover_ultimo()',
        documentacao:
            '# `vetor.remover_ultimo()` \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'var ultimoElemento = vetor.remover_ultimo()\n' +
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
            vetor: Array<number | { valor: number }>
        ): Promise<number | { valor: number }> => {
            return Promise.resolve(
                vetor.reduce(
                    (acc: number, item) => acc + (typeof item === 'number' ? item : item.valor),
                    0
                )
            );
        },
        assinaturaFormato: 'vetor.somar()',
        documentacao:
            '# `vetor.somar()` \n \n' +
            'Soma ou concatena todos os elementos do vetor (de acordo com o tipo de dados desses elementos) e retorna o resultado.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3, 4, 5]\n' +
            'escreva(vetor.somar()) // 15\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.somar()',
    },
    tamanho: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => Promise.resolve(vetor.length),
        assinaturaFormato: 'vetor.tamanho()',
        documentacao:
            '# `vetor.tamanho()` \n \n' +
            'Retorna o número de elementos que compõem o vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [0, 1, 2, 3, 4]\n' +
            'escreva(vetor.tamanho()) // 5\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.tamanho()',
    },
} as { [nome: string]: PrimitivaInterface };
