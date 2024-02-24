import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Constante,
    Construto,
    Deceto,
    DefinirValor,
    Dicionario,
    Dupla,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    Septeto,
    Sexteto,
    Super,
    TipoDe,
    Trio,
    Tupla,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Classe,
    Const,
    ConstMultiplo,
    Expressao,
    FuncaoDeclaracao,
    Enquanto,
    Escolha,
    Escreva,
    Fazer,
    Importar,
    Para,
    ParaCada,
    Se,
    Tente,
    Var,
    VarMultiplo,
    Bloco,
    Continua,
    EscrevaMesmaLinha,
    Leia,
    LeiaMultiplo,
    Retorna,
    Sustar,
    Declaracao,
    Falhar,
    Aleatorio,
    CabecalhoPrograma,
    TendoComo,
    PropriedadeClasse,
} from '../declaracoes';
import { InicioAlgoritmo } from '../declaracoes/inicio-algoritmo';
import { VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';
import tiposDeSimbolos from '../tipos-de-simbolos/potigol';
import { inferirTipoVariavel } from '../interpretador/inferenciador';
export class FormatadorPotigol implements VisitanteComumInterface {
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

    visitarDeclaracaoTendoComo(declaracao: TendoComo): void | Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}tipo ${declaracao.simbolo.lexema}${this.quebraLinha}`
        this.formatarBlocoOuVetorDeclaracoes(declaracao.propriedades)
        this.formatarBlocoOuVetorDeclaracoes(declaracao.metodos)
        this.codigoFormatado += `fim${this.quebraLinha}`
    }

    visitarExpressaoPropriedadeClasse(expressao: PropriedadeClasse): any {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}${expressao.nome.lexema}: `
        if (expressao.tipo) {
            this.codigoFormatado += `${expressao.tipo}`
        }
        this.codigoFormatado += this.quebraLinha
    }

    visitarDeclaracaoConst(declaracao: Const): any {
        this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}${declaracao.simbolo.lexema}`

        if (declaracao.tipo) {
            this.codigoFormatado += ": "
            switch (declaracao.tipo.toUpperCase()) {
                case tiposDeSimbolos.TEXTO:
                    this.codigoFormatado += 'Caractere = '
                    break;
                case tiposDeSimbolos.INTEIRO:
                    this.codigoFormatado += 'Inteiro = '
                    break;
                case "NUMERO":
                case tiposDeSimbolos.REAL:
                    this.codigoFormatado += 'Real = '
                    break;
                case tiposDeSimbolos.LOGICO:
                    this.codigoFormatado += 'Logico = '
                    break;
                case tiposDeSimbolos.LÓGICO:
                    this.codigoFormatado += 'Lógico = '
                    break;
                default:
                    console.log(declaracao.tipo);
                    break;
            }
        }

        if (declaracao.inicializador && !declaracao.tipo) {
            this.codigoFormatado += " = "
        }

        if (declaracao.inicializador) {
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador)
        }

    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        this.codigoFormatado += `${expressao.simbolo.lexema} de `;
        this.formatarDeclaracaoOuConstruto(expressao.valor);

        if (this.devePularLinha) {
            this.codigoFormatado += `${this.quebraLinha}`;
        }
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.formatarDeclaracaoOuConstruto(declaracao.expressao)
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        if (declaracao.simbolo.tipo !== tiposDeSimbolos.CONSTRUTOR) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${declaracao.simbolo.lexema}(`;

            this.visitarExpressaoFuncaoConstruto(declaracao.funcao);
        }
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto(`;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` ) faca`;
        this.codigoFormatado += this.quebraLinha;

        this.devePularLinha = true
        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
        this.codigoFormatado += this.quebraLinha;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fim`;
        this.devePularLinha = false
    }

    private formatarBlocoOuVetorDeclaracoes(declaracoes: Declaracao[]) {
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }
        this.indentacaoAtual -= this.tamanhoIndentacao;
    }


    visitarDeclaracaoEscolha(declaracao: Escolha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escolha `;

        this.formatarDeclaracaoOuConstruto(declaracao.identificadorOuLiteral);
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let caminho of declaracao.caminhos) {
            this.deveIndentar = false
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso `;
            this.formatarBlocoOuVetorDeclaracoes(caminho.condicoes)
            this.codigoFormatado += ` => `;
            this.formatarBlocoOuVetorDeclaracoes(caminho.declaracoes)
            this.codigoFormatado += this.quebraLinha
            this.deveIndentar = true
        }

        if (declaracao.caminhoPadrao.declaracoes.length > 0) {
            this.deveIndentar = false
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso _ => `;
            this.formatarBlocoOuVetorDeclaracoes(declaracao.caminhoPadrao.declaracoes);
            this.deveIndentar = true
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}fim${this.quebraLinha}`;
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        if (this.deveIndentar) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva (`;
        } else {
            this.codigoFormatado += `escreva (`;
        }
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += `)`
        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha
        }
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoPara(declaracao: Para): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}para `;
        this.indentacaoAtual += this.tamanhoIndentacao
        this.devePularLinha = false;
        if (declaracao.inicializador) {
            if (Array.isArray(declaracao.inicializador)) {
                this.deveIndentar = false;
                for (let declaracaoInicializador of declaracao.inicializador) {
                    this.formatarDeclaracaoOuConstruto(declaracaoInicializador);
                }
                this.deveIndentar = true;
            } else {
                this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
            }
        }

        if (declaracao.condicao instanceof Binario) this.codigoFormatado += ` ate ${declaracao.condicao.direita.valor}`;
        else this.formatarDeclaracaoOuConstruto(declaracao.condicao);

        this.codigoFormatado += ` faca${this.quebraLinha}`;
        this.formatarDeclaracaoOuConstruto(declaracao.incrementar);

        this.formatarBlocoOuVetorDeclaracoes(declaracao.corpo.declaracoes);

        this.indentacaoAtual -= this.tamanhoIndentacao
        this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}fim${this.quebraLinha}`;
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoSe(declaracao: Se) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}se ( `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` ) entao${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of (declaracao.caminhoEntao as Bloco).declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        if (declaracao.caminhoSenao) {
            this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}senao${this.quebraLinha}`;
            this.formatarDeclaracaoOuConstruto(declaracao.caminhoSenao);
        }
        this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}fim${this.quebraLinha}`;
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoVar(declaracao: Var): any {
        if (this.deveIndentar) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
        }

        this.codigoFormatado += `var ${declaracao.simbolo.lexema}`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` := `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAgrupamento(expressao: any): any {
        this.codigoFormatado += '(';
        this.formatarDeclaracaoOuConstruto(expressao.expressao);
        this.codigoFormatado += ')';
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoBinaria(expressao: Binario) {
        /* this.codigoFormatado += `${" ".repeat(this.indentacaoAtual)}` */
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += ' + ';
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += ' / ';
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += ' div ';
                break;
            case tiposDeSimbolos.IGUAL:
                this.codigoFormatado += ' = ';
                break;
            case tiposDeSimbolos.MAIOR:
                this.codigoFormatado += ' > ';
                break;
            case tiposDeSimbolos.MAIOR_IGUAL:
                this.codigoFormatado += ' >= ';
                break;
            case tiposDeSimbolos.MENOR:
                this.codigoFormatado += ' < ';
                break;
            case tiposDeSimbolos.MENOR_IGUAL:
                this.codigoFormatado += ' <= ';
                break;
            case tiposDeSimbolos.SUBTRACAO:
                this.codigoFormatado += ` - `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.MODULO:
                this.codigoFormatado += ` mod `;
                break;
            case tiposDeSimbolos.EXPONENCIACAO:
                this.codigoFormatado += ` ^ `;
                break;
            case tiposDeSimbolos.IGUAL_IGUAL:
                this.codigoFormatado += ` == `;
                break;
            case tiposDeSimbolos.DIFERENTE:
                this.codigoFormatado += ` <> `;
                break;
            default:
                console.log(expressao.operador.tipo);
                break;
        }
        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }
    visitarExpressaoBloco(declaracao: Bloco): any {
        this.formatarBlocoOuVetorDeclaracoes(declaracao.declaracoes);
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}imprima `;
        for (let argumento of declaracao.argumentos) {
            const argumentoTratado = argumento as FormatacaoEscrita;
            this.formatarDeclaracaoOuConstruto(argumentoTratado);
            this.codigoFormatado += ', ';
        }
        if (declaracao.argumentos.length && this.codigoFormatado[this.codigoFormatado.length - 2] === ',') {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }
    }
    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        this.indentacaoAtual += this.tamanhoIndentacao;

        if (expressao.parametros.length > 0) {
            for (let parametro of expressao.parametros) {
                if (parametro.tipoDado) {
                    this.codigoFormatado += `${parametro.tipoDado.nome}: `
                    switch (parametro.tipoDado.tipo.toUpperCase()) {
                        case tiposDeSimbolos.TEXTO:
                            this.codigoFormatado += "Caractere"
                            break;
                        case tiposDeSimbolos.REAL:
                            this.codigoFormatado += "Real"
                            break;
                        case tiposDeSimbolos.INTEIRO:
                            this.codigoFormatado += "Inteiro"
                            break;
                        default:
                            break;
                    }
                    this.codigoFormatado += `, `
                }
            }
            this.codigoFormatado = `${this.codigoFormatado.slice(0, -2)}): `;
        }

        for (let declaracaoCorpo of expressao.corpo) {
            this.formatarDeclaracaoOuConstruto(declaracaoCorpo);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `"${expressao.valor}"`;
            return;
        } else if (typeof expressao.valor === "boolean") {
            if (expressao.valor) {
                this.codigoFormatado += "verdadeiro"
            } else {
                this.codigoFormatado += "falso"
            }
            return;
        }

        this.codigoFormatado += `${expressao.valor}`;
    }

    visitarExpressaoLogica(expressao: any) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.E:
                this.codigoFormatado += ` e `;
                break;
            case tiposDeSimbolos.OU:
                this.codigoFormatado += ` ou `;
                break;
            case tiposDeSimbolos.NEGACAO:
                this.codigoFormatado += ` nao `;
                break;
        }

        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado');
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoUnaria(expressao: Unario) {
        let operador: string;
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                operador = ` - `;
                break;
            case tiposDeSimbolos.ADICAO:
                operador = ` + `;
                break;
            case tiposDeSimbolos.NEGACAO:
                operador = ` nao `;
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
        throw new Error('Método não implementado');
    }

    visitarDeclaracaoConstante(expressao: Constante): any {
        this.codigoFormatado += `${expressao.simbolo.lexema}`
    }

    private formatarDeclaraTuplas(declaracao: Declaracao | Construto) {
        const declaracoes = Object.keys(declaracao)
        this.codigoFormatado += "("
        for (let chaveDeclaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao[chaveDeclaracao])
            this.codigoFormatado += ", "
        }
        this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        this.codigoFormatado += ")"
    }

    visitarExpressaoDupla(expressao: Dupla): any {
        this.formatarDeclaraTuplas(expressao)
    }

    visitarExpressaoTrio(expressao: Trio): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoQuarteto(expressao: Quarteto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoQuinteto(expressao: Quinteto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoSexteto(expressao: Sexteto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoSepteto(expressao: Septeto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoOcteto(expressao: Octeto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoNoneto(expressao: Noneto): any {
        this.formatarDeclaraTuplas(expressao)
    }
    visitarExpressaoDeceto(expressao: Deceto): any {
        this.formatarDeclaraTuplas(expressao)
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
            case 'Dupla':
                this.visitarExpressaoDupla(declaracaoOuConstruto as Dupla);
                break;
            case 'Trio':
                this.visitarExpressaoTrio(declaracaoOuConstruto as Trio);
                break;
            case 'Quarteto':
                this.visitarExpressaoQuarteto(declaracaoOuConstruto as Quarteto);
                break;
            case 'Quinteto':
                this.visitarExpressaoQuinteto(declaracaoOuConstruto as Quinteto);
                break;
            case 'Sexteto':
                this.visitarExpressaoSexteto(declaracaoOuConstruto as Sexteto);
                break;
            case 'Septeto':
                this.visitarExpressaoSepteto(declaracaoOuConstruto as Septeto);
                break;
            case 'Octeto':
                this.visitarExpressaoOcteto(declaracaoOuConstruto as Octeto);
                break;
            case 'Noneto':
                this.visitarExpressaoNoneto(declaracaoOuConstruto as Noneto);
                break;
            case 'Deceto':
                this.visitarExpressaoDeceto(declaracaoOuConstruto as Deceto);
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
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar);
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
            case 'Constante':
                this.visitarDeclaracaoConstante(declaracaoOuConstruto as Constante);
                break;
            case 'PropriedadeClasse':
                this.visitarExpressaoPropriedadeClasse(declaracaoOuConstruto as any);
                break;
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }

    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = "";
        this.devePularLinha = true;
        this.deveIndentar = true;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        return this.codigoFormatado;
    }
}
