import { Chamavel } from './chamavel';
import { EspacoVariaveis } from '../espaco-variaveis';

import { InterpretadorInterface, VariavelInterface, VisitanteComumInterface } from '../interfaces'
import { RetornoQuebra } from '../quebras';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';
import { FuncaoConstruto } from '../construtos';
import { ArgumentoInterface } from '../interpretador/argumento-interface';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';

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

    paraTexto(): string {
        if (this.nome === null) return '<função>';
        return `<função ${this.nome}>`;
    }

    async chamar(visitante: VisitanteComumInterface, argumentos: Array<ArgumentoInterface>): Promise<any> {
        const ambiente = new EspacoVariaveis();
        const parametros = this.declaracao.parametros || [];

        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];

            const nome = parametro['nome'].lexema;
            let argumento = argumentos[i];
            if (argumentos[i] === null) {
                argumento = parametro['padrao'] ? parametro['padrao'].valor : null;
            }

            ambiente.valores[nome] = argumento.valor;
        }

        if (this.instancia !== undefined) {
            ambiente.valores['isto'] = {
                valor: this.instancia,
                tipo: 'objeto',
                imutavel: false
            };
        }

        // TODO: Repensar essa dinâmica para análise semântica.
        const interpretador = (visitante as any);
        interpretador.proximoEscopo = 'funcao';
        const retornoBloco: any = await interpretador.executarBloco(this.declaracao.corpo, ambiente);
        
        const referencias = this.declaracao.parametros.map((p, indice) => { 
            if (p.referencia) {
                return {
                    indice: indice,
                    parametro: p
                }
            }
        }).filter(r => r);
        const pilha = interpretador.pilhaEscoposExecucao as PilhaEscoposExecucaoInterface;

        for (let referencia of referencias) {
            let argumentoReferencia = ambiente.valores[referencia.parametro.nome.lexema];
            pilha.atribuirVariavel(
                { 
                    lexema: argumentos[referencia.indice].nome 
                } as any, 
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
