import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { Construto } from './construto';

export class TipoDe<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;
    valor: any;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(
        hashArquivo: number, 
        simbolo: SimboloInterface<TTipoSimbolo>, 
        valor: any
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoTipoDe(this));
    }
}
