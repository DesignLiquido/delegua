import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Um decorador é um construto especial que, em código, existe antes de uma declaração, e
 * na avaliação sintática, é colocado juntamente com a próxima declaração.
 */
export class Decorador implements Construto {
    linha: number;
    hashArquivo: number;
    nome: string;
    atributos: { [key: string]: any };

    constructor(
        hashArquivo: number,
        linha: number,
        nome: string,
        atributos: { [key: string]: any }
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.nome = nome;
        this.atributos = atributos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }

    paraTexto(): string {
        let atributos = '';

        for (const chave in this.atributos) {
            if (!Object.prototype.hasOwnProperty.call(this.atributos, chave)) {
                continue;
            }

            const valor = this.atributos[chave];
            const valorTexto =
                valor && typeof valor === 'object' && typeof valor.paraTexto === 'function'
                    ? valor.paraTexto()
                    : valor;

            atributos += `${chave}=${valorTexto} `;
        }

        if (atributos.length > 0) {
            return `<decorador nome=${this.nome} ${atributos.slice(0, -1)} />`;
        }

        return `<decorador nome=${this.nome} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
