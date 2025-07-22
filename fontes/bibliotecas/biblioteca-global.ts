import { ErroEmTempoDeExecucao } from '../excecoes';
import { ObjetoDeleguaClasse } from '../interpretador/estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../interpretador/estruturas/funcao-padrao';
import { DescritorTipoClasse } from '../interpretador/estruturas/descritor-tipo-classe';
import { VariavelInterface } from '../interfaces';
import { InterpretadorInterface } from '../interfaces';
import { DeleguaFuncao } from '../interpretador/estruturas';
import {
    Deceto,
    Dupla,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    Septeto,
    Sexteto,
    Trio,
    Tupla,
} from '../construtos';

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
            new ErroEmTempoDeExecucao(this.simbolo, 'A função recebe ao menos um parâmetro.')
        );
    }

    const valorMinimo = minimo.hasOwnProperty('valor')
        ? (minimo as VariavelInterface).valor
        : minimo;

    if (arguments.length === 2) {
        if (typeof valorMinimo !== 'number') {
            return Promise.reject(
                new ErroEmTempoDeExecucao(this.simbolo, 'O parâmetro deve ser um número.')
            );
        }

        return Math.floor(Math.random() * (0 - valorMinimo)) + valorMinimo;
    }

    if (arguments.length > 3) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
                'A quantidade de parâmetros máxima para esta função é 2.'
            )
        );
    }

    const valorMaximo = maximo.hasOwnProperty('valor')
        ? (maximo as VariavelInterface).valor
        : maximo;

    if (typeof valorMinimo !== 'number' || typeof valorMaximo !== 'number') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(this.simbolo, 'Os dois parâmetros devem ser do tipo número.')
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() deve ser um vetor.'
            )
        );
    }

    const construtorResolvido = valorFuncaoFiltragem.constructor.name.replaceAll(
        '_',
        ''
    );
    if (construtorResolvido !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
                'Parâmetro inválido. O segundo parâmetro da função filtrarPor() deve ser uma função.'
            )
        );
    }

    const resultados = [];
    for (let indice = 0; indice < valorVetor.length; ++indice) {
        const deveRetornarValor = await valorFuncaoFiltragem.chamar(interpretador, [
            valorVetor[indice],
        ]);
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
                this.simbolo,
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

function validacaoComumNumeros(valorParaConverter: any): Promise<never> | null {
    if (isNaN(valorParaConverter)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
                'Valor não parece ser um número. Somente números ou textos com números podem ser convertidos para inteiro.'
            )
        );
    }

    if (!/^(-)?\d+(\.\d+)?$/.test(valorParaConverter)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
    const resultadoValidacao = validacaoComumNumeros(valor);

    return resultadoValidacao || Promise.resolve(parseInt(valor));
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.'
            )
        );

    const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
    const valorFuncaoMapeamento = funcaoMapeamento.hasOwnProperty('valor')
        ? funcaoMapeamento.valor
        : funcaoMapeamento;

    // TODO: As lógicas de validação abaixo deixam de fazer sentido com a validação de argumentos feita
    // na avaliação sintática. Estudar remoção.
    if (!Array.isArray(valorVetor)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função mapear() deve ser um vetor.'
            )
        );
    }

    const nomeConstrutorFuncaoMapeamento = valorFuncaoMapeamento.constructor.name.replaceAll(
        '_',
        ''
    );
    if (nomeConstrutorFuncaoMapeamento !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
                'Parâmetro inválido. O segundo parâmetro da função mapear() deve ser uma função.'
            )
        );
    }

    const resultados = [];
    for (let indice = 0; indice < valorVetor.length; ++indice) {
        resultados.push(await valorFuncaoMapeamento.chamar(interpretador, [valorVetor[indice]]));
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
    const resultadoValidacao = validacaoComumNumeros(valor);

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
            this.simbolo,
            'Parâmetro inválido. O primeiro parâmetro da função ordenar() não pode ser nulo.'
        );

    const objeto = vetor.hasOwnProperty('valor') ? (vetor as VariavelInterface).valor : vetor;

    if (!Array.isArray(objeto)) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função paraCada() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoReducao.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Função global tamanho() não funciona com números.'
            )
        );
    }

    if (valorObjeto instanceof ObjetoDeleguaClasse) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
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
                this.simbolo,
                'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() deve ser um vetor.'
            )
        );
    }

    if (valorFuncaoCondicional.constructor.name !== 'DeleguaFuncao') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                this.simbolo,
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
                this.simbolo,
                'Argumento de função nativa `tupla` não parece ser um vetor.'
            )
        );
    }

    switch (valorVetor.length) {
        case 2:
            return Promise.resolve(new Dupla(valorVetor[0], valorVetor[1]));
        case 3:
            return Promise.resolve(new Trio(valorVetor[0], valorVetor[1], valorVetor[2]));
        case 4:
            return Promise.resolve(
                new Quarteto(valorVetor[0], valorVetor[1], valorVetor[2], valorVetor[3])
            );
        case 5:
            return Promise.resolve(
                new Quinteto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4]
                )
            );
        case 6:
            return Promise.resolve(
                new Sexteto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4],
                    valorVetor[5]
                )
            );
        case 7:
            return Promise.resolve(
                new Septeto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4],
                    valorVetor[5],
                    valorVetor[6]
                )
            );
        case 8:
            return Promise.resolve(
                new Octeto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4],
                    valorVetor[5],
                    valorVetor[6],
                    valorVetor[7]
                )
            );
        case 9:
            return Promise.resolve(
                new Noneto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4],
                    valorVetor[5],
                    valorVetor[6],
                    valorVetor[7],
                    valorVetor[8]
                )
            );
        case 10:
            return Promise.resolve(
                new Deceto(
                    valorVetor[0],
                    valorVetor[1],
                    valorVetor[2],
                    valorVetor[3],
                    valorVetor[4],
                    valorVetor[5],
                    valorVetor[6],
                    valorVetor[7],
                    valorVetor[8],
                    valorVetor[9]
                )
            );
        case 1:
        default:
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Para ser transformado em uma tupla, vetor precisa ter de 2 a 10 elementos.'
                )
            );
    }
}
