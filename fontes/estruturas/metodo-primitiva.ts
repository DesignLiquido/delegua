import { VisitanteComumInterface } from '../interfaces';
import { Chamavel } from './chamavel';

/**
 * Classe de método de primitiva.
 * Exemplos:
 *
 * - `v.inclui(1)` (`v` é um vetor)
 * - `t.minusculo()` (`t` é um texto)
 *
 * A aridade é sempre a quantidade de argumentos do método menos um porque o
 * primeiro parâmetro é sempre a referência para a primitiva.
 */
export class MetodoPrimitiva extends Chamavel {
    primitiva: any;
    metodo: Function;

    constructor(primitiva: any, metodo: Function) {
        super();
        this.primitiva = primitiva;
        this.metodo = metodo;
        this.valorAridade = metodo.length - 1;
    }

    async chamar(interpretador: VisitanteComumInterface, argumentos: any[] = []): Promise<any> {
        return await this.metodo(interpretador, this.primitiva, ...argumentos);
    }

    /**
     * Método utilizado por Delégua para inspecionar este método em depuração.
     * @returns {string} A representação do método como texto.
     */
    paraTexto(): string {
        return `<método nome=${this.metodo} primitiva=${this.primitiva}>`;
    }

    /**
     * Método utilizado pelo VSCode para representar este método quando impressa.
     * @returns {string} A representação do método como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
