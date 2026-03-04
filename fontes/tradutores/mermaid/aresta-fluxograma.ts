import { Declaracao } from '../../declaracoes';

export class ArestaFluxograma {
    declaracao: Declaracao;
    texto: string;

    constructor(declaracao: Declaracao, texto: string) {
        this.declaracao = declaracao;
        this.texto = texto;
    }
}
