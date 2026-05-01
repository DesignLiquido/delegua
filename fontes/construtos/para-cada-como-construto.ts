import { Bloco } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { ParaCadaInterface } from '../interfaces/delegua';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { Dupla } from './tuplas';
import { Variavel } from './variavel';

export class ParaCadaComoConstruto implements ConstrutoInterface, ParaCadaInterface {
    linha: number;
    hashArquivo: number;
    variavelIteracao: Variavel | Dupla;
    vetorOuDicionario: ConstrutoInterface;
    corpo: Bloco;
    posicaoAtual: number;

    constructor(
        hashArquivo: number,
        linha: number,
        variavelIteracao: Variavel | Dupla,
        vetorOuDicionario: ConstrutoInterface,
        corpo: Bloco
    ) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.variavelIteracao = variavelIteracao;
        this.vetorOuDicionario = vetorOuDicionario;
        this.corpo = corpo;
        this.posicaoAtual = 0;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoParaCada(this);
    }

    paraTexto(): string {
        return `<para-cada-como-construto />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
