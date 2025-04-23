import { FuncaoDeclaracao } from "../declaracoes";
import { PilhaInterface, VariavelInterface } from "../interfaces";
import { InformacaoEscopo } from "./informacao-escopo";

export class PilhaEscopos implements PilhaInterface<InformacaoEscopo> {
    pilha: InformacaoEscopo[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: InformacaoEscopo): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    topoDaPilha(): InformacaoEscopo {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): InformacaoEscopo {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }
 
    obterTipoVariavelPorNome(nome: string): string {
        for (let i = 1; i <= this.pilha.length; i++) {
            const informacaoEscopo = this.pilha[this.pilha.length - i];
            if (informacaoEscopo.variaveisEConstantes[nome] !== undefined) {
                return informacaoEscopo.variaveisEConstantes[nome];
            }
        }

        throw new Error(
            "Variável não definida: '" + nome + "'."
        );
    }

    definirTipoVariavel(nomeVariavel: string, tipo: string) {
        const topoDaPilha = this.topoDaPilha();
        topoDaPilha.variaveisEConstantes[nomeVariavel] = tipo;
    }

    registrarReferenciaFuncao(nome: string, definicao: FuncaoDeclaracao) {
        const topoDaPilha = this.topoDaPilha();
        topoDaPilha.referenciasFuncoes[nome] = definicao;
    }

    obterReferenciaFuncao(nome: string) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const informacaoEscopo = this.pilha[this.pilha.length - i];
            if (informacaoEscopo.referenciasFuncoes[nome] !== undefined) {
                return informacaoEscopo.referenciasFuncoes[nome];
            }
        }

        return null;
    }
}