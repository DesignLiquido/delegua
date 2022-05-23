import { DeleguaFuncao } from "../estruturas";
import { ErroEmTempoDeExecucao } from "../excecoes";
import { PilhaInterface, SimboloInterface } from "../interfaces";
import { EscopoExecucao } from "../interfaces/escopo-execucao";

export class PilhaEscoposExecucao implements PilhaInterface<EscopoExecucao> {
    pilha: EscopoExecucao[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: EscopoExecucao) {
        this.pilha.push(item);
    }

    eVazio() {
        return this.pilha.length === 0;
    }

    topoDaPilha() {
        if (this.eVazio())
            throw new Error("Pilha vazia.");
        return this.pilha.at(-1);
    }

    removerUltimo() {
        if (this.eVazio())
            throw new Error("Pilha vazia.");
        return this.pilha.pop();
    }

    definirVariavel(nomeVariavel: string, valor: any) {
        this.pilha.at(-1).ambiente.valores[nomeVariavel] = valor;
    }

    ambienteAncestral(distancia: number) {
        return this.pilha.at(-distancia).ambiente;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any) {
        this.ambienteAncestral(distancia).valores[simbolo.lexema] = valor;
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha.at(-i).ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                ambiente.valores[simbolo.lexema] = valor;
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterVariavelEm(distancia: number, nome: any) {
        return this.ambienteAncestral(distancia).valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha.at(-i).ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                return ambiente.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    /**
     * Obtém todas as definições de funções feitas ou por código-fonte, ou pelo desenvolvedor
     * em console.
     */
     obterTodasDeleguaFuncao() {
        const retorno = {};
        const ambiente = this.pilha.at(-1).ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            if (corpo instanceof DeleguaFuncao) {
                retorno[nome] = corpo;
            }
        }

        return retorno;
    }
}
