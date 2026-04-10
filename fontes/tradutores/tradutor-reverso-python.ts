import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';

import { Python3Lexer } from './python/python3-lexer';
import { Python3Visitor } from './python/python3-visitor';
import {
    Python3Parser,
    File_inputContext,
    Simple_stmtContext,
    Expr_stmtContext,
    Simple_assignContext,
    AugassignContext,
    Testlist_star_exprContext,
    TestlistContext,
    TestContext,
    Or_testContext,
    And_testContext,
    Not_testContext,
    ComparisonContext,
    Comp_opContext,
    Arith_exprContext,
    TermContext,
    FactorContext,
    PowerContext,
    Atom_exprContext,
    AtomContext,
    TrailerContext,
    ArglistContext,
    ArgumentContext,
    If_stmtContext,
    While_stmtContext,
    For_stmtContext,
    SuiteContext,
    Break_stmtContext,
    Continue_stmtContext,
    Return_stmtContext,
    FuncdefContext,
    ParametersContext,
    TypedargslistContext,
    TfpdefContext,
    ClassdefContext,
    DecoratedContext,
    Testlist_compContext,
    DictorsetmakerContext,
    SubscriptlistContext,
    SubscriptContext,
    Try_stmtContext,
    Raise_stmtContext,
    LambdefContext,
    VarargslistContext,
    Comp_forContext,
    Comp_ifContext,
    With_stmtContext,
    With_itemContext,
} from './python/python3-parser';

/**
 * Tradutor reverso de Python para Delégua.
 * Utiliza o visitor do ANTLR para percorrer a árvore sintática em
 * Python e traduzir para Delégua.
 */
export class TradutorReversoPython
    extends AbstractParseTreeVisitor<string>
    implements Python3Visitor<string>
{
    // Funções globais Python → Delégua
    private readonly mapeamentoFuncoes: Record<string, string> = {
        print: 'escreva',
        input: 'leia',
        len: 'tamanho',
        int: 'inteiro',
        float: 'real',
        str: 'texto',
        bool: 'logico',
        type: 'tipoDe',
        range: 'intervalo',
        abs: 'absoluto',
        round: 'arredondar',
        min: 'minimo',
        max: 'maximo',
        sum: 'somar',
    };

    // Métodos de instância Python → Delégua
    private readonly mapeamentoMetodos: Record<string, string> = {
        // Lista / vetor
        append: 'adicionar',
        pop: 'removerUltimo',
        reverse: 'inverter',
        sort: 'ordenar',
        clear: 'limpar',
        // Texto / string
        upper: 'maiusculo',
        lower: 'minusculo',
        strip: 'aparar',
        lstrip: 'aparar',
        rstrip: 'aparar',
        split: 'dividir',
        join: 'juntar',
        startswith: 'iniciaCom',
        endswith: 'terminaCom',
        replace: 'substituir',
        find: 'encontrar',
        count: 'contar',
        // Dicionário
        keys: 'chaves',
        values: 'valores',
        items: 'itens',
    };

    protected defaultResult(): string {
        return '';
    }

    protected aggregateResult(aggregate: string, nextResult: string): string {
        return aggregate + nextResult;
    }

    visitTerminal(node: TerminalNode): string {
        return node.text;
    }

    visitFile_input(ctx: File_inputContext): string {
        return ctx.stmt().map((s) => this.visit(s)).join('\n');
    }

    visitSimple_stmt(ctx: Simple_stmtContext): string {
        return ctx.small_stmt().map((s) => this.visit(s)).join('; ');
    }

    visitExpr_stmt(ctx: Expr_stmtContext): string {
        const lhs = this.visit(ctx.testlist_star_expr());

        const simpleAssign = ctx.simple_assign();
        if (simpleAssign && simpleAssign.childCount > 0) {
            const rhs = this.visitSimple_assign(simpleAssign);
            // Atribuições a atributos (a.b = x) ou índices (a[i] = x) não usam 'var'
            const prefixo = lhs.includes('.') || lhs.includes('[') ? '' : 'var ';
            return `${prefixo}${lhs} = ${rhs}`;
        }

        if (ctx.augassign()) {
            const op = this.visitAugassign(ctx.augassign()!);
            const testlist = ctx.testlist();
            const yieldExpr = ctx.yield_expr();
            const rhs = testlist
                ? this.visit(testlist)
                : yieldExpr
                ? this.visit(yieldExpr)
                : '';
            return `${lhs} ${op} ${rhs}`;
        }

        return lhs;
    }

    visitSimple_assign(ctx: Simple_assignContext): string {
        const exprs = ctx.testlist_star_expr();
        return this.visit(exprs[exprs.length - 1]);
    }

    visitAugassign(ctx: AugassignContext): string {
        if (ctx.ADD_ASSIGN()) return '+=';
        if (ctx.SUB_ASSIGN()) return '-=';
        if (ctx.MULT_ASSIGN()) return '*=';
        if (ctx.DIV_ASSIGN()) return '/=';
        if (ctx.MOD_ASSIGN()) return '%=';
        if (ctx.AND_ASSIGN()) return '&=';
        if (ctx.OR_ASSIGN()) return '|=';
        if (ctx.XOR_ASSIGN()) return '^=';
        if (ctx.LEFT_SHIFT_ASSIGN()) return '<<=';
        if (ctx.RIGHT_SHIFT_ASSIGN()) return '>>=';
        if (ctx.POWER_ASSIGN()) return '**=';
        if (ctx.IDIV_ASSIGN()) return '//=';
        return ctx.text;
    }

    visitTestlist_star_expr(ctx: Testlist_star_exprContext): string {
        return ctx.test().map((t) => this.visit(t)).join(', ');
    }

    visitTestlist(ctx: TestlistContext): string {
        return ctx.test().map((t) => this.visit(t)).join(', ');
    }

    visitTest(ctx: TestContext): string {
        const orTests = ctx.or_test();
        if (orTests.length === 1) return this.visit(orTests[0]);
        const lambdef = ctx.lambdef();
        if (lambdef) return this.visit(lambdef);
        // Expressão ternária (a if cond else b) — implementada em fase futura
        return this.visitChildren(ctx);
    }

    visitOr_test(ctx: Or_testContext): string {
        return ctx.and_test().map((t) => this.visit(t)).join(' ou ');
    }

    visitAnd_test(ctx: And_testContext): string {
        return ctx.not_test().map((t) => this.visit(t)).join(' e ');
    }

    visitNot_test(ctx: Not_testContext): string {
        if (ctx.NOT()) {
            return `nao ${this.visit(ctx.not_test()!)}`;
        }
        const comp = ctx.comparison();
        if (comp) return this.visit(comp);
        return this.visitChildren(ctx);
    }

    visitComparison(ctx: ComparisonContext): string {
        const exprs = ctx.expr();
        if (exprs.length === 1) return this.visit(exprs[0]);
        const ops = ctx.comp_op();
        let resultado = this.visit(exprs[0]);
        for (let i = 0; i < ops.length; i++) {
            resultado += ` ${this.visitComp_op(ops[i])} ${this.visit(exprs[i + 1])}`;
        }
        return resultado;
    }

    visitComp_op(ctx: Comp_opContext): string {
        if (ctx.LESS_THAN()) return '<';
        if (ctx.GREATER_THAN()) return '>';
        if (ctx.EQUALS()) return '==';
        if (ctx.GT_EQ()) return '>=';
        if (ctx.LT_EQ()) return '<=';
        if (ctx.NOT_EQ_1() || ctx.NOT_EQ_2()) return '!=';
        if (ctx.NOT() && ctx.IN()) return 'nao em';
        if (ctx.IN()) return 'em';
        if (ctx.NOT() && ctx.IS()) return '!=';
        if (ctx.IS()) return '==';
        return ctx.text;
    }

    visitArith_expr(ctx: Arith_exprContext): string {
        const termos = ctx.term();
        if (termos.length === 1) return this.visit(termos[0]);
        let resultado = this.visit(termos[0]);
        let idx = 1;
        for (let i = 1; i < ctx.childCount; i++) {
            const texto = ctx.getChild(i).text;
            if (texto === '+' || texto === '-') {
                resultado += ` ${texto} ${this.visit(termos[idx++])}`;
            }
        }
        return resultado;
    }

    visitTerm(ctx: TermContext): string {
        const fatores = ctx.factor();
        if (fatores.length === 1) return this.visit(fatores[0]);
        let resultado = this.visit(fatores[0]);
        let idx = 1;
        for (let i = 1; i < ctx.childCount; i++) {
            const texto = ctx.getChild(i).text;
            if (['*', '/', '%', '//', '@'].includes(texto)) {
                resultado += ` ${texto} ${this.visit(fatores[idx++])}`;
            }
        }
        return resultado;
    }

    visitFactor(ctx: FactorContext): string {
        if (ctx.ADD()) return `+${this.visit(ctx.factor()!)}`;
        if (ctx.MINUS()) return `-${this.visit(ctx.factor()!)}`;
        if (ctx.NOT_OP()) return `~${this.visit(ctx.factor()!)}`;
        return this.visit(ctx.power()!);
    }

    visitPower(ctx: PowerContext): string {
        const base = this.visit(ctx.atom_expr());
        if (ctx.POWER()) {
            return `${base} ** ${this.visit(ctx.factor()!)}`;
        }
        return base;
    }

    visitAtom_expr(ctx: Atom_exprContext): string {
        const textoAtomo = this.visit(ctx.atom());
        const trailers = ctx.trailer();

        if (trailers.length === 0) return textoAtomo;

        // Chamada de função simples: nome(args)
        if (trailers.length === 1 && trailers[0].OPEN_PAREN()) {
            const nomeFuncao = this.mapeamentoFuncoes[textoAtomo] ?? textoAtomo;
            const arglist = trailers[0].arglist();
            const args = arglist ? this.visit(arglist) : '';
            return `${nomeFuncao}(${args})`;
        }

        // Chamada de método: obj.metodo(args)  →  dois trailers: .nome e (args)
        if (
            trailers.length === 2 &&
            trailers[0].DOT() &&
            trailers[0].NAME() &&
            trailers[1].OPEN_PAREN()
        ) {
            const nomeMetodoPython = trailers[0].NAME()!.text;
            const arglist = trailers[1].arglist();
            const args = arglist ? this.visit(arglist) : '';

            // join é invertido: sep.join(iteravel) → iteravel.juntar(sep)
            if (nomeMetodoPython === 'join') {
                return `${args}.juntar(${textoAtomo})`;
            }

            const nomeMetodoDelégua =
                this.mapeamentoMetodos[nomeMetodoPython] ?? nomeMetodoPython;
            return `${textoAtomo}.${nomeMetodoDelégua}(${args})`;
        }

        // Fallback: acesso a atributo, índice ou chamadas encadeadas
        let resultado = textoAtomo;
        for (const trailer of trailers) {
            resultado += this.visitTrailer(trailer);
        }
        return resultado;
    }

    visitTrailer(ctx: TrailerContext): string {
        if (ctx.DOT() && ctx.NAME()) {
            return `.${ctx.NAME()!.text}`;
        }
        if (ctx.OPEN_BRACK()) {
            const subscriptlist = ctx.subscriptlist();
            const conteudo = subscriptlist ? this.visit(subscriptlist) : '';
            return `[${conteudo}]`;
        }
        if (ctx.OPEN_PAREN()) {
            const arglist = ctx.arglist();
            const args = arglist ? this.visit(arglist) : '';
            return `(${args})`;
        }
        return ctx.text;
    }

    visitAtom(ctx: AtomContext): string {
        const nome = ctx.NAME();
        if (nome) return nome.text === 'self' ? 'isto' : nome.text;

        const numero = ctx.NUMBER();
        if (numero) return numero.text;

        if (ctx.TRUE()) return 'verdadeiro';
        if (ctx.FALSE()) return 'falso';
        if (ctx.NONE()) return 'nulo';

        const strings = ctx.STRING();
        if (strings.length > 0) return strings.map((s) => s.text).join(' ');

        if (ctx.OPEN_PAREN()) {
            const testlistComp = ctx.testlist_comp();
            if (testlistComp) {
                // Tupla com vírgula → vetor em Delégua
                if (testlistComp.COMMA().length > 0) {
                    return `[${this.visitTestlist_comp(testlistComp)}]`;
                }
                return `(${this.visitTestlist_comp(testlistComp)})`;
            }
            return '()';
        }

        if (ctx.OPEN_BRACK()) {
            const testlistComp = ctx.testlist_comp();
            if (testlistComp) {
                // Compreensão de lista: resultado já é um vetor, não envolve em []
                if (testlistComp.comp_for()) {
                    return this.visitTestlist_comp(testlistComp);
                }
                return `[${this.visitTestlist_comp(testlistComp)}]`;
            }
            return '[]';
        }

        if (ctx.OPEN_BRACE()) {
            const dictorsetmaker = ctx.dictorsetmaker();
            if (dictorsetmaker) return `{${this.visitDictorsetmaker(dictorsetmaker)}}`;
            return '{}';
        }

        return ctx.text;
    }

    visitArglist(ctx: ArglistContext): string {
        return ctx.argument().map((a) => this.visit(a)).join(', ');
    }

    visitArgument(ctx: ArgumentContext): string {
        const testes = ctx.test();
        if (testes.length === 1 && !ctx.ASSIGN()) {
            return this.visit(testes[0]);
        }
        // Argumento nomeado: nome=valor
        if (testes.length === 2 && ctx.ASSIGN()) {
            return `${this.visit(testes[0])} = ${this.visit(testes[1])}`;
        }
        return this.visitChildren(ctx);
    }

    visitTestlist_comp(ctx: Testlist_compContext): string {
        const compFor = ctx.comp_for();
        if (compFor) {
            return this.traduzirCompreensao(ctx.test(0), compFor);
        }
        return ctx.test().map((t) => this.visit(t)).join(', ');
    }

    private traduzirCompreensao(exprCtx: TestContext, compFor: Comp_forContext): string {
        const variavel = this.visit(compFor.exprlist());
        const iteravel = this.visit(compFor.or_test());
        const expr = this.visit(exprCtx);

        const compIter = compFor.comp_iter();
        const compIf: Comp_ifContext | undefined = compIter?.comp_if();

        if (compIf) {
            const cond = this.visitChildren(compIf.test_nocond());
            return `filtrarPor(${iteravel}, funcao(${variavel}) { retorna ${cond} }).mapear(funcao(${variavel}) { retorna ${expr} })`;
        }

        return `${iteravel}.mapear(funcao(${variavel}) { retorna ${expr} })`;
    }

    visitLambdef(ctx: LambdefContext): string {
        const varargslist = ctx.varargslist();
        const params = varargslist ? this.visitVarargslist(varargslist) : '';
        const corpo = this.visit(ctx.test());
        return `funcao(${params}) { retorna ${corpo} }`;
    }

    visitVarargslist(ctx: VarargslistContext): string {
        const params: string[] = [];
        for (let i = 0; i < ctx.childCount; ) {
            const texto = ctx.getChild(i).text;
            if (texto === ',') { i++; continue; }
            if (texto === '*' || texto === '**') break;
            const nomeParam = texto;
            if (i + 1 < ctx.childCount && ctx.getChild(i + 1).text === '=') {
                const valorPadrao = this.visit(ctx.getChild(i + 2));
                params.push(`${nomeParam} = ${valorPadrao}`);
                i += 3;
            } else {
                params.push(nomeParam);
                i++;
            }
        }
        return params.join(', ');
    }

    visitDictorsetmaker(ctx: DictorsetmakerContext): string {
        const tests = ctx.test();
        if (ctx.COLON().length > 0) {
            // Dicionário: testes alternados como chave/valor
            const pares: string[] = [];
            for (let i = 0; i + 1 < tests.length; i += 2) {
                pares.push(`${this.visit(tests[i])}: ${this.visit(tests[i + 1])}`);
            }
            return pares.join(', ');
        }
        // Conjunto (set) — representado como lista em Delégua
        return tests.map((t) => this.visit(t)).join(', ');
    }

    visitSubscriptlist(ctx: SubscriptlistContext): string {
        return ctx.subscript().map((s) => this.visitSubscript(s)).join(', ');
    }

    visitSubscript(ctx: SubscriptContext): string {
        const tests = ctx.test();
        if (!ctx.COLON()) {
            // Índice simples
            return tests.length > 0 ? this.visit(tests[0]) : '';
        }
        // Fatia: [inicio]:fim → inicio..fim
        // Se o primeiro filho é ':', não há início (ex: texto[:3])
        const temInicio = ctx.childCount > 0 && ctx.getChild(0).text !== ':';
        const inicio = temInicio ? this.visit(tests[0]) : '';
        const fimIdx = temInicio ? 1 : 0;
        const fim = tests.length > fimIdx ? this.visit(tests[fimIdx]) : '';
        return `${inicio}..${fim}`;
    }

    // Retorna as linhas já indentadas de um bloco, sem os colchetes externos.
    private visitLinhasCorpo(ctx: SuiteContext): string[] {
        const linhas: string[] = [];
        const simpleStmt = ctx.simple_stmt();
        if (simpleStmt) {
            linhas.push(`    ${this.visit(simpleStmt)}`);
        } else {
            for (const stmt of ctx.stmt()) {
                const traduzido = this.visit(stmt);
                for (const linha of traduzido.split('\n')) {
                    linhas.push(`    ${linha}`);
                }
            }
        }
        return linhas;
    }

    // Traduz um bloco indentado (suite) para o corpo entre chaves de Delégua.
    private visitCorpo(ctx: SuiteContext): string {
        return `{\n${this.visitLinhasCorpo(ctx).join('\n')}\n}`;
    }

    visitTry_stmt(ctx: Try_stmtContext): string {
        const corpoTente = this.visitCorpo(ctx.suite(0));
        let resultado = `tente ${corpoTente}`;

        const excepts = ctx.except_clause();
        if (excepts.length > 0) {
            // Detecta alias do erro na primeira cláusula except com `as nome`
            const alias = excepts.find((e) => e.NAME())?.NAME()?.text;

            // Junta todos os corpos except num único bloco pegue
            const todasLinhas: string[] = [];
            for (let i = 0; i < excepts.length; i++) {
                todasLinhas.push(...this.visitLinhasCorpo(ctx.suite(i + 1)));
            }
            const corpoPegue = `{\n${todasLinhas.join('\n')}\n}`;

            resultado += alias ? ` pegue (${alias}) ${corpoPegue}` : ` pegue ${corpoPegue}`;
        }

        // Índice da suite do else/finally começa após as suites de except
        let suiteIdx = 1 + excepts.length;
        if (ctx.ELSE()) {
            suiteIdx++; // else não tem equivalente em Delégua — ignora
        }
        if (ctx.FINALLY()) {
            resultado += ` finalmente ${this.visitCorpo(ctx.suite(suiteIdx))}`;
        }

        return resultado;
    }

    visitRaise_stmt(ctx: Raise_stmtContext): string {
        const tests = ctx.test();
        if (tests.length === 0) return 'levante';
        return `levante ${this.visit(tests[0])}`;
    }

    visitWith_stmt(ctx: With_stmtContext): string {
        const linhasCorpo = this.visitLinhasCorpo(ctx.suite());
        // Apenas itens com `as` podem ser traduzidos para `tendo...como`
        const itemsComAs = ctx.with_item().filter((item) => item.expr());
        if (itemsComAs.length === 0) {
            // Nenhum item com `as`: traduz apenas o corpo, sem tendo
            return linhasCorpo.map((l) => l.trimStart()).join('\n');
        }
        return this.construirTendo(itemsComAs, 0, linhasCorpo);
    }

    // Constrói blocos `tendo` aninhados para cada item do `with`.
    // Items sem `as` são ignorados (Delégua exige um identificador).
    private construirTendo(items: With_itemContext[], i: number, linhas: string[]): string {
        if (i >= items.length) {
            return `{\n${linhas.join('\n')}\n}`;
        }
        const item = items[i];
        const varExpr = item.expr();
        const expr = this.visit(item.test());

        if (!varExpr) {
            // Sem `as`: sem variável para ligar — pula este item
            return this.construirTendo(items, i + 1, linhas);
        }

        const nomeVar = this.visit(varExpr);

        // Para múltiplos itens, o próximo nível é indentado dentro deste bloco
        let linhasInternas: string[];
        if (i + 1 < items.length) {
            const blocoInterno = this.construirTendo(items, i + 1, linhas);
            linhasInternas = blocoInterno.split('\n').map((l) => `    ${l}`);
        } else {
            linhasInternas = linhas;
        }

        return `tendo ${expr} como ${nomeVar} {\n${linhasInternas.join('\n')}\n}`;
    }

    visitIf_stmt(ctx: If_stmtContext): string {
        const testes = ctx.test();
        const suites = ctx.suite();
        const elifs = ctx.ELIF();

        // Primeiro bloco: se (cond) { ... }
        let resultado = `se (${this.visit(testes[0])}) ${this.visitCorpo(suites[0])}`;

        // Blocos elif: senão se (cond) { ... }
        for (let i = 0; i < elifs.length; i++) {
            resultado += ` senão se (${this.visit(testes[i + 1])}) ${this.visitCorpo(suites[i + 1])}`;
        }

        // Bloco else: senão { ... }
        if (ctx.ELSE()) {
            resultado += ` senão ${this.visitCorpo(suites[suites.length - 1])}`;
        }

        return resultado;
    }

    visitWhile_stmt(ctx: While_stmtContext): string {
        const cond = this.visit(ctx.test());
        const corpo = this.visitCorpo(ctx.suite(0));
        return `enquanto (${cond}) ${corpo}`;
    }

    visitFor_stmt(ctx: For_stmtContext): string {
        const variavel = this.visit(ctx.exprlist());
        const iteravel = this.visit(ctx.testlist());
        const corpo = this.visitCorpo(ctx.suite(0));
        return `para cada ${variavel} em ${iteravel} ${corpo}`;
    }

    visitBreak_stmt(_ctx: Break_stmtContext): string {
        return 'sustar';
    }

    visitContinue_stmt(_ctx: Continue_stmtContext): string {
        return 'continua';
    }

    visitReturn_stmt(ctx: Return_stmtContext): string {
        const testlist = ctx.testlist();
        if (testlist) return `retorna ${this.visit(testlist)}`;
        return 'retorna';
    }

    visitTfpdef(ctx: TfpdefContext): string {
        // Ignora anotação de tipo (: Tipo) — retorna apenas o nome
        return ctx.NAME().text;
    }

    visitTypedargslist(ctx: TypedargslistContext): string {
        const params: string[] = [];

        for (let i = 0; i < ctx.childCount; ) {
            const filho = ctx.getChild(i);
            const texto = filho.text;

            if (texto === ',') { i++; continue; }
            // Para em *args ou **kwargs — suporte básico suficiente para fase 4
            if (texto === '*' || texto === '**') break;

            const nomeParam = this.visit(filho); // → visitTfpdef → NAME
            if (nomeParam === 'self') { i++; continue; } // Remove self

            // Verifica se há valor padrão: tfpdef '=' test
            if (i + 1 < ctx.childCount && ctx.getChild(i + 1).text === '=') {
                const valorPadrao = this.visit(ctx.getChild(i + 2));
                params.push(`${nomeParam} = ${valorPadrao}`);
                i += 3;
            } else {
                params.push(nomeParam);
                i++;
            }
        }

        return params.join(', ');
    }

    visitParameters(ctx: ParametersContext): string {
        const argslist = ctx.typedargslist();
        if (!argslist) return '';
        return this.visitTypedargslist(argslist);
    }

    visitFuncdef(ctx: FuncdefContext): string {
        const nomePython = ctx.NAME().text;
        const params = this.visitParameters(ctx.parameters());
        const corpo = this.visitCorpo(ctx.suite());

        if (nomePython === '__init__') {
            return `construtor(${params}) ${corpo}`;
        }
        return `funcao ${nomePython}(${params}) ${corpo}`;
    }

    visitClassdef(ctx: ClassdefContext): string {
        const nome = ctx.NAME().text;
        const arglist = ctx.arglist();
        const heranca = arglist ? ` herda ${this.visit(arglist)}` : '';
        const corpo = this.visitCorpo(ctx.suite());
        return `classe ${nome}${heranca} ${corpo}`;
    }

    visitDecorated(ctx: DecoratedContext): string {
        // Ignora decoradores — traduz apenas o funcdef ou classdef subjacente
        const funcdef = ctx.funcdef();
        if (funcdef) return this.visitFuncdef(funcdef);
        const classdef = ctx.classdef();
        if (classdef) return this.visitClassdef(classdef);
        return this.visitChildren(ctx);
    }

    traduzir(codigo: string): string {
        // O lexer Python3 do ANTLR exige NEWLINE ao final de cada instrução.
        const codigoNormalizado = codigo.endsWith('\n') ? codigo : codigo + '\n';
        const inputStream = CharStreams.fromString(codigoNormalizado);
        const lexer = new Python3Lexer(inputStream);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new Python3Parser(tokenStream);
        const tree = parser.file_input();
        return this.visit(tree);
    }
}
