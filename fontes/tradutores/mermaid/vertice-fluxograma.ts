import { ArestaFluxograma } from "./aresta-fluxograma";

export class VerticeFluxograma {
    origem: ArestaFluxograma;
    destino: ArestaFluxograma;
    texto?: string;

    constructor(origem: ArestaFluxograma, destino: ArestaFluxograma, texto?: string) {
        this.origem = origem;
        this.destino = destino;
        this.texto = texto;
    }

    paraTexto(): string {
        const seta = this.texto ? `-->|${this.texto}|` : '-->';
        return `    ${this.origem.texto}${seta}${this.destino.texto};\n`;
    }
}
