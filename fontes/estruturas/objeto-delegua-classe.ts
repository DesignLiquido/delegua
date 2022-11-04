import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface } from '../interfaces';
import { DeleguaClasse } from './delegua-classe';

export class ObjetoDeleguaClasse {
    classe: DeleguaClasse;
    campos: any;

    constructor(criarClasse: any) {
        this.classe = criarClasse;
        this.campos = {};
    }

    get(simbolo: SimboloInterface): any {
        if (this.campos.hasOwnProperty(simbolo.lexema)) {
            return this.campos[simbolo.lexema];
        }

        const metodo = this.classe.encontrarMetodo(simbolo.lexema);
        if (metodo) return metodo.definirInstancia(this);

        throw new ErroEmTempoDeExecucao(
            simbolo,
            'Método indefinido não recuperado.'
        );
    }

    set(simbolo: SimboloInterface, valor: any): void {
        this.campos[simbolo.lexema] = valor;
    }

    toString(): string {
        return '<Objeto ' + this.classe.nome + '>';
    }
}
