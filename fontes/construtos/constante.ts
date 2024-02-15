import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * O construto de constante. 
 */
export class Constante<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(
        hashArquivo: number, 
        simbolo: SimboloInterface<TTipoSimbolo>
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoDeVariavel(this));
    }
}
