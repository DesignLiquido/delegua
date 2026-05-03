import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * O construto de constante.
 */
export class Constante<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    simbolo: SimboloInterface<TTipoSimbolo>;
    idReferencia?: string;

    constructor(hashArquivo: number, simbolo: SimboloInterface<TTipoSimbolo>) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoDeVariavel(this));
    }

    paraTexto(): string {
        return `<constante nome=${this.simbolo.lexema} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
