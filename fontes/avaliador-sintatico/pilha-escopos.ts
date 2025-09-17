import { FuncaoDeclaracao } from '../declaracoes';
import { PilhaInterface, VariavelInterface } from '../interfaces';
import { InformacaoEscopo } from './informacao-escopo';
import { InformacaoElementoSintatico as InformacaoElementoSintatico } from '../informacao-elemento-sintatico';

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

    obterBibliotecaGlobal(nome: string) {
        return this.pilha[0].elementosSintaticos[nome];
    }

    obterTipoVariavelPorNome(nome: string): string {
        for (let i = 1; i <= this.pilha.length; i++) {
            const informacaoEscopo = this.pilha[this.pilha.length - i];
            if (informacaoEscopo.elementosSintaticos[nome] !== undefined) {
                return informacaoEscopo.elementosSintaticos[nome].tipo;
            }
        }

        throw new Error("Variável não definida: '" + nome + "'.");
    }

    definirInformacoesVariavel(nomeVariavel: string, informacoes: InformacaoElementoSintatico) {
        const topoDaPilha = this.topoDaPilha();
        topoDaPilha.elementosSintaticos[nomeVariavel] = informacoes;
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
