import { DeleguaFuncao } from '../interpretador/estruturas';
import { InterpretadorInterface, PrimitivaInterface, SimboloInterface } from '../interfaces';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { inferirTipoVariavel } from '../inferenciador';
import {
    Literal,
    Dupla,
    Trio,
    Quarteto,
    Quinteto,
    Sexteto,
    Septeto,
    Octeto,
    Noneto,
    Deceto,
    TuplaN
} from '../construtos';
import { ErroEmTempoDeExecucao } from '../excecoes';

const mapaConstrutoresTupla: { [tamanho: number]: any } = {
    2: Dupla,
    3: Trio,
    4: Quarteto,
    5: Quinteto,
    6: Sexteto,
    7: Septeto,
    8: Octeto,
    9: Noneto,
    10: Deceto
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
            '```delegua\nv.adicionar(7)\n' +
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
            '\n\n```delegua\nvar v = [7, 5, 3]\n' +
            'escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.concatenar(...argumentos)',
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
            '\n\n```delegua\nvar v = []\n' +
            'v.empilhar(7)\n' +
            'v.empilhar(5)\n' +
            'v.empilhar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.empilhar(elemento)',
    },
    encaixar: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico('inicio', 'inteiro'),
            new InformacaoElementoSintatico('excluirQuantidade', 'número'),
            new InformacaoElementoSintatico('itens', 'qualquer[]'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            posicaoInicial: number,
            quantidadeExclusao?: number,
            ...itens: any[]
        ): Promise<any> => {
            let elementos = [];

            if (quantidadeExclusao || quantidadeExclusao === 0) {
                elementos = !itens.length
                    ? vetor.splice(posicaoInicial, quantidadeExclusao)
                    : vetor.splice(posicaoInicial, quantidadeExclusao, ...itens);

                return Promise.resolve(elementos);
            } else {
                elementos = !itens.length
                    ? vetor.splice(posicaoInicial)
                    : vetor.splice(posicaoInicial, ...itens);

                return Promise.resolve(elementos);
            }
        },
        assinaturaFormato:
            'vetor.encaixar(posicaoInicial?: número, quantidadeExclusao?: número, itens?: qualquer[])',
        documentacao:
            '# `vetor.encaixar(posicaoInicial, quantidadeExclusao, itens)` \n \n' +
            'Encaixa um vetor em outro, dadas posições de início e quantidade de ítens a serem excluídos do vetor original. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [1, 2, 3, 4, 5]\n' +
            'escreva(v.encaixar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            `var v1 = v.encaixar(2)\n` +
            'escreva(v) // "[3, 4, 5]", ou seja, a posição 2, onde fica o 3, passa a ser a nova posição inicial do vetor.\n' +
            'escreva(v1) // "[1, 2]", ou seja, o retorno de `encaixar()` são as posições removidas do vetor original.\n' +
            'var v2 = [1, 2, 3, 4, 5]\n' +
            'escreva(v2.encaixar(2, 1)) // "[3]"\n' +
            'escreva(v2) // "[1, 2, 4, 5]"\n```' +
            'var v3 = [1, 2, 3, 4, 5]\n' +
            'escreva(v3.encaixar(2, 1, "teste")) // "[3]"\n' +
            'escreva(v3) // "[1, 2, "teste", 4, 5]"\n```' +
            '\n\n ### Formas de uso \n' +
            '`encaixar` suporta sobrecarga do método.\n\n',
        exemploCodigo:
            'vetor.encaixar(<nova posição inicial>)\n' +
            'vetor.encaixar(<a partir desta posição>, <exclua esta quantidade de elementos>)\n' +
            'vetor.encaixar(<a partir desta posição>, <exclua esta quantidade de elementos>, <adicione estes elementos>)',
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
            '\n\n```delegua\nvar v = [1, 2, 3, 4, 5]\n' +
            'escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            'escreva(v.fatiar(2, 4)) // "[3, 4]"\n' +
            'escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, extrai trecho da 3ª posição até o final do vetor.\n```' +
            '\n\n ### Formas de uso \n' +
            'Fatiar suporta sobrecarga do método.\n\n',
        exemploCodigo:
            'vetor.fatiar(<a partir desta posição>)\n' +
            'vetor.fatiar(<a partir desta posição>, <até esta posição>)',
    },
    filtrarPor: {
        tipoRetorno: 'qualquer[]',
        argumentos: [
            new InformacaoElementoSintatico('funcao', 'função', true, [], 'A função de filtragem.'),
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
            '# `vetor.filtrarPor(funcao)` \n \n' +
            'Devolve todos os elementos de um vetor cujo resultado da execução de uma função, passada por parâmetro, seja verdadeiro.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [1, 2, 3, 4, 5]\n' +
            'var funcaoNumerosImpares = funcao (n) { retorna n % 2 > 0 }\n' +
            'escreva(v.filtrarPor(funcaoNumerosImpares)) // "[1, 3, 5]"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.filtrarPor(funcao (argumento) { <corpo da função com retorna> })',
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
            '\n\n```delegua\nvar v = [1, 2, 3]\n' +
            'escreva(v.inclui(2)) // verdadeiro\n' +
            'escreva(v.inclui(4)) // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inclui(elemento)',
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
            '\n\n```delegua\nvar v = [1, 2, 3]\n' +
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
            '\n\n```delegua\nvar v = [1, 2, 3]\n' +
            'escreva(v.juntar(":")) // "1:2:3"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.juntar()\n' + 'vetor.juntar(<separador>)',
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
            '\n\n```delegua\nvar v = [1, 2, 3, 4, 5]\n' +
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
            '\n\n```delegua\n// A ordenação padrão é ascendente, ou seja, para o caso de números, a ordem fica do menor para o maior.\n' +
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
            if (vetor.length < 2) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        {
                            hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                            linha: interpretador.linhaDeclaracaoAtual,
                        } as SimboloInterface,
                        'Para converter um vetor em tupla, ele precisa ter no mínimo 2 elementos.'
                    )
                );
            }

            const criarLiteral = (item: any) => new Literal(
                interpretador.hashArquivoDeclaracaoAtual,
                interpretador.linhaDeclaracaoAtual,
                item,
                inferirTipoVariavel(item) as any
            );

            if (mapaConstrutoresTupla.hasOwnProperty(vetor.length)) {
                const Construtor = mapaConstrutoresTupla[vetor.length];
                const args = vetor.map(criarLiteral);
                return Promise.resolve(new Construtor(...args));
            }

            const elementos = vetor.map(criarLiteral);

            return Promise.resolve(new TuplaN(
                interpretador.hashArquivoDeclaracaoAtual,
                interpretador.linhaDeclaracaoAtual,
                elementos
            ));
        },
        assinaturaFormato: 'vetor.paraTupla()',
        documentacao:
            '# `vetor.paraTupla()` \n \n' +
            'Converte o vetor atual em uma tupla imutável. Requer no mínimo 2 elementos.',
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
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'vetor.remover(2)\n' +
            'escreva(vetor) // [1, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover(elemento)',
    },
    removerPrimeiro: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            let elemento = vetor.shift();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.removerPrimeiro()',
        documentacao:
            '# `vetor.removerPrimeiro()` \n \n' +
            'Remove o primeiro elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'var primeiroElemento = vetor.removerPrimeiro()\n' +
            'escreva(primeiroElemento) // 1\n' +
            'escreva(vetor) // [2, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.removerPrimeiro()',
    },
    removerUltimo: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            let elemento = vetor.pop();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.removerUltimo()',
        documentacao:
            '# `vetor.removerUltimo()` \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'var ultimoElemento = vetor.removerUltimo()\n' +
            'escreva(ultimoElemento) // 3\n' +
            'escreva(vetor) // [1, 2]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.removerUltimo()',
    },
    removerÚltimo: {
        tipoRetorno: 'qualquer',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>
        ): Promise<any> => {
            let elemento = vetor.pop();
            return Promise.resolve(elemento);
        },
        assinaturaFormato: 'vetor.removerÚltimo()',
        documentacao:
            '# `vetor.removerÚltimo()` \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'var ultimoElemento = vetor.removerÚltimo()\n' +
            'escreva(ultimoElemento) // 3\n' +
            'escreva(vetor) // [1, 2]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.removerÚltimo()',
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
            '\n\n```delegua\nvar vetor = [1, 2, 3, 4, 5]\n' +
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
            '\n\n```delegua\nvar vetor = [0, 1, 2, 3, 4]\n' +
            'escreva(vetor.tamanho()) // 5\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.tamanho()',
    },
} as { [nome: string]: PrimitivaInterface };
