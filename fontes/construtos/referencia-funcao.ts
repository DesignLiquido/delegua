import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class ReferenciaFuncao implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    simboloFuncao: SimboloInterface;
    tipo: string;
    idFuncao: string;

    constructor(
        hashArquivo: number,
        linha: number,
        simboloFuncao: SimboloInterface,
        tipo: string,
        idfuncao: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.simboloFuncao = simboloFuncao;
        this.tipo = tipo;
        this.idFuncao = idfuncao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarExpressaoReferenciaFuncao(this);
    }

    paraTexto(): string {
        return `<referência-função nome=${this.simboloFuncao.lexema} tipo=${this.tipo} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
