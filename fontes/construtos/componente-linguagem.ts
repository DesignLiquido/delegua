import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Construto especial utilizado para especificar o tipo de
 * estruturas reservadas da linguagem.
 */
export class ComponenteLinguagem implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo: 'ComponenteLinguagem';

    constructor(hashArquivo: number, simbolo: SimboloInterface) {
        this.hashArquivo = hashArquivo;
        this.linha = simbolo.linha;
        this.valor = simbolo.lexema;
    }

    aceitar(visitante: VisitanteComumInterface): Promise<any> {
        throw new Error('Um componente de linguagem não tem método de visita.');
    }

    paraTexto(): string {
        return `<componente-linguagem valor=${this.valor} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
