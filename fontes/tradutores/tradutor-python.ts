import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { Python3Lexer } from './python/python3-lexer';
import { ExprContext, File_inputContext, Import_nameContext, Import_stmtContext, Python3Parser, Single_inputContext } from './python/python3-parser';
import { Python3ParserListener } from './python/python3-parser-listener';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

/**
 * Esse teste verifica o código passado dentro de `CharStreams.fromString()`.
 * Aqui apenas testamos quais seções da gramática estamos passando. 
 */
class TesteListenerPython implements Python3ParserListener {
    enterImport_name(ctx: Import_nameContext): void {
        console.log(`Linha do import: ${ctx._start.line}`);
    }

    enterImport_stmt?(ctx: Import_stmtContext): void {
        console.log(`Linha próximo import: ${ctx._start.line}`);
    }

    enterSingle_input(ctx: Single_inputContext): void {
        console.log(`Linha do ponto de entrada ${ctx._start.line}`);
    }

    enterFile_input(ctx: File_inputContext): void {
        console.log(`Linha do ponto de entrada do arquivo ${ctx._start.line}`);
    }

    exitImport_name(ctx: Import_nameContext): void {
        console.log(`Saiu do import: ${ctx._stop.text}`);
    }

    enterExpr?(ctx: ExprContext): void {
        console.log(`Linha de expressão ${ctx._start.line}`);
    }
}

// Criamos um Lexador e um avaliador sintático aqui.
// Uma coisa bizarra que notei é que o lexador não funciona direito
// quando passamos uma string com as quebras de linha corretas.
// por exemplo: "import json\nimport os\nimport sys"
let inputStream = CharStreams.fromString("import json import os import sys");
let lexer = new Python3Lexer(inputStream);
let tokenStream = new CommonTokenStream(lexer);
let parser = new Python3Parser(tokenStream);

// Aqui criamos o Listener, que apenas fala por onde o caminhante de árvore sintática
// passou. Neste caso, testamos o ponto de entrada (file_input) e um método de 
// importação.
let listener = new TesteListenerPython();

// Aqui achei três bons pontos de entrada:
// single_input, file_input e eval_input. O que funcionou melhor foi o file_input.
let tree = parser.file_input();
ParseTreeWalker.DEFAULT.walk(listener as any, tree);