import { Binario, Literal, Variavel } from "../construtos";
import { Bloco, Declaracao, Escreva, FuncaoDeclaracao, Se, Var } from "../declaracoes";
import { TradutorInterface } from "../interfaces";
import { dicionarioSimbolos } from "./dicionarios";

export class TradutorJavaScript implements TradutorInterface {

    traduzirConstrutoLiteral(literal: Literal) {
        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel) {
        return variavel.simbolo.lexema;
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[], indentacaoAnterior: number = 0) {
        let resultado = "{\n";
        const indentacao = indentacaoAnterior + 4;

        for (const declaracao of declaracoes) {
            resultado += " ".repeat(indentacao);
            resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            resultado += "\n";
        }

        resultado += "\n}\n";
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco, indentacaoAnterior: number = 0) {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes, indentacaoAnterior);
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
        'Literal': this.traduzirConstrutoLiteral.bind(this),
        'Variavel': this.traduzirConstrutoVariavel.bind(this)
    }

    dicionarioDeclaracoes = {
        'Bloco': this.traduzirDeclaracaoBloco.bind(this),
        'Classe': '',
        'Continua': '',
        'Enquanto': '',
        'Escolha': '',
        'Escreva': this.traduzirDeclaracaoEscreva.bind(this),
        'Expressao': '',
        'Fazer': '',
        'Funcao': this.traduzirDeclaracaoFuncao.bind(this),
        'Importar': '',
        'Leia': '',
        'Para': '',
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
