import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Como declaração, um comentário é normalmente útil para formatadores de código.
 * Pode ser que em alguns casos ter um conteúdo dentro de um comentário possa ser
 * importante. Por exemplo, uma ferramenta de testes ou de auto-documentação.
 */
export class Comentario extends Declaracao {
    conteudo: string | string[];
    multilinha: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        conteudo: string | string[],
        multilinha: boolean
    ) {
        super(linha, hashArquivo);
        this.conteudo = conteudo;
        this.multilinha = multilinha;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoComentario(this);
    }

    paraTexto(): string {
        return `<comentário conteúdo=${this.conteudo} multilinha=${this.multilinha ? 'Sim' : 'Não'} />`;
    }
}
