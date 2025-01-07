import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

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
export class Binario<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    esquerda: Construto;
    operador: SimboloInterface<TTipoSimbolo>;
    direita: Construto;
    tipo: string = 'qualquer';

    constructor(hashArquivo: number, esquerda: Construto, operador: SimboloInterface<TTipoSimbolo>, direita: Construto) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
        this.tipo = this.deduzirTipo();
    }

    protected deduzirTipo(): string {
        if (['logico', 'lógico'].includes(this.esquerda.tipo) || ['logico', 'lógico'].includes(this.direita.tipo)) {
            return 'lógico';
        }

        if (this.esquerda.tipo === 'texto' || this.direita.tipo === 'texto') {
            return 'texto';
        }

        if (this.esquerda.tipo === 'inteiro' && this.direita.tipo === 'inteiro') {
            return 'inteiro';
        }

        if (['numero', 'número'].includes(this.esquerda.tipo)  || ['numero', 'número'].includes(this.direita.tipo)) {
            return 'número';
        }

        return 'qualquer';
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoBinaria(this);
    }
}
