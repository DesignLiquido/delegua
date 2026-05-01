import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class Separador implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    conteudo: string;

    constructor(simboloSeparador: SimboloInterface) {
        this.linha = simboloSeparador.linha;
        this.hashArquivo = simboloSeparador.hashArquivo;
        this.conteudo = simboloSeparador.lexema || simboloSeparador.literal || '';
    }

    aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoSeparador(this));
    }

    paraTexto(): string {
        return `<separador símbolo=${this.conteudo} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
