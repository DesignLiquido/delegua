import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Decorador implements Construto {
    linha: number;
    hashArquivo: number;
    nome: string;
    parametros?: any;

    constructor(hashArquivo: number, linha: number, nome: string, parametros?: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.nome = nome;
        this.parametros = parametros;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(
            new Error(
                'Este método não deveria ser chamado.'
            )
        );
    }
}
