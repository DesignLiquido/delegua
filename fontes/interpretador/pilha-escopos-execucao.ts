import { DeleguaFuncao } from '../estruturas';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { PilhaInterface, SimboloInterface } from '../interfaces';
import { EscopoExecucao } from '../interfaces/escopo-execucao';

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

    elementos() {
        return this.pilha.length;
    }

    naPosicao(posicao: number) {
        return this.pilha[posicao];
    }

    topoDaPilha() {
        if (this.eVazio())
            throw new Error("Pilha vazia.");
        return this.pilha[this.pilha.length-1];
    }

    removerUltimo() {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }

    definirVariavel(nomeVariavel: string, valor: any) {
        this.pilha[this.pilha.length-1].ambiente.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any) {
        const ambienteAncestral = this.pilha[this.pilha.length-distancia].ambiente;
        ambienteAncestral.valores[simbolo.lexema] = valor;
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length-i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                ambiente.valores[simbolo.lexema] = valor;
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            "Variável não definida '" + simbolo.lexema + "'."
        );
    }

    obterVariavelEm(distancia: number, nome: any) {
        const ambienteAncestral = this.pilha[this.pilha.length-distancia].ambiente;
        return ambienteAncestral.valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length-i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                return ambiente.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            "Variável não definida '" + simbolo.lexema + "'."
        );
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: any[] = []) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha.at(-i).ambiente;
            todasVariaveis.push(ambiente.valores)
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console.
     */
    obterTodasDeleguaFuncao() {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length-1].ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            if (corpo instanceof DeleguaFuncao) {
                retorno[nome] = corpo;
            }
        }

        return retorno;
    }
}
