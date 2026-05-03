import { VisitanteComumInterface } from '../interfaces';
import { ComentarioComoConstruto } from './comentario-como-construto';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { Separador } from './separador';

export class Vetor implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    tipo?: string;

    valores: ConstrutoInterface[];

    constructor(hashArquivo: number, linha: number, valores: ConstrutoInterface[], tipo?: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.tipo = tipo;
        this.valores = valores;
    }

    /**
     * Retorna apenas os elementos de dados do vetor, excluindo nós sintáticos
     * (Separador, comentários) que podem aparecer entre os elementos.
     */
    get elementos(): ConstrutoInterface[] {
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
