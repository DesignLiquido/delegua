import { Callable } from "./callable";
import { Ambiente } from "../ambiente";
import { ReturnException } from "../erro";

export class DeleguaFuncao extends Callable {
    nome: any;
    declaracao: any;
    closure: any;
    eInicializador: any;

    constructor(nome: any, declaracao: any, closure: any, eInicializador = false) {
        super();
        this.nome = nome;
        this.declaracao = declaracao;
        this.closure = closure;
        this.eInicializador = eInicializador;
    }

    aridade() {
        return this.declaracao?.parametros?.length || 0;
    }

    toString() {
        if (this.nome === null) return "<função>";
        return `<função ${this.nome}>`;
    }

    call(interpretador, argumentos) {
        let ambiente = new Ambiente(this.closure);
        let parametros = this.declaracao.parametros;
        for (let i = 0; i < parametros.length; i++) {
            const param = parametros[i];

            const nome = param["nome"].lexeme;
            let valor = argumentos[i];
            if (argumentos[i] === null) {
                valor = param["padrao"] ? param["padrao"].valor : null;
            }
            ambiente.definirVariavel(nome, valor);
        }

        try {
            interpretador.executeBlock(this.declaracao.corpo, ambiente);
        } catch (erro) {
            if (erro instanceof ReturnException) {
                if (this.eInicializador) return this.closure.obterVariavelEm(0, "isto");
                return erro.valor;
            } else {
                throw erro;
            }
        }

        if (this.eInicializador) return this.closure.obterVariavelEm(0, "isto");
        return null;
    }

    bind(instancia) {
        let ambiente = new Ambiente(this.closure);
        ambiente.definirVariavel("isto", instancia);
        return new DeleguaFuncao(
            this.nome,
            this.declaracao,
            ambiente,
            this.eInicializador
        );
    }
}
