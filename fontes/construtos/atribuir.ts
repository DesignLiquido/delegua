import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Atribuir implements Construto {
    linha: number;
    hashArquivo: number;

    simbolo: SimboloInterface;
    valor: any;

    constructor(hashArquivo: number, simbolo: SimboloInterface, valor: any) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.valor = valor;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDeAtribuicao(this);
    }
}
