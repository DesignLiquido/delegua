import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { Construto } from './construto';

export class ExpressaoRegular implements Construto {
    linha: number;
    hashArquivo: number;
    valor: any;

    simbolo: SimboloInterface;

    constructor(hashArquivo: number, simbolo: SimboloInterface, valor: any) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<RegExp> {
        return Promise.resolve(visitante.visitarExpressaoExpressaoRegular(this));
    }
}
