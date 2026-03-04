import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Texto de documentação.
 */
export class TextoDocumentacao extends Declaracao {
    conteudo: string | string[];

    constructor(hashArquivo: number, linha: number, conteudo: string | string[]) {
        super(linha, hashArquivo);
        this.conteudo = conteudo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoTextoDocumentacao(this);
    }

    paraTexto(): string {
        return `<texto-documentação conteúdo=${this.conteudo} />`;
    }
}
