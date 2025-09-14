import { Bloco } from "../declaracoes";
import { VisitanteDeleguaInterface } from "../interfaces";
import { Construto } from "./construto";
import { Dupla } from "./tuplas";
import { Variavel } from "./variavel";

export class ParaCadaComoConstruto implements Construto {
    linha: number;
    hashArquivo: number;
    variavelIteracao: Variavel | Dupla;
    vetor: Construto;
    corpo: Bloco;
    posicaoAtual: number;

    constructor(
        hashArquivo: number,
        linha: number,
        variavelIteracao: Variavel | Dupla,
        vetor: Construto,
        corpo: Bloco
    ) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.variavelIteracao = variavelIteracao;
        this.vetor = vetor;
        this.corpo = corpo;
        this.posicaoAtual = 0;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoParaCada(this);
    }

    paraTexto(): string {
        return `<para-cada-como-construto />`;
    }
}
