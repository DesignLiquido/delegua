import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

export class AtribuicaoSobrescrita implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: any;
    valor: any;
    indice: any;

    constructor(hashArquivo: number, linha: number, objeto: any, indice: any, valor: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoAtribuicaoSobrescrita(this);
    }
}
