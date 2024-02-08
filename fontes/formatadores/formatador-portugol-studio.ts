import { AcessoIndiceVariavel, AcessoMetodoOuPropriedade, Agrupamento, AtribuicaoPorIndice, Atribuir, Binario, Chamada, Construto, DefinirValor, Dicionario, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Isto, Literal, Logico, Super, TipoDe, Tupla, Unario, Variavel, Vetor } from "../construtos";
import { Classe, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, Fazer, Importar, Para, ParaCada, Se, Tente, Var, VarMultiplo, Bloco, Continua, EscrevaMesmaLinha, Leia, LeiaMultiplo, Retorna, Sustar, Declaracao, Falhar, Aleatorio, CabecalhoPrograma } from "../declaracoes";
import { InicioAlgoritmo } from "../declaracoes/inicio-algoritmo";
import { VisitanteComumInterface } from "../interfaces";
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from "../quebras";

export class FormatadorPortugolStudio implements VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;
    deveIndentar: boolean;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.devePularLinha = true;
        this.deveIndentar = true;
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error("Método não implementado.");
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error("Método não implementado.");
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        throw new Error("Método não implementado");
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        // throw new Error("Método não implementado");
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}funcao ${declaracao.simbolo.lexema}()${this.quebraLinha}`;

        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}{${this.quebraLinha}`;
        this.visitarExpressaoFuncaoConstruto(declaracao.funcao);
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error("Método não implementado");
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoSe(declaracao: Se) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoBinaria(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error("Método não implementado");
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracaoCorpo of expressao.corpo) {
            this.formatarDeclaracaoOuConstruto(declaracaoCorpo);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error("Método não implementado");
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `"${expressao.valor}"`;
            return;
        }

        this.codigoFormatado += `${expressao.valor}`;
    }

    visitarExpressaoLogica(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error("Método não implementado");
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error("Método não implementado");
    }
    visitarExpressaoUnaria(expressao: any) {
        throw new Error("Método não implementado");
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error("Método não implementado");
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


    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = `programa${this.quebraLinha}{${this.quebraLinha}`;
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `}${this.quebraLinha}`;

        return this.codigoFormatado;
    }
}