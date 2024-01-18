import { Atribuir, Construto, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Literal, Super, TipoDe } from '../construtos';
import { Classe, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, Fazer, Importar, Para, ParaCada, Se, Tente, Var, VarMultiplo, Bloco, Continua, EscrevaMesmaLinha, Leia, LeiaMultiplo, Retorna, Sustar, Declaracao } from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

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
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += ")\n";
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
            if (declaracao.caminhoPegue instanceof FuncaoConstruto) {
                // Se tem um parâmetro de erro.
            } else {
                // Se não tem um parâmetro de erro.
                this.indentacaoAtual += 4;
                for (let declaracaoBloco of (declaracao.caminhoPegue as Declaracao[])) {
                    this.formatarDeclaracaoOuConstruto(declaracaoBloco);
                    this.codigoFormatado += ', ';
                }
            }

            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
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

    visitarExpressaoLiteral(expressao: Literal): any {
        if (expressao.valor instanceof String) {
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
    visitarExpressaoUnaria(expressao: any) {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error('Method not implemented.');
    }

    formatarDeclaracaoOuConstruto(declaracaoOuConstruto: Declaracao | Construto): void {
        switch (declaracaoOuConstruto.constructor.name) {
            case 'Escreva':
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case 'Literal':
                this.visitarExpressaoLiteral(declaracaoOuConstruto as Literal);
                break;
            case 'Tente':
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }

    formatar(declaracoes: Declaracao[], quebraLinha: string, tamanhoIndentacao: number = 4): string {
        this.codigoFormatado = "";
        this.indentacaoAtual = 0;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
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
