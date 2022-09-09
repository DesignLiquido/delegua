import { DeleguaFuncao } from '../estruturas';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface, VariavelInterface } from '../interfaces';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { Simbolo } from '../lexador';

export class PilhaEscoposExecucao implements PilhaEscoposExecucaoInterface {
    pilha: EscopoExecucao[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: EscopoExecucao): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    elementos() {
        return this.pilha.length;
    }

    naPosicao(posicao: number): EscopoExecucao {
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

    inferirTipoVariavel(variavel: string | number | Array<any> | boolean | null | undefined) {
        const tipo = typeof variavel;
        switch (tipo) {
            case 'string':
                return "texto";
            case 'number':
                return "número";
            case "bigint":
                return "longo";
            case "boolean":
                return "lógico";
            case "undefined":
                return "nulo"
            case "object":
                return "dicionário";
            case "function":
                return "função";
            case "symbol":
                return "símbolo";
        }
    }

    definirVariavel(nomeVariavel: string, valor: any) {
        this.pilha[this.pilha.length - 1].ambiente.valores[nomeVariavel] = { valor, tipo: this.inferirTipoVariavel(valor) };
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        ambienteAncestral.valores[simbolo.lexema] = { valor, tipo: this.inferirTipoVariavel(valor) };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                ambiente.valores[simbolo.lexema] = { valor, tipo: this.inferirTipoVariavel(valor) };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            "Variável não definida '" + simbolo.lexema + "'."
        );
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        return ambienteAncestral.valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length-i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                return ambiente.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            "Variável não definida: '" + simbolo.lexema + "'."
        );
    }

    obterVariavelPorNome(nome: string): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[nome] !== undefined) {
                return ambiente.valores[nome];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', nome, nome, -1, -1),
            "Variável não definida: '" + nome + "'."
        );
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: VariavelInterface[] = []): VariavelInterface[] {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            // TODO: Testar se isso faz sentido.
            const vetorObjeto: VariavelInterface[] = Object.entries(ambiente).map((chave, valor) => ({ valor: valor, tipo: 'texto' } as VariavelInterface));
            todasVariaveis.concat(vetorObjeto)
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console.
     */
    obterTodasDeleguaFuncao() {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length - 1].ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            if (corpo instanceof DeleguaFuncao) {
                retorno[nome] = corpo;
            }
        }

        return retorno;
    }
}
