import { ArestaFluxograma } from './aresta-fluxograma';
import { VerticeFluxograma } from './vertice-fluxograma';

export class SubgrafoFuncao {
    nomeClasse: string;
    linhaDeclaracao: number;
    vertices: VerticeFluxograma[];
    arestaInicial: ArestaFluxograma;
    arestaFinal: ArestaFluxograma;

    constructor(
        nomeClasse: string,
        linhaDeclaracao: number,
        arestaInicial: ArestaFluxograma,
        arestaFinal: ArestaFluxograma
    ) {
        this.nomeClasse = nomeClasse;
        this.linhaDeclaracao = linhaDeclaracao;
        this.vertices = [];
        this.arestaInicial = arestaInicial;
        this.arestaFinal = arestaFinal;
    }
}
