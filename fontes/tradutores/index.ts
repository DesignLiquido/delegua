import { Atribuir, Binario, Literal, Variavel } from "../construtos";
import { Bloco, Declaracao, Enquanto, Escreva, Expressao, FuncaoDeclaracao, Para, Se, Var } from "../declaracoes";
import { TradutorInterface } from "../interfaces";
import { dicionarioSimbolos } from "./dicionarios";

export class TradutorJavaScript implements TradutorInterface {

    traduzirConstrutoAtribuir(atribuir: Atribuir) {
        let resultado = atribuir.simbolo.lexema;
        resultado += " = " + this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return resultado;
    }

    traduzirConstrutoBinario(binario: Binario) {
        return this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda) +
            " " + binario.operador.lexema + " " +
            this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);
    }

    traduzirConstrutoLiteral(literal: Literal) {
        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel) {
        return variavel.simbolo.lexema;
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[], indentacaoAnterior: number = 0) {
        let resultado = "{\n";
        const indentacao = indentacaoAnterior + 4;

        if (typeof declaracoes[Symbol.iterator] === 'function') {
            for (const declaracaoOuConstruto of declaracoes) {
                resultado += " ".repeat(indentacao);
                const nomeConstrutor = declaracaoOuConstruto.constructor.name;
                if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
                    resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoOuConstruto);
                } else {
                    resultado += this.dicionarioDeclaracoes[nomeConstrutor](declaracaoOuConstruto);
                }

                resultado += "\n";
            }
        }

        resultado += "\n}\n";
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco, indentacaoAnterior: number = 0) {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes, indentacaoAnterior);
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto) {
        let resultado = "while (";
        resultado += this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](declaracaoEnquanto.condicao) + ") ";
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](declaracaoEnquanto.corpo);
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva) {
        let resultado = "console.log(";
        for (const argumento of declaracaoEscreva.argumentos) {
            resultado += this.dicionarioConstrutos[argumento.constructor.name](argumento) + ", ";
        }

        resultado = resultado.slice(0, -2); // Remover última vírgula
        resultado += ");"
        return resultado;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao) {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao) {
        let resultado = "function ";
        resultado += declaracaoFuncao.simbolo.lexema + " (";

        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema + ", ";
        }

        resultado = resultado.slice(0, -2);
        resultado += ") ";

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo, 0);
        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para) {
        let resultado = "for (";
        resultado += this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](declaracaoPara.inicializador) + "; ";
        resultado += this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao) + "; ";
        resultado += this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](declaracaoPara.incrementar) + ") ";

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se) {
        let resultado = "if (";
        const condicao = declaracaoSe.condicao as Binario;
        if (condicao.esquerda instanceof Literal) {
            resultado += condicao.esquerda.valor;
        } else if (condicao.esquerda instanceof Variavel) {
            resultado += condicao.esquerda.simbolo.lexema;
        }

        resultado += ' ' + dicionarioSimbolos[condicao.operador.tipo] + ' ';

        if (condicao.direita instanceof Literal) {
            resultado += condicao.direita.valor;
        } else if (condicao.direita instanceof Variavel) {
            resultado += condicao.direita.simbolo.lexema;
        }

        resultado += ') ';
        resultado += this.dicionarioDeclaracoes[
            declaracaoSe.caminhoEntao.constructor.name](declaracaoSe.caminhoEntao);

        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var) {
        let resultado = "let ";
        resultado += declaracaoVar.simbolo.lexema + " = ";
        if (declaracaoVar.inicializador instanceof Literal) {
            resultado += "'" + declaracaoVar.inicializador.valor + "'";
        } else {
            resultado += this.dicionarioDeclaracoes[declaracaoVar.inicializador.constructor.name](declaracaoVar.inicializador);
        }

        return resultado;
    }

    dicionarioConstrutos = {
        'Atribuir': this.traduzirConstrutoAtribuir.bind(this),
        'Binario': this.traduzirConstrutoBinario.bind(this),
        'Literal': this.traduzirConstrutoLiteral.bind(this),
        'Variavel': this.traduzirConstrutoVariavel.bind(this)
    }

    dicionarioDeclaracoes = {
        'Bloco': this.traduzirDeclaracaoBloco.bind(this),
        'Classe': '',
        'Continua': '',
        'Enquanto': this.traduzirDeclaracaoEnquanto.bind(this),
        'Escolha': '',
        'Escreva': this.traduzirDeclaracaoEscreva.bind(this),
        'Expressao': this.traduzirDeclaracaoExpressao.bind(this),
        'Fazer': '',
        'Funcao': this.traduzirDeclaracaoFuncao.bind(this),
        'Importar': '',
        'Leia': '',
        'Para': this.traduzirDeclaracaoPara.bind(this),
        'Sustar': '',
        'Retorna': '',
        'Se': this.traduzirDeclaracaoSe.bind(this),
        'Tente': '',
        'Var': this.traduzirDeclaracaoVar.bind(this)
    }

    traduzir(declaracoes: Declaracao[]) {
        let resultado = "";

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`
        }

        return resultado;
    }
}
