import { DeleguaFuncao, FuncaoPadrao } from '../../../interpretador/estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

/* eslint-disable prefer-rest-params */
export default function (interpreter, globals) {
    // Retorna um número aleatório entre 0 e 1.
    globals.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(0, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // MIN(inclusivo) - MAX(exclusivo)
    globals.definirVariavel(
        'aleatorioEntre',
        new FuncaoPadrao(1, function (_: any, min: any, max: any) {
            const valorMinimoResolvido =
                min !== undefined && min.hasOwnProperty('valor') ? min.valor : min;
            const valorMaximoResolvido =
                max !== undefined && max.hasOwnProperty('valor') ? max.valor : max;
            if (!arguments[1]) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'A função recebe ao menos um parâmetro'
                );
            }

            if (arguments.length === 2) {
                if (typeof valorMinimoResolvido !== 'number') {
                    throw new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'O parâmetro deve ser do tipo número'
                    );
                }

                return (
                    Math.floor(Math.random() * (0 - valorMinimoResolvido)) + valorMinimoResolvido
                );
            }

            if (arguments.length > 3) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'A quantidade de argumentos máxima é 2'
                );
            }

            if (
                typeof valorMinimoResolvido !== 'number' ||
                typeof valorMaximoResolvido !== 'number'
            ) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Os dois parâmetros devem ser do tipo número.'
                );
            }

            return (
                Math.floor(Math.random() * (valorMaximoResolvido - valorMinimoResolvido)) +
                valorMinimoResolvido
            );
        })
    );

    globals.definirVariavel(
        'algum',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                    return true;
                }
            }

            return false;
        })
    );

    globals.definirVariavel(
        'encontrar',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                    return arrayResolvido[index];
                }
            }

            return null;
        })
    );

    globals.definirVariavel(
        'encontrarUltimo',
        new FuncaoPadrao(1, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = arrayResolvido.length - 1; index >= 0; --index) {
                if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                    return array[index];
                }
            }
        })
    );

    globals.definirVariavel(
        'encontrarIndice',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor !== DeleguaFuncao) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                    return index;
                }
            }

            return -1;
        })
    );

    globals.definirVariavel(
        'encontrarUltimoIndice',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = arrayResolvido.length - 1; index >= 0; --index) {
                if (await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])) {
                    return index;
                }
            }

            return -1;
        })
    );

    globals.definirVariavel(
        'incluido',
        new FuncaoPadrao(2, function (_: any, array: any, valor: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (arrayResolvido[index] == valorResolvido) {
                    return true;
                }
            }

            return false;
        })
    );

    globals.definirVariavel(
        'inteiro',
        new FuncaoPadrao(1, function (_: any, value: any) {
            const valorResolvido = value && value.hasOwnProperty('valor') ? value.valor : value;

            if (valorResolvido === undefined || valorResolvido === null) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Somente números podem passar para inteiro.'
                );
            }

            if (!/^-{0,1}\d+$/.test(valorResolvido) && !/^\d+\.\d+$/.test(valorResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Somente números podem passar para inteiro.'
                );
            }

            return parseInt(valorResolvido);
        })
    );

    globals.definirVariavel(
        'mapear',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = [];
            for (let index = 0; index < arrayResolvido.length; ++index) {
                provisorio.push(
                    await callbackResolvido.chamar(interpreter, [arrayResolvido[index]])
                );
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'filtrar',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = [];
            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (await callbackResolvido.chamar(interpreter, [array[index]])) {
                    provisorio.push(arrayResolvido[index]);
                }
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'paraCada',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                await callbackResolvido.chamar(interpreter, [arrayResolvido[index]]);
            }
        })
    );

    globals.definirVariavel(
        'reduzir',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any, padrao: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            let provisorio = padrao;
            let inicio = 0;

            if (!provisorio) {
                provisorio = arrayResolvido[0];
                inicio = 1;
            }

            for (let index = inicio; index < arrayResolvido.length; ++index) {
                provisorio = await callbackResolvido.chamar(interpreter, [
                    provisorio,
                    arrayResolvido[index],
                ]);
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        'todos',
        new FuncaoPadrao(2, async function (_: any, array: any, callback: any) {
            const arrayResolvido = array && array.hasOwnProperty('valor') ? array.valor : array;
            const callbackResolvido =
                callback && callback.hasOwnProperty('valor') ? callback.valor : callback;

            if (!Array.isArray(arrayResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função, deve ser um array.'
                );
            }

            if (callbackResolvido.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função, deve ser uma função.'
                );
            }

            for (let index = 0; index < arrayResolvido.length; ++index) {
                if (!(await callbackResolvido.chamar(interpreter, [arrayResolvido[index]]))) {
                    return false;
                }
            }

            return true;
        })
    );

    globals.definirVariavel(
        'ordenar',
        new FuncaoPadrao(1, function (_: any, obj: any) {
            let objetoResolvido = obj && obj.hasOwnProperty('valor') ? obj.valor : obj;

            if (Array.isArray(objetoResolvido) == false) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Valor Inválido. Objeto inserido não é um vetor.'
                );
            }

            let trocado;
            let length = objetoResolvido.length;
            do {
                trocado = false;
                for (let i = 0; i < length - 1; i++) {
                    if (objetoResolvido[i] > objetoResolvido[i + 1]) {
                        [objetoResolvido[i], objetoResolvido[i + 1]] = [
                            objetoResolvido[i + 1],
                            objetoResolvido[i],
                        ];
                        trocado = true;
                    }
                }
            } while (trocado);

            return objetoResolvido;
        })
    );

    globals.definirVariavel(
        'real',
        new FuncaoPadrao(1, function (_: any, value: any) {
            const valorResolvido = value.hasOwnProperty('valor') ? value.valor : value;

            if (!/^-{0,1}\d+$/.test(valorResolvido) && !/^\d+\.\d+$/.test(valorResolvido))
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Somente números podem passar para real.'
                );

            return parseFloat(valorResolvido);
        })
    );

    globals.definirVariavel(
        'tamanho',
        new FuncaoPadrao(1, function (_: any, obj: any) {
            let objetoResolvido = obj && obj.hasOwnProperty('valor') ? obj.valor : obj;

            if (objetoResolvido instanceof DeleguaFuncao) {
                return objetoResolvido.declaracao.parametros.length;
            }

            if (objetoResolvido instanceof FuncaoPadrao) {
                return objetoResolvido.valorAridade;
            }

            if (!isNaN(objetoResolvido)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Não é possível encontrar o tamanho de um número.'
                );
            }

            return objetoResolvido.length;
        })
    );

    globals.definirVariavel(
        'texto',
        new FuncaoPadrao(1, function (_: any, value: any) {
            const valorResolvido = value.hasOwnProperty('valor') ? value.valor : value;

            return `${valorResolvido}`;
        })
    );

    globals.definirVariavel('exports', {});

    return globals;
}
