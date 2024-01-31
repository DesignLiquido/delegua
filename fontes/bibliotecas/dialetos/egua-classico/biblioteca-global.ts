import { DeleguaFuncao, FuncaoPadrao } from '../../../estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

/* eslint-disable prefer-rest-params */
export default function (interpreter, globals) {
    // Retorna um número aleatório entre 0 e 1.
    globals.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // MIN(inclusivo) - MAX(exclusivo)
    globals.definirVariavel(
        'aleatorioEntre',
        new FuncaoPadrao(1, function (min, max) {
            const valorMinimoResolvido = min.hasOwnProperty('valor') ? min.valor : min;
            const valorMaximoResolvido = max.hasOwnProperty('valor') ? max.valor : max;
            if (!arguments[0]) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'A função recebe ao menos um parâmetro');
            }

            if (arguments.length === 1) {
                if (typeof valorMinimoResolvido !== 'number') {
                    throw new ErroEmTempoDeExecucao(this.simbolo, 'O parâmetro deve ser do tipo número');
                }

                return Math.floor(Math.random() * (0 - valorMinimoResolvido)) + valorMinimoResolvido;
            }

            if (arguments.length > 2) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'A quantidade de argumentos máxima é 2');
            }

            if (typeof valorMinimoResolvido !== 'number' || typeof valorMaximoResolvido !== 'number') {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Os dois parâmetros devem ser do tipo número.');
            }

            return Math.floor(Math.random() * (valorMaximoResolvido - valorMinimoResolvido)) + valorMinimoResolvido;
        })
    );

    globals.definirVariavel(
        'inteiro',
        new FuncaoPadrao(1, function (value) {
            const valorResolvido = value.hasOwnProperty('valor') ? value.valor : value;
            if (valorResolvido === undefined || valorResolvido === null) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Somente números podem passar para inteiro.');
            }

            if (!/^-{0,1}\d+$/.test(valorResolvido) && !/^\d+\.\d+$/.test(valorResolvido)) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Somente números podem passar para inteiro.');
            }

            return parseInt(valorResolvido);
        })
    );

    globals.definirVariavel(
        'paraCada',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                await callback.chamar(interpreter, [array[index]]);
            }
        })
    );

    globals.definirVariavel(
        'mapear',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = [];
            for (let index = 0; index < array.length; ++index) {
                provisorio.push(await callback.chamar(interpreter, [array[index]]));
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'filtrar',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = [];
            for (let index = 0; index < array.length; ++index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    provisorio.push(array[index]);
                }
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'reduzir',
        new FuncaoPadrao(1, async function (array, callback, padrao) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = padrao;
            let inicio = 0;

            if (!provisorio) {
                provisorio = array[0];
                inicio = 1;
            }

            for (let index = inicio; index < array.length; ++index) {
                provisorio = await callback.chamar(interpreter, [provisorio, array[index]]);
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'encontrar',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    return array[index];
                }
            }

            return null;
        })
    );

    globals.definirVariavel(
        'encontrarUltimo',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = array.length - 1; index >= 0; --index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    return array[index];
                }
            }
        })
    );

    globals.definirVariavel(
        'encontrarIndice',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    return index;
                }
            }

            return -1;
        })
    );

    globals.definirVariavel(
        'encontrarUltimoIndice',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = array.length - 1; index >= 0; --index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    return index;
                }
            }
        })
    );

    globals.definirVariavel(
        'incluido',
        new FuncaoPadrao(1, function (array, valor) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                if (array[index] == valorResolvido) {
                    return true;
                }
            }

            return false;
        })
    );

    globals.definirVariavel(
        'algum',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                if (await callback.chamar(interpreter, [array[index]])) {
                    return true;
                }
            }

            return false;
        })
    );

    globals.definirVariavel(
        'todos',
        new FuncaoPadrao(1, async function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < array.length; ++index) {
                if (!(await callback.chamar(interpreter, [array[index]]))) {
                    return false;
                }
            }

            return true;
        })
    );

    globals.definirVariavel(
        'ordenar',
        new FuncaoPadrao(1, function (obj) {
            if (Array.isArray(obj) == false) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Valor Inválido. Objeto inserido não é um vetor.');
            }

            let trocado;
            let length = obj.length;
            do {
                trocado = false;
                for (let i = 0; i < length - 1; i++) {
                    if (obj[i] > obj[i + 1]) {
                        [obj[i], obj[i + 1]] = [obj[i + 1], obj[i]];
                        trocado = true;
                    }
                }
            } while (trocado);
            return obj;
        })
    );

    globals.definirVariavel(
        'real',
        new FuncaoPadrao(1, function (value) {
            const valorResolvido = value.hasOwnProperty('valor') ? value.valor : value;
            if (!/^-{0,1}\d+$/.test(valorResolvido) && !/^\d+\.\d+$/.test(valorResolvido))
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Somente números podem passar para real.');
            return parseFloat(valorResolvido);
        })
    );

    globals.definirVariavel(
        'tamanho',
        new FuncaoPadrao(1, function (obj) {
            if (!isNaN(obj)) {
                throw new ErroEmTempoDeExecucao(this.simbolo, 'Não é possível encontrar o tamanho de um número.');
            }

            if (obj instanceof DeleguaFuncao) {
                return obj.declaracao.parametros.length;
            }

            if (obj instanceof FuncaoPadrao) {
                return obj.valorAridade;
            }

            return obj.length;
        })
    );

    globals.definirVariavel(
        'texto',
        new FuncaoPadrao(1, function (value) {
            const valorResolvido = value.hasOwnProperty('valor') ? value.valor : value;
            return `${valorResolvido}`;
        })
    );

    globals.definirVariavel('exports', {});

    return globals;
}
