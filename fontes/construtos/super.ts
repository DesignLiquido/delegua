import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Super<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    simboloChave: SimboloInterface<TTipoSimbolo>;
    superclasse: string;

    constructor(
        hashArquivo: number,
        simboloChave: SimboloInterface<TTipoSimbolo>,
        superclasse: string
    ) {
        this.linha = Number(simboloChave.linha);
        this.hashArquivo = hashArquivo;

        this.simboloChave = simboloChave;
        this.superclasse = superclasse;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoSuper(this));
    }
}
