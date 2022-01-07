import { ErroEmTempoDeExecucao } from "./erro";

export class Ambiente {
    enclosing: any;
    valores: any;

    constructor(enclosing?: any) {
        this.enclosing = enclosing || null;
        this.valores = {};
    }

    definirVariavel(nomeVariavel: any, valor: any) {
        this.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia: any, nome: any, valor: any) {
        this.ancestor(distancia).valores[nome.lexeme] = valor;
    }

    atribuirVariavel(nome: any, valor: any) {
        if (this.valores[nome.lexeme] !== undefined) {
            this.valores[nome.lexeme] = valor;
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.atribuirVariavel(nome, valor);
            return;
        }

        throw new ErroEmTempoDeExecucao(nome, "Variável não definida '" + nome.lexeme + "'.");
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

    obterVariavel(simbolo: any) {
        if (this.valores[simbolo.lexeme] !== undefined) {
            return this.valores[simbolo.lexeme];
        }

        if (this.enclosing !== null) return this.enclosing.obterVariavel(simbolo);

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexeme + "'.");
    }
};