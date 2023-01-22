import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoSobrescrita,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
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
    declaracoesDeClasses: Classe[];

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
                return '!==';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.E:
                return '&&';
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
            case tiposDeSimbolos.OU:
                return '||';
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

    traduzirConstrutoDefinirValor(definirValor: DefinirValor): string {
        let resultado = '';
        if (definirValor.objeto instanceof Isto) {
            resultado = 'this.' + definirValor.nome.lexema + ' = ';
        }

        resultado += definirValor.valor.simbolo.lexema;
        return resultado;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        let resultado = '';

        const retorno = `${this.dicionarioConstrutos[chamada.entidadeChamada.constructor.name](chamada.entidadeChamada)}`;

        const instanciaClasse = this.declaracoesDeClasses.some(declaracao => declaracao?.simbolo?.lexema === retorno);
        if (instanciaClasse) {
            const classe = this.declaracoesDeClasses.find(declaracao => declaracao?.simbolo?.lexema === retorno);
            if (classe.simbolo.lexema === retorno)
                resultado += `new ${retorno}`
        } else {
            resultado += retorno
        }
        resultado += '(';
        for (let parametro of chamada.argumentos) {
            resultado += this.dicionarioConstrutos[parametro.constructor.name](parametro) + ', ';
        }
        if (chamada.argumentos.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
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

    logicaTraducaoMetodoClasse(metodoClasse: FuncaoDeclaracao): string {
        this.indentacao += 4;
        let resultado = ' '.repeat(this.indentacao);
        resultado += metodoClasse.simbolo.lexema === 'construtor' ? 'constructor(' : metodoClasse.simbolo.lexema + '(';

        for (let parametro of metodoClasse.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }
        if (metodoClasse.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';
        resultado += this.logicaComumBlocoEscopo(metodoClasse.funcao.corpo);
        resultado += ' '.repeat(this.indentacao) + '\n';

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoClasse(declaracaoClasse: Classe): string {
        let resultado = 'export class ';

        if(declaracaoClasse.superClasse)
            resultado += `${declaracaoClasse.simbolo.lexema} extends ${declaracaoClasse.superClasse.simbolo.lexema} {\n`
        else
            resultado += declaracaoClasse.simbolo.lexema + ' {\n';

        for (let metodo of declaracaoClasse.metodos) {
            resultado += this.logicaTraducaoMetodoClasse(metodo);
        }

        resultado += '}';
        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        let resultado = 'while (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](declaracaoEnquanto.condicao) + ') ';
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](declaracaoEnquanto.corpo);
        return resultado;
    }

    logicaComumCaminhosEscolha(caminho: CaminhoEscolha): string {
        let resultado = '';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);
        if (caminho?.condicoes?.length) {
            for (let condicao of caminho.condicoes) {
                resultado += 'case ' + this.dicionarioConstrutos[condicao.constructor.name](condicao) + ':\n';
                resultado += ' '.repeat(this.indentacao);
            }
        }
        if (caminho?.declaracoes?.length) {
            for (let declaracao of caminho.declaracoes) {
                resultado += ' '.repeat(this.indentacao + 4);
                if (declaracao?.simboloChave?.lexema === 'retorna') {
                    resultado +=
                        'return ' + this.dicionarioConstrutos[declaracao.valor.constructor.name](declaracao.valor);
                }
                resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
            }
            resultado += ' '.repeat(this.indentacao + 4);
            resultado += 'break' + '\n';
        }

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha): string {
        let resultado = 'switch (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEscolha.identificadorOuLiteral.constructor.name](
                declaracaoEscolha.identificadorOuLiteral
            ) + ') {\n';

        for (let caminho of declaracaoEscolha.caminhos) {
            resultado += this.logicaComumCaminhosEscolha(caminho);
        }

        if (declaracaoEscolha.caminhoPadrao) {
            resultado += ' '.repeat(4);
            resultado += 'default:\n';
            resultado += this.logicaComumCaminhosEscolha(declaracaoEscolha.caminhoPadrao);
        }

        resultado += '}\n';
        return resultado;
    }

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

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoFazer(declaracaoFazer: Fazer): string {
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

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
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

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let resultado = 'for (';
        resultado +=
            this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](declaracaoPara.inicializador) + ' ';

        resultado += !resultado.includes(';') ? ';': '';

        resultado +=
            this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao) + '; ';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](declaracaoPara.incrementar) + ') ';

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna): string {
        let resultado = 'return ';
        const nomeConstrutor = declaracaoRetorna.valor.constructor.name;
        return (resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna?.valor));
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
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

    traduzirDeclaracaoTente(declaracaoTente: Tente): string {
        let resultado = 'try {\n';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for (let condicao of declaracaoTente.caminhoTente) {
            resultado += this.dicionarioDeclaracoes[condicao.constructor.name](condicao) + '\n';
            resultado += ' '.repeat(this.indentacao);
        }
        resultado += '}';

        if (declaracaoTente.caminhoPegue !== null) {
            resultado += '\ncatch {\n';
            resultado += ' '.repeat(this.indentacao);
            if (Array.isArray(declaracaoTente.caminhoPegue)) {
                for (let declaracao of declaracaoTente.caminhoPegue) {
                    resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
                }
            } else {
                for (let corpo of declaracaoTente.caminhoPegue.corpo) {
                    resultado += this.dicionarioDeclaracoes[corpo.constructor.name](corpo) + '\n';
                }
            }
            
            resultado += ' '.repeat(this.indentacao);
            resultado += '}';
        }
        if (declaracaoTente.caminhoFinalmente !== null) {
            resultado += '\nfinally {\n';
            for (let finalmente of declaracaoTente.caminhoFinalmente) {
                resultado += this.dicionarioDeclaracoes[finalmente.constructor.name](finalmente) + '\n';
            }
            resultado += ' '.repeat(this.indentacao);
            resultado += '}';
        }

        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = 'let ';
        resultado += declaracaoVar.simbolo.lexema;
        if(!declaracaoVar?.inicializador)
            resultado += ';';
        else {
            resultado += ' = ';
            resultado += this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](
                declaracaoVar.inicializador
            );
            resultado += ";"
        }
        return resultado;
    }

    trazudirConstrutoAcessoMetodo(acessoMetodo: AcessoMetodo): string {
        if (acessoMetodo.objeto instanceof Variavel) {
            let objetoVariavel = acessoMetodo.objeto as Variavel;
            return `${objetoVariavel.simbolo.lexema}.${acessoMetodo.simbolo.lexema}`;
        }
        return `this.${acessoMetodo.simbolo.lexema}`;
    }

    traduzirFuncaoConstruto(funcaoConstruto: FuncaoConstruto): string {
        let resultado = 'function('
        for (const parametro of funcaoConstruto.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (funcaoConstruto.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') '

        resultado += this.logicaComumBlocoEscopo(funcaoConstruto.corpo);
        return resultado;
    }

    traduzirConstrutoLogico(logico: Logico): string {
        let direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita)
        let operador = this.traduzirSimboloOperador(logico.operador)
        let esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda)

        return `${direita} ${operador} ${esquerda}`;
    }

    traduzirConstrutoAtribuicaoSobrescrita(atribuicaoSobrescrita: AtribuicaoSobrescrita): string {
        let resultado = '';
        
        resultado += atribuicaoSobrescrita.objeto.simbolo.lexema + '['
        resultado += this.dicionarioConstrutos[atribuicaoSobrescrita.indice.constructor.name](atribuicaoSobrescrita.indice) + ']'
        resultado += ' = '

        if(atribuicaoSobrescrita?.valor?.simbolo?.lexema){
            resultado += `${atribuicaoSobrescrita.valor.simbolo.lexema}`
        } else {
            resultado += this.dicionarioConstrutos[atribuicaoSobrescrita.valor.constructor.name](atribuicaoSobrescrita.valor)
        }

        return resultado;
    }

    traduzirAcessoIndiceVariavel(acessoIndiceVariavel: AcessoIndiceVariavel): string {
        let resultado = '';

        resultado += this.dicionarioConstrutos[acessoIndiceVariavel.entidadeChamada.constructor.name](acessoIndiceVariavel.entidadeChamada)
        resultado += `[${this.dicionarioConstrutos[acessoIndiceVariavel.indice.constructor.name](acessoIndiceVariavel.indice)}]`

        return resultado;
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        if(!vetor.valores.length){
            return '[]'
        }
        
        let resultado = '[';

        for(let valor of vetor.valores){
            resultado += `${this.dicionarioConstrutos[valor.constructor.name](valor)}, `
        }
        if (vetor.valores.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ']'

        return resultado;
    }

    traduzirConstrutoUnario(unario: Unario): string {
        let resultado = '';
        resultado += this.traduzirSimboloOperador(unario.operador);
        resultado += unario.direita.valor ?? unario.direita.simbolo.lexema;
        return resultado;
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirAcessoIndiceVariavel.bind(this),
        AcessoMetodo: this.trazudirConstrutoAcessoMetodo.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        AtribuicaoSobrescrita: this.traduzirConstrutoAtribuicaoSobrescrita.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
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

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        this.declaracoesDeClasses = declaracoes.filter(declaracao => declaracao instanceof Classe) as Classe[];

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
