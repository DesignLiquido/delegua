import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Construto que solicita o tipo do valor. Normalmente usado em operações de 
 * reflexão e metaprogramação.
 */
export class TipoDe<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;
    valor: Construto;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(hashArquivo: number, simbolo: SimboloInterface<TTipoSimbolo>, valor: Construto) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoTipoDe(this));
    }
}
