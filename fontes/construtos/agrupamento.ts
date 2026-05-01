import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Um agrupamento é essencialmente uma expressão qualquer dentro de parênteses.
 * Usado para resolver precedência de operadores. Por exemplo:
 * `(2 + 2) * 5`, `(2 + 2)` é um agrupamento cuja expressão é `2 + 2`.
 */
export class Agrupamento implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    expressao: ConstrutoInterface;
    tipo: string;

    constructor(hashArquivo: number, linha: number, expressao: ConstrutoInterface) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.expressao = expressao;
        this.tipo = expressao.tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAgrupamento(this);
    }

    paraTexto(): string {
        return `<agrupamento subExpressão=${this.expressao.paraTexto()} tipo=${this.tipo} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
