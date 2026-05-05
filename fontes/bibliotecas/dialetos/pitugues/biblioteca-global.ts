import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { ObjetoDeleguaClasse } from '../../../interpretador/estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../../../interpretador/estruturas/funcao-padrao';
import { DescritorTipoClasse } from '../../../interpretador/estruturas/descritor-tipo-classe';
import { SimboloInterface, VariavelInterface } from '../../../interfaces';
import { InterpretadorInterface } from '../../../interfaces';
import { DeleguaFuncao } from '../../../interpretador/estruturas';
import { TuplaN, Literal, Vetor } from '../../../construtos';
import { RetornoQuebra } from '../../../quebras';
import { Iteravel } from '../../../interpretador/estruturas/iteravel';

/**
 * Compara dois valores (números, textos, booleanos ou vetores).
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

    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return (a === b) ? 0 : (a ? 1 : -1);
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        const tamanho = Math.min(a.length, b.length);

        for (let i = 0; i < tamanho; i++) {
            const comparacao = compararElementosRecursivamente(a[i], b[i]);
            if (comparacao !== 0) return comparacao;
        }

        return a.length - b.length;
    }

    // Tipos incompatíveis
    throw new Error('Tipos incompatíveis para comparação.');
}

function validacao_comum_numeros(
    interpretador: InterpretadorInterface,
    valorParaConverter: any,
    nomeDaFuncao: string
): void {
    const numeroConvertido = Number(valorParaConverter);

    if (
        valorParaConverter === '' ||
        valorParaConverter === null ||
        valorParaConverter === undefined ||
        typeof valorParaConverter === 'boolean' ||
        Number.isNaN(numeroConvertido)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            `Valor não parece estar estruturado como um número válido. Somente números ou textos com números podem ser convertidos na função ${nomeDaFuncao}().`
        );
    }
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
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'A função aceita no máximo 2 parâmetros.'
        );
    }

    const minimo = interpretador.resolverValor(argumentosUsuario[0]);
    if (typeof minimo !== 'number') {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'O primeiro parâmetro deve ser um número.'
        );
    }

    if (argumentosUsuario.length === 1) return Math.random() * minimo;

    const maximo = interpretador.resolverValor(argumentosUsuario[1]);
    if (typeof maximo !== 'number') {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
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
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (const item of itens) {
        if (await valorFuncao.chamar(
            interpretador,
            item,
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface)
        ) {
            return true;
        }
    }

    return false;
}

export async function combinar(
    interpretador: InterpretadorInterface,
    primeiroIteravel: any,
    segundoIteravel: any
): Promise<any[]> {
    const resolverEValidar = (iteravel: any, nomeParametro: string) => {
        const valor = interpretador.resolverValor(iteravel);
        const itens = new Iteravel(valor).elementos;

        if (
            itens.length === 0 &&
            valor !== '' &&
            !(valor instanceof TuplaN) &&
            !Array.isArray(valor)
        ) {
            throw new ErroEmTempoDeExecucao(
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface,
                `Parâmetro inválido. O ${nomeParametro} parâmetro deve ser um iterável.`
            );
        }

        return itens;
    };

    const itensPrimeiroIteravel = resolverEValidar(
        primeiroIteravel,
        'primeiro'
    );
    const itensSegundoIteravel = resolverEValidar(
        segundoIteravel,
        'segundo'
    );
    const resultado = [];
    const tamanhoMinimo = Math.min(
        itensPrimeiroIteravel.length,
        itensSegundoIteravel.length
    );

    for (let i = 0; i < tamanhoMinimo; i++) {
        resultado.push(new TuplaN(
            interpretador.hashArquivoDeclaracaoAtual,
            interpretador.linhaDeclaracaoAtual,
            [
                new Literal(
                    interpretador.hashArquivoDeclaracaoAtual,
                    interpretador.linhaDeclaracaoAtual,
                    itensPrimeiroIteravel[i],
                    typeof itensPrimeiroIteravel[i] === 'string' ? 'texto' : 'qualquer',
                ),
                new Literal(
                    interpretador.hashArquivoDeclaracaoAtual,
                    interpretador.linhaDeclaracaoAtual,
                    itensSegundoIteravel[i],
                    typeof itensSegundoIteravel[i] === 'string' ? 'texto' : 'qualquer',
                )
            ]
        ));
    }

    return resultado;
};

export async function contar(
    interpretador: InterpretadorInterface,
    iteravel: any,
    elemento: any
): Promise<number> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !(valorIteravel instanceof TuplaN) &&
        !Array.isArray(valorIteravel)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const elementoResolvido = interpretador.resolverValor(elemento);

    return itens.filter(item => item === elementoResolvido).length;
};

/**
 * Retorna o primeiro elemento de um iterável que satisfaça a condição definida na função de pesquisa.
 * A execução é interrompida assim que o elemento for encontrado.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoPesquisa A função que define a condição de busca.
 * @returns {Promise<any>} O primeiro elemento encontrado, ou nulo caso nenhum elemento satisfaça a condição.
 */
export async function encontrar(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<any> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (const item of itens) {
        if (
            await valorFuncao.chamar(
                interpretador,
                item,
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface
            )
        ) {
            return item;
        }
    }

    return null;
}

/**
 * Retorna o índice do primeiro elemento de um iterável que satisfaça a condição definida na função de pesquisa.
 * A execução é interrompida assim que o elemento for encontrado.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoPesquisa A função que define a condição de busca.
 * @returns {Promise<number>} O índice do primeiro elemento encontrado, ou -1 caso nenhum elemento satisfaça a condição.
 */
export async function encontrar_indice(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<number> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (let i = 0; i < itens.length; i++) {
        if (
            await valorFuncao.chamar(
                interpretador,
                itens[i],
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface
            )
        ) {
            return i;
        }
    }

    return -1;
}

/**
 * Retorna o último elemento de um iterável que satisfaça a condição definida na função de pesquisa.
 * A execução é interrompida assim que o elemento for encontrado.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoPesquisa A função que define a condição de busca.
 * @returns {Promise<any>} O último elemento encontrado, ou nulo caso nenhum elemento satisfaça a condição.
 */
export async function encontrar_ultimo(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<any> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (let i = itens.length - 1; i >= 0; i--) {
        if (
            await valorFuncao.chamar(
                interpretador,
                [itens[i]],
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface
            )
        ) {
            return itens[i];
        }
    }

    return null;
}

/**
 * Retorna o índice do último elemento de um iterável que satisfaça a condição definida na função de pesquisa.
 * A execução é interrompida assim que o elemento for encontrado.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoPesquisa A função que define a condição de busca.
 * @returns {Promise<number>} O índice do último elemento encontrado, ou -1 caso nenhum elemento satisfaça a condição.
 */
export async function encontrar_ultimo_indice(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<number> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    for (let i = itens.length - 1; i >= 0; i--) {
        if (
            await valorFuncao.chamar(
                interpretador,
                itens[i],
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface
            )
        ) {
            return i;
        }
    }

    return -1;
}

/**
 * Retorna os elementos que satisfazem a condição definida na função de pesquisa.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoPesquisa A função que define a condição de busca.
 * @returns {Promise<any[]>} Os elementos que satisfazem a função de pesquisa.
 */
export async function filtrar_por(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoPesquisa: any
): Promise<any[]> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoPesquisa);
    if (
        !(valorFuncao instanceof DeleguaFuncao) &&
        !(valorFuncao instanceof FuncaoPadrao)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
        )
    }

    const resultados = [];

    for (const item of itens) {
        const retornoFuncao = await valorFuncao.chamar(
            interpretador,
            item,
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface
        );

        if (retornoFuncao === null || retornoFuncao === undefined) continue;

        const passouPeloFiltro = retornoFuncao.valorRetornado.valor;
        if (passouPeloFiltro === false) continue;

        resultados.push(item);
    }

    return resultados;
}

/**
 * Verifica se um valor específico está incluído dentro de um iterável.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} valor O valor a ser buscado.
 * @returns {Promise<boolean>} verdadeiro se o valor for encontrado, falso caso contrário.
 */
export async function incluido(
    interpretador: InterpretadorInterface,
    iteravel: any,
    valor: any
): Promise<boolean> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorResolvido = interpretador.resolverValor(valor);

    for (const item of itens) {
        if (item == valorResolvido) return true;
    }

    return false;
}

/**
 * Converte um valor em um número inteiro.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} valor O valor a ser convertido.
 * @returns {Promise<number>} o resultado da conversão.
 */
export async function inteiro(
    interpretador: InterpretadorInterface,
    valor: any
): Promise<number> {
    const valorResolvido = interpretador.resolverValor(valor)

    validacao_comum_numeros(interpretador, valorResolvido, 'inteiro');

    return parseInt(String(valorResolvido), 10);
}

/**
 * Cria um vetor com números inteiros no intervalo especificado.
 * O valor inicial é inclusivo e o valor final é exclusivo.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {VariavelInterface | number} valorInicial O valor inicial (inclusivo) ou o limite final se for o único parâmetro.
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
    const validarEConverter = (
        valorBruto: any,
        mensagemErro: string
    ): number | undefined => {
        if (valorBruto === undefined || valorBruto === null) return undefined;

        const valorResolvido = interpretador.resolverValor(valorBruto);
        if (
            typeof valorResolvido !== 'number' ||
            Number.isNaN(valorResolvido)
        ) {
            throw new ErroEmTempoDeExecucao(
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface,
                mensagemErro
            );
        }

        return Math.floor(valorResolvido);
    }

    let inicio = validarEConverter(
        valorInicial,
        'O parâmetro de início deve ser do tipo número ou inteiro.'
    ) as number;
    let fim = validarEConverter(
        valorFinal,
        'O parâmetro de fim deve ser do tipo número ou inteiro.'
    );
    const passo = validarEConverter(
        valorPasso,
        'O parâmetro de passo deve ser do tipo número ou inteiro.'
    ) ?? 1;

    if (passo === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'O passo não pode ser zero.'
        );
    }

    if (fim === undefined) {
        fim = inicio;
        inicio = 0;
    }

    const resultado: number[] = [];

    if (passo > 0) {
        for (let i = inicio; i < fim; i += passo) {
            resultado.push(i);
        }
    } else {
        // Passo negativo
        for (let i = inicio; i > fim; i += passo) {
            resultado.push(i);
        }
    }

    return resultado;
}

export async function inverter(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<any> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !(valorIteravel instanceof TuplaN) &&
        !Array.isArray(valorIteravel)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const itensInvertidos = [...itens].reverse();

    if (iteravel instanceof TuplaN) {
        return new TuplaN(
            interpretador.hashArquivoDeclaracaoAtual,
            interpretador.linhaDeclaracaoAtual,
            itensInvertidos
        );
    }

    if (typeof valorIteravel === 'string') {
        return itensInvertidos.join('');
    }

    return itensInvertidos;
};

/**
 * Dado um vetor e, opcionalmente, um valor de início, retorna um vetor de dicionários,
 * onde cada dicionário contém o índice e o valor correspondente do vetor original.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel Um iterável.
 * @param {any} [inicio] O valor inicial do contador de índices (opcional, padrão 0).
 * @returns {Promise<any[]>} Um vetor de dicionários com índice e valor.
 */
export async function enumerar(
    interpretador: InterpretadorInterface,
    iteravel: any,
    inicio?: any
): Promise<any[]> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função enumerar() não pode ser nulo.'
        );
    }

    const valorInicioResolvido = interpretador.resolverValor(inicio);
    if (
        valorInicioResolvido !== undefined &&
        (typeof valorInicioResolvido !== 'number' || Number.isNaN(valorInicioResolvido))
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'O parâmetro de início deve ser do tipo número ou inteiro.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const inicioInteiro = typeof valorInicioResolvido === 'number'
        ? Math.floor(valorInicioResolvido)
        : 0;
    const resultados = [];

    for (let i = 0; i < itens.length; i++) {
        const valorResolvido = interpretador.resolverValor(itens[i]);

        resultados.push({
            indice: i + inicioInteiro,
            valor: valorResolvido
        });
    }

    return resultados;
}

/**
 * Dado um iterável e uma função de mapeamento, executa a função de mapeamento
 * passando como argumento cada elemento do iterável.
 * @param interpretador A instância do interpretador.
 * @param iteravel O iteravel a ser mapeado.
 * @param funcaoMapeamento A função de mapeamento.
 * @returns {Promise<any[]>} O resultado acumulado em forma de vetor.
 */
export async function mapear(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoMapeamento: any
): Promise<any[]> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoMapeamento);
    const ehUmaFuncao = valorFuncao instanceof DeleguaFuncao ||
        valorFuncao instanceof FuncaoPadrao;

    if (!valorFuncao || !ehUmaFuncao) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro da função mapear() deve ser uma função.'
        );
    }

    const resultados = [];

    for (const item of itens) {
        const retornoFuncao = await valorFuncao.chamar(
            interpretador,
            [item],
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface
        );

        if (retornoFuncao !== null && retornoFuncao !== undefined) {
            if (retornoFuncao.hasOwnProperty('valorRetornado')) {
                if (retornoFuncao.valorRetornado instanceof RetornoQuebra) {
                    resultados.push(retornoFuncao.valorRetornado.valor);
                }
            } else if (retornoFuncao instanceof RetornoQuebra) {
                resultados.push(retornoFuncao.valor);
            }
        }
    }

    return resultados;
}

/**
 * Encontra o maior número dentro de um iterável.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser inspecionado.
 * @returns {Promise<any>} O maior elemento encontrado.
 */
export async function maximo(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<number> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O parâmetro da função maximo() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. A função maximo() espera um iterável.'
        );
    }

    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O iterável não pode estar vazio.'
        );
    }

    let maiorValor = interpretador.resolverValor(itens[0]);

    try {
        for (const item of itens) {
            const itemResolvido = interpretador.resolverValor(item);

            if (compararElementosRecursivamente(itemResolvido, maiorValor) > 0) {
                maiorValor = itemResolvido;
            }
        }
    } catch (erro: any) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Não é possível comparar elementos de tipos incompatíveis dentro do iterável.'
        );
    }

    return maiorValor;
}

/**
 * Encontra o menor número dentro de um iterável.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser inspecionado.
 * @returns {Promise<any>} O menor elemento encontrado.
 */
export async function minimo(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<any> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O parâmetro da função minimo() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. A função minimo() espera um iterável.'
        );
    }

    if (itens.length === 0) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O iterável não pode estar vazio.'
        );
    }

    let menorValor = interpretador.resolverValor(itens[0]);

    try {
        for (const item of itens) {
            const itemResolvido = interpretador.resolverValor(item);

            if (compararElementosRecursivamente(itemResolvido, menorValor) < 0) {
                menorValor = itemResolvido;
            }
        }
    } catch (erro: any) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Não é possível comparar elementos de tipos incompatíveis dentro do iterável.'
        );
    }

    return menorValor;
}

/**
 * Ordena os elementos de um iterável
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser ordenado.
 * @returns {Promise<any[]>} Um novo vetor com os elementos ordenados.
 */
export async function ordenar(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<any[]> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função ordenar() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. A função ordenar() espera um iterável.'
        );
    }

    const itensParaOrdenar = [...itens];

    try {
        itensParaOrdenar.sort((a, b) => {
            const valorA = interpretador.resolverValor(a);
            const valorB = interpretador.resolverValor(b);

            if (typeof valorA === 'string' && typeof valorB === 'string') {
                return valorA.localeCompare(valorB);
            }

            return compararElementosRecursivamente(valorA, valorB);
        });
    } catch (erro) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Não é possível ordenar um iterável que contenha elementos de tipos incompatíveis.'
        );
    }

    return itensParaOrdenar;
}

/**
 * Executa uma função para cada elemento do iterável.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser percorrido.
 * @param {any} funcaoExecucao A função que será chamada para cada elemento.
 * @returns {Promise<void>}
 */
export async function para_cada(
    interpretador: InterpretadorInterface,
    iteravel: VariavelInterface | any,
    funcaoExecucao: VariavelInterface | any
): Promise<void> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função para_cada() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoExecucao);
    const ehUmaFuncao = valorFuncao instanceof DeleguaFuncao ||
        valorFuncao instanceof FuncaoPadrao;

    if (!valorFuncao || !ehUmaFuncao) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro da função para_cada() deve ser uma função.'
        );
    }

    for (const item of itens) {
        await valorFuncao.chamar(
            interpretador,
            [item],
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface
        );
    }
}

/**
 * Converte um valor em um número real (ponto flutuante).
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} valor O valor a ser convertido.
 * @returns {Promise<number>} O resultado da conversão.
 */
export async function real(
    interpretador: InterpretadorInterface,
    valor: any
): Promise<number> {
    const valorResolvido = interpretador.resolverValor(valor);

    validacao_comum_numeros(interpretador, valorResolvido, 'real');

    return parseFloat(String(valorResolvido));
}

/**
 * Reduz um iterável a um único valor, executando uma função acumuladora em cada elemento.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser reduzido.
 * @param {any} funcaoReducao A função que será chamada (acumulador, valorAtual).
 * @param {any} [valorInicial=null] O valor inicial do acumulador.
 * @returns {Promise<any>} O resultado acumulado.
 */
export async function reduzir(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoReducao: any,
    valorInicial: any = null
): Promise<any> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const valorFuncaoReducao = interpretador.resolverValor(funcaoReducao);
    const valorPadrao = interpretador.resolverValor(valorInicial);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro da função deve ser um iterável.'
        );
    }

    const ehUmaFuncao =
        valorFuncaoReducao instanceof DeleguaFuncao ||
        valorFuncaoReducao instanceof FuncaoPadrao ||
        typeof valorFuncaoReducao?.chamar === 'function';

    if (!valorFuncaoReducao || !ehUmaFuncao) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
        );
    }

    if (
        (valorPadrao === null || valorPadrao === undefined) &&
        itens.length === 0
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Não é possível reduzir um iterável vazio sem valor inicial.'
        );
    }

    let resultado = valorPadrao;
    let inicio = 0;

    if (resultado === null || resultado === undefined) {
        resultado = interpretador.resolverValor(itens[0]);
        inicio = 1;
    }

    for (let i = inicio; i < itens.length; i++) {
        const elementoAtual = interpretador.resolverValor(itens[i]);

        const resultadoFuncao = await valorFuncaoReducao.chamar(
            interpretador,
            [resultado, elementoAtual],
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface
        );

        resultado = interpretador.resolverValor(resultadoFuncao);
    }

    return resultado;
}

/**
 * Realiza a soma de todos os números dentro de um iterável.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável contendo os números.
 * @returns {Promise<number>} A soma de todos os elementos.
 */
export async function somar(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<number> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O parâmetro da função somar() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;
    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel instanceof TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O parâmetro da função somar() deve ser um iterável.'
        );
    }

    if (itens.length === 0) return 0;

    let somaDosElementos = 0;

    for (const item of itens) {
        const itemResolvido = interpretador.resolverValor(item);

        if (typeof itemResolvido !== 'number' || Number.isNaN(itemResolvido)) {
            throw new ErroEmTempoDeExecucao(
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface,
                'A função somar() aceita apenas iteráveis contendo números.'
            );
        }

        somaDosElementos += itemResolvido;
    }

    return somaDosElementos;
}

/**
 * Retorna o tamanho do objeto, vetor, texto ou número de parâmetros de uma função/classe.
 * * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} valor O valor a ser inspecionado.
 * @returns {Promise<number>} O tamanho.
 */
export async function tamanho(
    interpretador: InterpretadorInterface,
    valor: any
): Promise<number> {
    const valorResolvido = interpretador.resolverValor(valor);

    if (valorResolvido === null || valorResolvido === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Não é possível obter o tamanho de um valor nulo ou não definido.'
        );
    }

    if (
        typeof valorResolvido === 'number' ||
        typeof valorResolvido === 'boolean'
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            `A função global tamanho() não funciona com ${typeof valorResolvido === 'number' ? 'números' : 'booleanos'}.`
        );
    }

    if (valorResolvido instanceof ObjetoDeleguaClasse) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'A função global tamanho() não funciona com objetos complexos instanciados.'
        );
    }

    if (valorResolvido instanceof DeleguaFuncao) {
        return valorResolvido.declaracao.parametros.length;
    }

    if (valorResolvido instanceof FuncaoPadrao) {
        return valorResolvido.valorAridade;
    }

    if (valorResolvido instanceof DescritorTipoClasse) {
        const metodos = valorResolvido.metodos;
        const metodoInicializacao = metodos.inicializacao;

        let tamanho = 0;

        if (
            metodoInicializacao &&
            !Array.isArray(metodoInicializacao) &&
            metodoInicializacao.eInicializador
        ) {
            tamanho = metodoInicializacao.declaracao.parametros.length;
        }

        return tamanho;
    }

    if (
        valorResolvido.length === undefined &&
        typeof valorResolvido === 'object'
    ) {
        if (valorResolvido.hasOwnProperty('elementos')) {
            return valorResolvido.elementos.length;
        }

        return Object.keys(valorResolvido).length;
    }

    return valorResolvido.length;
}

/**
 * Transforma o valor ou variável em texto.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} valor O valor ou variável a ser convertido em texto.
 * @returns {Promise<string>} O valor resolvido em texto.
 */
export async function texto(
    interpretador: InterpretadorInterface,
    valor: any
): Promise<string> {
    const valorResolvido = interpretador.resolverValor(valor);

    if (valorResolvido === null || valorResolvido === undefined) {
        return 'nulo';
    }

    if (typeof valorResolvido === 'boolean') {
        return valorResolvido ? 'verdadeiro' : 'falso';
    }

    return String(valorResolvido);
}

/**
 * Retorna verdadeiro se todos os elementos do iterável forem verdadeiros (truthy). Caso seja passado uma função como segundo parâmetro, cada elemento do iterável será passado para ela.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel Qualquer dado que seja iterável
 * @param {any} funcaoCondicional A função que será executada com cada valor.
 * @returns {Promise<boolean>} Verdadeiro, se todos os valores do iterável forem verdadeiros ou se satisfazerem a função condicional.
 */
export async function todos(
    interpretador: InterpretadorInterface,
    iteravel: any,
    funcaoCondicional?: any
): Promise<boolean> {
    if (iteravel === null || iteravel === undefined) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O parâmetro da função todos() não pode ser nulo.'
        );
    }

    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !Array.isArray(valorIteravel) &&
        !(valorIteravel?.constructor === TuplaN)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                linha: interpretador.linhaDeclaracaoAtual,
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
            } as SimboloInterface,
            'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
        );
    }

    const valorFuncao = interpretador.resolverValor(funcaoCondicional);
    if (valorFuncao) {
        const ehUmaFuncao = valorFuncao instanceof DeleguaFuncao ||
            valorFuncao instanceof FuncaoPadrao;

        if (!valorFuncao || !ehUmaFuncao) {
            throw new ErroEmTempoDeExecucao(
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface,
                'Parâmetro inválido. O segundo parâmetro deve ser uma função.'
            );
        }
    }

    for (const item of itens) {
        let resultado: any;

        if (valorFuncao) {
            const resultadoChamada = await valorFuncao.chamar(
                interpretador,
                [item],
                {
                    linha: interpretador.linhaDeclaracaoAtual,
                    hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                } as SimboloInterface
            );

            if (resultadoChamada !== null && resultadoChamada !== undefined) {
                if (resultadoChamada.hasOwnProperty('valorRetornado')) {
                    resultado = resultadoChamada.valorRetornado instanceof RetornoQuebra
                        ? resultadoChamada.valorRetornado.valor
                        : resultadoChamada.valorRetornado;
                } else if (resultadoChamada instanceof RetornoQuebra) {
                    resultado = resultadoChamada.valor;
                } else {
                    resultado = resultadoChamada;
                }
            }
        } else {
            resultado = item;
        }

        const resultadoResolvido = interpretador.resolverValor(resultado);

        if (!interpretador.eVerdadeiro(resultadoResolvido)) return false;
    }

    return true;
}

/**
 * Transforma um iteravel em uma tupla.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser convertido.
 * @returns A tupla resolvida.
 */
export async function tupla(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<TuplaN> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !(valorIteravel instanceof Vetor) &&
        !Array.isArray(valorIteravel)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            'O argumento passado para a função `tupla()` deve ser iterável.'
        );
    }

    const itensDaTupla = itens.map(item => {
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
        itensDaTupla
    );
}

export async function unico(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<any[]> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !(valorIteravel?.constructor === TuplaN) &&
        !Array.isArray(valorIteravel)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            'O argumento passado para a função `unico()` deve ser iterável.'
        );
    }

    return [...new Set(itens)];
};

/**
 * Transforma um iteravel em um vetor.
 * @param {InterpretadorInterface} interpretador A instância do interpretador.
 * @param {any} iteravel O iterável a ser convertido.
 * @returns O vetor resolvido.
 */
export async function vetor(
    interpretador: InterpretadorInterface,
    iteravel: any
): Promise<any[]> {
    const valorIteravel = interpretador.resolverValor(iteravel);
    const itens = new Iteravel(valorIteravel).elementos;

    if (
        itens.length === 0 &&
        valorIteravel !== '' &&
        !(valorIteravel?.constructor === TuplaN) &&
        !Array.isArray(valorIteravel)
    ) {
        throw new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            'O argumento passado para a função `vetor()` deve ser iterável.'
        );
    }

    return itens.map(elemento => interpretador.resolverValor(elemento));
}
