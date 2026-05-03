import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class AtribuicaoPorIndicesMatriz implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    valor: ConstrutoInterface;
    indicePrimario: ConstrutoInterface;
    indiceSecundario: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        linha: number,
        objeto: ConstrutoInterface,
        indicePrimario: ConstrutoInterface,
        indiceSecundario: ConstrutoInterface,
        valor: ConstrutoInterface
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
