import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Construto que solicita o tipo do valor. Normalmente usado em operações de
 * reflexão e metaprogramação.
 */
export class TipoDe<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor: ConstrutoInterface;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(hashArquivo: number, simbolo: SimboloInterface<TTipoSimbolo>, valor: ConstrutoInterface) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoTipoDe(this));
    }

    paraTexto(): string {
        return `<tipo-de valor=${this.valor.paraTexto()} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
