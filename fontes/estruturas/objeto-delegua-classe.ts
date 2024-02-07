import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface } from '../interfaces';
import { DeleguaClasse } from './delegua-classe';

/**
 * A instância de uma classe em Delégua.
 * Possui propriedades e métodos. Propriedades são definidas localmente.
 * Métodos são extraídos da definição de classe.
 */
export class ObjetoDeleguaClasse {
    classe: DeleguaClasse;
    propriedades: {[nome: string]: any};

    constructor(classe: DeleguaClasse) {
        this.classe = classe;
        this.propriedades = {};
        if (this.classe.superClasse) {
            for (let propriedade of this.classe.superClasse.propriedades) {
                this.propriedades[propriedade.nome.lexema] = undefined;
            }
        }

        for (let propriedade of classe.propriedades) {
            this.propriedades[propriedade.nome.lexema] = undefined;
        }
    }

    obter(simbolo: SimboloInterface): any {
        if (this.propriedades.hasOwnProperty(simbolo.lexema)) {
            return this.propriedades[simbolo.lexema];
        }

        const metodo = this.classe.encontrarMetodo(simbolo.lexema);
        if (metodo) return metodo.funcaoPorMetodoDeClasse(this);

        throw new ErroEmTempoDeExecucao(simbolo, `Método ou propriedade "${simbolo.lexema}" não existe neste objeto.`);
    }

    definir(simbolo: SimboloInterface, valor: any): void {
        if (this.classe.dialetoRequerDeclaracaoPropriedades && !this.propriedades.hasOwnProperty(simbolo.lexema)) {
            throw new ErroEmTempoDeExecucao(simbolo, `Propriedade "${simbolo.lexema}" não foi definida na declaração da classe ${this.classe.simboloOriginal.lexema}.`);
        }

        this.propriedades[simbolo.lexema] = valor;
    }

    paraTexto(): string {
        return '<Objeto ' + this.classe.simboloOriginal.lexema + '>';
    }
}
