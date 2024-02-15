import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class DefinirValor<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    nome: SimboloInterface<TTipoSimbolo>;
    valor: any;

    constructor(
        hashArquivo: number, 
        linha: number, 
        objeto: Construto, 
        nome: SimboloInterface<TTipoSimbolo>, 
        valor: any
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDefinirValor(this);
    }
}
