import { Chamavel } from './chamavel';
import { EspacoVariaveis } from '../espaco-variaveis';

import { InterpretadorInterface, VisitanteComumInterface } from '../interfaces'
import { RetornoQuebra } from '../quebras';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';
import { FuncaoConstruto } from '../construtos';

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

    async chamar(visitante: VisitanteComumInterface, argumentos: Array<any>): Promise<any> {
        const ambiente = new EspacoVariaveis();
        const parametros = this.declaracao.parametros;

        if (parametros && parametros.length) {
            for (let i = 0; i < parametros.length; i++) {
                const parametro = parametros[i];

                const nome = parametro['nome'].lexema;
                let valor = argumentos[i];
                if (argumentos[i] === null) {
                    valor = parametro['padrao'] ? parametro['padrao'].valor : null;
                }

                ambiente.valores[nome] = valor;
            }
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
