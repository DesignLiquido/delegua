import { SimboloInterface } from '../interfaces';
import { InterpretadorInterfacePotigol } from '../interfaces/interpretador-interface-potigol';
import { Construto } from './construto';


export class QualTipo implements Construto {
    linha: number;
    hashArquivo: number;
    valor: any;

    simbolo: SimboloInterface;

    constructor(hashArquivo: number, simbolo: SimboloInterface, valor: any) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: InterpretadorInterfacePotigol): Promise<string> {
        return Promise.resolve(visitante.visitarExpressaoQualTipo(this));
    }
}

