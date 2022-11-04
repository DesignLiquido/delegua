import { Chamavel } from './chamavel';

export class DeleguaModulo {
    nome: string;
    componentes: { [nome: string]: Chamavel };

    constructor(nome?: string) {
        this.nome = nome || '';
        this.componentes = {};
    }

    toString(): string {
        return this.nome ? `<modulo ${this.nome}>` : '<modulo>';
    }
}
