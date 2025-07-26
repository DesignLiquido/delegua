export class InformacaoVariavelOuConstante {
    nome: string;
    tipo: string;
    obrigatorio: boolean;
    argumentos: InformacaoVariavelOuConstante[] = [];
    documentacao?: string;

    constructor(nome: string, tipo: string, obrigatorio: boolean = true, argumentos: InformacaoVariavelOuConstante[] = []) {
        this.nome = nome;
        this.tipo = tipo;
        this.obrigatorio = obrigatorio;
        this.argumentos = argumentos;
    }

    toString(): string {
        return `<informação-variável-ou-constante nome=${this.nome}, tipo=${this.tipo}, obrigatorio=${this.obrigatorio ? 'verdadeiro' : 'falso'} argumentos=${this.argumentos.map((arg) => arg.toString()).join(', ')}>`;
    }
}
