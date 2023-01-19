import { VariavelInterface } from './interfaces';

/**
 * Um espaço de variáveis é ligado a um `EscopoExecucao`.
 * Contém os valores de variáveis e resoluções de chamadas.
 * 
 * As resoluções de chamadas são utilizadas pelo depurador quando 
 * uma certa linha precisa "executar duas vezes". Isso acontece quando
 * um ponto de parada é ativado dentro de um escopo relacionado com 
 * a chamada. É apenas usado pelo Interpretador com Depuração.
 */
export class EspacoVariaveis {
    valores: { [nome: string]: VariavelInterface };
    resolucoesChamadas: {[id: string]: any };

    constructor() {
        this.valores = {};
        this.resolucoesChamadas = {};
    }
}
