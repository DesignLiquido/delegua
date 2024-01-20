import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class AtribuicaoPorIndicesMatriz implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: any;
    valor: any;
    indicePrimario: any;
    indiceSecundario: any;

    constructor(hashArquivo: number, linha: number, objeto: any, indicePrimario: any, indiceSecundario: any, valor: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.indicePrimario = indicePrimario;
        this.indiceSecundario = indiceSecundario;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAtribuicaoPorIndicesMatriz(this);
    }
}
