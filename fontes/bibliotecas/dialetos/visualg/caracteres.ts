import { FuncaoPadrao } from "../../../estruturas";
import { PilhaEscoposExecucaoInterface } from "../../../interfaces/pilha-escopos-execucao-interface";
import { InterpretadorVisuAlg, InterpretadorVisuAlgComDepuracao } from "../../../interpretador/dialetos";

export function registrarBibliotecaCaracteresVisuAlg(
    interpretador: InterpretadorVisuAlg | InterpretadorVisuAlgComDepuracao, 
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) 
{
    pilhaEscoposExecucao.definirVariavel(
        'asc', 
        new FuncaoPadrao(1, function(valor: any) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            return String(valorResolvido).charCodeAt(0);
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
        new FuncaoPadrao(1, function(valor: any) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            return Number(valorResolvido);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'compr',
        new FuncaoPadrao(1, function(valor: any) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            return String(valorResolvido).length;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'copia',
        new FuncaoPadrao(3, function(valor: string, inicio: number, fim: number) {
            return valor.substring(inicio, inicio + fim);
        })
    );

    // Esse método não existe na biblioteca padrão. É usado para outros
    // projetos montarem lógicas de tratamento de erro.
    pilhaEscoposExecucao.definirVariavel(
        'erro2',
        new FuncaoPadrao(0, function() {
            throw new Error('Essa função atira erro também. É usada para testes variados.');
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'limpatela',
        new FuncaoPadrao(0, console.clear)
    );

    pilhaEscoposExecucao.definirVariavel(
        'maiusc',
        new FuncaoPadrao(1, function(valor: any) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            return String(valorResolvido).toUpperCase();
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
        new FuncaoPadrao(2, function(busca: string, valor: any) {
            const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
            return String(valorResolvido).indexOf(busca) + 1;
        })
    );
}