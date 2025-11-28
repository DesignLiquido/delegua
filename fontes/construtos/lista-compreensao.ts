import { VisitanteDeleguaInterface } from '../interfaces';
import { Construto } from './construto';
import { ParaCadaComoConstruto } from './para-cada-como-construto';

export class ListaCompreensao implements Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;

    expressaoRetorno: Construto;
    referenciaVariavelIteracao: Construto;
    paraCada: ParaCadaComoConstruto;

    constructor(
        hashArquivo: number,
        linha: number,
        expressaoRetorno: Construto,
        referenciaVariavelIteracao: Construto,
        paraCada: ParaCadaComoConstruto,
        tipo?: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.expressaoRetorno = expressaoRetorno;
        this.referenciaVariavelIteracao = referenciaVariavelIteracao;
        this.paraCada = paraCada;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoListaCompreensao(this);
    }

    paraTexto(): string {
        return `<lista-compreensão />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
