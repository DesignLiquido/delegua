import { DeleguaFuncao } from '../estruturas';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface, VariavelInterface } from '../interfaces';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { Simbolo } from '../lexador';
import { inferirTipoVariavel } from './inferenciador';

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

    elementos(): number {
        return this.pilha.length;
    }

    naPosicao(posicao: number): EscopoExecucao {
        return this.pilha[posicao];
    }

    topoDaPilha(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }

    definirVariavel(nomeVariavel: string, valor: any) {
        this.pilha[this.pilha.length - 1].ambiente.valores[nomeVariavel] = {
            valor,
            tipo: inferirTipoVariavel(valor),
        };
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const ambienteAncestral =
            this.pilha[this.pilha.length - distancia].ambiente;
        ambienteAncestral.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor),
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                ambiente.valores[simbolo.lexema] = {
                    valor,
                    tipo: inferirTipoVariavel(valor),
                };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            "Variável não definida '" + simbolo.lexema + "'."
        );
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const ambienteAncestral =
            this.pilha[this.pilha.length - distancia].ambiente;
        return ambienteAncestral.valores[nome];
    }

    obterVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
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
    obterTodasVariaveis(
        todasVariaveis: VariavelInterface[] = []
    ): any[] {
        for (let i = 1; i <= this.pilha.length - 1; i++) {
            const valoresAmbiente = this.pilha[this.pilha.length - i].ambiente.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(
                valoresAmbiente
            ).map(
                (chaveEValor, indice) =>
                    ({ nome: chaveEValor[0], valor: chaveEValor[1].valor, tipo: chaveEValor[1].tipo })
            );
            todasVariaveis = todasVariaveis.concat(vetorObjeto);
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
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DeleguaFuncao) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }
}
