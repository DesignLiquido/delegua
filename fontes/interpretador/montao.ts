import { ErroEmTempoDeExecucao } from "../excecoes";
import { uuidv4 } from "../geracao-identificadores";
import { SimboloInterface } from "../interfaces";

/**
 * O montão, conhecido em inglês, como _heap_, guarda todas as estruturas de dados 
 * não primitivas durante a execução.
 * Inicialmente trabalha apenas com dicionários, mas a ideia mais futuramente é
 * trabalhar com toda e qualquer estrutura de dados mais complexa.
 * 
 * Diferentemente da pilha de escopos de execução, o montão trabalha entre escopos.
 * Por exemplo, se quisermos ter uma funcionalidade do interpretador em que uma
 * referência é preservada entre escopos, podemos apagar o escopo e transferir facilmente
 * a referência do montão para outro escopo.
 */
export class Montao {
    referencias: {[endereco: string]: any}

    constructor() {
        this.referencias = {};
    }

    /**
     * Adiciona uma nova referência ao montão, retornando seu endereço.
     * @param {any} objeto Qualquer objeto que pertença ao montão.
     * @returns {string} O endereço onde a referência foi registrada.
     */
    adicionarReferencia(objeto: any): string {
        const novoEndereco = uuidv4();
        this.referencias[novoEndereco] = objeto;
        return novoEndereco;
    }

    /**
     * Exclui referências do montão, normalmente por finalização de um 
     * escopo de execução.
     * @param enderecos 
     */
    excluirReferencias(...enderecos: string[]): void {
        for (const endereco of enderecos) {
            delete this.referencias[endereco];
        }
    }

    /**
     * Obtém uma referência com base no símbolo executado e endereço da referência.
     * @param {number} hashArquivo O _hash_ correspondente ao caminho do arquivo em execução.
     * @param {number} linha A linha correspondente à declaração sendo executada.
     * @param {string} endereco O endereço da referência.
     * @returns {any} O objeto armazenado no endereço.
     */
    obterReferencia(hashArquivo: number, linha: number, endereco: string): any {
        if (!(endereco in this.referencias)) {
            throw new ErroEmTempoDeExecucao(
                { hashArquivo, linha } as SimboloInterface, 
                `Referência para montão com endereco ${endereco} não existe.`
            );
        }

        return this.referencias[endereco];
    }
}
