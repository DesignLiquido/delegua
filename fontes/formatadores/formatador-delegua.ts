import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    TipoDe,
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
} from '../declaracoes';
import { InicioAlgoritmo } from '../declaracoes/inicio-algoritmo';
import { VisitanteComumInterface } from '../interfaces';

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
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTupla(expressao: Tupla): any {
        return "";
    }

    visitarDeclaracaoClasse(declaracao: Classe) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}classe ${declaracao.simbolo.lexema} {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let propriedade of declaracao.propriedades) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${propriedade.nome.lexema}: ${propriedade.tipo || 'qualquer'}${this.quebraLinha}`;
        }

        this.codigoFormatado += `${this.quebraLinha}`;

        for (let metodo of declaracao.metodos) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${metodo.simbolo.lexema}`;
            this.visitarExpressaoFuncaoConstruto(metodo.funcao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoConst(declaracao: Const): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}constante ${declaracao.simbolo.lexema}`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): any {
        // TODO: Até então o código nunca passa por aqui, porque o avaliador sintático
        // converte `ConstMultiplo` em várias declarações `const`.
        // Talvez mudar a avaliação sintática para não fazer mais isso.
        console.log(declaracao);
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        if (expressao.valor instanceof Binario &&
            [
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                tiposDeSimbolos.MODULO_IGUAL,
            ].includes(expressao.valor.operador.tipo)
        ) {
            this.visitarExpressaoBinaria(expressao.valor);
        } else {
            this.codigoFormatado += `${expressao.simbolo.lexema} = `;
            this.formatarDeclaracaoOuConstruto(expressao.valor);
        }

        this.codigoFormatado += `${this.quebraLinha}`;
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.codigoFormatado += ' '.repeat(this.indentacaoAtual);
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}função `;
        if (declaracao.simbolo) {
            this.codigoFormatado += `${declaracao.simbolo.lexema}`;
        }

        this.formatarDeclaracaoOuConstruto(declaracao.funcao);
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
    }

    visitarDeclaracaoEscolha(declaracao: Escolha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escolha `;
        this.formatarDeclaracaoOuConstruto(declaracao.identificadorOuLiteral);
        this.codigoFormatado += ` {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let caminho of declaracao.caminhos) {
            for (let declaracoes of caminho.condicoes) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso `;
                this.formatarDeclaracaoOuConstruto(declaracoes);
                this.codigoFormatado += ':';
                this.codigoFormatado += this.quebraLinha;
            }

            for (let declaracoes of caminho.declaracoes) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
                this.formatarDeclaracaoOuConstruto(declaracoes);
            }
        }

        for (let padrao of declaracao.caminhoPadrao.declaracoes) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}padrao:`;
            this.codigoFormatado += this.quebraLinha;
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
            this.formatarDeclaracaoOuConstruto(padrao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fazer {${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.caminhoFazer.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}} enquanto `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicaoEnquanto);
        this.codigoFormatado += `${this.quebraLinha}`;
    }

    visitarDeclaracaoImportar(declaracao: Importar) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}importar(`;
        this.formatarDeclaracaoOuConstruto(declaracao.caminho);
        this.codigoFormatado += `)`;
    }

    visitarDeclaracaoPara(declaracao: Para): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}para `;
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

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}para cada ${declaracao.nomeVariavelIteracao} de ${declaracao.vetor.simbolo.lexema}`;
        this.visitarExpressaoBloco(declaracao.corpo);
    }

    visitarDeclaracaoSe(declaracao: Se) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}se `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of (declaracao.caminhoEntao as Bloco).declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        if (declaracao.caminhoSenao) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}} senão `;
            this.formatarDeclaracaoOuConstruto(declaracao.caminhoSenao);
        } else {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
        }
    }

    visitarDeclaracaoTente(declaracao: Tente) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}tente {${this.quebraLinha}`;
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
                for (let declaracaoBloco of declaracao.caminhoPegue as Declaracao[]) {
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

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoVar(declaracao: Var): any {
        if (this.deveIndentar) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
        }

        this.codigoFormatado += `var ${declaracao.simbolo.lexema}`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): any {
        // TODO: Até então o código nunca passa por aqui, porque o avaliador sintático
        // converte `VarMultiplo` em várias declarações `var`.
        // Talvez mudar a avaliação sintática para não fazer mais isso.
        console.log(declaracao);
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += `[`;
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += `]`;
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade) {
        this.formatarDeclaracaoOuConstruto(expressao.objeto);
        this.codigoFormatado += '.';
        this.codigoFormatado += expressao.simbolo.lexema;
    }

    visitarExpressaoAgrupamento(expressao: Agrupamento): any {
        this.codigoFormatado += '(';
        this.formatarDeclaracaoOuConstruto(expressao.expressao);
        this.codigoFormatado += ')';
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): any {
        this.formatarDeclaracaoOuConstruto(expressao.objeto);
        this.codigoFormatado += '[';
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += '] = ';
        this.formatarDeclaracaoOuConstruto(expressao.valor);
        this.codigoFormatado += this.quebraLinha;
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        // Implementar somente para VisuAlg que tem atribuição diferente de Delégua - matriz[1, 2] = 1
        throw new Error('Método não implementado.');
    }

    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        // Implementar somente para VisuAlg que tem acesso ao elemento da matriz diferente de Delégua - var valor = matriz[1, 2]
        throw new Error('Método não implementado.');
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
            case tiposDeSimbolos.DIVISAO_IGUAL:
                this.codigoFormatado += ` /= `;
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += ` \\ `;
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL:
                this.codigoFormatado += ` \\= `;
                break;
            case tiposDeSimbolos.EXPONENCIACAO:
                this.codigoFormatado += ` ** `;
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
            case tiposDeSimbolos.MAIS_IGUAL:
                this.codigoFormatado += ` += `;
                break;
            case tiposDeSimbolos.MENOR:
                this.codigoFormatado += ` < `;
                break;
            case tiposDeSimbolos.MENOR_IGUAL:
                this.codigoFormatado += ` <= `;
                break;
            case tiposDeSimbolos.MENOS_IGUAL:
                this.codigoFormatado += ` -= `;
                break;
            case tiposDeSimbolos.MODULO:
                this.codigoFormatado += ` % `;
                break;
            case tiposDeSimbolos.MODULO_IGUAL:
                this.codigoFormatado += ` %= `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.SUBTRACAO:
                this.codigoFormatado += ` - `;
                break;
        }

        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }

    private formatarBlocoOuVetorDeclaracoes(declaracoes: Declaracao[]) {
        this.codigoFormatado += `{${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        this.formatarBlocoOuVetorDeclaracoes(declaracao.declaracoes);
    }

    visitarExpressaoContinua(declaracao?: Continua): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}continua${this.quebraLinha}`;
    }

    visitarExpressaoDeChamada(expressao: Chamada) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += '(';
        for (let argumento of expressao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += ', ';
        }

        if (expressao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += ')';
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoDefinirValor(expressao: DefinirValor) {
        this.formatarDeclaracaoOuConstruto(expressao.objeto);
        this.codigoFormatado += `.${expressao.nome.lexema} = `;
        this.formatarDeclaracaoOuConstruto(expressao.valor);
        this.codigoFormatado += `${this.quebraLinha}`;
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += expressao.simbolo.lexema;
    }

    visitarExpressaoDicionario(expressao: Dicionario) {
        this.codigoFormatado += `{`;
        for (let i = 0; i < expressao.chaves.length; i++) {
            this.formatarDeclaracaoOuConstruto(expressao.chaves[i]);
            this.codigoFormatado += `: `;
            this.formatarDeclaracaoOuConstruto(expressao.valores[i]);
            this.codigoFormatado += `, `;
        }

        if (expressao.chaves.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `}`;
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): any {
        this.codigoFormatado += `||${expressao.valor}||`;
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFalhar(expressao: Falhar): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}falhar`;
        if (expressao.explicacao) {
            this.codigoFormatado += ` `;
            this.formatarDeclaracaoOuConstruto(expressao.explicacao);
        }

        this.codigoFormatado += `${this.quebraLinha}`;
    }

    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        this.codigoFormatado += `(`;
        for (let argumento of expressao.parametros) {
            this.codigoFormatado += `${argumento.nome.lexema}${
                argumento.tipoDado && argumento.tipoDado.tipo ? `: ${argumento.tipoDado.tipo}, ` : ', '
            }`;
        }

        if (expressao.parametros.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `) `;
        this.formatarBlocoOuVetorDeclaracoes(expressao.corpo);
    }

    visitarExpressaoIsto(expressao: Isto) {
        this.codigoFormatado += `isto`;
    }

    visitarExpressaoLeia(expressao: Leia): any {
        this.codigoFormatado += `leia(`;
        for (let argumento of expressao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += `, `;
        }

        if (expressao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `)`;
    }

    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `'${expressao.valor}'`;
            return;
        }

        this.codigoFormatado += expressao.valor;
    }

    visitarExpressaoLogica(expressao: Logico) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.E:
                this.codigoFormatado += ` e `;
                break;
            case tiposDeSimbolos.EM:
                this.codigoFormatado += ` em `;
                break;
            case tiposDeSimbolos.OU:
                this.codigoFormatado += ` ou `;
                break;
        }

        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }

    visitarExpressaoRetornar(declaracao: Retorna): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}retorna`;
        if (declaracao.valor) {
            this.codigoFormatado += ` `;
            this.formatarDeclaracaoOuConstruto(declaracao.valor);
        }

        this.codigoFormatado += `${this.quebraLinha}`;
    }

    visitarExpressaoSuper(expressao: Super) {
        // TODO: `expressao.metodo` deveria ser um `Construto`, não um `Simbolo` aqui.
        this.codigoFormatado += `super.${expressao.metodo.lexema}()`;
        console.log(expressao);
    }

    visitarExpressaoSustar(declaracao?: Sustar): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}sustar${this.quebraLinha}`;
    }

    visitarExpressaoTipoDe(expressao: TipoDe): any {
        this.codigoFormatado += `tipo de `;
        this.formatarDeclaracaoOuConstruto(expressao.valor);
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

    visitarExpressaoVetor(expressao: Vetor) {
        this.codigoFormatado += '[';
        for (let valor of expressao.valores) {
            this.formatarDeclaracaoOuConstruto(valor);
            this.codigoFormatado += ', ';
        }

        if (expressao.valores.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += ']';
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

    /**
     * Devolve código formatado de acordo com os símbolos encontrados.
     * @param {Declaracao[]} declaracoes Um vetor de declarações.
     * @returns Código Delégua formatado.
     */
    formatar(declaracoes: Declaracao[]): string {
        this.codigoFormatado = '';
        this.indentacaoAtual = 0;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        return this.codigoFormatado;
    }
}
