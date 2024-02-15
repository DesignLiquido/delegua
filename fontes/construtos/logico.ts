import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Logico<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    esquerda: Construto;
    operador: SimboloInterface<TTipoSimbolo>;
    direita: Construto;

    constructor(
        hashArquivo: number, 
        esquerda: Construto, 
        operador: SimboloInterface<TTipoSimbolo>, 
        direita: Construto
    ) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLogica(this);
    }
}
