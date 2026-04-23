import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Para,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../declaracoes';
import { SimboloInterface, TradutorInterface } from '../interfaces';
import { LexadorCalango } from '../lexador/dialetos';
import tiposDeSimbolos from '../tipos-de-simbolos/calango';
import { AvaliadorSintaticoCalango } from '../avaliador-sintatico/dialetos/avaliador-sintatico-calango';

export class TradutorReversoCalango implements TradutorInterface<Declaracao | Construto> {
    indentacao: number = 0;
    lexador!: LexadorCalango;
    avaliadorSintatico!: AvaliadorSintaticoCalango;

    dicionarioConstrutos: Record<string, (construto: any) => string> = {
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        FormatacaoEscrita: this.traduzirConstrutoFormatacaoEscrita.bind(this),
        FuncaoConstruto: this.traduzirConstrutoFuncao.bind(this),
        Leia: this.traduzirConstrutoLeia.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes: Record<string, (declaracao: any) => string> = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Sustar: this.traduzirDeclaracaoSustar.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    private traduzirSimboloOperador(simbolo: SimboloInterface<string>): string {
        switch (simbolo?.tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
            case tiposDeSimbolos.MULTIPLICACAO:
                return '*';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                return '\\';
            case tiposDeSimbolos.MODULO:
                return '%';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '^';
            case tiposDeSimbolos.IGUAL:
            case tiposDeSimbolos.IGUAL_IGUAL:
                return '==';
            case tiposDeSimbolos.IGUAL_ATRIBUICAO:
                return '=';
            case tiposDeSimbolos.DIFERENTE:
                return '!=';
            case tiposDeSimbolos.MAIOR:
                return '>';
            case tiposDeSimbolos.MAIOR_IGUAL:
                return '>=';
            case tiposDeSimbolos.MENOR:
                return '<';
            case tiposDeSimbolos.MENOR_IGUAL:
                return '<=';
            case tiposDeSimbolos.E:
                return 'e';
            case tiposDeSimbolos.OU:
                return 'ou';
            case tiposDeSimbolos.NEGACAO:
                return 'nao';
            default:
                return simbolo?.lexema || '';
        }
    }

    private traduzirQualquer(elemento: Declaracao | Construto): string {
        if (!elemento) {
            return '';
        }

        const nomeConstrutor = elemento.constructor.name;
        if (this.dicionarioDeclaracoes.hasOwnProperty(nomeConstrutor)) {
            return this.dicionarioDeclaracoes[nomeConstrutor](elemento as Declaracao);
        }

        if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
            return this.dicionarioConstrutos[nomeConstrutor](elemento as Construto);
        }

        throw new Error(`Elemento não suportado pelo tradutor Calango reverso: ${nomeConstrutor}`);
    }

    private traduzirParametro(parametro: any): string {
        const nome = parametro?.nome?.lexema;
        const tipo = parametro?.tipoDado;
        if (!nome) {
            return '';
        }

        if (!tipo || tipo === 'qualquer') {
            return nome;
        }

        return `${nome}: ${tipo}`;
    }

    private logicaComumBlocoEscopo(declaracoes: (Declaracao | Construto)[]): string {
        let resultado = '{\n';
        this.indentacao += 4;

        for (const declaracaoOuConstruto of declaracoes || []) {
            const traducao = this.traduzirQualquer(declaracaoOuConstruto);
            if (!traducao) {
                continue;
            }

            resultado += `${' '.repeat(this.indentacao)}${traducao}\n`;
        }

        this.indentacao -= 4;
        resultado += `${' '.repeat(this.indentacao)}}`;
        return resultado;
    }

    traduzirConstrutoAcessoIndiceVariavel(acessoIndiceVariavel: AcessoIndiceVariavel): string {
        const entidade = this.traduzirQualquer(acessoIndiceVariavel.entidadeChamada);
        const indice = this.traduzirQualquer(acessoIndiceVariavel.indice);
        return `${entidade}[${indice}]`;
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return `(${this.traduzirQualquer(agrupamento.expressao)})`;
    }

    traduzirConstrutoAtribuicaoPorIndice(atribuicao: AtribuicaoPorIndice): string {
        const objeto = this.traduzirQualquer(atribuicao.objeto);
        const indice = this.traduzirQualquer(atribuicao.indice);
        const valor = this.traduzirQualquer(atribuicao.valor);
        return `${objeto}[${indice}] = ${valor}`;
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let alvo = this.traduzirQualquer(atribuir.alvo);
        if (atribuir.indice) {
            alvo += `[${this.traduzirQualquer(atribuir.indice)}]`;
        }

        const operador = atribuir.simboloOperador
            ? this.traduzirSimboloOperador(atribuir.simboloOperador)
            : '=';
        const valor = this.traduzirQualquer(atribuir.valor);
        return `${alvo} ${operador} ${valor}`;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        const esquerda = this.traduzirQualquer(binario.esquerda);
        const direita = this.traduzirQualquer(binario.direita);
        const operador = this.traduzirSimboloOperador(binario.operador);
        return `${esquerda} ${operador} ${direita}`;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        const entidade = this.traduzirQualquer(chamada.entidadeChamada);
        const argumentos = (chamada.argumentos || []).map((argumento) =>
            this.traduzirQualquer(argumento)
        );
        return `${entidade}(${argumentos.join(', ')})`;
    }

    traduzirConstrutoFormatacaoEscrita(formatacaoEscrita: FormatacaoEscrita) {
        const avaliacaoExpressao = this.traduzirQualquer(formatacaoEscrita.expressao);
        return `${avaliacaoExpressao}`;
    }

    traduzirConstrutoFuncao(funcaoConstruto: FuncaoConstruto): string {
        const parametros = (funcaoConstruto.parametros || [])
            .map((parametro) => this.traduzirParametro(parametro))
            .filter((p) => p)
            .join(', ');

        let resultado = `funcao(${parametros}) `;
        resultado += this.logicaComumBlocoEscopo(funcaoConstruto.corpo);
        return resultado;
    }

    traduzirConstrutoLeia(leia: Leia): string {
        const argumentos = (leia.argumentos || []).map((argumento) =>
            this.traduzirQualquer(argumento)
        );
        return `leia(${argumentos.join(', ')})`;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') {
            const valorEscapado = literal.valor.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `'${valorEscapado}'`;
        }

        if (literal.valor === null || literal.valor === undefined) {
            return 'nulo';
        }

        if (typeof literal.valor === 'boolean') {
            return literal.valor ? 'verdadeiro' : 'falso';
        }

        return String(literal.valor);
    }

    traduzirConstrutoLogico(logico: Logico): string {
        const esquerda = this.traduzirQualquer(logico.esquerda);
        const direita = this.traduzirQualquer(logico.direita);
        const operador = this.traduzirSimboloOperador(logico.operador);
        return `${esquerda} ${operador} ${direita}`;
    }

    traduzirConstrutoUnario(unario: Unario): string {
        const operador = this.traduzirSimboloOperador(unario.operador);
        const operando = this.traduzirQualquer(unario.operando);
        if (unario.incidenciaOperador === 'DEPOIS') {
            return `${operando}${operador}`;
        }

        if (operador === 'nao') {
            return `${operador} ${operando}`;
        }

        return `${operador}${operando}`;
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        const elementos = (vetor.elementos || []).map((elemento) =>
            this.traduzirQualquer(elemento)
        );
        return `[${elementos.join(', ')}]`;
    }

    traduzirDeclaracaoBloco(bloco: Bloco): string {
        return this.logicaComumBlocoEscopo(bloco.declaracoes);
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        const condicao = this.traduzirQualquer(declaracaoEnquanto.condicao);
        const corpo = this.traduzirDeclaracaoBloco(declaracaoEnquanto.corpo);
        return `enquanto (${condicao}) ${corpo}`;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha): string {
        const expressao = this.traduzirQualquer(declaracaoEscolha.identificadorOuLiteral);
        let resultado = `escolha (${expressao}) {\n`;
        this.indentacao += 4;

        for (const caminho of declaracaoEscolha.caminhos || []) {
            for (const condicao of caminho.condicoes || []) {
                resultado += `${' '.repeat(this.indentacao)}caso ${this.traduzirQualquer(condicao)}:\n`;
            }

            this.indentacao += 4;
            for (const declaracao of caminho.declaracoes || []) {
                const traducao = this.traduzirQualquer(declaracao);
                if (traducao) {
                    resultado += `${' '.repeat(this.indentacao)}${traducao}\n`;
                }
            }
            this.indentacao -= 4;
        }

        if (declaracaoEscolha.caminhoPadrao) {
            resultado += `${' '.repeat(this.indentacao)}padrao:\n`;
            this.indentacao += 4;
            for (const declaracao of declaracaoEscolha.caminhoPadrao.declaracoes || []) {
                const traducao = this.traduzirQualquer(declaracao);
                if (traducao) {
                    resultado += `${' '.repeat(this.indentacao)}${traducao}\n`;
                }
            }
            this.indentacao -= 4;
        }

        this.indentacao -= 4;
        resultado += `${' '.repeat(this.indentacao)}}`;
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.traduzirQualquer(argumento);
            resultado += valor + ', ';
        }

        if (declaracaoEscreva.argumentos.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscreva: EscrevaMesmaLinha): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.traduzirQualquer(argumento);
            resultado += valor + ', ';
        }

        if (declaracaoEscreva.argumentos.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoExpressao(expressao: Expressao): string {
        return this.traduzirQualquer(expressao.expressao);
    }

    traduzirDeclaracaoFazer(fazer: Fazer): string {
        const corpo = this.traduzirDeclaracaoBloco(fazer.caminhoFazer);
        const condicao = this.traduzirQualquer(fazer.condicaoEnquanto);
        return `fazer ${corpo} enquanto (${condicao})`;
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
        const parametros = (declaracaoFuncao.funcao.parametros || [])
            .map((parametro) => this.traduzirParametro(parametro))
            .filter((p) => p)
            .join(', ');

        const tipoRetorno =
            declaracaoFuncao.tipo &&
            declaracaoFuncao.tipo !== 'qualquer' &&
            declaracaoFuncao.tipo !== 'vazio'
                ? `: ${declaracaoFuncao.tipo}`
                : '';

        let resultado = `funcao ${declaracaoFuncao.simbolo.lexema}(${parametros})${tipoRetorno} `;
        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let inicializador = '';
        if (Array.isArray(declaracaoPara.inicializador)) {
            inicializador = declaracaoPara.inicializador
                .map((declaracao) => this.traduzirQualquer(declaracao))
                .join(', ');
        } else if (declaracaoPara.inicializador) {
            inicializador = this.traduzirQualquer(declaracaoPara.inicializador);
        }

        const condicao = this.traduzirQualquer(declaracaoPara.condicao);
        const incremento = this.traduzirQualquer(declaracaoPara.incrementar);
        const corpo = this.traduzirDeclaracaoBloco(declaracaoPara.corpo);

        return `para (${inicializador}; ${condicao}; ${incremento}) ${corpo}`;
    }

    traduzirDeclaracaoRetorna(retorna: Retorna): string {
        if (!retorna.valor) {
            return 'retorna';
        }

        return `retorna ${this.traduzirQualquer(retorna.valor)}`;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
        const condicao = this.traduzirQualquer(declaracaoSe.condicao);
        const caminhoEntao = this.traduzirQualquer(declaracaoSe.caminhoEntao);
        let resultado = `se (${condicao}) ${caminhoEntao}`;

        const caminhosSeSenao = declaracaoSe.caminhosSeSenao || [];
        for (const caminhoSeSenao of caminhosSeSenao) {
            resultado += ` senao se (${this.traduzirQualquer(caminhoSeSenao.condicao)}) ${this.traduzirQualquer(
                caminhoSeSenao.caminho
            )}`;
        }

        if (declaracaoSe.caminhoSenao) {
            resultado += ` senao ${this.traduzirQualquer(declaracaoSe.caminhoSenao)}`;
        }

        return resultado;
    }

    traduzirDeclaracaoSustar(_sustar: Sustar): string {
        return 'sustar';
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        if (!declaracaoVar.inicializador) {
            return `var ${declaracaoVar.simbolo.lexema}`;
        }

        return `var ${declaracaoVar.simbolo.lexema} = ${this.traduzirQualquer(declaracaoVar.inicializador)}`;
    }

    traduzir(declaracoes: Array<Declaracao | Construto>): string {
        const linhas: string[] = [];

        for (const declaracao of declaracoes) {
            const traducao = this.traduzirQualquer(declaracao);
            if (traducao) {
                linhas.push(traducao);
            }
        }

        return linhas.join('\n');
    }
}
