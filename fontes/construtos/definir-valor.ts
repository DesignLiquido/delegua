import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

export class DefinirValor implements Construto {
    linha: number;
    hashArquivo?: number;

    objeto: any;
    nome: any;
    valor: any;

    constructor(
        hashArquivo: number,
        linha: number,
        objeto: any,
        nome: any,
        valor: any
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoDefinirValor(this);
    }
}
