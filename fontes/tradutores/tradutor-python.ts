import { Agrupamento, Atribuir, Binario, Chamada, Literal, Logico, Variavel, Vetor } from "../construtos";
import { Bloco, Declaracao, Escreva, Expressao, FuncaoDeclaracao, Leia, Para, ParaCada, Retorna, Var } from "../declaracoes";
import { SimboloInterface, TradutorInterface } from "../interfaces";
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

export class TradutorPython implements TradutorInterface {
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
                return 'and';
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
                return 'or';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[]): string {
        let resultado = '';
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
        resultado += ' '.repeat(this.indentacao) + '\n';
        return resultado;
    }

    traduzirConstrutoLogico(logico: Logico): string {
        let direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita);
        let operador = this.traduzirSimboloOperador(logico.operador);
        let esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda);

        return `${esquerda} ${operador} ${direita}`;
    }
    
    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        if (typeof literal.valor === 'boolean') {
            return literal.valor ? 'True' : 'False';
        }
        if (!literal.valor) return 'None';
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

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
        let resultado = 'def ';
        resultado += declaracaoFuncao.simbolo.lexema + '(';

        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (declaracaoFuncao.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += '):';

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        let resultado = '';

        // const retorno = `${this.dicionarioConstrutos[chamada.entidadeChamada.constructor.name](
        //     chamada.entidadeChamada
        // )}`;

        // const instanciaClasse = this.declaracoesDeClasses.some((declaracao) => declaracao?.simbolo?.lexema === retorno);
        // if (instanciaClasse) {
        //     const classe = this.declaracoesDeClasses.find((declaracao) => declaracao?.simbolo?.lexema === retorno);
        //     if (classe.simbolo.lexema === retorno) resultado += `new ${retorno}`;
        // } else {
        //     resultado += retorno;
        // }
        // resultado += '(';
        // for (let parametro of chamada.argumentos) {
        //     resultado += this.dicionarioConstrutos[parametro.constructor.name](parametro) + ', ';
        // }
        // if (chamada.argumentos.length > 0) {
        //     resultado = resultado.slice(0, -2);
        // }
        // resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna): string {
        let resultado = 'return ';
        const nomeConstrutor = declaracaoRetorna.valor.constructor.name;
        return (resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna?.valor));
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        if (!vetor.valores.length) {
            return '[]';
        }

        let resultado = '[';

        for (let valor of vetor.valores) {
            resultado += `${this.dicionarioConstrutos[valor.constructor.name](valor)}, `;
        }
        if (vetor.valores.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ']';

        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = '';
        resultado += declaracaoVar.simbolo.lexema;
        // if (!declaracaoVar?.inicializador) resultado += ';';
        // else {
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
        // }
        return resultado;
    }

    traduzirDeclaracaoParaCada(declaracaoParaCada: ParaCada): string {
        let resultado = `for ${declaracaoParaCada.nomeVariavelIteracao} in `;
        resultado +=
            this.dicionarioConstrutos[declaracaoParaCada.vetor.constructor.name](declaracaoParaCada.vetor) + ":\n";

        resultado += this.dicionarioDeclaracoes[declaracaoParaCada.corpo.constructor.name](declaracaoParaCada.corpo);
        return resultado;
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let resultado = atribuir.simbolo.lexema;
        resultado += ' = ' + this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return resultado;
    }
    
    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco): string {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.constructor.name](agrupamento.expressao || agrupamento);
    }
    
    dicionarioConstrutos = {
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    }

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Continua: () => 'continue',
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Sustar: () => 'break',
        Var: this.traduzirDeclaracaoVar.bind(this),
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}