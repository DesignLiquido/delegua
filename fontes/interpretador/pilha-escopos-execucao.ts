import { DescritorTipoClasse, DeleguaFuncao, ReferenciaMontao } from './estruturas';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface, VariavelInterface } from '../interfaces';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { Simbolo } from '../lexador';
import { TipoInferencia, inferirTipoVariavel } from '../inferenciador';

import tipoDeDadosDelegua from '../tipos-de-dados/delegua';

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
            case 'logico':
            case 'lógico':
                return Boolean(valor);
            case 'numero':
            case 'número':
                return Number(valor);
            case 'texto':
                return String(valor);
            default:
                return valor;
        }
    }

    definirConstante(nomeConstante: string, valor: any, tipo?: string): void {
        const constante = this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeConstante];

        let tipoConstante;
        if (constante && constante.hasOwnProperty('tipo')) {
            tipoConstante = constante.tipo;
        } else if (tipo) {
            tipoConstante = tipo;
        } else {
            tipoConstante = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipoConstante,
            subtipo: undefined,
            imutavel: true,
        };

        if ([tipoDeDadosDelegua.VETOR, tipoDeDadosDelegua.TUPLA].includes(tipoConstante)) {
            let subtipo = '';
            if (valor instanceof Array) {
                // TODO: verificar tipo lógico e outros possíveis subtipos
                let numeros = valor.some((v) => typeof v === 'number');
                let textos = valor.some((v) => typeof v === 'string');
                if (numeros && textos) subtipo = tipoDeDadosDelegua.QUALQUER;
                else if (numeros) subtipo = tipoDeDadosDelegua.NUMERO;
                else subtipo = tipoDeDadosDelegua.TEXTO;
            }
            (elementoAlvo.subtipo as any) = subtipo;
        }

        this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeConstante] = elementoAlvo;
    }

    definirVariavel(nomeVariavel: string, valor: any, tipo?: string) {
        const variavel = this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeVariavel];

        let tipoVariavel: string;
        let subtipo: string = undefined;
        if (variavel && variavel.hasOwnProperty('tipo')) {
            tipoVariavel = variavel.tipo;
        } else if (valor && valor.constructor === DeleguaFuncao) {
            tipoVariavel = 'função';
            if (tipo !== undefined) {
                tipoVariavel = `função<${tipo}>`;
                subtipo = tipo;
            }
        } else if (tipo) {
            tipoVariavel = tipo;
        } else {
            tipoVariavel = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipoVariavel, valor),
            tipo: tipoVariavel,
            subtipo: subtipo,
            imutavel: false,
        };

        if ([tipoDeDadosDelegua.VETOR, tipoDeDadosDelegua.TUPLA].includes(tipoVariavel)) {
            let subtipo = '';
            if (valor instanceof Array) {
                // TODO: verificar tipo lógico e outros possíveis subtipos
                let numeros = valor.some((v) => typeof v === 'number');
                let textos = valor.some((v) => typeof v === 'string');
                if (numeros && textos) subtipo = tipoDeDadosDelegua.QUALQUER;
                else if (numeros) subtipo = tipoDeDadosDelegua.NUMERO;
                else subtipo = tipoDeDadosDelegua.TEXTO;
            }
            (elementoAlvo.subtipo as any) = subtipo;
        }

        this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeVariavel] = elementoAlvo;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const espacoMemoriaAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        if (espacoMemoriaAncestral.valores[simbolo.lexema].imutavel) {
            throw new ErroEmTempoDeExecucao(
                simbolo,
                `Constante '${simbolo.lexema}' não pode receber novos valores.`
            );
        }
        espacoMemoriaAncestral.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor),
            imutavel: false,
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any, indice?: number) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[simbolo.lexema] !== undefined) {
                const variavel = espacoMemoria.valores[simbolo.lexema];
                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }

                const tipoInferido =
                    variavel && variavel.hasOwnProperty('tipo') && variavel.tipo
                        ? variavel.tipo
                        : inferirTipoVariavel(valor);
                const tipo = (tipoInferido || 'objeto').toLowerCase() as TipoInferencia;

                const valorResolvido = this.converterValor(tipo, valor);

                if (indice !== undefined && indice !== null) {
                    let variavelValor = variavel.valor;
                    if (variavelValor instanceof Array || variavelValor instanceof Object) {
                        variavelValor[indice] = valorResolvido;
                    } else {
                        throw new ErroEmTempoDeExecucao(
                            simbolo,
                            'Variável não é um vetor ou dicionário.'
                        );
                    }
                } else {
                    espacoMemoria.valores[simbolo.lexema] = {
                        valor: valorResolvido,
                        tipo,
                        imutavel: false,
                    };
                }

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
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        return ambienteAncestral.valores[nome];
    }

    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].espacoMemoria;
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
            const ambiente = this.pilha[this.pilha.length - i].espacoMemoria;
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
            const valoresEspacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(valoresEspacoMemoria).map(
                (chaveEValor, indice) => ({
                    nome: chaveEValor[0],
                    valor: chaveEValor[1].valor,
                    tipo: chaveEValor[1].tipo,
                    imutavel: chaveEValor[1].imutavel,
                })
            );
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
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(espacoMemoria.valores)) {
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
    obterTodasDeclaracoesClasse(): any {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DescritorTipoClasse) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }

    registrarReferenciaFuncao(idFuncao: string, funcao: DeleguaFuncao): void {
        const espacoMemoriaAtual = this.pilha[this.pilha.length - 1].espacoMemoria;
        espacoMemoriaAtual.referenciasFuncoes[idFuncao] = funcao;
    }

    obterReferenciaFuncao(idFuncao: string): DeleguaFuncao {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.referenciasFuncoes[idFuncao] !== undefined) {
                return espacoMemoria.referenciasFuncoes[idFuncao];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', idFuncao, idFuncao, -1, -1),
            "Referência para função não encontrada: '" + idFuncao + "'."
        );
    }

    registrarReferenciaMontao(endereco: string) {
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        espacoMemoria.enderecosMontao.add(endereco);
    }

    migrarReferenciaMontaoParaEscopoDeVariavel(nomeVariavel: string, enderecoMontao: string) {
        // TODO: Normalmente uma referência a ser migrada está sempre no último escopo.
        // Conferir se é sempre este o caso.
        const ultimoEspacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        ultimoEspacoMemoria.enderecosMontao.delete(enderecoMontao);

        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[nomeVariavel] !== undefined) {
                espacoMemoria.enderecosMontao.add(enderecoMontao);
                break;
            }
        }

        // TODO: Devemos emitir erro em algum momento?
    }
}
