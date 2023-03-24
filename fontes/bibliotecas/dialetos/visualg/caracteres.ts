import { FuncaoPadrao } from "../../../estruturas";
import { PilhaEscoposExecucaoInterface } from "../../../interfaces/pilha-escopos-execucao-interface";
import { InterpretadorVisuAlg, InterpretadorVisuAlgComDepuracao } from "../../../interpretador/dialetos";

export function registrarBibliotecaCaracteresVisuAlg(
    interpretador: InterpretadorVisuAlg | InterpretadorVisuAlgComDepuracao, 
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) 
{
    pilhaEscoposExecucao.definirVariavel(
        'asc', 
        new FuncaoPadrao(1, function(valor: string) {
            return valor.charCodeAt(0);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'carac',
        new FuncaoPadrao(1, function(valor: number) {
            return String.fromCharCode(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'caracpnum',
        new FuncaoPadrao(1, function(valor: string) {
            return Number(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'compr',
        new FuncaoPadrao(1, function(valor: string) {
            return valor.length;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'copia',
        new FuncaoPadrao(3, function(valor: string, inicio: number, fim: number) {
            return valor.substring(inicio, inicio + fim);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'maiusc',
        new FuncaoPadrao(1, function(valor: string) {
            return valor.toUpperCase();
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'minusc',
        new FuncaoPadrao(1, function(valor: string) {
            return valor.toLowerCase();
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'numpcarac',
        new FuncaoPadrao(1, function(valor: number) {
            return String(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'pos',
        new FuncaoPadrao(2, function(busca: string, valor: string) {
            return valor.indexOf(busca) + 1;
        })
    );
}