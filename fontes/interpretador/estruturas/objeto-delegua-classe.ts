import { ErroEmTempoDeExecucao } from '../../excecoes';
import { SimboloInterface } from '../../interfaces';
import { DescritorTipoClasse } from './descritor-tipo-classe';

/**
 * A instância de uma classe em Delégua.
 * Possui propriedades e métodos. Propriedades são definidas localmente.
 * Métodos são extraídos do descritor da classe, uma `DeleguaClasse`.
 */
export class ObjetoDeleguaClasse {
    classe: DescritorTipoClasse;
    propriedades: { [nome: string]: any };

    constructor(classe: DescritorTipoClasse) {
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

    obterMetodo(nomeMetodo: string): any {
        const metodo = this.classe.encontrarMetodo(nomeMetodo);
        if (metodo) return metodo.funcaoPorMetodoDeClasse(this);

        throw new ErroEmTempoDeExecucao(null, `Método "${nomeMetodo}" não existe neste objeto.`);
    }

    obterPropriedade(nomePropriedade: string): any {
        if (this.propriedades.hasOwnProperty(nomePropriedade)) {
            return this.propriedades[nomePropriedade];
        }

        throw new ErroEmTempoDeExecucao(null, `Propriedade "${nomePropriedade}" não existe neste objeto.`);
    }

    definir(simbolo: SimboloInterface, valor: any): void {
        if (this.classe.dialetoRequerDeclaracaoPropriedades && !this.propriedades.hasOwnProperty(simbolo.lexema)) {
            throw new ErroEmTempoDeExecucao(
                simbolo,
                `Propriedade "${simbolo.lexema}" não foi definida na declaração da classe ${this.classe.simboloOriginal.lexema}.`
            );
        }

        this.propriedades[simbolo.lexema] = valor;
    }

    /**
     * Método utilizado por Delégua para inspecionar este objeto em depuração.
     * @returns {string} A representação do objeto como texto.
     */
    paraTexto(): string {
        return '<Objeto ' + this.classe.simboloOriginal.lexema + '>';
    }

    /**
     * Método utilizado pelo VSCode para representar este objeto quando impresso.
     * @returns {string} A representação do objeto como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
