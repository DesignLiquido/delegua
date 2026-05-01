import { VisitanteDeleguaInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { ParaCadaComoConstruto } from './para-cada-como-construto';

export class ListaCompreensao implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;

    expressaoRetorno: ConstrutoInterface;
    referenciaVariavelIteracao: ConstrutoInterface;
    paraCada: ParaCadaComoConstruto;

    constructor(
        hashArquivo: number,
        linha: number,
        expressaoRetorno: ConstrutoInterface,
        referenciaVariavelIteracao: ConstrutoInterface,
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
