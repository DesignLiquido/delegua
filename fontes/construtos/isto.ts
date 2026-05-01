import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Isto<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    simboloChave: SimboloInterface<TTipoSimbolo>;
    tipo: string = 'qualquer';

    constructor(hashArquivo: number, linha: number, simboloChave?: SimboloInterface<TTipoSimbolo>) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.simboloChave = simboloChave;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoIsto(this));
    }

    paraTexto(): string {
        return `<isto />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
