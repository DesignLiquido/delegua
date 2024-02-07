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
    Aleatorio,
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
    CabecalhoPrograma,
} from '../declaracoes';
import { InicioAlgoritmo } from '../declaracoes/inicio-algoritmo';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';
import tiposDeSimbolos from '../tipos-de-simbolos/visualg';

export class FormatadorVisuAlg implements VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;
    deveIndentar: boolean;
    contadorDeclaracaoVar: number;
    retornoFuncaoAtual: SimboloInterface;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.devePularLinha = false;
        this.deveIndentar = true;
        this.contadorDeclaracaoVar = 0;
        this.retornoFuncaoAtual = undefined;
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): any {
        this.codigoFormatado += `inicio${this.quebraLinha}`;
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): any {
        this.codigoFormatado += `algoritmo "${declaracao.nomeProgramaAlgoritmo}"${this.quebraLinha}`;
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}aleatorio `;
        if (declaracao.argumentos.max > 0 && declaracao.argumentos.min > 0) {
            this.codigoFormatado += `${declaracao.argumentos.min}, ${declaracao.argumentos.max}${this.quebraLinha}`;
        } else {
            this.codigoFormatado += `ON${this.quebraLinha}`;
        }
        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoConst(declaracao: Const): any {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): any {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        this.codigoFormatado += `${expressao.simbolo.lexema} <- `;
        this.formatarDeclaracaoOuConstruto(expressao.valor);

        if (this.devePularLinha) {
            this.codigoFormatado += `${this.quebraLinha}`;
        }
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.codigoFormatado += ' '.repeat(this.indentacaoAtual);
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.retornoFuncaoAtual = declaracao.tipoRetorno;
        this.contadorDeclaracaoVar = 2;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}funcao `;
        if (declaracao.simbolo) {
            this.codigoFormatado += `${declaracao.simbolo.lexema}`;
        }

        let primeiraOcorrenciaVar = declaracao.funcao.corpo.findIndex((item) => item instanceof Var);
        var ultimaOcorrenciaIndex = declaracao.funcao.corpo
            .slice()
            .reverse()
            .findIndex((item) => item instanceof Var);
        var ultimaOcorrenciaPosicao =
            ultimaOcorrenciaIndex >= 0 ? declaracao.funcao.corpo.length - 1 - ultimaOcorrenciaIndex : -1;

        let indiceParaRemover = [];
        if (primeiraOcorrenciaVar > -1 && ultimaOcorrenciaPosicao > -1) {
            this.codigoFormatado += this.quebraLinha;
            for (let i = primeiraOcorrenciaVar; i <= ultimaOcorrenciaPosicao; i++) {
                this.formatarDeclaracaoOuConstruto(declaracao.funcao.corpo[i]);
                indiceParaRemover.push(i);
            }
        }

        for (let posicao of indiceParaRemover) {
            declaracao.funcao.corpo.splice(posicao, 1);
        }
        this.codigoFormatado += this.quebraLinha;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}inicio${this.quebraLinha}`;

        this.formatarDeclaracaoOuConstruto(declaracao.funcao);
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fimfuncao${this.quebraLinha}`;
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto(`;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` ) faca`;
        this.codigoFormatado += this.quebraLinha;

        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fimenquanto`;
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escolha (`;
        this.formatarDeclaracaoOuConstruto(declaracao.identificadorOuLiteral);

        this.codigoFormatado += `)${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let caminho of declaracao.caminhos) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso `;
            for (let condicao of caminho.condicoes) {
                this.formatarDeclaracaoOuConstruto(condicao);
                this.codigoFormatado += ', ';
            }
            if (caminho.condicoes.length > 0) {
                this.codigoFormatado = this.codigoFormatado.slice(0, -2);
            }
            this.codigoFormatado += this.quebraLinha;
            this.formatarBlocoOuVetorDeclaracoes(caminho.declaracoes);
        }

        if (declaracao.caminhoPadrao.declaracoes.length > 0) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}outrocaso`;
            this.codigoFormatado += this.quebraLinha;
            this.formatarBlocoOuVetorDeclaracoes(declaracao.caminhoPadrao.declaracoes);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fimescolha${this.quebraLinha}`;
    }
    visitarDeclaracaoEscreva(declaracao: Escreva) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += ', ';
        }
        if (declaracao.argumentos.length && this.codigoFormatado[this.codigoFormatado.length - 2] === ',') {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }
        this.codigoFormatado += `)${this.quebraLinha}`;
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}repita${this.quebraLinha}`;
        this.formatarDeclaracaoOuConstruto(declaracao.caminhoFazer);
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}ate `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicaoEnquanto);
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Método não implementado.');
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

        if (declaracao.condicao instanceof Binario) this.codigoFormatado += ` ate ${declaracao.condicao.direita.valor}`;
        else this.formatarDeclaracaoOuConstruto(declaracao.condicao);

        this.codigoFormatado += ` faca${this.quebraLinha}`;
        this.formatarDeclaracaoOuConstruto(declaracao.incrementar);

        this.formatarBlocoOuVetorDeclaracoes(declaracao.corpo.declaracoes);

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fimpara${this.quebraLinha}`;
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): any {
        throw new Error('Método não implementado.');
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
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}} senao `;
            this.formatarDeclaracaoOuConstruto(declaracao.caminhoSenao);
        } else {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}fimse${this.quebraLinha}`;
        }
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoVar(declaracao: Var): any {
        switch (this.contadorDeclaracaoVar) {
            case 0:
                this.codigoFormatado += `var${this.quebraLinha}`;
                this.contadorDeclaracaoVar++;
                break;
            case 2:
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}var${this.quebraLinha}`;
                this.contadorDeclaracaoVar++;
                break;
        }

        if (this.contadorDeclaracaoVar > 2) {
            this.indentacaoAtual += this.tamanhoIndentacao;
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
        if (this.contadorDeclaracaoVar > 2) {
            this.indentacaoAtual -= this.tamanhoIndentacao;
        }
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): any {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAgrupamento(expressao: any): any {
        this.codigoFormatado += '(';
        this.formatarDeclaracaoOuConstruto(expressao.expressao);
        this.codigoFormatado += ')';
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): any {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): any {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoBinaria(expressao: Binario) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += ' + ';
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += ' / ';
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += '  ';
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
                this.codigoFormatado += '<';
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
                this.codigoFormatado += ` % `;
                break;
            default:
                console.log(expressao.operador.tipo);
                break;
        }
        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }

    private formatarBlocoOuVetorDeclaracoes(declaracoes: Declaracao[]) {
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }
        this.indentacaoAtual -= this.tamanhoIndentacao;
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        this.formatarBlocoOuVetorDeclaracoes(declaracao.declaracoes);
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeChamada(expressao: any) {
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
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += expressao.simbolo.lexema;
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            const argumentoTratado = argumento as FormatacaoEscrita;
            this.formatarDeclaracaoOuConstruto(argumentoTratado);
            this.codigoFormatado += ', ';
        }
        if (declaracao.argumentos.length && this.codigoFormatado[this.codigoFormatado.length - 2] === ',') {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }
        this.codigoFormatado += `)${this.quebraLinha}`;
    }
    visitarExpressaoFalhar(expressao: any): any {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoLeia(expressao: Leia): any {
        this.codigoFormatado += `${' '.repeat(this.tamanhoIndentacao)}leia(`;
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
        return Promise.resolve();
    }
    visitarExpressaoLiteral(expressao: any): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `"${expressao.valor}"`;
            return;
        }
        if (typeof expressao.valor === 'boolean') {
            switch (expressao.valor) {
                case true:
                    this.codigoFormatado += `verdadeiro`;
                    break;
                case false:
                    this.codigoFormatado += `falso`;
                    break;
            }
            return;
        }

        this.codigoFormatado += expressao.valor;
    }
    visitarExpressaoLogica(expressao: any) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.E:
                this.codigoFormatado += ` e `;
                break;
            case tiposDeSimbolos.XOU:
                this.codigoFormatado += ` xou `;
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
    visitarExpressaoRetornar(declaracao: Retorna): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}retorne`;
        if (declaracao.valor) {
            this.codigoFormatado += ` `;
            this.formatarDeclaracaoOuConstruto(declaracao.valor);
        }

        this.codigoFormatado += `${this.quebraLinha}`;
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSustar(declaracao?: Sustar): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}interrompa${this.quebraLinha}`;
    }
    visitarExpressaoTipoDe(expressao: TipoDe): any {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Method not implemented.');
    }

    visitarExpressaoUnaria(expressao: Unario) {
        let operador: string;
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                operador = `-`;
                break;
            case tiposDeSimbolos.ADICAO:
                operador = `+`;
                break;
            case tiposDeSimbolos.NEGACAO:
                operador = `nao `;
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
        throw new Error('Método não implementado.');
    }

    formatarDeclaracaoOuConstruto(declaracaoOuConstruto: Declaracao | Construto): void {
        switch (declaracaoOuConstruto.constructor.name) {
            case 'AcessoIndiceVariavel':
                this.visitarExpressaoAcessoIndiceVariavel(declaracaoOuConstruto as AcessoIndiceVariavel);
                break;
            case 'AcessoMetodoOuPropriedade':
                this.visitarExpressaoAcessoMetodo(declaracaoOuConstruto as AcessoMetodoOuPropriedade);
                break;
            case 'Aleatorio':
                this.visitarDeclaracaoAleatorio(declaracaoOuConstruto as Aleatorio);
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
            case 'CabecalhoPrograma':
                this.visitarDeclaracaoCabecalhoPrograma(declaracaoOuConstruto as CabecalhoPrograma);
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
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar);
                break;
            case 'Fazer':
                this.visitarDeclaracaoFazer(declaracaoOuConstruto as Fazer);
                break;
            case 'FimPara':
                // FimPara só existe com um Para, então não é necessário formatá-lo.
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
            case 'InicioAlgoritmo':
                this.visitarDeclaracaoInicioAlgoritmo(declaracaoOuConstruto as InicioAlgoritmo);
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
        if (expressao.parametros.length > 0) {
            this.codigoFormatado += `(`;
            for (let argumento of expressao.parametros) {
                this.codigoFormatado += `${argumento.nome.lexema}${
                    argumento.tipoDado && argumento.tipoDado.tipo ? `: ${argumento.tipoDado.tipo}, ` : ', '
                }`;
            }
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
            this.codigoFormatado += `) `;
        }
        this.codigoFormatado += ` : ${this.retornoFuncaoAtual}${this.quebraLinha}`;
        this.formatarBlocoOuVetorDeclaracoes(expressao.corpo);
    }

    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = "";
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${this.quebraLinha}fimalgoritmo`;
        return this.codigoFormatado;
    }
}
