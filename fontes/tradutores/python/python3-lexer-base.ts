import { Lexer } from "antlr4ts/Lexer";
import { CommonToken } from "antlr4ts/CommonToken";
import { Token } from "antlr4ts";

export abstract class Python3LexerBase extends Lexer {
    public static readonly INDENT = 1;
	public static readonly DEDENT = 2;
	public static readonly STRING = 3;
	public static readonly NUMBER = 4;
	public static readonly INTEGER = 5;
	public static readonly AND = 6;
	public static readonly AS = 7;
	public static readonly ASSERT = 8;
	public static readonly ASYNC = 9;
	public static readonly AWAIT = 10;
	public static readonly BREAK = 11;
	public static readonly CASE = 12;
	public static readonly CLASS = 13;
	public static readonly CONTINUE = 14;
	public static readonly DEF = 15;
	public static readonly DEL = 16;
	public static readonly ELIF = 17;
	public static readonly ELSE = 18;
	public static readonly EXCEPT = 19;
	public static readonly FALSE = 20;
	public static readonly FINALLY = 21;
	public static readonly FOR = 22;
	public static readonly FROM = 23;
	public static readonly GLOBAL = 24;
	public static readonly IF = 25;
	public static readonly IMPORT = 26;
	public static readonly IN = 27;
	public static readonly IS = 28;
	public static readonly LAMBDA = 29;
	public static readonly MATCH = 30;
	public static readonly NONE = 31;
	public static readonly NONLOCAL = 32;
	public static readonly NOT = 33;
	public static readonly OR = 34;
	public static readonly PASS = 35;
	public static readonly RAISE = 36;
	public static readonly RETURN = 37;
	public static readonly TRUE = 38;
	public static readonly TRY = 39;
	public static readonly UNDERSCORE = 40;
	public static readonly WHILE = 41;
	public static readonly WITH = 42;
	public static readonly YIELD = 43;
	public static readonly NEWLINE = 44;
	public static readonly NAME = 45;
	public static readonly STRING_LITERAL = 46;
	public static readonly BYTES_LITERAL = 47;
	public static readonly DECIMAL_INTEGER = 48;
	public static readonly OCT_INTEGER = 49;
	public static readonly HEX_INTEGER = 50;
	public static readonly BIN_INTEGER = 51;
	public static readonly FLOAT_NUMBER = 52;
	public static readonly IMAG_NUMBER = 53;
	public static readonly DOT = 54;
	public static readonly ELLIPSIS = 55;
	public static readonly STAR = 56;
	public static readonly OPEN_PAREN = 57;
	public static readonly CLOSE_PAREN = 58;
	public static readonly COMMA = 59;
	public static readonly COLON = 60;
	public static readonly SEMI_COLON = 61;
	public static readonly POWER = 62;
	public static readonly ASSIGN = 63;
	public static readonly OPEN_BRACK = 64;
	public static readonly CLOSE_BRACK = 65;
	public static readonly OR_OP = 66;
	public static readonly XOR = 67;
	public static readonly AND_OP = 68;
	public static readonly LEFT_SHIFT = 69;
	public static readonly RIGHT_SHIFT = 70;
	public static readonly ADD = 71;
	public static readonly MINUS = 72;
	public static readonly DIV = 73;
	public static readonly MOD = 74;
	public static readonly IDIV = 75;
	public static readonly NOT_OP = 76;
	public static readonly OPEN_BRACE = 77;
	public static readonly CLOSE_BRACE = 78;
	public static readonly LESS_THAN = 79;
	public static readonly GREATER_THAN = 80;
	public static readonly EQUALS = 81;
	public static readonly GT_EQ = 82;
	public static readonly LT_EQ = 83;
	public static readonly NOT_EQ_1 = 84;
	public static readonly NOT_EQ_2 = 85;
	public static readonly AT = 86;
	public static readonly ARROW = 87;
	public static readonly ADD_ASSIGN = 88;
	public static readonly SUB_ASSIGN = 89;
	public static readonly MULT_ASSIGN = 90;
	public static readonly AT_ASSIGN = 91;
	public static readonly DIV_ASSIGN = 92;
	public static readonly MOD_ASSIGN = 93;
	public static readonly AND_ASSIGN = 94;
	public static readonly OR_ASSIGN = 95;
	public static readonly XOR_ASSIGN = 96;
	public static readonly LEFT_SHIFT_ASSIGN = 97;
	public static readonly RIGHT_SHIFT_ASSIGN = 98;
	public static readonly POWER_ASSIGN = 99;
	public static readonly IDIV_ASSIGN = 100;
	public static readonly SKIP_ = 101;
	public static readonly UNKNOWN_CHAR = 102;

    opened: number;
    indents: any[] = [];
    tokens: Token[] = [];
    lastToken: Token = null;

    openBrace() {
        this.opened++;
    }

    closeBrace() {
        this.opened--;
    }

    private createDedent(): Token {
        let dedent: CommonToken = this.commonToken(Python3LexerBase.DEDENT, '');
        dedent.line = this.lastToken.line;
        return dedent;
    }

    private commonToken(type: number, text: string): CommonToken {
        let stop = this.charIndex - 1;
        let start = text.length === 0 ? stop : stop - text.length + 1;
        return new CommonToken(
            type, 
            text, 
            this._tokenFactorySourcePair, 
            Token.DEFAULT_CHANNEL,
            start,
            stop
        )
    }

    private getIndentationCount(spaces: string) {
        let count = 0;

        for (let c of spaces) {
            switch (c) {
                case '\t':
                    count += 8 - (count % 8);
                    break;
                default: // Normal space char
                    count++;
            }
        }

        return count;
    }

    onNewLine() {
        let newLine = super.text.replace(/[^\r\n\f]+/, '');
        let spaces = super.text.replace(/[\r\n\f]+/, '');

        // Strip newlines inside open clauses except if we are near EOF. We keep NEWLINEs near EOF to
        // satisfy the final newline needed by the single_put rule used by the REPL.
        let next = super._input.LA(1);
        let nextNext = super._input.LA(2);
        if (this.opened > 0 || (nextNext != -1 && (next === '\r'.charCodeAt(0) || next === '\n'.charCodeAt(0) || next === '\f'.charCodeAt(0) || next === '#'.charCodeAt(0)))) {
            // If we're inside a list or on a blank line, ignore all indents,
            // dedents and line breaks.
            super.skip();
        } else {
            super.emit(this.commonToken(Python3LexerBase.NEWLINE, newLine));
            let indent = this.getIndentationCount(spaces);
            let previous = this.indents.length === 0 ? 0 : this.indents[this.indents.length - 1];

            if (indent === previous) {
                this.skip();
            } else if (indent > previous) {
                this.indents.push(indent);
                super.emit(this.commonToken(Python3LexerBase.INDENT, spaces));
            } else {
                while (this.indents.length > 0 && this.indents[this.indents.length - 1] > indent) {
                    this.emit(this.createDedent());
                    this.indents.pop();
                }
            }
        }
    }

    atStartOfInput() {
        return super.charPositionInLine === 0 && super.line === 1;
    }

    // Overrides

    emit(token: Token = null): Token {
        if (token) {
            this.tokens.push(token);
        }
        
        return super.emit(token);
    }

    nextToken(): Token {
        // Check if the end-of-file is ahead and there are still some DEDENTS expected.
        if (this._input.LA(1) == Python3LexerBase.EOF && this.indents.length > 0) {
            // Remove any trailing EOF tokens from our buffer.
            for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type == Python3LexerBase.EOF) {
                    this.tokens.splice(i, 1);
                }

                // First emit an extra line break that serves as the end of the statement.
                this.emit(this.commonToken(Python3LexerBase.NEWLINE, '\n'));

                // Now emit as much DEDENT tokens as needed.
                while (this.indents.length > 0) {
                    this.emit(this.createDedent());
                    this.indents.pop();
                }

                // Put the EOF back on the token stream.
                this.emit(this.commonToken(Python3LexerBase.EOF, "<EOF>"));
            }
        }

        let next: Token = super.nextToken();

        if (next.channel == Token.DEFAULT_CHANNEL) {
            // Keep track of the last token on the default channel.
            this.lastToken = next;
        }

        return this.tokens.length === 0 ? next : this.tokens.shift();
    }

    reset() {
        this.tokens = [];
        this.indents = [];
        this.opened = 0;
        this.lastToken = null;
        super.reset();
    }
}