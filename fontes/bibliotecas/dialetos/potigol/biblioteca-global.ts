import { FuncaoPadrao } from '../../../estruturas';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';
import { InterpretadorBase } from '../../../interpretador';

export function registrarBibliotecaGlobalPotigol(
    interpretador: InterpretadorBase,
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface
) {
    pilhaEscoposExecucao.definirVariavel(
        'abs',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.abs(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'aleatório',
        new FuncaoPadrao(0, function () {
            return Math.random();
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arccos',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.acos(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arcsen',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.asin(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arctg',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.atan(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'cos',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.cos(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'log',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.log(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'log10',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.log10(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'pi',
        new FuncaoPadrao(0, function () {
            return Math.PI;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'raiz',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.sqrt(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'sen',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.sin(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'tg',
        new FuncaoPadrao(1, function (valor: number) {
            return Math.tan(valor);
        })
    );
}
