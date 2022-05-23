import { DeleguaFuncao } from "./estruturas";

export class Ambiente {
    valores: any;

    constructor() {
        this.valores = {};
    }

    /* definirVariavel(nomeVariavel: any, valor: any) {
        this.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia: any, simbolo: any, valor: any) {
        this.ancestor(distancia).valores[simbolo.lexema] = valor;
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        if (this.valores[simbolo.lexema] !== undefined) {
            this.valores[simbolo.lexema] = valor;
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.atribuirVariavel(simbolo, valor);
            return;
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    ancestor(distancia: any) {
        let ambiente = this;
        for (let i = 0; i < distancia; i++) {
            ambiente = ambiente.enclosing;
        }

        return ambiente;
    }

    obterVariavelEm(distancia: any, nome: any) {
        return this.ancestor(distancia).valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface) {
        if (this.valores[simbolo.lexema] !== undefined) {
            return this.valores[simbolo.lexema];
        }

        if (this.enclosing !== null) return this.enclosing.obterVariavel(simbolo);

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    } */

    /**
     * Obtém todas as definições de funções feitas ou por código-fonte, ou pelo desenvolvedor
     * em console.
     */
    /* obterTodasDeleguaFuncao() {
        const retorno = {};
        for (const [nome, corpo] of Object.entries(this.valores)) {
            if (corpo instanceof DeleguaFuncao) {
                retorno[nome] = corpo;
            }
        }

        return retorno;
    } */
};