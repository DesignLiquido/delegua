import { Atribuir, ExpressaoRegular, FimPara, FormatacaoEscrita, Literal, Super, TipoDe } from '../construtos';
import { Classe, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, Fazer, Importar, Para, ParaCada, Se, Tente, Var, VarMultiplo, Bloco, Continua, EscrevaMesmaLinha, Leia, LeiaMultiplo, Retorna, Sustar, Declaracao } from '../declaracoes';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * O formatador de código Delégua.
 * Normalmente usado por IDEs, mas pode ser usado por linha de comando ou programaticamente.
 */
export class FormatadorDelegua implements VisitanteComumInterface {
    indentacaoAtual: number;
    blocoAberto: boolean;
    codigoFormatado: string;

    constructor() {
        this.indentacaoAtual = 0;
        this.blocoAberto = true;
        this.codigoFormatado = "";
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
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEscreva(declaracao: Escreva) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoSe(declaracao: Se) {
        throw new Error('Method not implemented.');
    }

    visitarDeclaracaoTente(declaracao: Tente) {
        this.codigoFormatado += "tente {\n";
        if (declaracao.caminhoPegue) {
            this.codigoFormatado += "} pegue {\n";
        }

        if (declaracao.caminhoFinalmente) {
            this.codigoFormatado += "} finalmente {\n";
        }

        this.codigoFormatado += "}\n\n";
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        throw new Error('Method not implemented.');
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
    visitarExpressaoBinaria(expressao: any) {
        throw new Error('Method not implemented.');
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
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error('Method not implemented.');
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
    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        throw new Error('Method not implemented.');
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
    visitarExpressaoUnaria(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error('Method not implemented.');
    }

    formatarDeclaracao(declaracao: Declaracao): void {
        switch (declaracao.constructor.name) {
            case 'Tente':
                this.visitarDeclaracaoTente(declaracao as Tente);
            default:
                console.log(declaracao.constructor.name);
        }
    }

    formatar(declaracoes: Declaracao[], quebraLinha: string, tamanhoIndentacao: number = 4): string {
        this.codigoFormatado = "";
        this.indentacaoAtual = 0;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracao(declaracao);
        }

        return this.codigoFormatado;
    }

    /**
     * Devolve código formatado de acordo com os símbolos encontrados.
     * @param simbolos Um vetor de símbolos.
     * @param quebraLinha O símbolo de quebra de linha. Normalmente `\r\n` para Windows e `\n` para outros sistemas operacionais.
     * @param tamanhoIndentacao O tamanho de cada bloco de indentação (por padrão, 4)
     * @returns Código Delégua formatado.
     */
    /* formatar(simbolos: SimboloInterface[], quebraLinha: string, tamanhoIndentacao: number = 4): string {
        let resultado = '';
        let deveQuebrarLinha: boolean = false;

        for (let simbolo of simbolos) {
            switch (simbolo.tipo) {
                case tiposDeSimbolos.CHAVE_ESQUERDA:
                    this.indentacao += tamanhoIndentacao;
                    resultado += '{' + quebraLinha;
                    resultado += ' '.repeat(this.indentacao);
                    break;
                case tiposDeSimbolos.CHAVE_DIREITA:
                    this.indentacao -= tamanhoIndentacao;
                    resultado += quebraLinha + ' '.repeat(this.indentacao) + '}' + quebraLinha;
                    break;
                case tiposDeSimbolos.ESCREVA:
                    deveQuebrarLinha = true;
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.FAZER:
                case tiposDeSimbolos.FINALMENTE:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.PEGUE:
                case tiposDeSimbolos.RETORNA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.SENAO:
                case tiposDeSimbolos.SENÃO:
                case tiposDeSimbolos.TENTE:
                case tiposDeSimbolos.VARIAVEL:
                    resultado += quebraLinha + ' '.repeat(this.indentacao) + simbolo.lexema + ' ';
                    break;
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    resultado += '(';
                    break;
                case tiposDeSimbolos.PARENTESE_DIREITO:
                    resultado = resultado.trimEnd();
                    resultado += ')';
                    if (deveQuebrarLinha) {
                        deveQuebrarLinha = false;
                        resultado += quebraLinha;
                    } else {
                        resultado += ' ';
                    }

                    break;
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.IDENTIFICADOR:
                case tiposDeSimbolos.IGUAL:
                case tiposDeSimbolos.IGUAL_IGUAL:
                    resultado += simbolo.lexema + ' ';
                    break;
                default:
                    resultado += simbolo.lexema;
                    break;
            }
        }

        return resultado;
    } */
}
