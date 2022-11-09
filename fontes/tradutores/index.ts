import { Binario, Literal, Variavel } from "../construtos";
import { Bloco, Declaracao, Escreva, Se } from "../declaracoes";
import { TradutorInterface } from "../interfaces";
import { dicionarioSimbolos } from "./dicionarios";

export class TradutorJavaScript implements TradutorInterface {

    traduzirConstrutoLiteral(literal: Literal) {
        return literal.valor;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco, indentacaoAnterior: number = 0) {
        let resultado = "{\n";
        const indentacao = indentacaoAnterior + 4;

        for (const declaracao of declaracaoBloco.declaracoes) {
            resultado += " ".repeat(indentacao);
            resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            resultado += "\n";
        }

        resultado += "\n}";
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

    dicionarioConstrutos = {
        'Literal': this.traduzirConstrutoLiteral.bind(this)
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
        'Funcao': '',
        'Importar': '',
        'Leia': '',
        'Para': '',
        'Sustar': '',
        'Retorna': '',
        'Se': this.traduzirDeclaracaoSe.bind(this),
        'Tente': '',
        'Var': ''
    }

    traduzir(declaracoes: Declaracao[]) {
        let resultado = "";

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`
        }

        return resultado;
    }
}
