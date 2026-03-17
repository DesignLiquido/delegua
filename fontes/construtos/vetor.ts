import { VisitanteComumInterface } from '../interfaces';
import { ComentarioComoConstruto } from './comentario-como-construto';
import { Construto } from './construto';
import { Separador } from './separador';

export class Vetor implements Construto {
    linha: number;
    hashArquivo: number;
    tipo?: string;

    valores: Construto[];

    constructor(hashArquivo: number, linha: number, valores: Construto[], tipo?: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.tipo = tipo;
        this.valores = valores;
    }

    /**
     * Retorna apenas os elementos de dados do vetor, excluindo nós sintáticos
     * (Separador, comentários) que podem aparecer entre os elementos.
     */
    get elementos(): Construto[] {
        return this.valores.filter(
            (v) => v.constructor !== Separador && v.constructor !== ComentarioComoConstruto
        );
    }

    get tamanho(): number {
        return this.elementos.length;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoVetor(this);
    }

    paraTexto(): string {
        return `<vetor tipo=${this.tipo} valores=${this.valores.reduce((anterior, atual) => (anterior += atual.paraTexto()), '')} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
