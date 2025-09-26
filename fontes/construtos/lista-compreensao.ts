import { SimboloInterface, VisitanteDeleguaInterface } from '../interfaces';
import { Construto } from './construto';

export class ListaCompreensao implements Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;

    variavelIteracao: SimboloInterface;
    referenciaVariavelIteracao: Construto;
    condicao: Construto;

    constructor(
        hashArquivo: number,
        linha: number,
        variavelIteracao: SimboloInterface,
        referenciaVariavelIteracao: Construto,
        condicao: Construto,
        tipo?: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.variavelIteracao = variavelIteracao;
        this.referenciaVariavelIteracao = referenciaVariavelIteracao;
        this.condicao = condicao;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoListaCompreensao(this);
    }
    paraTexto(): string {
        throw new Error('Method not implemented.');
    }
    
}