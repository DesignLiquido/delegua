import { ArestaFluxograma } from "./aresta-fluxograma";
import { VerticeFluxograma } from "./vertice-fluxograma";

export class SubgrafoMetodo {
    nomeMetodo: string;
    nomeClasse: string;
    linha: number;
    vertices: VerticeFluxograma[];
    arestaInicial: ArestaFluxograma;
    arestaFinal: ArestaFluxograma;
    ehConstrutor: boolean;

    constructor(
        nomeMetodo: string,
        nomeClasse: string,
        linha: number,
        arestaInicial: ArestaFluxograma,
        arestaFinal: ArestaFluxograma,
        ehConstrutor: boolean = false
    ) {
        this.nomeMetodo = nomeMetodo;
        this.nomeClasse = nomeClasse;
        this.linha = linha;
        this.vertices = [];
        this.arestaInicial = arestaInicial;
        this.arestaFinal = arestaFinal;
        this.ehConstrutor = ehConstrutor;
    }
}
