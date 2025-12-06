export class DiagramaClasse {
    nome: string;
    superClasse?: string;
    metodos: { nome: string; parametros: string[]; tipoRetorno?: string }[];
    propriedades: { nome: string; tipo?: string }[];

    constructor(nome: string, superClasse?: string) {
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = [];
        this.propriedades = [];
    }

    paraTexto(): string {
        let resultado = `    classe ${this.nome} {\n`;

        // Adiciona propriedades (se houver)
        for (const prop of this.propriedades) {
            const tipo = prop.tipo ? `: ${prop.tipo}` : '';
            resultado += `        +${prop.nome}${tipo}\n`;
        }

        // Adiciona métodos
        for (const metodo of this.metodos) {
            const params = metodo.parametros.join(', ');
            const retorno = metodo.tipoRetorno ? `: ${metodo.tipoRetorno}` : '';
            resultado += `        +${metodo.nome}(${params})${retorno}\n`;
        }

        resultado += `    }\n`;

        // Adiciona herança se houver
        if (this.superClasse) {
            resultado += `    ${this.superClasse} <|-- ${this.nome}\n`;
        }

        return resultado;
    }
}