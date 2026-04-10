import { AvaliadorSintaticoCalango } from '../avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { FormatacaoEscrita, Literal } from '../construtos';
import { Declaracao, Escreva, EscrevaMesmaLinha } from '../declaracoes';
import { LexadorCalango } from '../lexador/dialetos';

export class TradutorReversoCalango {
    indentacao: number = 0;
    lexador: LexadorCalango;
    avaliadorSintatico: AvaliadorSintaticoCalango;

    dicionarioConstrutos = {
        FormatacaoEscrita: this.traduzirConstrutoFormatacaoEscrita.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
    };

    dicionarioDeclaracoes = {
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
    };

    traduzirConstrutoFormatacaoEscrita(formatacaoEscrita: FormatacaoEscrita) {
        const avaliacaoExpressao = this.dicionarioConstrutos[
            formatacaoEscrita.expressao.constructor.name
        ](formatacaoEscrita.expressao);
        return `${avaliacaoExpressao}`;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return String(literal.valor);
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscreva: EscrevaMesmaLinha): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
