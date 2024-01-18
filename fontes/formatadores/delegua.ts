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
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
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

        this.codigoFormatado += `)${this.quebraLinha}`;
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
        this.codigoFormatado += `tente {${this.quebraLinha}`;
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
