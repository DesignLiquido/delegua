import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class AtribuicaoPorIndice implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    valor: ConstrutoInterface;
    indice: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        linha: number,
        objeto: ConstrutoInterface,
        indice: ConstrutoInterface,
        valor: ConstrutoInterface
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAtribuicaoPorIndice(this);
    }

    paraTexto(): string {
        return (
            `<atribuição-por-índice objeto=${this.objeto.paraTexto()} ` +
            `índice=${this.indice.paraTexto()} ` +
            `valor=${this.valor.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
