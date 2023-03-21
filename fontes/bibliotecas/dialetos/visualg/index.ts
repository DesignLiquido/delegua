import { FuncaoPadrao } from "../../../estruturas";
import { PilhaEscoposExecucaoInterface } from "../../../interfaces/pilha-escopos-execucao-interface";
import { InterpretadorVisuAlg } from "../../../interpretador/dialetos";

export function registrarBibliotecaGlobalVisuAlg(
    interpretador: InterpretadorVisuAlg, 
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) 
{
    pilhaEscoposExecucao.definirVariavel(
        'abs', 
        new FuncaoPadrao(1, function(valor: number) {
            return Math.abs(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arccos', 
        new FuncaoPadrao(1, function(valor: number) {
            return Math.acos(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arcsen',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.asin(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'arctan',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.atan(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'cos',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.cos(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'cotan',
        new FuncaoPadrao(1, function(valor: number) {
            return 1 / Math.tan(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'exp',
        new FuncaoPadrao(2, function(base: number, expoente: number) {
            return Math.pow(base, expoente);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'grauprad',
        new FuncaoPadrao(1, function(valor: number) {
            return valor * Math.PI / 180;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'int',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.floor(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'log',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.log10(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'logn',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.log(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'pi',
        new FuncaoPadrao(0, function() {
            return Math.PI;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'quad',
        new FuncaoPadrao(1, function(valor: number) {
            return valor * valor;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'radpgrau',
        new FuncaoPadrao(1, function(valor: number) {
            return valor * 180 / Math.PI;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'raizq',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.sqrt(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'rand',
        new FuncaoPadrao(0, function() {
            return Math.random();
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'randi',
        new FuncaoPadrao(2, function(limite: number) {
            return Math.floor(Math.random() * limite);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'sen',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.sin(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'tan',
        new FuncaoPadrao(1, function(valor: number) {
            return Math.tan(valor);
        })
    );
}