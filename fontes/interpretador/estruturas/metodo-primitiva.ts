import { InterpretadorInterface } from '../../interfaces';
import { Chamavel } from './chamavel';

/**
 * Classe de método de primitiva.
 * Exemplos:
 *
 * - `v.inclui(1)` (`v` é um vetor)
 * - `t.minusculo()` (`t` é um texto)
 *
 * A aridade é sempre a quantidade de argumentos do método menos dois porque os
 * dois primeiros parâmetros são sempre o interpretador e a referência para a primitiva.
 */
export class MetodoPrimitiva extends Chamavel {
    nome: string;
    primitiva: any;
    metodo: Function;
    nomeMetodo: string;
    tipo: string = 'qualquer';

    constructor(
        nome: string,
        primitiva: any,
        metodo: Function,
        nomeMetodo: string,
        tipo: string = 'qualquer'
    ) {
        super();
        this.nome = nome;
        this.primitiva = primitiva;
        this.metodo = metodo;
        this.nomeMetodo = nomeMetodo;
        this.tipo = tipo;
        this.valorAridade = metodo.length - 2;
    }

    async chamar(interpretador: InterpretadorInterface, argumentos: any[] = []): Promise<any> {
        return await this.metodo(interpretador, this.primitiva, ...argumentos);
    }

    /**
     * Método utilizado por Delégua para inspecionar este método em depuração.
     * @returns {string} A representação do método como texto.
     */
    paraTexto(): string {
        return `<método nome=${this.nomeMetodo} primitiva=${this.nome} tipo-da-primitiva=${this.tipo} />`;
    }

    /**
     * Método utilizado pelo VSCode para representar este método quando impressa.
     * @returns {string} A representação do método como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
