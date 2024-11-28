import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class AtribuicaoPorIndice implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    valor: Construto;
    indice: Construto;

    constructor(hashArquivo: number, linha: number, objeto: Construto, indice: Construto, valor: Construto) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAtribuicaoPorIndice(this);
    }
}
