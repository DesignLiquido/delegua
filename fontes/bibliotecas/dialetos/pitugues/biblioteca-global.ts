import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { ObjetoDeleguaClasse } from '../../../interpretador/estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../../../interpretador/estruturas/funcao-padrao';
import { DescritorTipoClasse } from '../../../interpretador/estruturas/descritor-tipo-classe';
import { SimboloInterface, VariavelInterface } from '../../../interfaces';
import { InterpretadorInterface } from '../../../interfaces';
import { DeleguaFuncao } from '../../../interpretador/estruturas';
import { TuplaN, Literal } from '../../../construtos';
import { RetornoQuebra } from '../../../quebras';

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
 * Retorna um número aleatório.
 * - Sem argumentos: retorna um número real entre 0 (inclusivo) e 1 (exclusivo).
 * - Com um argumento: retorna um número real entre 0 (inclusivo) e `maximo` (exclusivo).
 * - Com dois argumentos: retorna um número real entre `minimo` (inclusivo) e `maximo` (exclusivo).
 * @param {number} [minimo] O número mínimo (inclusivo), ou o máximo quando único argumento.
 * @param {number} [maximo] O número máximo (exclusivo).
 * @returns {Promise<number>} O número real aleatório gerado.
 */
export async function aleatorio(
    interpretador: InterpretadorInterface,
    ...argumentos: any[]
): Promise<number> {
    const simboloAtual = {
        linha: interpretador.linhaDeclaracaoAtual,
        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
    } as SimboloInterface;

    const argumentosUsuario = argumentos.filter(
        (arg) => !(
            arg &&
            typeof arg === 'object' &&
            'lexema' in arg &&
            'linha' in arg
        )
    );

    if (argumentosUsuario.length === 0) return Math.random();

    if (argumentosUsuario.length > 2) {
        throw new ErroEmTempoDeExecucao(
            simboloAtual,
            'A função aceita no máximo 2 parâmetros.'
        );
    }

    const minimo = interpretador.resolverValor(argumentosUsuario[0]);
    if (typeof minimo !== 'number') {
        throw new ErroEmTempoDeExecucao(
            simboloAtual,
            'O primeiro parâmetro deve ser um número.'
        );
    }

    if (argumentosUsuario.length === 1) return Math.random() * minimo;

    const maximo = interpretador.resolverValor(argumentosUsuario[1]);
    if (typeof maximo !== 'number') {
        throw new ErroEmTempoDeExecucao(
            simboloAtual,
            'O segundo parâmetro deve ser um número.'
        );
    }

    return Math.random() * (maximo - minimo) + minimo;
}

/**
 * Verifica se algum dos elementos satisfaz a condição passada por parâmetro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel Um iterável.
 * @param {any} funcaoPesquisa A função que ensina o método de pesquisa.
 * @returns {Promise<boolean>} Verdadeiro se há algum elemento no iterável com a condição. Falso caso contrário.
 */
export async function algum(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<boolean> {
    const simboloAtual = {
        linha: interpretador.linhaDeclaracaoAtual,
        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
    } as SimboloInterface;

    const valorIteravel = interpretador.resolverValor(iteravel);
    const ehIteravel = typeof valorIteravel?.[Symbol.iterator] === 'function';
    const ehObjetoOuDicionario = typeof valorIteravel === 'object' &&
        valorIteravel !== null;

    let itens: Iterable<any>;

    if (valorIteravel && ehIteravel) {
        itens = valorIteravel;
    } else if (valorIteravel && ehObjetoOuDicionario) {
        itens = Object.values(valorIteravel);
    } else {
        throw new ErroEmTempoDeExecucao(
            simboloAtual,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = funcaoPesquisa?.valor ?? funcaoPesquisa;

    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            simboloAtual,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (const item of itens) {
        if (await valorFuncao.chamar(interpretador, item, simboloAtual)) {
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
                'Erro: arredondar() deve receber um número.',
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (typeof numero !== 'number') {
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
export async function encontrar_indice(
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
export async function encontrar_ultimo(
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
export async function encontrar_ultimo_indice(
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
export async function filtrar_por(
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

function validacao_comum_numeros(
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
    const resultadoValidacao = validacao_comum_numeros(interpretador, valor);

    return resultadoValidacao || Promise.resolve(parseInt(valor));
}

/**
 * Cria um vetor com números inteiros no intervalo especificado.
 * O valor inicial é inclusivo e o valor final é exclusivo.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | number} valorInicial O valor inicial (inclusivo).
 * @param {VariavelInterface | number} valorFinal O valor final (exclusivo).
 * @param {VariavelInterface | number} valorPasso O valor do passo.
 * @returns {Promise<number[]>} Um vetor com os números no intervalo.
 */
export async function intervalo(
    interpretador: InterpretadorInterface,
    valorInicial: VariavelInterface | number,
    valorFinal?: VariavelInterface | number,
    valorPasso?: VariavelInterface | number
): Promise<number[]> {
    const primeiroParam = interpretador.resolverValor(valorInicial);
    const segundoParam = interpretador.resolverValor(valorFinal);
    const terceiroParam = interpretador.resolverValor(valorPasso);

    let inicioInteiro: number;
    let fimInteiro: number;
    let passoInteiro: number = 1;

    // intervalo(parada) - apenas um parâmetro
    if (segundoParam === undefined || segundoParam === null) {
        if (typeof primeiroParam !== 'number' || isNaN(primeiroParam)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    {
                        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                        linha: interpretador.linhaDeclaracaoAtual,
                    } as SimboloInterface,
                    'O parâmetro deve ser do tipo número ou inteiro.'
                )
            );
        }

        inicioInteiro = 0;
        fimInteiro = Math.floor(primeiroParam);
    }
    // intervalo(inicio, parada) ou intervalo(inicio, parada, passo)
    else {
        if (
            typeof primeiroParam !== 'number' ||
            isNaN(primeiroParam) ||
            typeof segundoParam !== 'number' ||
            isNaN(segundoParam)
        ) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    {
                        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                        linha: interpretador.linhaDeclaracaoAtual,
                    } as SimboloInterface,
                    'Os parâmetros de início e fim devem ser do tipo número ou inteiro.'
                )
            );
        }

        inicioInteiro = Math.floor(primeiroParam);
        fimInteiro = Math.floor(segundoParam);

        // Se há um terceiro parâmetro (passo)
        if (terceiroParam !== undefined && terceiroParam !== null) {
            if (typeof terceiroParam !== 'number' || isNaN(terceiroParam)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        {
                            hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                            linha: interpretador.linhaDeclaracaoAtual,
                        } as SimboloInterface,
                        'O parâmetro de passo deve ser do tipo número ou inteiro.'
                    )
                );
            }

            passoInteiro = Math.floor(terceiroParam);
            if (passoInteiro === 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        {
                            hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                            linha: interpretador.linhaDeclaracaoAtual,
                        } as SimboloInterface,
                        'O passo não pode ser zero.'
                    )
                );
            }
        }
    }

    const resultado = [];

    if (passoInteiro > 0) {
        for (let i = inicioInteiro; i < fimInteiro; i += passoInteiro) {
            resultado.push(i);
        }
    } else {
        // Parâmetro passo sendo um número negativo
        for (let i = inicioInteiro; i > fimInteiro; i += passoInteiro) {
            resultado.push(i);
        }
    }

    return Promise.resolve(resultado);
}

/**
 * Dado um vetor e, opcionalmente, um valor de início, retorna um vetor de dicionários,
 * onde cada dicionário contém o índice e o valor correspondente do vetor original.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} vetor Uma variável de Delégua ou um vetor nativo de JavaScript.
 * @param {number | undefined} inicio O valor de início (opcional).
 * @returns {Promise<any[]>} Um vetor de dicionários com índice e valor.
 */
export async function enumerar(
    interpretador: InterpretadorInterface,
    vetor: VariavelInterface | any,
    inicio?: number | undefined
): Promise<any[]> {
    if (vetor === null || vetor === undefined) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro da função enumerar() não pode ser nulo.'
            )
        );
    }
    if (inicio !== undefined && (typeof inicio !== 'number' || isNaN(inicio))) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'O parâmetro de início deve ser do tipo número ou inteiro.'
            )
        );
    }

    const valorVetor = interpretador.resolverValor(vetor);
    const inicioInteiro = typeof inicio === 'number' && !isNaN(inicio) ? Math.floor(inicio) : 0;

    const resultados = [];
    for (let i = inicioInteiro; i < valorVetor.length; ++i) {
        resultados.push({ indice: i, valor: valorVetor[i] });
    }

    return Promise.resolve(resultados);
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
 * @param {VariavelInterface | any} vetor Uma variável de Pituguês ou um vetor nativo de JavaScript contendo números.
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
 * @param {VariavelInterface | any} vetor Uma variável de Pituguês ou um vetor nativo de JavaScript contendo números.
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
    const resultadoValidacao = validacao_comum_numeros(interpretador, valor);

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
export async function para_cada(
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

    const valorVetor = interpretador.resolverValor(vetor);
    const valorFuncaoFiltragem = interpretador.resolverValor(funcaoFiltragem);

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
export async function primeiro_em_condicao(
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

    const valorVetor = interpretador.resolverValor(vetor);
    const valorFuncaoFiltragem = interpretador.resolverValor(funcaoFiltragem);
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

    if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
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
    const valorPadrao =
        valorInicial && valorInicial.hasOwnProperty && valorInicial.hasOwnProperty('valor')
            ? valorInicial.valor
            : valorInicial;

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

    if (valorFuncaoReducao.constructor.name !== 'DeleguaFuncao') {
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

    // Se não houver valor inicial e vetor vazio, não é possível reduzir
    if (
        (valorPadrao === null || valorPadrao === undefined) &&
        (!Array.isArray(valorVetor) || valorVetor.length === 0)
    ) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Não é possível reduzir um vetor vazio sem valor inicial.'
            )
        );
    }

    let resultado = valorPadrao;
    let inicio = 0;

    if (resultado === null || resultado === undefined) {
        resultado = valorVetor[0];
        inicio = 1;
    }

    for (let index = inicio; index < valorVetor.length; ++index) {
        resultado = await valorFuncaoReducao.chamar(interpretador, [resultado, valorVetor[index]]);
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

        somaDosElementos += elemento;
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

        const metodoInicializacao = metodos.inicializacao;
        if (
            metodoInicializacao &&
            !Array.isArray(metodoInicializacao) &&
            metodoInicializacao.eInicializador
        ) {
            tamanho = metodoInicializacao.declaracao.parametros.length;
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
 * Retorna verdadeiro se todos os elementos do iterável forem truly.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} iteravel O primeiro parâmetro, qualquer dado que seja iterável (vetores, tuplas, dicionários etc.).
 * @returns {Promise<boolean>} Verdadeiro, se todos os valores do iterável forem Truly.
 */
export async function todos(
    interpretador: InterpretadorInterface,
    iteravel: VariavelInterface | any
): Promise<boolean> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const ehObjetoOuDicionario =
        valorIteravel && typeof valorIteravel === 'object' && !Array.isArray(valorIteravel);
    const ehIteravelNativo = valorIteravel && typeof valorIteravel[Symbol.iterator] === 'function';

    if (!ehIteravelNativo && !ehObjetoOuDicionario) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
            )
        );
    }

    const itens = ehIteravelNativo ? valorIteravel : Object.values(valorIteravel);

    for (const valor of itens) {
        const valorResolvido = interpretador.resolverValor(valor);
        if (!interpretador.eVerdadeiro(valorResolvido)) return false;
    }

    return true;
}

/**
 * Retorna verdadeiro se todos os elementos do primeiro parâmetro retornam verdadeiro ao
 * serem aplicados como argumentos da função passada como segundo parâmetro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | any} iteravel O primeiro parâmetro, qualquer dado que seja iterável (vetores, tuplas, dicionários etc.).
 * @param {VariavelInterface | any} funcaoCondicional A função que será executada com cada
 *                                  valor do vetor passado como primeiro parâmetro.
 * @returns {Promise<boolean>} Verdadeiro, se todos os valores do iterável fazem a função passada
 *                             por parâmetro devolver verdadeiro, ou falso em caso contrário.
 */
export async function todos_em_condicao(
    interpretador: InterpretadorInterface,
    iteravel: VariavelInterface | any,
    funcaoCondicional: VariavelInterface | any
): Promise<boolean> {
    const simboloChamada = {
        linha: interpretador.linhaDeclaracaoAtual,
        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
    } as SimboloInterface;

    const valorIteravel = interpretador.resolverValor(iteravel);

    const ehObjetoOuDicionario =
        valorIteravel && typeof valorIteravel === 'object' && !Array.isArray(valorIteravel);
    const ehIteravelNativo = valorIteravel && typeof valorIteravel[Symbol.iterator] === 'function';

    if (!ehIteravelNativo && !ehObjetoOuDicionario) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
            )
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoCondicional);
    const naoEhUmaFuncao = !(
        valorFuncao instanceof DeleguaFuncao || valorFuncao instanceof FuncaoPadrao
    );

    if (!valorFuncao || naoEhUmaFuncao) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                    linha: interpretador.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
            )
        );
    }

    const itens = ehIteravelNativo ? valorIteravel : Object.values(valorIteravel);

    for (const valor of itens) {
        const resultadoChamada = await valorFuncao.chamar(interpretador, [valor], simboloChamada);
        const resultadoResolvido = interpretador.resolverValor(resultadoChamada);

        if (!interpretador.eVerdadeiro(resultadoResolvido)) return false;
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

    const elementos = valorVetor.map((item) => {
        const valorResolvido = interpretador.resolverValor(item);

        const literal = new Literal(
            interpretador.hashArquivoDeclaracaoAtual,
            interpretador.linhaDeclaracaoAtual,
            valorResolvido
        );

        if (typeof valorResolvido === 'string') {
            literal.paraTextoSaida = () => `'${valorResolvido}'`;
        }

        return literal;
    });

    return new TuplaN(
        interpretador.hashArquivoDeclaracaoAtual,
        interpretador.linhaDeclaracaoAtual,
        elementos
    );
}

export async function vetor(
    interpretador: InterpretadorInterface,
    tupla: TuplaN | any
): Promise<any[]> {
    const objetoTupla = interpretador.resolverValor(tupla);

    if (!(objetoTupla instanceof TuplaN)) {
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

    const resultado = objetoTupla.elementos.map((elemento: any) =>
        interpretador.resolverValor(elemento)
    );

    return Promise.resolve(resultado);
}
