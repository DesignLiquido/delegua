import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Logico<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    esquerda: ConstrutoInterface;
    operador: SimboloInterface<TTipoSimbolo>;
    direita: ConstrutoInterface;
    negado: boolean = false;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        esquerda: ConstrutoInterface,
        operador: SimboloInterface<TTipoSimbolo>,
        direita: ConstrutoInterface
    ) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
        this.tipo = this.deduzirTipo();
    }

    /**
     * Dedução de tipos para expressões lógicas.
     * - `em` e `contém` resultam em `lógico`.
     * - `e` e `ou` entre dois lógicos resultam em `lógico`. Entre dois números são operações
     *   bit a bit e resultam em número. Nos demais casos, o resultado é um dos operandos,
     *   então o tipo é `qualquer`.
     * @returns O tipo deduzido.
     */
    protected deduzirTipo(): string {
        if ([tiposDeSimbolos.EM, tiposDeSimbolos.CONTEM].includes(this.operador.tipo as string)) {
            return 'lógico';
        }

        const tipoEsquerda = this.esquerda?.tipo;
        const tipoDireita = this.direita?.tipo;
        const logicos = ['logico', 'lógico'];
        if (logicos.includes(tipoEsquerda) && logicos.includes(tipoDireita)) {
            return 'lógico';
        }

        const numericos = ['número', 'numero', 'inteiro', 'real', 'longo'];
        if (numericos.includes(tipoEsquerda) && numericos.includes(tipoDireita)) {
            return tipoEsquerda === tipoDireita ? tipoEsquerda : 'número';
        }

        return 'qualquer';
    }

    aceitar(visitante: VisitanteComumInterface): any {
        return visitante.visitarExpressaoLogica(this);
    }

    paraTexto(): string {
        return (
            `<lógico esquerda=${this.esquerda.paraTexto()} operador=${this.operador.lexema} ` +
            `direita=${this.direita.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
