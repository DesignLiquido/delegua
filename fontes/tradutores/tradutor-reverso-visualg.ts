import { Agrupamento, Atribuir, Binario, FimPara, Literal, Logico, Variavel } from '../construtos';
import { Bloco, Declaracao, Escreva, Expressao, Para, Se, Var } from '../declaracoes';
import { SimboloInterface } from '../interfaces';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * Este tradutor reverso traduz de VisuAlg para Delégua.
 */
export class TradutorReversoVisuAlg {
    indentacao: number = 0;

    traduzirSimboloOperador(operador: SimboloInterface): string {
        switch (operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.BIT_AND:
                return '&';
            case tiposDeSimbolos.BIT_OR:
                return '|';
            case tiposDeSimbolos.BIT_XOR:
                return '^';
            case tiposDeSimbolos.BIT_NOT:
                return '~';
            case tiposDeSimbolos.DIFERENTE:
                return '!=';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.E:
                return 'e';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.IGUAL_IGUAL:
                return '==';
            case tiposDeSimbolos.MAIOR:
                return '>';
            case tiposDeSimbolos.MAIOR_IGUAL:
                return '>=';
            case tiposDeSimbolos.MENOR:
                return '<';
            case tiposDeSimbolos.MENOR_IGUAL:
                return '<=';
            case tiposDeSimbolos.MODULO:
                return '%';
            case tiposDeSimbolos.MULTIPLICACAO:
                return '*';
            case tiposDeSimbolos.OU:
                return 'ou';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.constructor.name](agrupamento.expressao || agrupamento);
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let resultado = atribuir.simbolo.lexema;
        resultado += ' = ' + this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return resultado;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        let resultado = '';
        if (binario.esquerda.constructor.name === 'Agrupamento')
            resultado += '(' + this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda) + ')';
        else resultado += this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda);

        let operador = this.traduzirSimboloOperador(binario.operador);
        resultado += ` ${operador} `;

        if (binario.direita.constructor.name === 'Agrupamento')
            resultado += '(' + this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita) + ')';
        else resultado += this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);

        return resultado;
    }

    traduzirConstrutoFimPara(fimPara: FimPara): string {
        if (fimPara.incremento === null || fimPara.incremento === undefined) {
            return '';
        }

        const expressao = fimPara.incremento as Expressao;
        const atribuir = expressao.expressao as Atribuir;
        const variavel = atribuir.simbolo.lexema;
        return `${variavel}++`;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[]): string {
        let resultado = '{\n';
        this.indentacao += 4;

        if (typeof declaracoes[Symbol.iterator] === 'function') {
            for (const declaracaoOuConstruto of declaracoes) {
                resultado += ' '.repeat(this.indentacao);
                const nomeConstrutor = declaracaoOuConstruto.constructor.name;
                if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
                    resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoOuConstruto);
                } else {
                    resultado += this.dicionarioDeclaracoes[nomeConstrutor](declaracaoOuConstruto);
                }

                resultado += '\n';
            }
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco): string {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    logicaComumCaminhosEscolha(caminho: any): string {
        let resultado = '';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);
        if (caminho?.condicoes?.length) {
            for (let condicao of caminho.condicoes) {
                resultado += 'caso ' + this.dicionarioConstrutos[condicao.constructor.name](condicao) + ':\n';
                resultado += ' '.repeat(this.indentacao);
            }
        }
        if (caminho?.declaracoes?.length) {
            for (let declaracao of caminho.declaracoes) {
                resultado += ' '.repeat(this.indentacao + 4);
                resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
            }
            resultado += ' '.repeat(this.indentacao + 4);
        }

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: any): string {
        let resultado = 'escolha (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEscolha.identificadorOuLiteral.constructor.name](
                declaracaoEscolha.identificadorOuLiteral
            ) + ') {\n';

        for (let caminho of declaracaoEscolha.caminhos) {
            resultado += this.logicaComumCaminhosEscolha(caminho);
        }

        if (declaracaoEscolha.caminhoPadrao) {
            resultado += ' '.repeat(4);
            resultado += 'padrao:\n';
            resultado += this.logicaComumCaminhosEscolha(declaracaoEscolha.caminhoPadrao);
        }

        resultado += '}\n';
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

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoFimPara(declaracaoFimPara: FimPara): string {
        return this.dicionarioDeclaracoes[declaracaoFimPara.incremento.constructor.name](declaracaoFimPara.incremento);
    }

    traduzirDeclaracaoLeia(declaracaoLeia: any) {
        let resultado = '';
        for (const parametro of declaracaoLeia.argumentos) {
            resultado += `var ${this.dicionarioConstrutos[parametro.constructor.name](parametro)} = leia()\n`;
        }

        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let resultado = 'para (';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.inicializador.constructor.name](declaracaoPara.inicializador) +
            ' ';

        resultado += !resultado.includes(';') ? ';' : '';

        resultado +=
            this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao) + '; ';
        resultado +=
            this.dicionarioDeclaracoes[declaracaoPara.incrementar.constructor.name](declaracaoPara.incrementar) + ') ';

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
        let resultado = 'se (';

        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](declaracaoSe.condicao);

        resultado += condicao;

        resultado += ')';
        resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](declaracaoSe.caminhoEntao);

        if (declaracaoSe.caminhoSenao !== null) {
            resultado += ' '.repeat(this.indentacao);
            resultado += 'senao ';

            resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](
                declaracaoSe.caminhoSenao
            );
        }

        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = 'var ';
        resultado += declaracaoVar.simbolo.lexema;
        if (!declaracaoVar?.inicializador) resultado += ';';
        else if (Array.isArray(declaracaoVar?.inicializador.valor)) resultado += ' = []';
        else {
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            } else {
                resultado += this.dicionarioDeclaracoes[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            }
            resultado += ';';
        }
        return resultado;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscreva: Escreva): string {
        return this.traduzirDeclaracaoEscreva(declaracaoEscreva);
    }

    traduzirConstrutoLogico(logico: Logico): string {
        let direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita);
        let operador = this.traduzirSimboloOperador(logico.operador);
        let esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda);

        return `${direita} ${operador} ${esquerda}`;
    }

    dicionarioConstrutos = {
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        FimPara: this.traduzirConstrutoFimPara.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        CabecalhoPrograma: () => "",
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        FimPara: this.traduzirDeclaracaoFimPara.bind(this),
        InicioAlgoritmo: () => "",
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
