import { uuidv4 } from '../geracao-identificadores';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { SimboloInterface } from '../interfaces';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

/**
 * O montão de tipos é muito semelhante ao montão original do interpretador, mas
 * sua função é apenas armazenas informações de tipos de estruturas de dados
 * com N níveis de profundidade, como dicionários e objetos em Delégua.
 */
export class MontaoTipos {
    referencias: { [endereco: string]: InformacaoElementoSintatico };

    constructor() {
        this.referencias = {};
    }

    /**
     * Adiciona uma nova referência ao montão de tipos, retornando seu endereço.
     * @param {any} objeto Qualquer objeto que pertença ao montão de tipos.
     * @returns {string} O endereço onde a referência foi registrada.
     */
    adicionarReferencia(objeto: any): string {
        const novoEndereco = uuidv4();
        this.referencias[novoEndereco] = objeto;
        return novoEndereco;
    }

    /**
     * Exclui referências do montão de tipos, normalmente por finalização de um
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
    obterReferencia(
        hashArquivo: number,
        linha: number,
        endereco: string
    ): InformacaoElementoSintatico {
        if (!(endereco in this.referencias)) {
            throw new ErroAvaliadorSintatico(
                { hashArquivo, linha } as SimboloInterface,
                `Referência para montão de tipos com endereco ${endereco} não existe.`
            );
        }

        return this.referencias[endereco];
    }
}
