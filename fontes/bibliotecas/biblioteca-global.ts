import { ErroEmTempoDeExecucao } from '../excecoes';
import { ObjetoDeleguaClasse } from '../interpretador/estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../interpretador/estruturas/funcao-padrao';
import { DescritorTipoClasse } from '../interpretador/estruturas/descritor-tipo-classe';
import { SimboloInterface, VariavelInterface } from '../interfaces';
import { InterpretadorInterface } from '../interfaces';
import { DeleguaFuncao } from '../interpretador/estruturas';
import {
    Deceto,
    Dupla,
    Literal,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    Septeto,
    Sexteto,
    Trio,
    Tupla,
} from '../construtos';

import { RetornoQuebra } from '../quebras';
import { inferirTipoVariavel } from '../inferenciador';

/**
 * Retorna um número aleatório entre 0 e 1.
 * @returns {Promise<number>} Número real.
 */
export async function aleatorio(interpretador: InterpretadorInterface): Promise<number> {
    return Promise.resolve(Math.random());
}

/**
 * Retorna um número aleatório de acordo com o parâmetro passado.
 * Mínimo(inclusivo) - Máximo(exclusivo).
 * @param {number} minimo O número mínimo.
 * @param {number} maximo O número máximo.
 * @returns {Promise<number>} Um número real entre os valores máximo e mínimo especificados.
 */
export async function aleatorioEntre(
    interpretador: InterpretadorInterface,
    minimo: VariavelInterface | number,
    maximo: VariavelInterface | number
): Promise<number> {
    if (arguments.length <= 0) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'A função recebe ao menos um parâmetro.'
            )
        );
    }

    const valorMinimo = minimo.hasOwnProperty('valor')
        ? (minimo as VariavelInterface).valor
        : minimo;

    if (arguments.length === 2) {
        if (typeof valorMinimo !== 'number') {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    {
                        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                        linha: interpretador.linhaDeclaracaoAtual,
                    } as SimboloInterface,
                    'O parâmetro deve ser um número.'
                )
            );
        }

        return Math.floor(Math.random() * (0 - valorMinimo)) + valorMinimo;
    }

    if (arguments.length > 3) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'A quantidade de parâmetros máxima para esta função é 2.'
            )
        );
    }

    const valorMaximo = maximo.hasOwnProperty('valor')
        ? (maximo as VariavelInterface).valor
        : maximo;

    if (typeof valorMinimo !== 'number' || typeof valorMaximo !== 'number') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Os dois parâmetros devem ser do tipo número.'
            )
        );
    }

    return Promise.resolve(Math.floor(Math.random() * (valorMaximo - valorMinimo)) + valorMinimo);
}

/**
 * Verifica se algum dos elementos satisfaz à condição para por parâmetro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {VariavelInterface | any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<boolean>} Verdadeiro se há algum elemento no vetor com a condição. Falso caso contrário.
 */
export async function algum(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoPesquisa: VariavelInterface | any
): Promise<boolean> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor')
        ? funcaoPesquisa.valor
        : funcaoPesquisa;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
            return true;
        }
    }

    return false;
}

/**
 * Clona profundamente uma variável ou constante em Delégua.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} valor O valor a ser clonado.
 * @returns {Promise<any>} Uma cópia profunda do valor fornecido.
 */
export async function clonar(
    interpretador: InterpretadorInterface,
    valor: VariavelInterface | any
): Promise<any> {
    // Resolver o valor caso seja uma VariavelInterface
    // Verificar se é null/undefined antes de usar hasOwnProperty
    let valorResolvido: any;
    if (valor === null || valor === undefined) {
        valorResolvido = valor;
    } else if (typeof valor === 'object' && valor.hasOwnProperty('valor')) {
        valorResolvido = valor.valor;
    } else {
        valorResolvido = valor;
    }

    // Map para evitar referências circulares
    const visitados = new WeakMap<object, any>();

    function clonarProfundo(valorAtual: any): any {
        // Valores primitivos (null, undefined, number, string, boolean)
        if (valorAtual === null || valorAtual === undefined) {
            return valorAtual;
        }

        if (typeof valorAtual !== 'object') {
            return valorAtual;
        }

        // Verificar se já visitamos este objeto (evitar referências circulares)
        if (visitados.has(valorAtual)) {
            return visitados.get(valorAtual);
        }

        // Arrays
        if (Array.isArray(valorAtual)) {
            const arrayClonado: any[] = [];
            visitados.set(valorAtual, arrayClonado);

            for (let i = 0; i < valorAtual.length; i++) {
                arrayClonado[i] = clonarProfundo(valorAtual[i]);
            }

            return arrayClonado;
        }

        // Objetos de Delégua - ObjetoDeleguaClasse
        if (valorAtual instanceof ObjetoDeleguaClasse) {
            // Clonar propriedades do objeto
            const propriedadesClonadas: { [nome: string]: any } = {};
            visitados.set(valorAtual, propriedadesClonadas);

            for (const chave in valorAtual.propriedades) {
                if (valorAtual.propriedades.hasOwnProperty(chave)) {
                    propriedadesClonadas[chave] = clonarProfundo(valorAtual.propriedades[chave]);
                }
            }

            // Criar novo objeto com as propriedades clonadas
            // Nota: A classe em si não é clonada, apenas suas propriedades
            const objetoClonado = new ObjetoDeleguaClasse(valorAtual.classe);
            objetoClonado.propriedades = propriedadesClonadas;

            return objetoClonado;
        }

        // Tuplas
        const nomeClasseTupla = valorAtual.constructor?.name;
        if (
            nomeClasseTupla &&
            /^(Dupla|Trio|Quarteto|Quinteto|Sexteto|Septeto|Octeto|Noneto|Deceto)$/.test(
                nomeClasseTupla
            )
        ) {
            const valoresClonados: any[] = [];
            visitados.set(valorAtual, valoresClonados);

            // Extrair valores da tupla baseado no tipo
            let valores: any[] = [];

            switch (nomeClasseTupla) {
                case 'Dupla':
                    valores = [valorAtual.primeiro, valorAtual.segundo];
                    break;
                case 'Trio':
                    valores = [valorAtual.primeiro, valorAtual.segundo, valorAtual.terceiro];
                    break;
                case 'Quarteto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                    ];
                    break;
                case 'Quinteto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                    ];
                    break;
                case 'Sexteto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                        valorAtual.sexto,
                    ];
                    break;
                case 'Septeto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                        valorAtual.sexto,
                        valorAtual.setimo,
                    ];
                    break;
                case 'Octeto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                        valorAtual.sexto,
                        valorAtual.setimo,
                        valorAtual.oitavo,
                    ];
                    break;
                case 'Noneto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                        valorAtual.sexto,
                        valorAtual.setimo,
                        valorAtual.oitavo,
                        valorAtual.nono,
                    ];
                    break;
                case 'Deceto':
                    valores = [
                        valorAtual.primeiro,
                        valorAtual.segundo,
                        valorAtual.terceiro,
                        valorAtual.quarto,
                        valorAtual.quinto,
                        valorAtual.sexto,
                        valorAtual.setimo,
                        valorAtual.oitavo,
                        valorAtual.nono,
                        valorAtual.decimo,
                    ];
                    break;
                default:
                    // Se não conseguir identificar, tentar extrair valores diretamente
                    if (valorAtual.valor) {
                        valores = Array.isArray(valorAtual.valor)
                            ? valorAtual.valor
                            : [valorAtual.valor];
                    }
            }

            // Clonar valores
            for (let i = 0; i < valores.length; i++) {
                valoresClonados.push(clonarProfundo(valores[i]));
            }

            // Recriar a tupla com valores clonados
            switch (nomeClasseTupla) {
                case 'Dupla':
                    return new Dupla(valoresClonados[0], valoresClonados[1]);
                case 'Trio':
                    return new Trio(valoresClonados[0], valoresClonados[1], valoresClonados[2]);
                case 'Quarteto':
                    return new Quarteto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3]
                    );
                case 'Quinteto':
                    return new Quinteto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4]
                    );
                case 'Sexteto':
                    return new Sexteto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4],
                        valoresClonados[5]
                    );
                case 'Septeto':
                    return new Septeto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4],
                        valoresClonados[5],
                        valoresClonados[6]
                    );
                case 'Octeto':
                    return new Octeto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4],
                        valoresClonados[5],
                        valoresClonados[6],
                        valoresClonados[7]
                    );
                case 'Noneto':
                    return new Noneto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4],
                        valoresClonados[5],
                        valoresClonados[6],
                        valoresClonados[7],
                        valoresClonados[8]
                    );
                case 'Deceto':
                    return new Deceto(
                        valoresClonados[0],
                        valoresClonados[1],
                        valoresClonados[2],
                        valoresClonados[3],
                        valoresClonados[4],
                        valoresClonados[5],
                        valoresClonados[6],
                        valoresClonados[7],
                        valoresClonados[8],
                        valoresClonados[9]
                    );
                default:
                    // Se não conseguir recriar, retornar os valores clonados como array
                    return valoresClonados;
            }
        }

        // DeleguaFuncao e FuncaoPadrao - funções não são clonadas profundamente
        // Elas mantêm referência à mesma definição, mas isso é comportamento esperado
        if (valorAtual instanceof DeleguaFuncao || valorAtual instanceof FuncaoPadrao) {
            return valorAtual;
        }

        // Objetos simples (plain objects)
        const objetoClonado: { [chave: string]: any } = {};
        visitados.set(valorAtual, objetoClonado);

        for (const chave in valorAtual) {
            if (valorAtual.hasOwnProperty(chave)) {
                objetoClonado[chave] = clonarProfundo(valorAtual[chave]);
            }
        }

        return objetoClonado;
    }

    return Promise.resolve(clonarProfundo(valorResolvido));
}

/**
 * Encontra o primeiro elemento de um vetor cuja função de pesquisa retorne
 * verdadeiro na avaliação de cada elemento.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {VariavelInterface | any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<any>} Um elemento, caso o elemento seja encontraro, ou nulo em caso contrário.
 */
export async function encontrar(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoPesquisa: VariavelInterface | any
): Promise<any> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor')
        ? funcaoPesquisa.valor
        : funcaoPesquisa;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
            return valorVetor[indice];
        }
    }

    return null;
}

/**
 * Encontra o índice do primeiro elemento de um vetor cuja função de pesquisa retorne
 * verdadeiro na avaliação de cada elemento.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {VariavelInterface | any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<number>} O número correspondente ao índice se o elemento for encontrado, ou nulo em caso contrário.
 */
export async function encontrarIndice(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoPesquisa: VariavelInterface | any
): Promise<number> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor')
        ? funcaoPesquisa.valor
        : funcaoPesquisa;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
            return indice;
        }
    }

    return -1;
}

/**
 * Encontrar o último elemento de um vetor cuja função de pesquisa retorne
 * verdadeiro na avaliação de cada elemento.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {VariavelInterface | any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<any>} O número correspondente ao índice se o elemento for encontrado, ou nulo em caso contrário.
 */
export async function encontrarUltimo(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoPesquisa: VariavelInterface | any
): Promise<any> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor')
        ? funcaoPesquisa.valor
        : funcaoPesquisa;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    for (let indice = valorVetor.length - 1; indice >= 0; --indice) {
        if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
            return valorVetor[indice];
        }
    }

    return null;
}

/**
 *
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {VariavelInterface | any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<number>} O número correspondente ao índice se o elemento for encontrado, ou nulo em caso contrário.
 */
export async function encontrarUltimoIndice(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoPesquisa: VariavelInterface | any
): Promise<number> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor')
        ? funcaoPesquisa.valor
        : funcaoPesquisa;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    for (let indice = valorVetor.length - 1; indice >= 0; --indice) {
        if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
            return indice;
        }
    }

    return null;
}

/**
 *
 * @param interpretador
 * @param vetor
 * @param funcaoFiltragem
 * @returns
 */
export async function filtrarPor(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoFiltragem: VariavelInterface | any
) {
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() não pode ser nulo.'
            )
        );

    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
        ? funcaoFiltragem.valor
        : funcaoFiltragem;
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoFiltragem.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função filtrarPor() deve ser uma função.'
            )
        );
    }

    const resultados = [];
    for (let indice = 0; indice < valorVetor.length; ++indice) {
        const informacoesValor = await valorFuncaoFiltragem.chamar(interpretador, [
            valorVetor[indice],
        ]);

        if (informacoesValor === null || informacoesValor === undefined) {
            continue;
        }

        const deveRetornarValor = informacoesValor.valorRetornado.valor;
        if (deveRetornarValor === false) continue;

        resultados.push(valorVetor[indice]);
    }

    return resultados;
}

/**
 *
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param valor
 * @returns
 */
export async function incluido(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    valor: VariavelInterface | any
): Promise<boolean> {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorValor = valor.hasOwnProperty('valor') ? valor.valor : valor;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        if (valorVetor[indice] == valorValor) {
            return true;
        }
    }

    return false;
}

function validacaoComumNumeros(
    interpretador: InterpretadorInterface,
    valorParaConverter: any
): Promise<never> | null {
    if (isNaN(valorParaConverter)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Valor não parece ser um número. Somente números ou textos com números podem ser convertidos para inteiro.'
            )
        );
    }

    if (!/^(-)?\d+(\.\d+)?$/.test(valorParaConverter)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Valor não parece estar estruturado como um número (texto vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para inteiro.'
            )
        );
    }

    return null;
}

/**
 * Converte um valor em um número inteiro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} valorParaConverter O valor a ser convertido.
 * @returns {Promise<any>} Uma Promise com o resultado da conversão.
 */
export async function inteiro(
    interpretador: InterpretadorInterface,
    valorParaConverter: VariavelInterface | any
): Promise<any> {
    if (valorParaConverter === null || valorParaConverter === undefined) return Promise.resolve(0);

    const valor = valorParaConverter.hasOwnProperty('valor')
        ? valorParaConverter.valor
        : valorParaConverter;
    const resultadoValidacao = validacaoComumNumeros(interpretador, valor);

    return resultadoValidacao || Promise.resolve(parseInt(valor));
}

/**
 * Cria um vetor com números inteiros no intervalo especificado.
 * O valor inicial é inclusivo e o valor final é exclusivo.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | number} valorInicial O valor inicial (inclusivo).
 * @param {VariavelInterface | number} valorFinal O valor final (exclusivo).
 * @returns {Promise<number[]>} Um vetor com os números no intervalo.
 */
export async function intervalo(
    interpretador: InterpretadorInterface,
    valorInicial: VariavelInterface | number,
    valorFinal: VariavelInterface | number
): Promise<number[]> {
    const inicio = interpretador.resolverValor(valorInicial);
    const fim = interpretador.resolverValor(valorFinal);

    if (typeof inicio !== 'number' || typeof fim !== 'number') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Os dois parâmetros devem ser do tipo número.'
            )
        );
    }

    const resultado = [];
    for (let i = inicio; i < fim; i++) {
        resultado.push(i);
    }

    return Promise.resolve(resultado);
}

/**
 * Dado um vetor e uma função de mapeamento, executa a função de mapeamento
 * passando como argumento cada elemento do vetor.
 * @param interpretador A instância do interpretador.
 * @param vetor O vetor
 * @param funcaoMapeamento A função de mapeamento.
 * @returns O resultado acumulado da execução da função de mapeamento.
 */
export async function mapear(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoMapeamento: VariavelInterface | any
): Promise<any[]> {
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.'
            )
        );

    const valorVetor = interpretador.resolverValor(vetor);
    const valorFuncaoMapeamento = interpretador.resolverValor(funcaoMapeamento);

    // TODO: As lógicas de validação abaixo deixam de fazer sentido com a validação de argumentos feita
    // na avaliação sintática. Estudar remoção.
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função mapear() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoMapeamento.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função mapear() deve ser uma função.'
            )
        );
    }

    const resultados = [];
    for (let indice = 0; indice < valorVetor.length; ++indice) {
        const informacoesRetorno = await valorFuncaoMapeamento.chamar(interpretador, [
            valorVetor[indice],
        ]);
        if (!informacoesRetorno.hasOwnProperty('valorRetornado')) {
            console.warn(
                `Retorno inconsistente em mapear(): ${JSON.stringify(informacoesRetorno)}.`
            );
            continue;
        }

        if (!(informacoesRetorno.valorRetornado instanceof RetornoQuebra)) {
            console.warn(
                `mapear() finalizado com valor retornado diferente do esperado: ${JSON.stringify(informacoesRetorno)}.`
            );
            continue;
        }

        resultados.push(informacoesRetorno.valorRetornado.valor);
    }

    return resultados;
}

/**
 * Converte um valor em um número, com parte decimal ou não.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} valorParaConverter O valor a ser convertido.
 * @returns {Promise<any>} Uma Promise com o resultado da conversão.
 */
export async function numero(
    interpretador: InterpretadorInterface,
    valorParaConverter: VariavelInterface | any
): Promise<any> {
    if (valorParaConverter === null || valorParaConverter === undefined) return Promise.resolve(0);

    const valor = valorParaConverter.hasOwnProperty('valor')
        ? valorParaConverter.valor
        : valorParaConverter;
    const resultadoValidacao = validacaoComumNumeros(interpretador, valor);

    return resultadoValidacao || Promise.resolve(Number(valor));
}

/**
 *
 * @param vetor
 * @returns
 */
export async function ordenar(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | Array<any>
): Promise<any[]> {
    if (vetor === null || vetor === undefined)
        throw new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função ordenar() não pode ser nulo.'
        );

    const objeto = vetor.hasOwnProperty('valor') ? (vetor as VariavelInterface).valor : vetor;

    if (!Array.isArray(objeto)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Valor inválido. Objeto inserido não é um vetor.'
            )
        );
    }

    let trocado: boolean;
    const tamanho = objeto.length;
    do {
        trocado = false;
        for (let i = 0; i < tamanho - 1; i++) {
            if (objeto[i] > objeto[i + 1]) {
                [objeto[i], objeto[i + 1]] = [objeto[i + 1], objeto[i]];
                trocado = true;
            }
        }
    } while (trocado);

    return Promise.resolve(objeto);
}

/**
 *
 * @param interpretador
 * @param vetor
 * @param funcaoFiltragem
 * @returns
 */
export async function paraCada(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoFiltragem: VariavelInterface | any
): Promise<any> {
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função paraCada() não pode ser nulo.'
            )
        );

    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
        ? funcaoFiltragem.valor
        : funcaoFiltragem;

    // TODO: As lógicas de validação abaixo deixam de fazer sentido com a validação de argumentos feita
    // na avaliação sintática. Estudar remoção.
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função paraCada() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoFiltragem.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função paraCada() deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]]);
    }
}

/**
 *
 * @param interpretador
 * @param vetor
 * @param funcaoFiltragem
 * @returns
 */
export async function primeiroEmCondicao(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoFiltragem: VariavelInterface | any
) {
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() não pode ser nulo.'
            )
        );

    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
        ? funcaoFiltragem.valor
        : funcaoFiltragem;
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoFiltragem.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função primeiroEmCondicao() deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        const valorResolvido = await valorFuncaoFiltragem.chamar(interpretador, [
            valorVetor[indice],
        ]);
        if (valorResolvido !== null) {
            return valorResolvido;
        }
    }

    return undefined;
}

/**
 *
 * @param interpretador
 * @param numero
 * @returns
 */
export async function real(
    interpretador: InterpretadorInterface,
    numero: VariavelInterface | any
): Promise<number> {
    if (numero === null || numero === undefined) return Promise.resolve(parseFloat('0'));

    const valor = numero.hasOwnProperty('valor') ? numero.valor : numero;
    if (!/^(-)?\d+(\.\d+)?$/.test(valor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Valor não parece estar estruturado como um número (texto/valor vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para real.'
            )
        );
    }

    return Promise.resolve(parseFloat(valor));
}

/**
 *
 * @param interpretador
 * @param vetor
 * @param funcaoReducao
 * @param valorInicial
 * @returns
 */
export async function reduzir(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoReducao: VariavelInterface | any,
    valorInicial: VariavelInterface | any = null
) {
    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorFuncaoReducao = funcaoReducao.hasOwnProperty('valor')
        ? funcaoReducao.valor
        : funcaoReducao;
    const valorPadrao = valorInicial.hasOwnProperty('valor') ? valorInicial.valor : valorInicial;

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoReducao.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
            )
        );
    }

    let resultado = valorPadrao;
    let inicio = 0;

    if (!resultado) {
        resultado = vetor[0];
        inicio = 1;
    }

    for (let index = inicio; index < vetor.length; ++index) {
        resultado = await valorFuncaoReducao.chamar(interpretador, [resultado, vetor[index]]);
    }

    return resultado;
}

/**
 *
 * @param objeto
 * @returns
 */
export async function tamanho(interpretador: InterpretadorInterface, objeto: any) {
    const valorObjeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;

    if (typeof valorObjeto === 'number') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Função global tamanho() não funciona com números.'
            )
        );
    }

    if (valorObjeto instanceof ObjetoDeleguaClasse) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Função global tamanho não funciona com objetos complexos.'
            )
        );
    }

    if (valorObjeto instanceof DeleguaFuncao) {
        return Promise.resolve(valorObjeto.declaracao.parametros.length);
    }

    if (valorObjeto instanceof FuncaoPadrao) {
        return Promise.resolve(valorObjeto.valorAridade);
    }

    if (valorObjeto instanceof DescritorTipoClasse) {
        const metodos = valorObjeto.metodos;
        let tamanho = 0;

        if (metodos.inicializacao && metodos.inicializacao.eInicializador) {
            tamanho = metodos.inicializacao.declaracao.parametros.length;
        }

        return Promise.resolve(tamanho);
    }

    return Promise.resolve(valorObjeto.length);
}

/**
 * Transforma o valor ou variável em texto.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} valorParaConverter O valor ou variável.
 * @returns {Promise<string>} O valor resolvido em texto.
 */
export async function texto(
    interpretador: InterpretadorInterface,
    valorParaConverter: VariavelInterface | any
): Promise<string> {
    return Promise.resolve(
        `${valorParaConverter.hasOwnProperty('valor') ? valorParaConverter.valor : valorParaConverter}`
    );
}

/**
 * Retorna verdadeiro se todos os elementos do primeiro parâmetro retornam verdadeiro ao
 * serem aplicados como argumentos da função passada como segundo parâmetro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor O primeiro parâmetro, um vetor.
 * @param {VariavelInterface | any} funcaoCondicional A função que será executada com cada
 *                                  valor do vetor passado como primeiro parâmetro.
 * @returns {Promise<boolean>} Verdadeiro, se todos os valores do vetor fazem a função passada
 *                             por parâmetro devolver verdadeiro, ou falso em caso contrário.
 */
export async function todosEmCondicao(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    funcaoCondicional: VariavelInterface | any
): Promise<boolean> {
    if (vetor === null || vetor === undefined)
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() não pode ser nulo.'
            )
        );

    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorFuncaoCondicional = funcaoCondicional.hasOwnProperty('valor')
        ? funcaoCondicional.valor
        : funcaoCondicional;
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoCondicional.constructor !== DeleguaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro da função todosEmCondicao() deve ser uma função.'
            )
        );
    }

    for (let indice = 0; indice < valorVetor.length; ++indice) {
        if (!(await valorFuncaoCondicional.chamar(interpretador, [valorVetor[indice]])))
            return false;
    }

    return true;
}

/**
 * Transforma um vetor de elementos em uma tupla de N elementos, sendo N a
 * largura do vetor.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any[]} vetor O vetor.
 * @returns A tupla resolvida.
 */
export async function tupla(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any[]
): Promise<Tupla> {
    const valorVetor: any[] =
        !Array.isArray(vetor) && vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

    // TODO: As lógicas de validação abaixo deixam de fazer sentido com a validação de argumentos feita
    // na avaliação sintática. Estudar remoção.
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Argumento de função nativa `tupla` não parece ser um vetor.'
            )
        );
    }

    switch (valorVetor.length) {
        case 2:
            return Promise.resolve(
                new Dupla(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                )
            );
        case 3:
            return Promise.resolve(new Trio(
                new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
            ));
        case 4:
            return Promise.resolve(
                new Quarteto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                )
            );
        case 5:
            return Promise.resolve(
                new Quinteto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                )
            );
        case 6:
            return Promise.resolve(
                new Sexteto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[5], inferirTipoVariavel(valorVetor[5]) as any),
                )
            );
        case 7:
            return Promise.resolve(
                new Septeto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[5], inferirTipoVariavel(valorVetor[5]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[6], inferirTipoVariavel(valorVetor[6]) as any),
                )
            );
        case 8:
            return Promise.resolve(
                new Octeto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[5], inferirTipoVariavel(valorVetor[5]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[6], inferirTipoVariavel(valorVetor[6]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[7], inferirTipoVariavel(valorVetor[7]) as any),
                )
            );
        case 9:
            return Promise.resolve(
                new Noneto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[5], inferirTipoVariavel(valorVetor[5]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[6], inferirTipoVariavel(valorVetor[6]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[7], inferirTipoVariavel(valorVetor[7]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[8], inferirTipoVariavel(valorVetor[8]) as any),
                )
            );
        case 10:
            return Promise.resolve(
                new Deceto(
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[0], inferirTipoVariavel(valorVetor[0]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[1], inferirTipoVariavel(valorVetor[1]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[2], inferirTipoVariavel(valorVetor[2]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[3], inferirTipoVariavel(valorVetor[3]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[4], inferirTipoVariavel(valorVetor[4]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[5], inferirTipoVariavel(valorVetor[5]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[6], inferirTipoVariavel(valorVetor[6]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[7], inferirTipoVariavel(valorVetor[7]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[8], inferirTipoVariavel(valorVetor[8]) as any),
                    new Literal(interpretador.hashArquivoDeclaracaoAtual, interpretador.linhaDeclaracaoAtual, valorVetor[9], inferirTipoVariavel(valorVetor[9]) as any),
                )
            );
        case 1:
        default:
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    {
                        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                        linha: interpretador.linhaDeclaracaoAtual,
                    } as SimboloInterface,
                    'Para ser transformado em uma tupla, vetor precisa ter de 2 a 10 elementos.'
                )
            );
    }
}
