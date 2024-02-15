import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Atribuir<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    simbolo: SimboloInterface<TTipoSimbolo>;
    valor: any;

    constructor(
        hashArquivo: number, 
        simbolo: SimboloInterface<TTipoSimbolo>, 
        valor: any
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeAtribuicao(this);
    }
}
