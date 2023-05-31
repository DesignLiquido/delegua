import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface } from '../interfaces';
import { DeleguaClasse } from './delegua-classe';

export class ObjetoDeleguaClasse {
    classe: DeleguaClasse;
    campos: any;

    constructor(classe: any) {
        this.classe = classe;
        this.campos = {};
    }

    obter(simbolo: SimboloInterface): any {
        if (this.campos.hasOwnProperty(simbolo.lexema)) {
            return this.campos[simbolo.lexema];
        }

        const metodo = this.classe.encontrarMetodo(simbolo.lexema);
        if (metodo) return metodo.funcaoPorMetodoDeClasse(this);

        throw new ErroEmTempoDeExecucao(simbolo, 'Método indefinido não recuperado.');
    }

    definir(simbolo: SimboloInterface, valor: any): void {
        this.campos[simbolo.lexema] = valor;
    }

    toString(): string {
        return '<Objeto ' + this.classe.nome + '>';
    }
}
