import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Super implements Construto {
    linha: number;
    hashArquivo: number;

    simboloChave: SimboloInterface;
    metodo: SimboloInterface;

    constructor(hashArquivo: number, simboloChave: SimboloInterface, metodo: SimboloInterface) {
        this.linha = Number(simboloChave.linha);
        this.hashArquivo = hashArquivo;

        this.simboloChave = simboloChave;
        this.metodo = metodo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoSuper(this));
    }
}
