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
    TuplaN
} from '../construtos';

import { RetornoQuebra } from '../quebras';
import { inferirTipoVariavel } from '../inferenciador';

const configTuplas: { [key: string]: { Classe: any, props: string[] } } = {
    'Dupla': { Classe: Dupla, props: ['primeiro', 'segundo'] },
    'Trio': { Classe: Trio, props: ['primeiro', 'segundo', 'terceiro'] },
    'Quarteto': { Classe: Quarteto, props: ['primeiro', 'segundo', 'terceiro', 'quarto'] },
    'Quinteto': { Classe: Quinteto, props: ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto'] },
    'Sexteto': { Classe: Sexteto, props: [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto'] },
    'Septeto': { Classe: Septeto, props: [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo' ] },
    'Octeto': { Classe: Octeto, props: [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo' ] },
    'Noneto': { Classe: Noneto, props: [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono' ] },
    'Deceto': { Classe: Deceto, props: [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono', 'decimo' ] },
};

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

const mapaPropriedadesTuplas: { [nomeClasse: string]: string[] } = {
    'Dupla': ['primeiro', 'segundo'],
    'Trio': ['primeiro', 'segundo', 'terceiro'],
    'Quarteto': ['primeiro', 'segundo', 'terceiro', 'quarto'],
    'Quinteto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto' ],
    'Sexteto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto' ],
    'Septeto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo' ],
    'Octeto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo' ],
    'Noneto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono' ],
    'Deceto': [ 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono', 'decimo' ],
};

/**
 * Compara dois valores (números ou vetores).
 * Retorna:
 * > 0 se a > b
 * < 0 se a < b
 * 0 se a == b
 * Lança erro se os tipos forem incompatíveis.
 */
function compararElementosRecursivamente(a: any, b: any): number {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        const tamanho = Math.min(a.length, b.length);

        for (let i = 0; i < tamanho; i++) {
            const comparacao = compararElementosRecursivamente(a[i], b[i]);
            if (comparacao !== 0) return comparacao;
        }

        return a.length - b.length;
    }

    // Tipos incompatíveis (ex: comparar número com vetor)
    throw new Error('Tipos incompatíveis para comparação.');
}

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
 * Arredonda um número para uma quantidade específica de casas decimais.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} numero O número a ser arredondado.
 * @param {any} casasDecimais A quantidade de casas decimais para o arredondamento.
 * @returns {Promise<number>} O número arredondado.
 */
export async function arredondar(
    interpretador: InterpretadorInterface,
    numero: any,
    casasDecimais: any
): Promise<number> {
    const valorNumero = interpretador.resolverValor(numero);
    const valorCasas = interpretador.resolverValor(casasDecimais);

    if (numero == undefined || numero == null) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                "Erro: arredondar() deve receber um número.",
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (typeof numero !== "number") {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Erro de Tipo: arredondar() espera um número, mas recebeu '${typeof valorNumero}'.`,
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    const fator = Math.pow(10, valorCasas);
    const resultado = Math.round(valorNumero * fator) / fator;

    return Promise.resolve(resultado);
};

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

        // Tuplas com 11 elementos ou mais
        if (valorAtual instanceof TuplaN) {
            const elementosClonados: any[] = [];
            visitados.set(valorAtual, elementosClonados);

            for (let i = 0; i < valorAtual.elementos.length; i++) {
                elementosClonados.push(clonarProfundo(valorAtual.elementos[i]));
            }

            return new TuplaN(
                valorAtual.hashArquivo,
                valorAtual.linha,
                elementosClonados
            );
        }

        // Tuplas com até 10 elementos
        const nomeClasseTupla = valorAtual.constructor?.name;
        if (nomeClasseTupla && configTuplas[nomeClasseTupla]) {
            const config = configTuplas[nomeClasseTupla];
            const argsClonados = [];

            visitados.set(valorAtual, argsClonados);

            for (const prop of config.props) {
                argsClonados.push(clonarProfundo(valorAtual[prop]));
            }

            return new config.Classe(...argsClonados);
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
 * Converte um valor em um número longo (BigInt).
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} valorParaConverter O valor a ser convertido.
 * @returns {Promise<any>} Uma Promise com o resultado da conversão para BigInt.
 */
export async function longo(
    interpretador: InterpretadorInterface,
    valorParaConverter: VariavelInterface | any
): Promise<any> {
    if (valorParaConverter === null || valorParaConverter === undefined) {
        return Promise.resolve(BigInt(0));
    }

    const valor = valorParaConverter.hasOwnProperty('valor')
        ? valorParaConverter.valor
        : valorParaConverter;

    // Se já é BigInt, retorna direto
    if (typeof valor === 'bigint') {
        return Promise.resolve(valor);
    }

    // Se é número, converte para BigInt (trunca decimais)
    if (typeof valor === 'number') {
        return Promise.resolve(BigInt(Math.floor(valor)));
    }

    // Para strings, remove parte decimal se presente
    const strValue = String(valor).trim();

    // Trata string vazia
    if (!strValue || strValue === '') {
        return Promise.resolve(BigInt(0));
    }

    // Remove parte decimal da string (ex: "3.14" -> "3")
    const integerPart = strValue.split('.')[0];

    try {
        return Promise.resolve(BigInt(integerPart));
    } catch (e) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                `Não foi possível converter '${valor}' para longo. O valor deve ser um número ou texto numérico.`
            )
        );
    }
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
                'Os dois parâmetros devem ser do tipo número ou inteiro.'
            )
        );
    }

    if (isNaN(inicio) || isNaN(fim)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Os dois parâmetros devem ser do tipo número ou inteiro.'
            )
        );
    }

    // Remove a parte decimal se houver
    const inicioInteiro = Math.floor(inicio);
    const fimInteiro = Math.floor(fim);

    const resultado = [];
    for (let i = inicioInteiro; i < fimInteiro; i++) {
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
 * Encontra o maior número dentro de um vetor.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript contendo números.
 * @returns {Promise<number>} O maior número encontrado no vetor.
 */
export async function maximo(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any
): Promise<number> {
    if (vetor === null || vetor === undefined) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função maximo() não pode ser nulo.'
            )
        );
    }

    const valorVetor = interpretador.resolverValor(vetor);

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função maximo() deve ser um vetor.'
            )
        );
    }

    if (vetor.length == 0) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O vetor não pode estar vazio.'
            )
        );
    }

    let maiorValor = valorVetor[0];

    try {
        for (let i = 1; i < valorVetor.length; i++) {
            const elementoAtual = valorVetor[i];
            if (compararElementosRecursivamente(elementoAtual, maiorValor) > 0) {
                maiorValor = elementoAtual;
            }
        }
    } catch (erro: any) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).'
            )
        );
    }

    return Promise.resolve(maiorValor);
}

/**
 * Encontra o menor número dentro de um vetor.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript contendo números.
 * @returns {Promise<number>} O menor número encontrado no vetor.
 */
export async function minimo(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any
): Promise<number> {
    if (vetor === null || vetor === undefined) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função minimo() não pode ser nulo.'
            )
        );
    }

    const valorVetor = interpretador.resolverValor(vetor);

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função minimo() deve ser um vetor.'
            )
        );
    }

    if (valorVetor.length == 0) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O vetor não pode estar vazio.'
            )
        );
    }

    let menorValor = valorVetor[0];

    try {
        for (let i = 1; i < valorVetor.length; i++) {
            const elementoAtual = valorVetor[i];
            if (compararElementosRecursivamente(elementoAtual, menorValor) < 0) {
                menorValor = elementoAtual;
            }
        }
    } catch (erro: any) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).'
            )
        );
    }

    return Promise.resolve(menorValor);
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
 * Realiza a soma de todos os números dentro de um vetor.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Pituguês ou um vetor nativo de JavaScript contendo números.
 * @returns {Promise<number>} A soma de todos os elementos do vetor.
 */
export async function somar(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any
): Promise<number> {
    if (vetor === null || vetor === undefined) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função somar() não pode ser nulo.'
            )
        );
    }

    const valorVetor = interpretador.resolverValor(vetor);

    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O parâmetro da função somar() deve ser um vetor.'
            )
        );
    }

    if (valorVetor.length === 0) return Promise.resolve(0);

    let somaDosElementos = 0;
    for (let elemento of valorVetor) {
        if (typeof elemento !== 'number' || isNaN(elemento)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    {
                        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                        linha: interpretador.linhaDeclaracaoAtual,
                    } as SimboloInterface,
                    'A função somar() aceita apenas vetores contendo números.'
                )
            );
        }

        somaDosElementos += elemento
    }

    return Promise.resolve(somaDosElementos);
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
): Promise<TuplaN> {
    const valorVetor: any[] = interpretador.resolverValor(vetor);

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

    const elementos = valorVetor.map(item =>
        new Literal(
            interpretador.hashArquivoDeclaracaoAtual,
            interpretador.linhaDeclaracaoAtual,
            interpretador.resolverValor(item)
        )
    );

    return new TuplaN(
        interpretador.hashArquivoDeclaracaoAtual,
        interpretador.linhaDeclaracaoAtual,
        elementos
    );
}

export async function vetor(
    interpretador: InterpretadorInterface,
    tupla: Tupla | TuplaN | any
): Promise<any[]> {
    const objetoTupla = interpretador.resolverValor(tupla);

    // TODO: As lógicas de validação abaixo deixam de fazer sentido com a validação de argumentos feita
    // na avaliação sintática. Estudar remoção.
    if (!(objetoTupla instanceof Tupla || objetoTupla instanceof TuplaN)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Argumento de função nativa `vetor` não parece ser uma tupla.'
            )
        );
    }

    let resultado: any[] = [];

    if (objetoTupla instanceof TuplaN) {
        resultado = objetoTupla.elementos;
    } else {
        const nomeClasse = objetoTupla.constructor.name;

        if (mapaPropriedadesTuplas.hasOwnProperty(nomeClasse)) {
            const props = mapaPropriedadesTuplas[nomeClasse];
            resultado = props.map(prop => (objetoTupla as any)[prop]);
        } else if ((objetoTupla as any).elementos && Array.isArray((objetoTupla as any).elementos)) {
            resultado = (objetoTupla as any).elementos;
        }
    }

    const resultadoFinal = resultado.map(item =>
        (item && item.hasOwnProperty('valor')) ? item.valor : item
    );

    return Promise.resolve(resultadoFinal);
}