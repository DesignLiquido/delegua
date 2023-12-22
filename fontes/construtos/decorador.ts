import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Decorador implements Construto {
    linha: number;
    hashArquivo: number;

    nome: string;

    constructor(hashArquivo: number, linha: number, nome: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.nome = nome;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(
            new Error(
                'Este método não deveria ser chamado.'
            )
        );
    }
}
