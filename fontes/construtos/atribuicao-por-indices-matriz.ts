import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class AtribuicaoPorIndicesMatriz implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    valor: Construto;
    indicePrimario: Construto;
    indiceSecundario: Construto;

    constructor(
        hashArquivo: number,
        linha: number,
        objeto: Construto,
        indicePrimario: Construto,
        indiceSecundario: Construto,
        valor: Construto
    ) {
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

    paraTexto(): string {
        return (
            `<atribuição-por-índices-matriz objeto=${this.objeto.paraTexto()} ` +
            `índice-primário=${this.indicePrimario.paraTexto()} ` +
            `índice-secundário=${this.indiceSecundario.paraTexto()} ` +
            `valor=${this.valor.paraTexto()} ` +
            ` />`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
