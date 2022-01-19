import { Callable } from "./callable";
import { Ambiente } from "../ambiente";
import { ReturnException } from "../excecoes";

export class DeleguaFuncao extends Callable {
    nome: any;
    declaracao: any;
    ambienteAnterior: any;
    eInicializador: any;

    constructor(nome: any, declaracao: any, ambienteAnterior: any, eInicializador = false) {
        super();
        this.nome = nome;
        this.declaracao = declaracao;
        this.ambienteAnterior = ambienteAnterior;
        this.eInicializador = eInicializador;
    }

    aridade(): any {
        return this.declaracao?.parametros?.length || 0;
    }

    toString(): string {
        if (this.nome === null) return "<função>";
        return `<função ${this.nome}>`;
    }

    chamar(interpretador: any, argumentos: any): any {
        let ambiente = new Ambiente(this.ambienteAnterior);
        let parametros = this.declaracao.parametros;

        if (parametros && parametros.length) {
            for (let i = 0; i < parametros.length; i++) {
                const param = parametros[i];

                const nome = param["nome"].lexema;
                let valor = argumentos[i];
                if (argumentos[i] === null) {
                    valor = param["padrao"] ? param["padrao"].valor : null;
                }
                ambiente.definirVariavel(nome, valor);
            }
        }

        try {
            interpretador.executarBloco(this.declaracao.corpo, ambiente);
        } catch (erro) {
            if (erro instanceof ReturnException) {
                if (this.eInicializador) return this.ambienteAnterior.obterVariavelEm(0, "isto");
                return erro.valor;
            } else {
                throw erro;
            }
        }

        if (this.eInicializador) return this.ambienteAnterior.obterVariavelEm(0, "isto");
        return null;
    }

    bind(instancia: any): any {
        let ambiente = new Ambiente(this.ambienteAnterior);
        ambiente.definirVariavel("isto", instancia);
        return new DeleguaFuncao(
            this.nome,
            this.declaracao,
            ambiente,
            this.eInicializador
        );
    }
}
