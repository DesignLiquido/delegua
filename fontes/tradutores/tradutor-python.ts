import { Literal } from "../construtos";
import { Declaracao, Escreva, Leia } from "../declaracoes";
import { TradutorInterface } from "../interfaces";

export class TradutorPython implements TradutorInterface {
    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }
    
    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'print(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoLeia(declaracaoLeia: Leia) {
        let resultado = 'input(';
        for (const argumento of declaracaoLeia.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';

        return resultado;
    }
    
    dicionarioConstrutos = {
        Literal: this.traduzirConstrutoLiteral.bind(this),
    }

    dicionarioDeclaracoes = {
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}