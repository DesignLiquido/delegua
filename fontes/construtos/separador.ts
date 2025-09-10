import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Separador implements Construto {
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
}
