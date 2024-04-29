import { VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Como construto, um comentário é normalmente útil para formatadores de código.
 * Pode ser que em alguns casos ter um conteúdo dentro de um comentário possa ser
 * importante. Por exemplo, uma ferramenta de testes ou de auto-documentação.
 */
export class Comentario implements Construto {
    linha: number;
    hashArquivo: number;
    conteudo: string | string[];
    multilinha: boolean;

    constructor(hashArquivo: number, linha: number, conteudo: string | string[], multilinha: boolean) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.conteudo = conteudo;
        this.multilinha = multilinha;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoComentario(this);
    }
}
