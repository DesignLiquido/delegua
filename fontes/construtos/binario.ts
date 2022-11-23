import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Binário é uma estrutura com um operador e dois operandos: esquerda e direita.
 * Implementa as seguintes operações:
 *
 * - `+` (Adição) e `+=` (Adição com Atribuição)
 * - `-` (Subtração) e `-=` (Subtração com Atribuição)
 * - `*` (Multiplicação) e `*=` (Multiplicação com Atribuição)
 * - `/` (Divisão) e `/=` (Divisão com Atribuição)
 * - `%` (Módulo) e `%=` (Módulo com Atribuição)
 * - `**` (Exponenciação)
 */
export class Binario implements Construto {
    linha: number;
    hashArquivo?: number;

    esquerda: any;
    operador: SimboloInterface;
    direita: any;

    constructor(
        hashArquivo: number,
        esquerda: any,
        operador: SimboloInterface,
        direita: any
    ) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoBinaria(this);
    }
}
