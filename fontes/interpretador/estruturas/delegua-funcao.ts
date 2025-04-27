import { Chamavel } from './chamavel';
import { EspacoVariaveis } from '../../espaco-variaveis';

import { InterpretadorInterface } from '../../interfaces';
import { RetornoQuebra } from '../../quebras';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';
import { FuncaoConstruto } from '../../construtos';
import { ArgumentoInterface } from '../argumento-interface';
import { PilhaEscoposExecucaoInterface } from '../../interfaces/pilha-escopos-execucao-interface';
import { inferirTipoVariavel } from '../../inferenciador';
import { Retorna } from '../../declaracoes';

/**
 * Qualquer função declarada em código é uma DeleguaFuncao.
 */
export class DeleguaFuncao extends Chamavel {
    nome: string;
    declaracao: FuncaoConstruto;
    eInicializador: boolean;
    instancia: ObjetoDeleguaClasse;

    constructor(
        nome: string,
        declaracao: FuncaoConstruto,
        instancia: ObjetoDeleguaClasse = undefined,
        eInicializador = false
    ) {
        super();
        this.nome = nome;
        this.declaracao = declaracao;
        this.instancia = instancia;
        this.eInicializador = eInicializador;
    }

    aridade(): number {
        return this.declaracao?.parametros?.length || 0;
    }

    /**
     * Método utilizado por Delégua para representar esta função quando impressa.
     * @returns {string} A representação da função como texto.
     */
    paraTexto(): string {
        if (!this.nome) return '<função>';
        let resultado = `<função ${this.nome}`;
        let parametros = '';
        let retorno = '';

        for (let parametro of this.declaracao.parametros) {
            parametros += `${parametro.nome.lexema}: ${parametro.tipoDado || 'qualquer'}, `;
        }

        if (this.declaracao.parametros.length > 0) {
            parametros = `argumentos=<${parametros.slice(0, -2)}>`;
        }

        const retorna = this.declaracao.corpo.filter((c) => c instanceof Retorna)[0];
        if (retorna instanceof Retorna) {
            const valor = retorna?.valor?.valor;
            retorno = `retorna=<${typeof valor === 'number' ? valor : `'${valor}'`}>`;
        }

        if (parametros) {
            resultado += ` ${parametros}`;
        }

        if (retorno) {
            resultado += ` ${retorno}`;
        }

        resultado += '>';
        return resultado;
    }

    /**
     * Método utilizado pelo VSCode para inspecionar esta função em depuração.
     * @returns {string} A representação da função como texto.
     */
    toString(): string {
        return this.paraTexto();
    }

    private resolverParametrosEspalhados(argumentos: Array<ArgumentoInterface>, indiceArgumentoAtual: number) {
        const argumentosResolvidos = [];
        for (let i = indiceArgumentoAtual; i < argumentos.length; i++) {
            const argumentoAtual = argumentos[i];
            argumentosResolvidos.push(
                argumentoAtual && argumentoAtual.hasOwnProperty('valor') ? argumentoAtual.valor : argumentoAtual
            );
        }

        return argumentosResolvidos;
    }

    protected resolverAmbiente(
        argumentos: Array<ArgumentoInterface>
    ): EspacoVariaveis {
        const ambiente = new EspacoVariaveis();
        const parametros = this.declaracao.parametros || [];

        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];

            const nome = parametro['nome'].lexema;
            if (parametro.abrangencia === 'multiplo') {
                const argumentosResolvidos = this.resolverParametrosEspalhados(argumentos, i);

                // TODO: Verificar se `imutavel` é `true` aqui mesmo.
                ambiente.valores[nome] = { tipo: 'vetor', valor: argumentosResolvidos, imutavel: true };
            } else {
                let argumento = argumentos[i];
                if (argumento.valor === null) {
                    argumentos[i].valor = parametro['padrao'] ? parametro['padrao'].valor : null;
                }

                ambiente.valores[nome] = argumento && argumento.hasOwnProperty('valor') ? argumento.valor : argumento;

                // Se o argumento é `DeleguaFuncao`, para habilitar o recurso de _currying_, 
                // copiamos seu valor para o escopo atual. Nem sempre podemos contar com a tipagem explícita aqui.
                if (argumento.valor && ['funcao', 'função'].includes(argumento.valor.tipo)) {
                    parametro.referencia = true;
                }
            }
        }

        return ambiente;
    }

    async chamar(visitante: InterpretadorInterface, argumentos: Array<ArgumentoInterface>): Promise<any> {
        const ambiente = this.resolverAmbiente(argumentos);

        if (this.instancia !== undefined) {
            ambiente.valores['isto'] = {
                valor: this.instancia,
                tipo: 'objeto',
                imutavel: false,
            };

            // TODO: Apenass Potigol usa isso até então.
            // Estudar mover isso para o dialeto.
            if (this.instancia.classe.dialetoRequerExpansaoPropriedadesEspacoVariaveis && this.nome !== 'construtor') {
                for (let [nomeCampo, valorCampo] of Object.entries(this.instancia.propriedades)) {
                    ambiente.valores[nomeCampo] = {
                        valor: valorCampo,
                        tipo: inferirTipoVariavel(valorCampo as any),
                        imutavel: false,
                    };
                }
            }
        }

        // TODO: Repensar essa dinâmica para análise semântica (levar toda a lógica abaixo para
        // o interpretador).
        const interpretador = visitante as any;
        interpretador.proximoEscopo = 'funcao';
        const retornoBloco: any = await interpretador.executarBloco(this.declaracao.corpo, ambiente);

        const referencias = this.declaracao.parametros
            .map((p, indice) => {
                if (p.referencia) {
                    return {
                        indice: indice,
                        parametro: p,
                    };
                }
            })
            .filter((r) => r);
        const pilha = interpretador.pilhaEscoposExecucao as PilhaEscoposExecucaoInterface;

        for (let referencia of referencias) {
            let argumentoReferencia = ambiente.valores[referencia.parametro.nome.lexema];

            pilha.definirVariavel(
                referencia.parametro.nome.lexema,
                argumentoReferencia.valor
            );
        }

        if (retornoBloco instanceof RetornoQuebra) {
            return retornoBloco.valor;
        }

        if (this.eInicializador) {
            return this.instancia;
        }

        return retornoBloco;
    }

    funcaoPorMetodoDeClasse(instancia: ObjetoDeleguaClasse): DeleguaFuncao {
        return new DeleguaFuncao(this.nome, this.declaracao, instancia, this.eInicializador);
    }
}
