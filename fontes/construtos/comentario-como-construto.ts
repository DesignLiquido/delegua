import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Diferentemente da declaração de comentário, este construto ocorre
 * dentro de expressões, como por exemplo, em especificação de elementos de um vetor.
 */
export class ComentarioComoConstruto implements Construto {
    linha: number;
    hashArquivo: number;
    conteudo: string | string[];
    multilinha: boolean;

    constructor(simboloComentario: SimboloInterface) {
        this.linha = simboloComentario.linha;
        this.hashArquivo = simboloComentario.hashArquivo;
        this.conteudo = simboloComentario.lexema || simboloComentario.literal || '';
        this.multilinha = simboloComentario.tipo === 'COMENTARIO_MULTILINHA';
    }

    aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoComentario(this));
    }

    paraTexto(): string {
        return `<comentário-como-construto conteúdo=${this.conteudo} />`;
    }
}
