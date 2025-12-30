import { ArestaFluxograma } from "./aresta-fluxograma";
import { SubgrafoMetodo } from "./subgrafo-metodo";
import { VerticeFluxograma } from "./vertice-fluxograma";

export class SubgrafoClasse {
    nomeClasse: string;
    linha: number;
    superClasse?: string;
    vertices: VerticeFluxograma[];
    construtor?: SubgrafoMetodo;
    metodos: SubgrafoMetodo[];
    arestaInicial: ArestaFluxograma;
    arestaFinal: ArestaFluxograma;

    constructor(
        nomeClasse: string,
        linha: number,
        arestaInicial: ArestaFluxograma,
        arestaFinal: ArestaFluxograma,
        superClasse?: string
    ) {
        this.nomeClasse = nomeClasse;
        this.linha = linha;
        this.superClasse = superClasse;
        this.vertices = [];
        this.metodos = [];
        this.arestaInicial = arestaInicial;
        this.arestaFinal = arestaFinal;
    }

    paraTexto(): string {
        let resultado = `    subgraph ${this.nomeClasse}["Classe: ${this.nomeClasse}`;

        if (this.superClasse) {
            resultado += ` (estende ${this.superClasse})`;
        }

        resultado += `"]\n`;

        // Renderiza o construtor se existir
        if (this.construtor) {
            resultado += `        subgraph construtor_${this.nomeClasse}["Construtor"]\n`;
            resultado += `            direction TB\n`;

            for (const vertice of this.construtor.vertices) {
                const textoVertice = vertice.paraTexto();
                resultado += '    ' + textoVertice;
            }

            resultado += `        end\n`;
        }

        // Renderiza os métodos
        for (const metodo of this.metodos) {
            resultado += `        subgraph ${metodo.nomeMetodo}_${this.nomeClasse}["Método: ${metodo.nomeMetodo}()"]\n`;
            resultado += `            direction TB\n`;

            for (const vertice of metodo.vertices) {
                const textoVertice = vertice.paraTexto();
                resultado += '    ' + textoVertice;
            }

            resultado += `        end\n`;
        }

        resultado += `    end\n`;
        return resultado;
    }
}