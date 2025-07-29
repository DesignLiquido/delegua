import { DeleguaFuncao } from './estruturas';
import { VariavelInterface } from '../interfaces';

/**
 * Um espaço de memória é ligado a um `EscopoExecucao`.
 * Contém valores de variáveis, endereços utilizados no montão, 
 * referências a funções (Delégua e Pituguês) e resoluções de chamadas.
 *
 * As resoluções de chamadas são utilizadas pelo depurador quando
 * uma certa linha precisa "executar duas vezes". Isso acontece quando
 * um ponto de parada é ativado dentro de um escopo relacionado com
 * a chamada. É apenas usado pelo Interpretador com Depuração.
 * @see EscopoExecucao
 */
export class EspacoMemoria {
    valores: { [nome: string]: VariavelInterface };
    enderecosMontao: Set<string>;
    resolucoesChamadas: { [id: string]: any };
    referenciasFuncoes: { [id: string]: DeleguaFuncao };

    constructor() {
        this.valores = {};
        this.enderecosMontao = new Set<string>();
        this.resolucoesChamadas = {};
        this.referenciasFuncoes = {};
    }
}
