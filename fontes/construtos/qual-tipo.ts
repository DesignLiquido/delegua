import { SimboloInterface } from '../interfaces';
import { InterpretadorInterfacePotigol } from '../interfaces/interpretador-interface-potigol';
import { Construto } from './construto';

export class QualTipo<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;
    valor: any;

    simbolo: SimboloInterface<TTipoSimbolo>;

    constructor(
        hashArquivo: number, 
        simbolo: SimboloInterface<TTipoSimbolo>, 
        valor: any
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: InterpretadorInterfacePotigol): Promise<string> {
        return Promise.resolve(visitante.visitarExpressaoQualTipo(this));
    }
}
