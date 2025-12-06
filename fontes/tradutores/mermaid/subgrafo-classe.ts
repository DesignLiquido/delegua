import { VerticeFluxograma } from "./vertice-fluxograma";

export class SubgrafoClasse {
    nomeClasse: string;
    linha: number;
    superClasse?: string;
    vertices: VerticeFluxograma[];
    metodos: { nome: string; vertices: VerticeFluxograma[] }[];

    constructor(nomeClasse: string, linha: number, superClasse?: string) {
        this.nomeClasse = nomeClasse;
        this.linha = linha;
        this.superClasse = superClasse;
        this.vertices = [];
        this.metodos = [];
    }

    paraTexto(): string {
        let resultado = `    subgraph Classe_${this.nomeClasse}_${this.linha}["Classe: ${this.nomeClasse}`;
        
        if (this.superClasse) {
            resultado += ` (estende ${this.superClasse})`;
        }
        
        resultado += `"]\n`;
        resultado += `        direction TB\n`;

        // Nó de início da classe
        resultado += `        ClasseInicio_${this.nomeClasse}_${this.linha}((Início da Classe))\n`;

        // Adiciona os métodos como sub-subgrafos
        for (const metodo of this.metodos) {
            resultado += `        subgraph Metodo_${metodo.nome}_${this.nomeClasse}_${this.linha}["Método: ${metodo.nome}"]\n`;
            resultado += `            direction TB\n`;
            
            for (const vertice of metodo.vertices) {
                // Adiciona indentação extra para vértices dentro do método
                const textoVertice = vertice.paraTexto().replace(/^ {4}/, '            ');
                resultado += textoVertice;
            }
            
            resultado += `        end\n`;
        }

        // Conecta o início da classe aos métodos
        if (this.metodos.length > 0) {
            const primeiroMetodo = this.metodos[0];
            if (primeiroMetodo.vertices.length > 0) {
                const primeiraAresta = primeiroMetodo.vertices[0].origem.texto;
                resultado += `        ClasseInicio_${this.nomeClasse}_${this.linha} --> ${primeiraAresta}\n`;
            }
        }

        resultado += `    end\n`;
        return resultado;
    }
}