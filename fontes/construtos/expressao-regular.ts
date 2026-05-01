import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class ExpressaoRegular<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor: any;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(hashArquivo: number, simbolo: SimboloInterface<TTipoSimbolo>, valor: any) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoExpressaoRegular(this));
    }

    paraTexto(): string {
        return `<expressão-regular valor=${this.valor} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
