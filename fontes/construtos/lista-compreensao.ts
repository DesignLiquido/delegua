import { Para } from '../declaracoes';
import { SimboloInterface, VisitanteDeleguaInterface } from '../interfaces';
import { Construto } from './construto';
import { ParaCadaComoConstruto } from './para-cada-como-construto';

export class ListaCompreensao implements Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;

    variavelIteracao: SimboloInterface;
    referenciaVariavelIteracao: Construto;
    paraCada: ParaCadaComoConstruto; 

    constructor(
        hashArquivo: number,
        linha: number,
        variavelIteracao: SimboloInterface,
        referenciaVariavelIteracao: Construto,
        paraCada: ParaCadaComoConstruto,
        tipo?: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.variavelIteracao = variavelIteracao;
        this.referenciaVariavelIteracao = referenciaVariavelIteracao;
        this.paraCada = paraCada;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoListaCompreensao(this);
    }
    paraTexto(): string {
        throw new Error('Method not implemented.');
    }
    
}