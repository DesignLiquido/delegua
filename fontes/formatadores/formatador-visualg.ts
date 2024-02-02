import { AcessoIndiceVariavel, AcessoMetodoOuPropriedade, Agrupamento, AtribuicaoPorIndice, Atribuir, Binario, Chamada, Construto, DefinirValor, Dicionario, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Isto, Literal, Logico, Super, TipoDe, Unario, Variavel, Vetor } from "../construtos";
import { Aleatorio, Classe, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, Fazer, Importar, Para, ParaCada, Se, Tente, Var, VarMultiplo, Bloco, Continua, EscrevaMesmaLinha, Leia, LeiaMultiplo, Retorna, Sustar, Declaracao, Falhar } from "../declaracoes";
import { VisitanteComumInterface } from "../interfaces";
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from "../quebras";
import tiposDeSimbolos from '../tipos-de-simbolos/visualg';

export class FormatadorVisualG implements VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;
    deveIndentar: boolean;
    contadorDeclaracaoVar: number;
    deveAdicionarInicio: boolean;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.devePularLinha = false;
        this.deveIndentar = true;
        this.contadorDeclaracaoVar = 0
        this.deveAdicionarInicio = true;
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): any {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoConst(declaracao: Const): any {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        console.log(expressao);

        this.codigoFormatado += `${expressao.simbolo.lexema} <- `;
        this.formatarDeclaracaoOuConstruto(expressao.valor);

        this.codigoFormatado += `${this.quebraLinha}`;
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.codigoFormatado += ' '.repeat(this.indentacaoAtual);
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEscreva(declaracao: Escreva) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoPara(declaracao: Para): any {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): any {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoSe(declaracao: Se) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoVar(declaracao: Var): any {
        if (this.contadorDeclaracaoVar === 0) {
            this.codigoFormatado += `var${this.quebraLinha}`
            this.contadorDeclaracaoVar++;
        }
        if (this.deveIndentar) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
        }

        this.codigoFormatado += `${declaracao.simbolo.lexema}`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` : ${declaracao.tipo.toLowerCase()}`;
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAgrupamento(expressao: any): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoBinaria(expressao: Binario) {
        console.log(expressao);
        console.log(expressao.operador.tipo);

        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += " + "
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += " / "
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += ' \ '
                break;
            case tiposDeSimbolos.
        }
    }
    visitarExpressaoBloco(declaracao: Bloco): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += expressao.simbolo.lexema;
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        this.codigoFormatado += `${" ".repeat(this.tamanhoIndentacao)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += ", ";
        }
        if (declaracao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }
        this.codigoFormatado += `)${this.quebraLinha}`;


    }
    visitarExpressaoFalhar(expressao: any): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        if (declaracao.expressao instanceof Variavel) {
            this.codigoFormatado += declaracao.expressao.simbolo.lexema
            return;
        } else if (declaracao.expressao instanceof Literal) {
            this.codigoFormatado += `"${declaracao.expressao.valor}"`
            return;
        }
        this.codigoFormatado += `${declaracao.expressao.valor}`
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoLeia(expressao: Leia): any {
        this.codigoFormatado += `${" ".repeat(this.tamanhoIndentacao)}leia(`;
        for (let argumento of expressao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += `, `;
        }

        if (expressao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): any {
        return Promise.resolve()
    }
    visitarExpressaoLiteral(expressao: any): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `'${expressao.valor}'`;
            return;
        }

        this.codigoFormatado += expressao.valor;
    }
    visitarExpressaoLogica(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoTipoDe(expressao: TipoDe): any {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoUnaria(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error("Método não implementado.");
    }

    formatarDeclaracaoOuConstruto(declaracaoOuConstruto: Declaracao | Construto): void {
        switch (declaracaoOuConstruto.constructor.name) {
            case 'AcessoIndiceVariavel':
                this.visitarExpressaoAcessoIndiceVariavel(declaracaoOuConstruto as AcessoIndiceVariavel);
                break;
            case 'AcessoMetodoOuPropriedade':
                this.visitarExpressaoAcessoMetodo(declaracaoOuConstruto as AcessoMetodoOuPropriedade);
                break;
            case 'Agrupamento':
                this.visitarExpressaoAgrupamento(declaracaoOuConstruto as Agrupamento);
                break;
            case 'AtribuicaoPorIndice':
                this.visitarExpressaoAtribuicaoPorIndice(declaracaoOuConstruto as AtribuicaoPorIndice);
                break;
            case 'Atribuir':
                this.visitarExpressaoDeAtribuicao(declaracaoOuConstruto as Atribuir);
                break;
            case 'Binario':
                this.visitarExpressaoBinaria(declaracaoOuConstruto as Binario);
                break;
            case 'Bloco':
                this.visitarExpressaoBloco(declaracaoOuConstruto as Bloco);
                break;
            case 'Chamada':
                this.visitarExpressaoDeChamada(declaracaoOuConstruto as Chamada);
                break;
            case 'Classe':
                this.visitarDeclaracaoClasse(declaracaoOuConstruto as Classe);
                break;
            case 'Continua':
                this.visitarExpressaoContinua(declaracaoOuConstruto as Continua);
                break;
            case 'DefinirValor':
                this.visitarExpressaoDefinirValor(declaracaoOuConstruto as DefinirValor);
                break;
            case 'Dicionario':
                this.visitarExpressaoDicionario(declaracaoOuConstruto as Dicionario);
                break;
            case 'Escolha':
                this.visitarDeclaracaoEscolha(declaracaoOuConstruto as Escolha);
                break;
            case 'Enquanto':
                this.visitarDeclaracaoEnquanto(declaracaoOuConstruto as Enquanto);
                break;
            case 'Escreva':
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case 'EscrevaMesmaLinha':
                this.visitarDeclaracaoEscrevaMesmaLinha(declaracaoOuConstruto as Escreva);
                break;
            case 'Expressao':
                this.visitarDeclaracaoDeExpressao(declaracaoOuConstruto as Expressao);
                break;
            case 'ExpressaoRegular':
                this.visitarExpressaoExpressaoRegular(declaracaoOuConstruto as ExpressaoRegular);
                break;
            case 'Falhar':
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar)
                break;
            case 'Fazer':
                this.visitarDeclaracaoFazer(declaracaoOuConstruto as Fazer);
                break;
            case 'FormatacaoEscrita':
                this.visitarExpressaoFormatacaoEscrita(declaracaoOuConstruto as FormatacaoEscrita);
                break;
            case 'FuncaoConstruto':
                this.visitarExpressaoFuncaoConstruto(declaracaoOuConstruto as FuncaoConstruto);
                break;
            case 'FuncaoDeclaracao':
                this.visitarDeclaracaoDefinicaoFuncao(declaracaoOuConstruto as FuncaoDeclaracao);
                break;
            case 'Importar':
                this.visitarDeclaracaoImportar(declaracaoOuConstruto as Importar);
                break;
            case 'Isto':
                this.visitarExpressaoIsto(declaracaoOuConstruto as Isto);
                break;
            case 'Leia':
                this.visitarExpressaoLeia(declaracaoOuConstruto as Leia);
                break;
            case 'Literal':
                this.visitarExpressaoLiteral(declaracaoOuConstruto as Literal);
                break;
            case 'Logico':
                this.visitarExpressaoLogica(declaracaoOuConstruto as Logico);
                break;
            case 'Para':
                this.visitarDeclaracaoPara(declaracaoOuConstruto as Para);
                break;
            case 'ParaCada':
                this.visitarDeclaracaoParaCada(declaracaoOuConstruto as ParaCada);
                break;
            case 'Retorna':
                this.visitarExpressaoRetornar(declaracaoOuConstruto as Retorna);
                break;
            case 'Se':
                this.visitarDeclaracaoSe(declaracaoOuConstruto as Se);
                break;
            case 'Super':
                this.visitarExpressaoSuper(declaracaoOuConstruto as Super);
                break;
            case 'Sustar':
                this.visitarExpressaoSustar(declaracaoOuConstruto as Sustar);
                break;
            case 'Tente':
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            case 'TipoDe':
                this.visitarExpressaoTipoDe(declaracaoOuConstruto as TipoDe);
                break;
            case 'Unario':
                this.visitarExpressaoUnaria(declaracaoOuConstruto as Unario);
                break;
            case 'Const':
                this.visitarDeclaracaoConst(declaracaoOuConstruto as Const);
                break;
            case 'Var':
                this.visitarDeclaracaoVar(declaracaoOuConstruto as Var);
                break;
            case 'Variavel':
                this.visitarExpressaoDeVariavel(declaracaoOuConstruto as Variavel);
                break;
            case 'Vetor':
                this.visitarExpressaoVetor(declaracaoOuConstruto as Vetor);
                break;
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        throw new Error("Método não implementado.");
    }

    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = `algoritmo${this.quebraLinha}`;
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracao of declaracoes) {
            if (!(declaracao instanceof Var) && this.deveAdicionarInicio) {
                this.codigoFormatado += `${this.quebraLinha}inicio${this.quebraLinha}`
                this.deveAdicionarInicio = false;
            } else if (declaracao instanceof Var) this.deveAdicionarInicio = true


            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${this.quebraLinha}fimalgoritmo`
        return this.codigoFormatado;
    }

}