import { AvaliadorSintaticoPortugolIpt } from "../avaliador-sintatico/dialetos";
import { FormatacaoEscrita, Literal } from "../construtos";
import { LexadorPortugolIpt } from "../lexador/dialetos";

export class TradutorPortugolIpt {
    indentacao: number = 0;
    lexador: LexadorPortugolIpt;
    avaliadorSintatico: AvaliadorSintaticoPortugolIpt;

    dicionarioConstrutos = {
        FormatacaoEscrita: this.traduzirConstrutoFormatacaoEscrita.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
    }

    dicionarioDeclaracoes = {
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }

    traduzirConstrutoFormatacaoEscrita(formatacaoEscrita: FormatacaoEscrita) {
        let resultado = "";
        resultado += String(formatacaoEscrita.expressao.valor);
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: any): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.expressao.constructor.name](argumento.expressao);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscreva: any): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.expressao.constructor.name](argumento.expressao);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzir(codigo: string): string {
        let resultado = '';

        this.lexador = new LexadorPortugolIpt();
        this.avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();

        const retornoLexador = this.lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador, -1);

        for (const declaracao of retornoAvaliadorSintatico.declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}