import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Binário é uma estrutura com um operador e dois operandos: esquerda e direita.
 * Implementa as seguintes operações para Delégua e todos os dialetos:
 *
 * - `+` (Adição);
 * - `-` (Subtração);
 * - `*` (Multiplicação);
 * - `/` (Divisão);
 * - `%` (Módulo);
 *
 * Algumas outras operações podem ser suportadas de dialeto para dialeto,
 * como por exemplo:
 *
 * - `+=` (Adição com Atribuição);
 * - `-=` (Subtração com Atribuição);
 * - `*=` (Multiplicação com Atribuição);
 * - `/=` (Divisão com Atribuição);
 * - `%=` (Módulo com Atribuição);
 * - `**` (Exponenciação);
 * - `::` (Concatenação);
 * - `\` (Divisão inteira).
 */
export class Binario<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    esquerda: ConstrutoInterface;
    operador: SimboloInterface<TTipoSimbolo>;
    direita: ConstrutoInterface;
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
     * Dedução otimista de tipos para expressões binárias.
     * @returns O tipo deduzido.
     */
    protected deduzirTipo(): string {
        if (
            [
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL,
                tiposDeSimbolos.IGUAL,
                tiposDeSimbolos.IGUAL_IGUAL,
                tiposDeSimbolos.DIFERENTE,
            ].includes(this.operador.tipo)
        ) {
            return 'lógico';
        }

        if (
            ['logico', 'lógico'].includes(this.esquerda.tipo) ||
            ['logico', 'lógico'].includes(this.direita.tipo)
        ) {
            return 'lógico';
        }

        if (this.esquerda.tipo === 'texto' || this.direita.tipo === 'texto') {
            return 'texto';
        }

        if (
            ['numero', 'número'].includes(this.esquerda.tipo) ||
            ['numero', 'número'].includes(this.direita.tipo)
        ) {
            return 'número';
        }

        if (this.esquerda.tipo === this.direita.tipo) {
            return this.esquerda.tipo;
        }

        return 'qualquer';
    }

    aceitar(visitante: VisitanteComumInterface): any {
        return visitante.visitarExpressaoBinaria(this);
    }

    paraTexto(): string {
        return (
            `<binário esquerda=${this.esquerda.paraTexto()} operador=${this.operador.lexema} ` +
            `direita=${this.direita.paraTexto()} ` +
            `tipo=${this.tipo} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
