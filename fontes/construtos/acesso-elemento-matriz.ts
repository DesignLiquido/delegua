import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class AcessoElementoMatriz implements Construto {
    linha: number;
    hashArquivo: number;

    entidadeChamada: Construto;
    simboloFechamento: SimboloInterface;
    indicePrimario: any;
    indiceSecundario: any;

    constructor(
        hashArquivo: number,
        entidadeChamada: Construto,
        indicePrimario: any,
        indiceSegundario: any,
        simboloFechamento: SimboloInterface
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indicePrimario = indicePrimario;
        this.indiceSecundario = indiceSegundario;
        this.simboloFechamento = simboloFechamento;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoElementoMatriz(this);
    }
}
