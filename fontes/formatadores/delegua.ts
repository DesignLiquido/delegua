import { Atribuir, Binario, Construto, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Literal, Super, TipoDe, Unario, Variavel } from '../construtos';
import { Classe, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, Fazer, Importar, Para, ParaCada, Se, Tente, Var, VarMultiplo, Bloco, Continua, EscrevaMesmaLinha, Leia, LeiaMultiplo, Retorna, Sustar, Declaracao } from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * O formatador de código Delégua.
 * Normalmente usado por IDEs, mas pode ser usado por linha de comando ou programaticamente.
 */
export class FormatadorDelegua implements VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = "";
        this.devePularLinha = true;
    }

    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.codigoFormatado += " ".repeat(this.indentacaoAtual);
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}enquanto `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.corpo.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `}${this.quebraLinha}${this.quebraLinha}`;
    }

    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoPara(declaracao: Para): any {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}para `;
        this.devePularLinha = false;
        if (declaracao.inicializador) {
            if (Array.isArray(declaracao.inicializador)) {
                for (let declaracaoInicializador of declaracao.inicializador) {
                    this.formatarDeclaracaoOuConstruto(declaracaoInicializador);
                }
            } else {
                this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
            }
        }

        this.codigoFormatado += `; `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        
        this.codigoFormatado += `; `;
        this.formatarDeclaracaoOuConstruto(declaracao.incrementar);
        this.devePularLinha = true;
        this.codigoFormatado += ` {${this.quebraLinha}`;
        
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.corpo.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `}${this.quebraLinha}${this.quebraLinha}`;
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoSe(declaracao: Se) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}se `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of (declaracao.caminhoEntao as Bloco).declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        if (declaracao.caminhoSenao) {
            this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}} senão {${this.quebraLinha}`;
            this.indentacaoAtual += this.tamanhoIndentacao;
            for (let declaracaoBloco of (declaracao.caminhoSenao as Bloco).declaracoes) {
                this.formatarDeclaracaoOuConstruto(declaracaoBloco);
            }
            this.indentacaoAtual -= this.tamanhoIndentacao;
        }

        this.codigoFormatado += `}${this.quebraLinha}${this.quebraLinha}`;
    }

    visitarDeclaracaoTente(declaracao: Tente) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}tente {${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.caminhoTente) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        if (declaracao.caminhoPegue) {
            this.codigoFormatado += `} pegue {${this.quebraLinha}`;
            if (declaracao.caminhoPegue instanceof FuncaoConstruto) {
                // Se tem um parâmetro de erro.
            } else {
                // Se não tem um parâmetro de erro.
                this.indentacaoAtual += this.tamanhoIndentacao;
                for (let declaracaoBloco of (declaracao.caminhoPegue as Declaracao[])) {
                    this.formatarDeclaracaoOuConstruto(declaracaoBloco);
                }
            }
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        if (declaracao.caminhoFinalmente) {
            this.codigoFormatado += `} finalmente {${this.quebraLinha}`;
            this.indentacaoAtual += this.tamanhoIndentacao;
            for (let declaracaoBloco of declaracao.caminhoFinalmente) {
                this.formatarDeclaracaoOuConstruto(declaracaoBloco);
            }
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `}${this.quebraLinha}${this.quebraLinha}`;
    }

    visitarDeclaracaoVar(declaracao: Var): any {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}var ${declaracao.simbolo.lexema}`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoBinaria(expressao: Binario) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += ` + `;
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += ` / `;
                break;
            case tiposDeSimbolos.IGUAL_IGUAL:
                this.codigoFormatado += ` == `;
                break;
            case tiposDeSimbolos.MAIOR:
                this.codigoFormatado += ` > `;
                break;
            case tiposDeSimbolos.MAIOR_IGUAL:
                this.codigoFormatado += ` >= `;
                break;
            case tiposDeSimbolos.MENOR:
                this.codigoFormatado += ` < `;
                break;
            case tiposDeSimbolos.MENOR_IGUAL:
                this.codigoFormatado += ` <= `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.SUBTRACAO:
                this.codigoFormatado += ` - `;
                break;
        }

        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += expressao.simbolo.lexema;
    }

    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `'${expressao.valor}'`;
            return;
        }
        
        this.codigoFormatado += expressao.valor;
    }

    visitarExpressaoLogica(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoUnaria(expressao: Unario) {
        let operador: string;
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
                operador = `++`;
                break;
            case tiposDeSimbolos.DECREMENTAR:
                operador = `--`;
                break;
        }

        switch (expressao.incidenciaOperador) {
            case 'ANTES':
                this.codigoFormatado += operador;
                this.formatarDeclaracaoOuConstruto(expressao.operando);
                break;
            case 'DEPOIS':
                this.formatarDeclaracaoOuConstruto(expressao.operando);
                this.codigoFormatado += operador;
                break;
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    visitarExpressaoVetor(expressao: any) {
        throw new Error('Method not implemented.');
    }

    formatarDeclaracaoOuConstruto(declaracaoOuConstruto: Declaracao | Construto): void {
        switch (declaracaoOuConstruto.constructor.name) {
            case 'Binario':
                this.visitarExpressaoBinaria(declaracaoOuConstruto as Binario);
                break;
            case 'Enquanto':
                this.visitarDeclaracaoEnquanto(declaracaoOuConstruto as Enquanto);
                break;
            case 'Escreva':
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case 'Expressao':
                this.visitarDeclaracaoDeExpressao(declaracaoOuConstruto as Expressao);
                break;
            case 'Literal':
                this.visitarExpressaoLiteral(declaracaoOuConstruto as Literal);
                break;
            case 'Para':
                this.visitarDeclaracaoPara(declaracaoOuConstruto as Para);
                break;
            case 'Se':
                this.visitarDeclaracaoSe(declaracaoOuConstruto as Se);
                break;
            case 'Tente':
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            case 'Unario':
                this.visitarExpressaoUnaria(declaracaoOuConstruto as Unario);
                break;
            case 'Var':
                this.visitarDeclaracaoVar(declaracaoOuConstruto as Var);
                break;
            case 'Variavel':
                this.visitarExpressaoDeVariavel(declaracaoOuConstruto as Variavel);
                break;
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }

    /**
     * Devolve código formatado de acordo com os símbolos encontrados.
     * @param {Declaracao[]} declaracoes Um vetor de declarações.
     * @returns Código Delégua formatado.
     */
    formatar(declaracoes: Declaracao[]): string {
        this.codigoFormatado = "";
        this.indentacaoAtual = 0;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        return this.codigoFormatado;
    }
}
