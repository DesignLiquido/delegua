import { Literal } from '../construtos';
import {
    Classe, Declaracao, Escreva
} from '../declaracoes';

export class TradutorAssemblyScript {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'console.log(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }

    dicionarioConstrutos = {
        Literal: this.traduzirConstrutoLiteral.bind(this),
    }

    dicionarioDeclaracoes = {
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        this.declaracoesDeClasses = declaracoes.filter((declaracao) => declaracao instanceof Classe) as Classe[];

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}