import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FormatacaoEscrita,
    Leia,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    Para,
    Se,
    Var,
} from '../declaracoes';
import { AvaliadorSintaticoPortugolIpt } from '../avaliador-sintatico/dialetos';
import { LexadorPortugolIpt } from '../lexador/dialetos';
import { CaminhoEscolha } from '../interfaces/construtos';

import tiposDeSimbolos from '../tipos-de-simbolos/portugol-ipt';

export class TradutorPortugolIpt {
    indentacao: number = 0;
    lexador: LexadorPortugolIpt;
    avaliadorSintatico: AvaliadorSintaticoPortugolIpt;

    // ── Mapeamento de funções embutidas ─────────────────────────────────────────

    private readonly mapaFuncoes: Record<string, string> = {
        ALEATORIO: 'aleatorio',
        SEN: 'seno',
        COS: 'cosseno',
        TAN: 'tangente',
        CTG: 'cotangente',
        ASEN: 'arco_seno',
        ACOS: 'arco_cosseno',
        ATAN: 'arco_tangente',
        ACTG: 'arco_cotangente',
        SENH: 'seno_hiperbolico',
        COSH: 'cosseno_hiperbolico',
        TANH: 'tangente_hiperbolica',
        CTGH: 'cotangente_hiperbolica',
        EXP: 'exponencial',
        ABS: 'absoluto',
        RAIZ: 'raiz_quadrada',
        LOG: 'logaritmo',
        LN: 'logaritmo_natural',
        INT: 'inteiro',
        FRAC: 'parte_fracionaria',
        ARRED: 'arredondar',
        POTENCIA: 'potência',
        COMPRIMENTO: 'tamanho',
        LETRA: 'letra',
    };

    // ── Operadores ───────────────────────────────────────────────────────────────

    private traduzirOperador(tipo: string): string {
        switch (tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
            case tiposDeSimbolos.MULTIPLICACAO:
                return '*';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.MODULO:
                return '%';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';
            case tiposDeSimbolos.IGUAL:
                return '==';
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
                return '&&';
            case tiposDeSimbolos.OU:
                return '||';
            case tiposDeSimbolos.XOU:
                return '^^';
            default:
                return tipo;
        }
    }

    // ── Construtos ───────────────────────────────────────────────────────────────

    traduzirConstruto(construto: Construto): string {
        const nome = construto.constructor.name;
        if (this.dicionarioConstrutos.hasOwnProperty(nome)) {
            return this.dicionarioConstrutos[nome](construto);
        }
        return `/* construto ${nome} não suportado */`;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        if (typeof literal.valor === 'boolean') return literal.valor ? 'verdadeiro' : 'falso';
        return String(literal.valor);
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return `(${this.traduzirConstruto(agrupamento.expressao)})`;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        const esq = this.traduzirConstruto(binario.esquerda);
        const op = this.traduzirOperador(binario.operador.tipo);
        const dir = this.traduzirConstruto(binario.direita);
        return `${esq} ${op} ${dir}`;
    }

    traduzirConstrutoLogico(logico: Logico): string {
        const esq = this.traduzirConstruto(logico.esquerda);
        const dir = this.traduzirConstruto(logico.direita);
        if (logico.operador.tipo === tiposDeSimbolos.XOU) {
            return `((${esq} && !(${dir})) || (!(${esq}) && ${dir}))`;
        }

        const op = this.traduzirOperador(logico.operador.tipo);
        return `${esq} ${op} ${dir}`;
    }

    traduzirConstrutoUnario(unario: Unario): string {
        const operando = this.traduzirConstruto(unario.operando);
        switch (unario.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                return `-${operando}`;
            case tiposDeSimbolos.NEGACAO:
            case tiposDeSimbolos.NAO:
                return `!(${operando})`;
            default:
                return `!(${operando})`;
        }
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        const alvo = this.traduzirConstruto(atribuir.alvo);
        const valor = this.traduzirConstruto(atribuir.valor);
        return `${alvo} = ${valor}`;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        const nomeOriginal = this.traduzirConstruto(chamada.entidadeChamada).toUpperCase();
        const nomeDelegua = this.mapaFuncoes[nomeOriginal] ?? nomeOriginal.toLowerCase();
        const args = chamada.argumentos.map((a) => this.traduzirConstruto(a)).join(', ');
        return `${nomeDelegua}(${args})`;
    }

    traduzirConstrutoAcessoIndiceVariavel(acesso: AcessoIndiceVariavel): string {
        const entidade = this.traduzirConstruto(acesso.entidadeChamada);
        const indice = this.traduzirConstruto(acesso.indice);
        return `${entidade}[${indice}]`;
    }

    traduzirConstrutoAtribuicaoPorIndice(atrib: AtribuicaoPorIndice): string {
        const objeto = this.traduzirConstruto(atrib.objeto);
        const indice = this.traduzirConstruto(atrib.indice);
        const valor = this.traduzirConstruto(atrib.valor);
        return `${objeto}[${indice}] = ${valor}`;
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        const elementos = vetor.elementos.map((v) => this.traduzirConstruto(v)).join(', ');
        return `[${elementos}]`;
    }

    traduzirConstrutoLeia(_leia: Leia): string {
        return 'leia()';
    }

    traduzirConstrutoFormatacaoEscrita(formatacao: FormatacaoEscrita): string {
        return this.traduzirConstruto(formatacao.expressao);
    }

    // ── Declarações ──────────────────────────────────────────────────────────────

    traduzirDeclaracao(declaracao: Declaracao): string {
        const nome = declaracao.constructor.name;
        if (this.dicionarioDeclaracoes.hasOwnProperty(nome)) {
            return this.dicionarioDeclaracoes[nome](declaracao);
        }
        return `/* declaração ${nome} não suportada */`;
    }

    private tipoParaDelégua(tipo: string): string {
        switch (tipo) {
            case 'inteiro':
                return 'inteiro';
            case 'texto':
                return 'texto';
            case 'real':
                return 'real';
            case 'lógico':
            case 'logico':
                return 'logico';
            case 'caracter':
                return 'caracter';
            default:
                return tipo;
        }
    }

    private valorPadraoPorTipo(tipo: string): string {
        switch (tipo) {
            case 'inteiro':
                return '0';
            case 'texto':
                return "''";
            case 'real':
                return '0.0';
            case 'lógico':
            case 'logico':
                return 'falso';
            case 'caracter':
                return "' '";
            default:
                return 'nulo';
        }
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        const nome = declaracaoVar.simbolo.lexema;
        const tipo = declaracaoVar.tipo;

        if (tipo && tipo.endsWith('[]')) {
            // Array
            const tipoBase = tipo.slice(0, -2);
            const valor = declaracaoVar.inicializador
                ? this.traduzirConstruto(declaracaoVar.inicializador as Construto)
                : '[]';
            return `var ${nome}: ${tipoBase}[] = ${valor}`;
        }

        const tipoDelegua = tipo ? this.tipoParaDelégua(tipo) : '';
        const valorPadrao = tipo ? this.valorPadraoPorTipo(tipo) : 'nulo';
        const valor = declaracaoVar.inicializador
            ? this.traduzirConstruto(declaracaoVar.inicializador as Construto)
            : valorPadrao;

        if (tipoDelegua) {
            return `var ${nome}: ${tipoDelegua} = ${valor}`;
        }
        return `var ${nome} = ${valor}`;
    }

    traduzirDeclaracaoConst(declaracaoConst: Const): string {
        const nome = declaracaoConst.simbolo.lexema;
        const valor = declaracaoConst.inicializador
            ? this.traduzirConstruto(declaracaoConst.inicializador as Construto)
            : 'nulo';
        return `const ${nome} = ${valor}`;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        const expr = declaracaoExpressao.expressao;

        // `ler x` → `x = leia()`
        if (expr instanceof Leia) {
            const linhas: string[] = [];
            for (const arg of expr.argumentos) {
                const alvo =
                    arg instanceof Expressao
                        ? this.traduzirConstruto((arg as Expressao).expressao)
                        : this.traduzirConstruto(arg);
                linhas.push(`${alvo} = leia()`);
            }
            return linhas.join('\n' + ' '.repeat(this.indentacao));
        }

        return this.traduzirConstruto(expr);
    }

    traduzirDeclaracaoBloco(bloco: Bloco): string {
        let resultado = '{\n';
        this.indentacao += 4;
        for (const declaracao of bloco.declaracoes) {
            resultado += ' '.repeat(this.indentacao);
            resultado += this.traduzirDeclaracao(declaracao) + '\n';
        }
        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}';
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        const args = declaracaoEscreva.argumentos.map((a) => this.traduzirConstruto(a)).join(', ');
        return `escreva(${args})`;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscreva: EscrevaMesmaLinha): string {
        const args = declaracaoEscreva.argumentos.map((a) => this.traduzirConstruto(a)).join(', ');
        return `escreva(${args})`;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
        const cond = this.traduzirConstruto(declaracaoSe.condicao);
        let resultado = `se (${cond}) `;
        resultado += this.traduzirDeclaracaoBloco(declaracaoSe.caminhoEntao as unknown as Bloco);
        if (declaracaoSe.caminhoSenao) {
            resultado += ' senão ';
            resultado += this.traduzirDeclaracaoBloco(
                declaracaoSe.caminhoSenao as unknown as Bloco
            );
        }
        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        const cond = this.traduzirConstruto(declaracaoEnquanto.condicao);
        let resultado = `enquanto (${cond}) `;
        resultado += this.traduzirDeclaracaoBloco(declaracaoEnquanto.corpo);
        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        // inicializador é Expressao(Atribuir(v, inicio))
        let init = '';
        if (declaracaoPara.inicializador) {
            const ini = declaracaoPara.inicializador;
            if (Array.isArray(ini)) {
                init = ini.map((d) => this.traduzirDeclaracao(d)).join(', ');
            } else {
                init = this.traduzirDeclaracao(ini);
            }
        }
        const cond = declaracaoPara.condicao ? this.traduzirConstruto(declaracaoPara.condicao) : '';
        const incr = declaracaoPara.incrementar
            ? this.traduzirConstruto(declaracaoPara.incrementar)
            : '';

        let resultado = `para (${init}; ${cond}; ${incr}) `;
        resultado += this.traduzirDeclaracaoBloco(declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoFazer(declaracaoFazer: Fazer): string {
        let resultado = 'fazer ';
        resultado += this.traduzirDeclaracaoBloco(declaracaoFazer.caminhoFazer);
        const cond = this.traduzirConstruto(declaracaoFazer.condicaoEnquanto);
        resultado += ` enquanto (${cond})`;
        return resultado;
    }

    private traduzirCaminhoEscolha(caminho: CaminhoEscolha): string {
        let resultado = '';
        this.indentacao += 4;
        if (caminho.condicoes && caminho.condicoes.length > 0) {
            for (const cond of caminho.condicoes) {
                resultado +=
                    ' '.repeat(this.indentacao) + `caso ${this.traduzirConstruto(cond)}:\n`;
            }
        } else {
            resultado += ' '.repeat(this.indentacao) + 'padrão:\n';
        }
        this.indentacao += 4;
        for (const declaracao of caminho.declaracoes) {
            resultado += ' '.repeat(this.indentacao) + this.traduzirDeclaracao(declaracao) + '\n';
        }
        this.indentacao -= 8;
        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha): string {
        const expr = this.traduzirConstruto(declaracaoEscolha.identificadorOuLiteral);
        let resultado = `escolha (${expr}) {\n`;
        for (const caminho of declaracaoEscolha.caminhos) {
            resultado += this.traduzirCaminhoEscolha(caminho);
        }
        if (declaracaoEscolha.caminhoPadrao) {
            resultado += this.traduzirCaminhoEscolha(declaracaoEscolha.caminhoPadrao);
        }
        resultado += ' '.repeat(this.indentacao) + '}';
        return resultado;
    }

    // ── Dicionários ──────────────────────────────────────────────────────────────

    dicionarioConstrutos: Record<string, (c: any) => string> = {
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        FormatacaoEscrita: this.traduzirConstrutoFormatacaoEscrita.bind(this),
        Leia: this.traduzirConstrutoLeia.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes: Record<string, (d: any) => string> = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    // ── Ponto de entrada ─────────────────────────────────────────────────────────

    async traduzir(codigo: string): Promise<string> {
        this.lexador = new LexadorPortugolIpt();
        this.avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();

        const retornoLexador = this.lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await this.avaliadorSintatico.analisar(
            retornoLexador,
            -1
        );

        let resultado = '';
        for (const declaracao of retornoAvaliadorSintatico.declaracoes) {
            resultado += this.traduzirDeclaracao(declaracao) + '\n';
        }
        return resultado;
    }
}
