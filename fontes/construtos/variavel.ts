import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Variavel<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    simbolo: SimboloInterface<TTipoSimbolo>;
    tipo: string;
    idReferencia?: string;

    constructor(
        hashArquivo: number,
        simbolo: SimboloInterface<TTipoSimbolo>,
        tipo: string = 'qualquer'
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<VariavelInterface> {
        return Promise.resolve(visitante.visitarExpressaoDeVariavel(this));
    }

    paraTexto(): string {
        return `<variável nome=${this.simbolo.lexema} tipo=${this.tipo} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
