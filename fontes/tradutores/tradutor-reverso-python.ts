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
    ArglistContext,
    ArgumentContext,
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
    private readonly mapeamentoFuncoes: Record<string, string> = {
        print: 'escreva',
        input: 'leia',
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
            return `var ${lhs} = ${rhs}`;
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

        // Fallback: acesso a atributo, índice, chamadas encadeadas
        let resultado = textoAtomo;
        for (const trailer of trailers) {
            resultado += this.visit(trailer);
        }
        return resultado;
    }

    visitAtom(ctx: AtomContext): string {
        const nome = ctx.NAME();
        if (nome) return nome.text;

        const numero = ctx.NUMBER();
        if (numero) return numero.text;

        if (ctx.TRUE()) return 'verdadeiro';
        if (ctx.FALSE()) return 'falso';
        if (ctx.NONE()) return 'nulo';

        const strings = ctx.STRING();
        if (strings.length > 0) return strings.map((s) => s.text).join(' ');

        if (ctx.OPEN_PAREN()) {
            const testlistComp = ctx.testlist_comp();
            if (testlistComp) return `(${this.visit(testlistComp)})`;
            return '()';
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
