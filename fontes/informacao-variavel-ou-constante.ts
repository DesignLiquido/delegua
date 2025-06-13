export class InformacaoVariavelOuConstante {
    nome: string;
    tipo: string;
    argumentos: InformacaoVariavelOuConstante[] = [];

    constructor(nome: string, tipo: string, argumentos: InformacaoVariavelOuConstante[] = []) {
        this.nome = nome;
        this.tipo = tipo;
        this.argumentos = argumentos;
    }

    toString(): string {
        return `InformacaoVariavelOuConstante(nome=${this.nome}, tipo=${this.tipo}, argumentos=${this.argumentos.map(arg => arg.toString()).join(', ')})`;
    }
}
