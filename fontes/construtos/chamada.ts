import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { uuidv4 } from '../geracao-identificadores';

/**
 * Chamada de funções, métodos, etc.
 */
export class Chamada implements ConstrutoInterface {
    id: string;
    linha: number;
    hashArquivo: number;

    entidadeChamada: ConstrutoInterface;
    argumentos: ConstrutoInterface[];
    tipo?: string;

    constructor(hashArquivo: number, entidadeChamada: ConstrutoInterface, argumentos: ConstrutoInterface[]) {
        this.id = uuidv4();
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeChamada(this);
    }

    paraTexto(): string {
        let argumentos = '';
        for (let indice = 0; indice < this.argumentos.length; indice++) {
            argumentos += this.argumentos[indice].paraTexto();
        }

        return `<chamada entidadeChamada=${this.entidadeChamada.paraTexto()} argumentos=[${argumentos}] />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
