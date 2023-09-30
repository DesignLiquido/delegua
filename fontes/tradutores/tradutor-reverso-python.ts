import { CharStreams, CodePointCharStream, CommonTokenStream } from 'antlr4ts';
import {
    ExprContext,
    Python3Parser,
    StmtContext,
    Expr_stmtContext,
    Simple_assignContext,
} from './python/python3-parser';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';

import { Python3Lexer } from './python/python3-lexer';
import { Python3Listener } from './python/python3-listener';

/**
 * Tradutor reverso de Python para Delégua.
 * Utiliza o ecossistema do ANTLR para percorrer código em
 * Python e traduzir para Delégua.
 */
export class TradutorReversoPython implements Python3Listener {
    inputStream: CodePointCharStream;
    lexer: Python3Lexer;
    parser: Python3Parser;
    tokenStream: CommonTokenStream;
    resultado: string;

    /**
     * Aqui é preciso contar se o contexto tem filhos.
     * Há alguns casos em que este código é executado mais
     * de uma vez por algum motivo.
     * @param ctx O contexto da atribuição.
     */
    enterSimple_assign(ctx: Simple_assignContext): void {
        if (ctx.childCount > 0) {
            this.resultado += ' = ';
        }
    }

    /**
     * Aparentemente é o melhor lugar para escrever quebras de linha.
     * @param ctx Contexto da instrução.
     */
    exitStmt(ctx: StmtContext): void {
        this.resultado += ctx.stop.text;
    }

    enterExpr_stmt(ctx: Expr_stmtContext): void {
        // console.log(ctx.start.text);
    }

    enterExpr(ctx: ExprContext): void {
        switch (ctx.start.text) {
            case 'input':
                this.resultado += 'leia(';
                break;
            case 'print':
                this.resultado += 'escreva(';
                break;
            default:
                this.resultado += ctx.start.text;
                break;
        }
    }

    exitExpr(ctx: ExprContext): void {
        switch (ctx.start.text) {
            case 'input':
            case 'print':
                this.resultado += ')';
                break;
            default:
                break;
        }
    }

    traduzir(codigo: string) {
        this.inputStream = CharStreams.fromString(codigo);
        this.lexer = new Python3Lexer(this.inputStream);
        this.tokenStream = new CommonTokenStream(this.lexer);
        this.parser = new Python3Parser(this.tokenStream);
        this.resultado = '';

        // Aqui achei três bons pontos de entrada:
        // single_input, file_input e eval_input. O que funcionou melhor foi o file_input.
        let tree = this.parser.file_input();
        ParseTreeWalker.DEFAULT.walk(this as any, tree);
        return this.resultado;
    }
}
