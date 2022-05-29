import { Chamavel } from "./chamavel";
import { Ambiente } from "../ambiente";

import { InterpretadorInterface } from "../interfaces";
import { RetornoQuebra } from "../quebras";

export class DeleguaFuncao extends Chamavel {
    nome: any;
    declaracao: any;
    eInicializador: any;

    constructor(nome: any, declaracao: any, eInicializador = false) {
        super();
        this.nome = nome;
        this.declaracao = declaracao;
        this.eInicializador = eInicializador;
    }

    aridade(): any {
        return this.declaracao?.parametros?.length || 0;
    }

    paraTexto(): string {
        if (this.nome === null) return "<função>";
        return `<função ${this.nome}>`;
    }

    chamar(interpretador: InterpretadorInterface, argumentos: any): any {
        let ambiente = new Ambiente();
        let parametros = this.declaracao.parametros;

        if (parametros && parametros.length) {
            for (let i = 0; i < parametros.length; i++) {
                const param = parametros[i];

                const nome = param["nome"].lexema;
                let valor = argumentos[i];
                if (argumentos[i] === null) {
                    valor = param["padrao"] ? param["padrao"].valor : null;
                }
                // ambiente.definirVariavel(nome, valor);
                ambiente.valores[nome] = valor;
            }
        }

        const retornoBloco: any = interpretador.executarBloco(this.declaracao.corpo, ambiente);
        if (retornoBloco instanceof RetornoQuebra) {
            return retornoBloco.valor;
        }

        return retornoBloco;
        // if (this.eInicializador) return this.ambienteAnterior.obterVariavelEm(0, "isto");
    }

    definirEscopo(instancia: any): any {
        // TODO: Retirar dependência do núcleo da linguagem antes de refatorar aqui.
        // Exemplo: fontes\estruturas\classe.ts
        // let ambiente = new Ambiente(this.ambienteAnterior);
        // ambiente.definirVariavel("isto", instancia);
        return new DeleguaFuncao(
            this.nome,
            this.declaracao,
            this.eInicializador
        );
    }
}
