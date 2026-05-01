import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Um decorador é um construto especial que, em código, existe antes de uma declaração, e
 * na avaliação sintática, é colocado juntamente com a próxima declaração.
 */
export class ReferenciaBibliotecaGlobal implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    nome: string;

    constructor(hashArquivo: number, linha: number, nome: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.nome = nome;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }

    paraTexto(): string {
        return `<referência-biblioteca-global nome=${this.nome} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
