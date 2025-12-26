import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Isto<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    simboloChave: SimboloInterface<TTipoSimbolo>;

    constructor(hashArquivo: number, linha: number, simboloChave?: SimboloInterface<TTipoSimbolo>) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.simboloChave = simboloChave;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoIsto(this));
    }

    paraTexto(): string {
        return `<isto />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
