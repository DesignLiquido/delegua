import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Logico<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    esquerda: ConstrutoInterface;
    operador: SimboloInterface<TTipoSimbolo>;
    direita: ConstrutoInterface;
    negado: boolean = false;

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
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLogica(this);
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
