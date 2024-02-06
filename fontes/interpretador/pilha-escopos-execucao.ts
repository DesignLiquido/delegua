import { DeleguaClasse, DeleguaFuncao } from '../estruturas';
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

    private converterValor(tipo: string, valor: any) {
        switch (tipo) {
            case 'inteiro':
                return parseInt(valor);
            case 'lógico':
                return Boolean(valor);
            case 'número':
                return Number(valor);
            case 'texto':
                return String(valor);
            default:
                return valor;
        }
    }

    definirConstante(nomeConstante: string, valor: any, subtipo?: string): void {
        const constante = this.pilha[this.pilha.length - 1].ambiente.valores[nomeConstante];
        let tipo;
        if (subtipo !== null && subtipo !== undefined) {
            tipo = subtipo;
        } else {
            tipo = constante && constante.hasOwnProperty('tipo') ? constante.tipo : inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipo,
            subtipo: undefined,
            imutavel: true,
        };

        if (subtipo !== undefined) {
            (elementoAlvo.subtipo as any) = subtipo;
        }

        this.pilha[this.pilha.length - 1].ambiente.valores[nomeConstante] = elementoAlvo;
    }

    definirVariavel(nomeVariavel: string, valor: any, subtipo?: string, imutavel: boolean = false) {
        const variavel = this.pilha[this.pilha.length - 1].ambiente.valores[nomeVariavel];
        let tipo = variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor);
        // TODO: Dois testes no VisuAlg falham por causa disso.
        /* if (subtipo !== null && subtipo !== undefined) {
            tipo = subtipo;
        } else {
            tipo = variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor);
        } */

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipo,
            subtipo: undefined,
            imutavel: imutavel,
        };

        if (subtipo !== undefined) {
            (elementoAlvo.subtipo as any) = subtipo;
        }

        this.pilha[this.pilha.length - 1].ambiente.valores[nomeVariavel] = elementoAlvo;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        if (ambienteAncestral.valores[simbolo.lexema].imutavel) {
            throw new ErroEmTempoDeExecucao(simbolo, `Constante '${simbolo.lexema}' não pode receber novos valores.`);
        }
        ambienteAncestral.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor),
            imutavel: false,
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                const variavel = ambiente.valores[simbolo.lexema];
                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }
                const tipo = variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor);

                const valorResolvido = this.converterValor(tipo, valor);
                ambiente.valores[simbolo.lexema] = {
                    valor: valorResolvido,
                    tipo,
                    imutavel: false,
                };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterEscopoPorTipo(tipo: string): EscopoExecucao | undefined {
        for (let i = 1; i <= this.pilha.length; i++) {
            const escopoAtual = this.pilha[this.pilha.length - i];
            if (escopoAtual.tipo === tipo) {
                return escopoAtual;
            }
        }

        return undefined;
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        return ambienteAncestral.valores[nome];
    }

    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                return ambiente.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida: '" + simbolo.lexema + "'.");
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
    obterTodasVariaveis(todasVariaveis: VariavelInterface[] = []): any[] {
        for (let i = 1; i <= this.pilha.length - 1; i++) {
            const valoresAmbiente = this.pilha[this.pilha.length - i].ambiente.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(valoresAmbiente).map((chaveEValor, indice) => ({
                nome: chaveEValor[0],
                valor: chaveEValor[1].valor,
                tipo: chaveEValor[1].tipo,
                imutavel: chaveEValor[1].imutavel,
            }));
            todasVariaveis = todasVariaveis.concat(vetorObjeto);
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console, do último escopo.
     */
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao } {
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

    /**
     * Obtém todas as declarações de classe do último escopo.
     * @returns
     */
    obterTodasDeclaracaoClasse(): any {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length - 1].ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DeleguaClasse) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }
}
