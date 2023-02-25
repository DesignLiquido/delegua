import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';

import { Python3Lexer } from './python/python3-lexer';
import { Python3Listener } from './python/python3-listener';
import { Import_nameContext, ExprContext, Python3Parser } from './python/python3-parser';

/**
 * Esse teste verifica o código passado dentro de `CharStreams.fromString()`.
 * Aqui apenas testamos quais seções da gramática estamos passando. 
 */
class TesteListenerPython implements Python3Listener {
    enterImport_name(ctx: Import_nameContext): void {
        console.log(`Linha do import: ${ctx._start.line}`);
    }

    exitImport_name(ctx: Import_nameContext): void {
        console.log(`Saiu do import: ${ctx._stop.text}`);
    }

    enterExpr(ctx: ExprContext): void {
        console.log(`Linha de expressão ${ctx._start.line}`);
    }
}

// Criamos um Lexador e um avaliador sintático aqui.
let inputStream = CharStreams.fromString("import json\nimport os\nimport sys\n");
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