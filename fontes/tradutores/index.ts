import { Agrupamento, Atribuir, Binario, Chamada, DefinirValor, Isto, Literal, Variavel } from '../construtos';
import {
    Bloco,
    Classe,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { SimboloInterface, TradutorInterface } from '../interfaces';
import { CaminhoEscolha } from '../interfaces/construtos';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * Esse tradutor traduz para JavaScript sem módulos, o que significa que
 * instruções em Delégua como `leia()` e `importar()` não são suportadas.
 * O tradutor levantará erro toda vez que essas instruções são encontradas.
 */
export class TradutorJavaScript implements TradutorInterface {
    indentacao: number = 0;

    traduzirSimboloOperador(operador: SimboloInterface) {
        switch (operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.DIFERENTE:
                return '!==';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.IGUAL_IGUAL:
                return '===';
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
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento) {
        // TODO
        return null;
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir) {
        let resultado = atribuir.simbolo.lexema;
        resultado += ' = ' + this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return resultado;
    }

    traduzirConstrutoBinario(binario: Binario) {
        let esquerda = this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda);
        let operador = this.traduzirSimboloOperador(binario.operador);
        let direita = this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);

        return `${esquerda} ${operador} ${direita}`;
    }

    traduzirConstrutoDefinirValor(definirValor: DefinirValor) {
        let resultado = '';
        if (definirValor.objeto instanceof Isto) {
            resultado = 'this.' + definirValor.nome.lexema + ' = ';
        }

        resultado += definirValor.valor.simbolo.lexema;
        return resultado;
    }

    traduzirConstrutoIsto(isto: Isto) {
        return 'this';
    }

    traduzirConstrutoLiteral(literal: Literal) {
        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel) {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoChamada(chamada: Chamada) {
        let resultado = '';

        let entidadeChamada = chamada.entidadeChamada as Variavel;
        resultado += `${entidadeChamada.simbolo.lexema}(`;
        for (let parametro of chamada.argumentos as Array<Variavel>) {
            resultado += parametro.simbolo.lexema + ', ';
        }
        if (chamada.argumentos.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[]) {
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

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco) {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    logicaTraducaoMetodoClasse(metodoClasse: FuncaoDeclaracao) {
        this.indentacao += 4;
        let resultado = ' '.repeat(this.indentacao);
        resultado += metodoClasse.simbolo.lexema + '(';

        for (let parametro of metodoClasse.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        resultado = resultado.slice(0, -2); // Remover última vírgula
        resultado += ') ';
        resultado += this.logicaComumBlocoEscopo(metodoClasse.funcao.corpo);
        resultado += ' '.repeat(this.indentacao) + '\n';

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoClasse(declaracaoClasse: Classe) {
        let resultado = 'export class ';
        resultado += declaracaoClasse.simbolo.lexema + ' {\n';

        for (let metodo of declaracaoClasse.metodos) {
            resultado += this.logicaTraducaoMetodoClasse(metodo);
        }

        resultado += '}';
        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto) {
        let resultado = 'while (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](declaracaoEnquanto.condicao) + ') ';
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](declaracaoEnquanto.corpo);
        return resultado;
    }

    logicaComumCaminhosEscolha(caminho: CaminhoEscolha) {
        let resultado = '';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);
        resultado +=
            'case ' + this.dicionarioConstrutos[caminho.condicoes[0].constructor.name](caminho.condicoes[0]) + ':\n';
        for (let declaracao of caminho.declaracoes) {
            resultado += ' '.repeat(this.indentacao + 4);
            if (declaracao.simboloChave.lexema === 'retorna') {
                resultado += 'return ' + this.dicionarioConstrutos[declaracao.valor.constructor.name](declaracao.valor);
            }
        }

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha) {
        let resultado = 'switch (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEscolha.identificadorOuLiteral.constructor.name](
                declaracaoEscolha.identificadorOuLiteral
            ) + ') {\n';

        for (let caminho of declaracaoEscolha.caminhos) {
            resultado += this.logicaComumCaminhosEscolha(caminho);
        }

        resultado += '}\n';
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva) {
        let resultado = 'console.log(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            if (argumento instanceof Binario) {
                resultado += valor + ', ';
                continue;
            }
            if (argumento instanceof Variavel) {
                resultado += valor + ', ';
                continue;
            }
            if (typeof valor === 'string') {
                resultado += `'${valor}', `;
                continue;
            }
            if (typeof valor === 'number') {
                resultado += valor + ', ';
                continue;
            }

            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2); // Remover última vírgula
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao) {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoFazer(declaracaoFazer: Fazer) {
        let resultado = 'do ';
        resultado += this.dicionarioDeclaracoes[declaracaoFazer.caminhoFazer.constructor.name](
            declaracaoFazer.caminhoFazer
        );
        resultado +=
            'while (' +
            this.dicionarioConstrutos[declaracaoFazer.condicaoEnquanto.constructor.name](
                declaracaoFazer.condicaoEnquanto
            ) +
            ') ';
        return resultado;
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao) {
        let resultado = 'function ';
        resultado += declaracaoFuncao.simbolo.lexema + ' (';

        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (declaracaoFuncao.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }

    traduzirDeclaracaoImportar(declaracaoImportar: Importar) {
        throw new Error('`importar()` não é suportado por este padrão de JavaScript.');
    }

    traduzirDeclaracaoLeia(declaracaoImportar: Importar) {
        throw new Error('`leia()` não é suportado por este padrão de JavaScript.');
    }

    traduzirDeclaracaoPara(declaracaoPara: Para) {
        let resultado = 'for (';
        resultado +=
            this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](declaracaoPara.inicializador) +
            '; ';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao) + '; ';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](declaracaoPara.incrementar) + ') ';

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna) {
        let resultado = 'return ';
        const nomeConstrutor = declaracaoRetorna?.valor?.expressao?.constructor?.name;
        if (declaracaoRetorna?.valor instanceof Binario) {
            return (resultado += this.traduzirConstrutoBinario(declaracaoRetorna?.valor));
        }
        if (declaracaoRetorna?.valor instanceof Literal) {
            const valor = this.traduzirConstrutoLiteral(declaracaoRetorna?.valor as Literal);
            if (typeof valor === 'string') resultado += `'${valor}'`;
            else if (typeof valor === 'number') resultado += valor;
            else if (valor === null) resultado += 'null';
            return resultado;
        }
        if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
            resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna.valor.expressao);
        } else {
            resultado += this.dicionarioDeclaracoes[nomeConstrutor](declaracaoRetorna.valor.expressao);
        }
        return resultado;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se) {
        let resultado = 'if (';

        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](declaracaoSe.condicao);

        resultado += condicao;

        resultado += ')';
        resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](declaracaoSe.caminhoEntao);

        if (declaracaoSe.caminhoSenao !== null) {
            resultado += '\nelse ';
            const se = declaracaoSe?.caminhoSenao as Se;
            if (se?.caminhoEntao) {
                resultado += 'if (';
                resultado += this.dicionarioConstrutos[se.condicao.constructor.name](se.condicao);
                resultado += ')';
                resultado += this.dicionarioDeclaracoes[se.caminhoEntao.constructor.name](se.caminhoEntao);

                if (se?.caminhoSenao) {
                    resultado += 'else ';
                    resultado += this.dicionarioDeclaracoes[se.caminhoSenao.constructor.name](se.caminhoSenao);
                    return resultado;
                }
            }
            
            resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](
                declaracaoSe.caminhoSenao
            );
        }

        return resultado;
    }

    traduzirDeclaracaoTente(declaracaoTente: Tente) {
        let resultado = 'try ';
        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var) {
        let resultado = 'let ';
        resultado += declaracaoVar.simbolo.lexema + ' = ';
        if (declaracaoVar.inicializador instanceof Literal) {
            resultado += "'" + declaracaoVar.inicializador.valor + "'";
        } else if (declaracaoVar.inicializador instanceof Binario) {
            resultado += this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](
                declaracaoVar.inicializador
            );
        } else {
            resultado += this.dicionarioDeclaracoes[declaracaoVar.inicializador.constructor.name](
                declaracaoVar.inicializador
            );
        }

        return resultado;
    }

    dicionarioConstrutos = {
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        Isto: this.traduzirConstrutoIsto.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Continua: () => 'continue',
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Importar: this.traduzirDeclaracaoImportar.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        Sustar: () => 'break',
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    traduzir(declaracoes: Declaracao[]) {
        let resultado = '';

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
