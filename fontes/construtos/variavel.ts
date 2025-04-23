import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { Construto } from './construto';

export class Variavel<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;
    simbolo: SimboloInterface<TTipoSimbolo>;
    tipo: string;
    idReferencia?: string;

    constructor(hashArquivo: number, simbolo: SimboloInterface<TTipoSimbolo>, tipo: string = 'qualquer') {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoDeVariavel(this));
    }
}
