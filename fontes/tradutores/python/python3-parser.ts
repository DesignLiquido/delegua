// Generated from D:\Delegua\delegua\fontes\tradutores\python\Python3Parser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { Python3ParserListener } from "./python3-parser-listener";
import { Python3ParserVisitor } from "./python3-parser-visitor";
import { Python3ParserBase } from "./python3-parser-base";


export class Python3Parser extends Python3ParserBase {
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
	public static readonly RULE_single_input = 0;
	public static readonly RULE_file_input = 1;
	public static readonly RULE_eval_input = 2;
	public static readonly RULE_decorator = 3;
	public static readonly RULE_decorators = 4;
	public static readonly RULE_decorated = 5;
	public static readonly RULE_async_funcdef = 6;
	public static readonly RULE_funcdef = 7;
	public static readonly RULE_parameters = 8;
	public static readonly RULE_typedargslist = 9;
	public static readonly RULE_tfpdef = 10;
	public static readonly RULE_varargslist = 11;
	public static readonly RULE_vfpdef = 12;
	public static readonly RULE_stmt = 13;
	public static readonly RULE_simple_stmts = 14;
	public static readonly RULE_simple_stmt = 15;
	public static readonly RULE_expr_stmt = 16;
	public static readonly RULE_annassign = 17;
	public static readonly RULE_testlist_star_expr = 18;
	public static readonly RULE_augassign = 19;
	public static readonly RULE_del_stmt = 20;
	public static readonly RULE_pass_stmt = 21;
	public static readonly RULE_flow_stmt = 22;
	public static readonly RULE_break_stmt = 23;
	public static readonly RULE_continue_stmt = 24;
	public static readonly RULE_return_stmt = 25;
	public static readonly RULE_yield_stmt = 26;
	public static readonly RULE_raise_stmt = 27;
	public static readonly RULE_import_stmt = 28;
	public static readonly RULE_import_name = 29;
	public static readonly RULE_import_from = 30;
	public static readonly RULE_import_as_name = 31;
	public static readonly RULE_dotted_as_name = 32;
	public static readonly RULE_import_as_names = 33;
	public static readonly RULE_dotted_as_names = 34;
	public static readonly RULE_dotted_name = 35;
	public static readonly RULE_global_stmt = 36;
	public static readonly RULE_nonlocal_stmt = 37;
	public static readonly RULE_assert_stmt = 38;
	public static readonly RULE_compound_stmt = 39;
	public static readonly RULE_async_stmt = 40;
	public static readonly RULE_if_stmt = 41;
	public static readonly RULE_while_stmt = 42;
	public static readonly RULE_for_stmt = 43;
	public static readonly RULE_try_stmt = 44;
	public static readonly RULE_with_stmt = 45;
	public static readonly RULE_with_item = 46;
	public static readonly RULE_except_clause = 47;
	public static readonly RULE_block = 48;
	public static readonly RULE_match_stmt = 49;
	public static readonly RULE_subject_expr = 50;
	public static readonly RULE_star_named_expressions = 51;
	public static readonly RULE_star_named_expression = 52;
	public static readonly RULE_case_block = 53;
	public static readonly RULE_guard = 54;
	public static readonly RULE_patterns = 55;
	public static readonly RULE_pattern = 56;
	public static readonly RULE_as_pattern = 57;
	public static readonly RULE_or_pattern = 58;
	public static readonly RULE_closed_pattern = 59;
	public static readonly RULE_literal_pattern = 60;
	public static readonly RULE_literal_expr = 61;
	public static readonly RULE_complex_number = 62;
	public static readonly RULE_signed_number = 63;
	public static readonly RULE_signed_real_number = 64;
	public static readonly RULE_real_number = 65;
	public static readonly RULE_imaginary_number = 66;
	public static readonly RULE_capture_pattern = 67;
	public static readonly RULE_pattern_capture_target = 68;
	public static readonly RULE_wildcard_pattern = 69;
	public static readonly RULE_value_pattern = 70;
	public static readonly RULE_attr = 71;
	public static readonly RULE_name_or_attr = 72;
	public static readonly RULE_group_pattern = 73;
	public static readonly RULE_sequence_pattern = 74;
	public static readonly RULE_open_sequence_pattern = 75;
	public static readonly RULE_maybe_sequence_pattern = 76;
	public static readonly RULE_maybe_star_pattern = 77;
	public static readonly RULE_star_pattern = 78;
	public static readonly RULE_mapping_pattern = 79;
	public static readonly RULE_items_pattern = 80;
	public static readonly RULE_key_value_pattern = 81;
	public static readonly RULE_double_star_pattern = 82;
	public static readonly RULE_class_pattern = 83;
	public static readonly RULE_positional_patterns = 84;
	public static readonly RULE_keyword_patterns = 85;
	public static readonly RULE_keyword_pattern = 86;
	public static readonly RULE_test = 87;
	public static readonly RULE_test_nocond = 88;
	public static readonly RULE_lambdef = 89;
	public static readonly RULE_lambdef_nocond = 90;
	public static readonly RULE_or_test = 91;
	public static readonly RULE_and_test = 92;
	public static readonly RULE_not_test = 93;
	public static readonly RULE_comparison = 94;
	public static readonly RULE_comp_op = 95;
	public static readonly RULE_star_expr = 96;
	public static readonly RULE_expr = 97;
	public static readonly RULE_xor_expr = 98;
	public static readonly RULE_and_expr = 99;
	public static readonly RULE_shift_expr = 100;
	public static readonly RULE_arith_expr = 101;
	public static readonly RULE_term = 102;
	public static readonly RULE_factor = 103;
	public static readonly RULE_power = 104;
	public static readonly RULE_atom_expr = 105;
	public static readonly RULE_atom = 106;
	public static readonly RULE_name = 107;
	public static readonly RULE_testlist_comp = 108;
	public static readonly RULE_trailer = 109;
	public static readonly RULE_subscriptlist = 110;
	public static readonly RULE_subscript_ = 111;
	public static readonly RULE_sliceop = 112;
	public static readonly RULE_exprlist = 113;
	public static readonly RULE_testlist = 114;
	public static readonly RULE_dictorsetmaker = 115;
	public static readonly RULE_classdef = 116;
	public static readonly RULE_arglist = 117;
	public static readonly RULE_argument = 118;
	public static readonly RULE_comp_iter = 119;
	public static readonly RULE_comp_for = 120;
	public static readonly RULE_comp_if = 121;
	public static readonly RULE_encoding_decl = 122;
	public static readonly RULE_yield_expr = 123;
	public static readonly RULE_yield_arg = 124;
	public static readonly RULE_strings = 125;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"single_input", "file_input", "eval_input", "decorator", "decorators", 
		"decorated", "async_funcdef", "funcdef", "parameters", "typedargslist", 
		"tfpdef", "varargslist", "vfpdef", "stmt", "simple_stmts", "simple_stmt", 
		"expr_stmt", "annassign", "testlist_star_expr", "augassign", "del_stmt", 
		"pass_stmt", "flow_stmt", "break_stmt", "continue_stmt", "return_stmt", 
		"yield_stmt", "raise_stmt", "import_stmt", "import_name", "import_from", 
		"import_as_name", "dotted_as_name", "import_as_names", "dotted_as_names", 
		"dotted_name", "global_stmt", "nonlocal_stmt", "assert_stmt", "compound_stmt", 
		"async_stmt", "if_stmt", "while_stmt", "for_stmt", "try_stmt", "with_stmt", 
		"with_item", "except_clause", "block", "match_stmt", "subject_expr", "star_named_expressions", 
		"star_named_expression", "case_block", "guard", "patterns", "pattern", 
		"as_pattern", "or_pattern", "closed_pattern", "literal_pattern", "literal_expr", 
		"complex_number", "signed_number", "signed_real_number", "real_number", 
		"imaginary_number", "capture_pattern", "pattern_capture_target", "wildcard_pattern", 
		"value_pattern", "attr", "name_or_attr", "group_pattern", "sequence_pattern", 
		"open_sequence_pattern", "maybe_sequence_pattern", "maybe_star_pattern", 
		"star_pattern", "mapping_pattern", "items_pattern", "key_value_pattern", 
		"double_star_pattern", "class_pattern", "positional_patterns", "keyword_patterns", 
		"keyword_pattern", "test", "test_nocond", "lambdef", "lambdef_nocond", 
		"or_test", "and_test", "not_test", "comparison", "comp_op", "star_expr", 
		"expr", "xor_expr", "and_expr", "shift_expr", "arith_expr", "term", "factor", 
		"power", "atom_expr", "atom", "name", "testlist_comp", "trailer", "subscriptlist", 
		"subscript_", "sliceop", "exprlist", "testlist", "dictorsetmaker", "classdef", 
		"arglist", "argument", "comp_iter", "comp_for", "comp_if", "encoding_decl", 
		"yield_expr", "yield_arg", "strings",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, "'and'", 
		"'as'", "'assert'", "'async'", "'await'", "'break'", "'case'", "'class'", 
		"'continue'", "'def'", "'del'", "'elif'", "'else'", "'except'", "'False'", 
		"'finally'", "'for'", "'from'", "'global'", "'if'", "'import'", "'in'", 
		"'is'", "'lambda'", "'match'", "'None'", "'nonlocal'", "'not'", "'or'", 
		"'pass'", "'raise'", "'return'", "'True'", "'try'", "'_'", "'while'", 
		"'with'", "'yield'", undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "'.'", "'...'", 
		"'*'", "'('", "')'", "','", "':'", "';'", "'**'", "'='", "'['", "']'", 
		"'|'", "'^'", "'&'", "'<<'", "'>>'", "'+'", "'-'", "'/'", "'%'", "'//'", 
		"'~'", "'{'", "'}'", "'<'", "'>'", "'=='", "'>='", "'<='", "'<>'", "'!='", 
		"'@'", "'->'", "'+='", "'-='", "'*='", "'@='", "'/='", "'%='", "'&='", 
		"'|='", "'^='", "'<<='", "'>>='", "'**='", "'//='",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "INDENT", "DEDENT", "STRING", "NUMBER", "INTEGER", "AND", "AS", 
		"ASSERT", "ASYNC", "AWAIT", "BREAK", "CASE", "CLASS", "CONTINUE", "DEF", 
		"DEL", "ELIF", "ELSE", "EXCEPT", "FALSE", "FINALLY", "FOR", "FROM", "GLOBAL", 
		"IF", "IMPORT", "IN", "IS", "LAMBDA", "MATCH", "NONE", "NONLOCAL", "NOT", 
		"OR", "PASS", "RAISE", "RETURN", "TRUE", "TRY", "UNDERSCORE", "WHILE", 
		"WITH", "YIELD", "NEWLINE", "NAME", "STRING_LITERAL", "BYTES_LITERAL", 
		"DECIMAL_INTEGER", "OCT_INTEGER", "HEX_INTEGER", "BIN_INTEGER", "FLOAT_NUMBER", 
		"IMAG_NUMBER", "DOT", "ELLIPSIS", "STAR", "OPEN_PAREN", "CLOSE_PAREN", 
		"COMMA", "COLON", "SEMI_COLON", "POWER", "ASSIGN", "OPEN_BRACK", "CLOSE_BRACK", 
		"OR_OP", "XOR", "AND_OP", "LEFT_SHIFT", "RIGHT_SHIFT", "ADD", "MINUS", 
		"DIV", "MOD", "IDIV", "NOT_OP", "OPEN_BRACE", "CLOSE_BRACE", "LESS_THAN", 
		"GREATER_THAN", "EQUALS", "GT_EQ", "LT_EQ", "NOT_EQ_1", "NOT_EQ_2", "AT", 
		"ARROW", "ADD_ASSIGN", "SUB_ASSIGN", "MULT_ASSIGN", "AT_ASSIGN", "DIV_ASSIGN", 
		"MOD_ASSIGN", "AND_ASSIGN", "OR_ASSIGN", "XOR_ASSIGN", "LEFT_SHIFT_ASSIGN", 
		"RIGHT_SHIFT_ASSIGN", "POWER_ASSIGN", "IDIV_ASSIGN", "SKIP_", "UNKNOWN_CHAR",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(Python3Parser._LITERAL_NAMES, Python3Parser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return Python3Parser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Python3Parser.g4"; }

	// @Override
	public get ruleNames(): string[] { return Python3Parser.ruleNames; }

	// @Override
	public get serializedATN(): string { return Python3Parser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(Python3Parser._ATN, this);
	}
	// @RuleVersion(0)
	public single_input(): Single_inputContext {
		let _localctx: Single_inputContext = new Single_inputContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, Python3Parser.RULE_single_input);
		try {
			this.state = 257;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 252;
				this.match(Python3Parser.NEWLINE);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 253;
				this.simple_stmts();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 254;
				this.compound_stmt();
				this.state = 255;
				this.match(Python3Parser.NEWLINE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public file_input(): File_inputContext {
		let _localctx: File_inputContext = new File_inputContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, Python3Parser.RULE_file_input);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 263;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.ASSERT) | (1 << Python3Parser.ASYNC) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.BREAK) | (1 << Python3Parser.CLASS) | (1 << Python3Parser.CONTINUE) | (1 << Python3Parser.DEF) | (1 << Python3Parser.DEL) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.FOR) | (1 << Python3Parser.FROM) | (1 << Python3Parser.GLOBAL) | (1 << Python3Parser.IF) | (1 << Python3Parser.IMPORT) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (Python3Parser.NONLOCAL - 32)) | (1 << (Python3Parser.NOT - 32)) | (1 << (Python3Parser.PASS - 32)) | (1 << (Python3Parser.RAISE - 32)) | (1 << (Python3Parser.RETURN - 32)) | (1 << (Python3Parser.TRUE - 32)) | (1 << (Python3Parser.TRY - 32)) | (1 << (Python3Parser.UNDERSCORE - 32)) | (1 << (Python3Parser.WHILE - 32)) | (1 << (Python3Parser.WITH - 32)) | (1 << (Python3Parser.YIELD - 32)) | (1 << (Python3Parser.NEWLINE - 32)) | (1 << (Python3Parser.NAME - 32)) | (1 << (Python3Parser.ELLIPSIS - 32)) | (1 << (Python3Parser.STAR - 32)) | (1 << (Python3Parser.OPEN_PAREN - 32)))) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & ((1 << (Python3Parser.OPEN_BRACK - 64)) | (1 << (Python3Parser.ADD - 64)) | (1 << (Python3Parser.MINUS - 64)) | (1 << (Python3Parser.NOT_OP - 64)) | (1 << (Python3Parser.OPEN_BRACE - 64)) | (1 << (Python3Parser.AT - 64)))) !== 0)) {
				{
				this.state = 261;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.NEWLINE:
					{
					this.state = 259;
					this.match(Python3Parser.NEWLINE);
					}
					break;
				case Python3Parser.STRING:
				case Python3Parser.NUMBER:
				case Python3Parser.ASSERT:
				case Python3Parser.ASYNC:
				case Python3Parser.AWAIT:
				case Python3Parser.BREAK:
				case Python3Parser.CLASS:
				case Python3Parser.CONTINUE:
				case Python3Parser.DEF:
				case Python3Parser.DEL:
				case Python3Parser.FALSE:
				case Python3Parser.FOR:
				case Python3Parser.FROM:
				case Python3Parser.GLOBAL:
				case Python3Parser.IF:
				case Python3Parser.IMPORT:
				case Python3Parser.LAMBDA:
				case Python3Parser.MATCH:
				case Python3Parser.NONE:
				case Python3Parser.NONLOCAL:
				case Python3Parser.NOT:
				case Python3Parser.PASS:
				case Python3Parser.RAISE:
				case Python3Parser.RETURN:
				case Python3Parser.TRUE:
				case Python3Parser.TRY:
				case Python3Parser.UNDERSCORE:
				case Python3Parser.WHILE:
				case Python3Parser.WITH:
				case Python3Parser.YIELD:
				case Python3Parser.NAME:
				case Python3Parser.ELLIPSIS:
				case Python3Parser.STAR:
				case Python3Parser.OPEN_PAREN:
				case Python3Parser.OPEN_BRACK:
				case Python3Parser.ADD:
				case Python3Parser.MINUS:
				case Python3Parser.NOT_OP:
				case Python3Parser.OPEN_BRACE:
				case Python3Parser.AT:
					{
					this.state = 260;
					this.stmt();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 265;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 266;
			this.match(Python3Parser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public eval_input(): Eval_inputContext {
		let _localctx: Eval_inputContext = new Eval_inputContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, Python3Parser.RULE_eval_input);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 268;
			this.testlist();
			this.state = 272;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.NEWLINE) {
				{
				{
				this.state = 269;
				this.match(Python3Parser.NEWLINE);
				}
				}
				this.state = 274;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 275;
			this.match(Python3Parser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public decorator(): DecoratorContext {
		let _localctx: DecoratorContext = new DecoratorContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, Python3Parser.RULE_decorator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 277;
			this.match(Python3Parser.AT);
			this.state = 278;
			this.dotted_name();
			this.state = 284;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.OPEN_PAREN) {
				{
				this.state = 279;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 281;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.POWER - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 280;
					this.arglist();
					}
				}

				this.state = 283;
				this.match(Python3Parser.CLOSE_PAREN);
				}
			}

			this.state = 286;
			this.match(Python3Parser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public decorators(): DecoratorsContext {
		let _localctx: DecoratorsContext = new DecoratorsContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, Python3Parser.RULE_decorators);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 289;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 288;
				this.decorator();
				}
				}
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === Python3Parser.AT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public decorated(): DecoratedContext {
		let _localctx: DecoratedContext = new DecoratedContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, Python3Parser.RULE_decorated);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 293;
			this.decorators();
			this.state = 297;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.CLASS:
				{
				this.state = 294;
				this.classdef();
				}
				break;
			case Python3Parser.DEF:
				{
				this.state = 295;
				this.funcdef();
				}
				break;
			case Python3Parser.ASYNC:
				{
				this.state = 296;
				this.async_funcdef();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public async_funcdef(): Async_funcdefContext {
		let _localctx: Async_funcdefContext = new Async_funcdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, Python3Parser.RULE_async_funcdef);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 299;
			this.match(Python3Parser.ASYNC);
			this.state = 300;
			this.funcdef();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public funcdef(): FuncdefContext {
		let _localctx: FuncdefContext = new FuncdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, Python3Parser.RULE_funcdef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 302;
			this.match(Python3Parser.DEF);
			this.state = 303;
			this.name();
			this.state = 304;
			this.parameters();
			this.state = 307;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ARROW) {
				{
				this.state = 305;
				this.match(Python3Parser.ARROW);
				this.state = 306;
				this.test();
				}
			}

			this.state = 309;
			this.match(Python3Parser.COLON);
			this.state = 310;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameters(): ParametersContext {
		let _localctx: ParametersContext = new ParametersContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, Python3Parser.RULE_parameters);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 312;
			this.match(Python3Parser.OPEN_PAREN);
			this.state = 314;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.MATCH || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (Python3Parser.UNDERSCORE - 40)) | (1 << (Python3Parser.NAME - 40)) | (1 << (Python3Parser.STAR - 40)) | (1 << (Python3Parser.POWER - 40)))) !== 0)) {
				{
				this.state = 313;
				this.typedargslist();
				}
			}

			this.state = 316;
			this.match(Python3Parser.CLOSE_PAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public typedargslist(): TypedargslistContext {
		let _localctx: TypedargslistContext = new TypedargslistContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, Python3Parser.RULE_typedargslist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 399;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.MATCH:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
				{
				this.state = 318;
				this.tfpdef();
				this.state = 321;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.ASSIGN) {
					{
					this.state = 319;
					this.match(Python3Parser.ASSIGN);
					this.state = 320;
					this.test();
					}
				}

				this.state = 331;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 12, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 323;
						this.match(Python3Parser.COMMA);
						this.state = 324;
						this.tfpdef();
						this.state = 327;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.ASSIGN) {
							{
							this.state = 325;
							this.match(Python3Parser.ASSIGN);
							this.state = 326;
							this.test();
							}
						}

						}
						}
					}
					this.state = 333;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 12, this._ctx);
				}
				this.state = 367;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 334;
					this.match(Python3Parser.COMMA);
					this.state = 365;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case Python3Parser.STAR:
						{
						this.state = 335;
						this.match(Python3Parser.STAR);
						this.state = 337;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (Python3Parser.MATCH - 30)) | (1 << (Python3Parser.UNDERSCORE - 30)) | (1 << (Python3Parser.NAME - 30)))) !== 0)) {
							{
							this.state = 336;
							this.tfpdef();
							}
						}

						this.state = 347;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								{
								{
								this.state = 339;
								this.match(Python3Parser.COMMA);
								this.state = 340;
								this.tfpdef();
								this.state = 343;
								this._errHandler.sync(this);
								_la = this._input.LA(1);
								if (_la === Python3Parser.ASSIGN) {
									{
									this.state = 341;
									this.match(Python3Parser.ASSIGN);
									this.state = 342;
									this.test();
									}
								}

								}
								}
							}
							this.state = 349;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
						}
						this.state = 358;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 350;
							this.match(Python3Parser.COMMA);
							this.state = 356;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la === Python3Parser.POWER) {
								{
								this.state = 351;
								this.match(Python3Parser.POWER);
								this.state = 352;
								this.tfpdef();
								this.state = 354;
								this._errHandler.sync(this);
								_la = this._input.LA(1);
								if (_la === Python3Parser.COMMA) {
									{
									this.state = 353;
									this.match(Python3Parser.COMMA);
									}
								}

								}
							}

							}
						}

						}
						break;
					case Python3Parser.POWER:
						{
						this.state = 360;
						this.match(Python3Parser.POWER);
						this.state = 361;
						this.tfpdef();
						this.state = 363;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 362;
							this.match(Python3Parser.COMMA);
							}
						}

						}
						break;
					case Python3Parser.CLOSE_PAREN:
						break;
					default:
						break;
					}
					}
				}

				}
				break;
			case Python3Parser.STAR:
				{
				this.state = 369;
				this.match(Python3Parser.STAR);
				this.state = 371;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (Python3Parser.MATCH - 30)) | (1 << (Python3Parser.UNDERSCORE - 30)) | (1 << (Python3Parser.NAME - 30)))) !== 0)) {
					{
					this.state = 370;
					this.tfpdef();
					}
				}

				this.state = 381;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 373;
						this.match(Python3Parser.COMMA);
						this.state = 374;
						this.tfpdef();
						this.state = 377;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.ASSIGN) {
							{
							this.state = 375;
							this.match(Python3Parser.ASSIGN);
							this.state = 376;
							this.test();
							}
						}

						}
						}
					}
					this.state = 383;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
				}
				this.state = 392;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 384;
					this.match(Python3Parser.COMMA);
					this.state = 390;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === Python3Parser.POWER) {
						{
						this.state = 385;
						this.match(Python3Parser.POWER);
						this.state = 386;
						this.tfpdef();
						this.state = 388;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 387;
							this.match(Python3Parser.COMMA);
							}
						}

						}
					}

					}
				}

				}
				break;
			case Python3Parser.POWER:
				{
				this.state = 394;
				this.match(Python3Parser.POWER);
				this.state = 395;
				this.tfpdef();
				this.state = 397;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 396;
					this.match(Python3Parser.COMMA);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public tfpdef(): TfpdefContext {
		let _localctx: TfpdefContext = new TfpdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, Python3Parser.RULE_tfpdef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 401;
			this.name();
			this.state = 404;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COLON) {
				{
				this.state = 402;
				this.match(Python3Parser.COLON);
				this.state = 403;
				this.test();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public varargslist(): VarargslistContext {
		let _localctx: VarargslistContext = new VarargslistContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, Python3Parser.RULE_varargslist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 487;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.MATCH:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
				{
				this.state = 406;
				this.vfpdef();
				this.state = 409;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.ASSIGN) {
					{
					this.state = 407;
					this.match(Python3Parser.ASSIGN);
					this.state = 408;
					this.test();
					}
				}

				this.state = 419;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 411;
						this.match(Python3Parser.COMMA);
						this.state = 412;
						this.vfpdef();
						this.state = 415;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.ASSIGN) {
							{
							this.state = 413;
							this.match(Python3Parser.ASSIGN);
							this.state = 414;
							this.test();
							}
						}

						}
						}
					}
					this.state = 421;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				}
				this.state = 455;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 422;
					this.match(Python3Parser.COMMA);
					this.state = 453;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case Python3Parser.STAR:
						{
						this.state = 423;
						this.match(Python3Parser.STAR);
						this.state = 425;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (Python3Parser.MATCH - 30)) | (1 << (Python3Parser.UNDERSCORE - 30)) | (1 << (Python3Parser.NAME - 30)))) !== 0)) {
							{
							this.state = 424;
							this.vfpdef();
							}
						}

						this.state = 435;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								{
								{
								this.state = 427;
								this.match(Python3Parser.COMMA);
								this.state = 428;
								this.vfpdef();
								this.state = 431;
								this._errHandler.sync(this);
								_la = this._input.LA(1);
								if (_la === Python3Parser.ASSIGN) {
									{
									this.state = 429;
									this.match(Python3Parser.ASSIGN);
									this.state = 430;
									this.test();
									}
								}

								}
								}
							}
							this.state = 437;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
						}
						this.state = 446;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 438;
							this.match(Python3Parser.COMMA);
							this.state = 444;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la === Python3Parser.POWER) {
								{
								this.state = 439;
								this.match(Python3Parser.POWER);
								this.state = 440;
								this.vfpdef();
								this.state = 442;
								this._errHandler.sync(this);
								_la = this._input.LA(1);
								if (_la === Python3Parser.COMMA) {
									{
									this.state = 441;
									this.match(Python3Parser.COMMA);
									}
								}

								}
							}

							}
						}

						}
						break;
					case Python3Parser.POWER:
						{
						this.state = 448;
						this.match(Python3Parser.POWER);
						this.state = 449;
						this.vfpdef();
						this.state = 451;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 450;
							this.match(Python3Parser.COMMA);
							}
						}

						}
						break;
					case Python3Parser.COLON:
						break;
					default:
						break;
					}
					}
				}

				}
				break;
			case Python3Parser.STAR:
				{
				this.state = 457;
				this.match(Python3Parser.STAR);
				this.state = 459;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (Python3Parser.MATCH - 30)) | (1 << (Python3Parser.UNDERSCORE - 30)) | (1 << (Python3Parser.NAME - 30)))) !== 0)) {
					{
					this.state = 458;
					this.vfpdef();
					}
				}

				this.state = 469;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 45, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 461;
						this.match(Python3Parser.COMMA);
						this.state = 462;
						this.vfpdef();
						this.state = 465;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.ASSIGN) {
							{
							this.state = 463;
							this.match(Python3Parser.ASSIGN);
							this.state = 464;
							this.test();
							}
						}

						}
						}
					}
					this.state = 471;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 45, this._ctx);
				}
				this.state = 480;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 472;
					this.match(Python3Parser.COMMA);
					this.state = 478;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === Python3Parser.POWER) {
						{
						this.state = 473;
						this.match(Python3Parser.POWER);
						this.state = 474;
						this.vfpdef();
						this.state = 476;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === Python3Parser.COMMA) {
							{
							this.state = 475;
							this.match(Python3Parser.COMMA);
							}
						}

						}
					}

					}
				}

				}
				break;
			case Python3Parser.POWER:
				{
				this.state = 482;
				this.match(Python3Parser.POWER);
				this.state = 483;
				this.vfpdef();
				this.state = 485;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 484;
					this.match(Python3Parser.COMMA);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public vfpdef(): VfpdefContext {
		let _localctx: VfpdefContext = new VfpdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, Python3Parser.RULE_vfpdef);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 489;
			this.name();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public stmt(): StmtContext {
		let _localctx: StmtContext = new StmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, Python3Parser.RULE_stmt);
		try {
			this.state = 493;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 51, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 491;
				this.simple_stmts();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 492;
				this.compound_stmt();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public simple_stmts(): Simple_stmtsContext {
		let _localctx: Simple_stmtsContext = new Simple_stmtsContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, Python3Parser.RULE_simple_stmts);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 495;
			this.simple_stmt();
			this.state = 500;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 496;
					this.match(Python3Parser.SEMI_COLON);
					this.state = 497;
					this.simple_stmt();
					}
					}
				}
				this.state = 502;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
			}
			this.state = 504;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.SEMI_COLON) {
				{
				this.state = 503;
				this.match(Python3Parser.SEMI_COLON);
				}
			}

			this.state = 506;
			this.match(Python3Parser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public simple_stmt(): Simple_stmtContext {
		let _localctx: Simple_stmtContext = new Simple_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, Python3Parser.RULE_simple_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 516;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.STAR:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				{
				this.state = 508;
				this.expr_stmt();
				}
				break;
			case Python3Parser.DEL:
				{
				this.state = 509;
				this.del_stmt();
				}
				break;
			case Python3Parser.PASS:
				{
				this.state = 510;
				this.pass_stmt();
				}
				break;
			case Python3Parser.BREAK:
			case Python3Parser.CONTINUE:
			case Python3Parser.RAISE:
			case Python3Parser.RETURN:
			case Python3Parser.YIELD:
				{
				this.state = 511;
				this.flow_stmt();
				}
				break;
			case Python3Parser.FROM:
			case Python3Parser.IMPORT:
				{
				this.state = 512;
				this.import_stmt();
				}
				break;
			case Python3Parser.GLOBAL:
				{
				this.state = 513;
				this.global_stmt();
				}
				break;
			case Python3Parser.NONLOCAL:
				{
				this.state = 514;
				this.nonlocal_stmt();
				}
				break;
			case Python3Parser.ASSERT:
				{
				this.state = 515;
				this.assert_stmt();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expr_stmt(): Expr_stmtContext {
		let _localctx: Expr_stmtContext = new Expr_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, Python3Parser.RULE_expr_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 518;
			this.testlist_star_expr();
			this.state = 535;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.COLON:
				{
				this.state = 519;
				this.annassign();
				}
				break;
			case Python3Parser.ADD_ASSIGN:
			case Python3Parser.SUB_ASSIGN:
			case Python3Parser.MULT_ASSIGN:
			case Python3Parser.AT_ASSIGN:
			case Python3Parser.DIV_ASSIGN:
			case Python3Parser.MOD_ASSIGN:
			case Python3Parser.AND_ASSIGN:
			case Python3Parser.OR_ASSIGN:
			case Python3Parser.XOR_ASSIGN:
			case Python3Parser.LEFT_SHIFT_ASSIGN:
			case Python3Parser.RIGHT_SHIFT_ASSIGN:
			case Python3Parser.POWER_ASSIGN:
			case Python3Parser.IDIV_ASSIGN:
				{
				this.state = 520;
				this.augassign();
				this.state = 523;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.YIELD:
					{
					this.state = 521;
					this.yield_expr();
					}
					break;
				case Python3Parser.STRING:
				case Python3Parser.NUMBER:
				case Python3Parser.AWAIT:
				case Python3Parser.FALSE:
				case Python3Parser.LAMBDA:
				case Python3Parser.MATCH:
				case Python3Parser.NONE:
				case Python3Parser.NOT:
				case Python3Parser.TRUE:
				case Python3Parser.UNDERSCORE:
				case Python3Parser.NAME:
				case Python3Parser.ELLIPSIS:
				case Python3Parser.OPEN_PAREN:
				case Python3Parser.OPEN_BRACK:
				case Python3Parser.ADD:
				case Python3Parser.MINUS:
				case Python3Parser.NOT_OP:
				case Python3Parser.OPEN_BRACE:
					{
					this.state = 522;
					this.testlist();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;
			case Python3Parser.NEWLINE:
			case Python3Parser.SEMI_COLON:
			case Python3Parser.ASSIGN:
				{
				this.state = 532;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === Python3Parser.ASSIGN) {
					{
					{
					this.state = 525;
					this.match(Python3Parser.ASSIGN);
					this.state = 528;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case Python3Parser.YIELD:
						{
						this.state = 526;
						this.yield_expr();
						}
						break;
					case Python3Parser.STRING:
					case Python3Parser.NUMBER:
					case Python3Parser.AWAIT:
					case Python3Parser.FALSE:
					case Python3Parser.LAMBDA:
					case Python3Parser.MATCH:
					case Python3Parser.NONE:
					case Python3Parser.NOT:
					case Python3Parser.TRUE:
					case Python3Parser.UNDERSCORE:
					case Python3Parser.NAME:
					case Python3Parser.ELLIPSIS:
					case Python3Parser.STAR:
					case Python3Parser.OPEN_PAREN:
					case Python3Parser.OPEN_BRACK:
					case Python3Parser.ADD:
					case Python3Parser.MINUS:
					case Python3Parser.NOT_OP:
					case Python3Parser.OPEN_BRACE:
						{
						this.state = 527;
						this.testlist_star_expr();
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
					this.state = 534;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public annassign(): AnnassignContext {
		let _localctx: AnnassignContext = new AnnassignContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, Python3Parser.RULE_annassign);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 537;
			this.match(Python3Parser.COLON);
			this.state = 538;
			this.test();
			this.state = 541;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ASSIGN) {
				{
				this.state = 539;
				this.match(Python3Parser.ASSIGN);
				this.state = 540;
				this.test();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public testlist_star_expr(): Testlist_star_exprContext {
		let _localctx: Testlist_star_exprContext = new Testlist_star_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, Python3Parser.RULE_testlist_star_expr);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 545;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				{
				this.state = 543;
				this.test();
				}
				break;
			case Python3Parser.STAR:
				{
				this.state = 544;
				this.star_expr();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 554;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 547;
					this.match(Python3Parser.COMMA);
					this.state = 550;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case Python3Parser.STRING:
					case Python3Parser.NUMBER:
					case Python3Parser.AWAIT:
					case Python3Parser.FALSE:
					case Python3Parser.LAMBDA:
					case Python3Parser.MATCH:
					case Python3Parser.NONE:
					case Python3Parser.NOT:
					case Python3Parser.TRUE:
					case Python3Parser.UNDERSCORE:
					case Python3Parser.NAME:
					case Python3Parser.ELLIPSIS:
					case Python3Parser.OPEN_PAREN:
					case Python3Parser.OPEN_BRACK:
					case Python3Parser.ADD:
					case Python3Parser.MINUS:
					case Python3Parser.NOT_OP:
					case Python3Parser.OPEN_BRACE:
						{
						this.state = 548;
						this.test();
						}
						break;
					case Python3Parser.STAR:
						{
						this.state = 549;
						this.star_expr();
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
				}
				this.state = 556;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
			}
			this.state = 558;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 557;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public augassign(): AugassignContext {
		let _localctx: AugassignContext = new AugassignContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, Python3Parser.RULE_augassign);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 560;
			_la = this._input.LA(1);
			if (!(((((_la - 88)) & ~0x1F) === 0 && ((1 << (_la - 88)) & ((1 << (Python3Parser.ADD_ASSIGN - 88)) | (1 << (Python3Parser.SUB_ASSIGN - 88)) | (1 << (Python3Parser.MULT_ASSIGN - 88)) | (1 << (Python3Parser.AT_ASSIGN - 88)) | (1 << (Python3Parser.DIV_ASSIGN - 88)) | (1 << (Python3Parser.MOD_ASSIGN - 88)) | (1 << (Python3Parser.AND_ASSIGN - 88)) | (1 << (Python3Parser.OR_ASSIGN - 88)) | (1 << (Python3Parser.XOR_ASSIGN - 88)) | (1 << (Python3Parser.LEFT_SHIFT_ASSIGN - 88)) | (1 << (Python3Parser.RIGHT_SHIFT_ASSIGN - 88)) | (1 << (Python3Parser.POWER_ASSIGN - 88)) | (1 << (Python3Parser.IDIV_ASSIGN - 88)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public del_stmt(): Del_stmtContext {
		let _localctx: Del_stmtContext = new Del_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, Python3Parser.RULE_del_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 562;
			this.match(Python3Parser.DEL);
			this.state = 563;
			this.exprlist();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pass_stmt(): Pass_stmtContext {
		let _localctx: Pass_stmtContext = new Pass_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, Python3Parser.RULE_pass_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 565;
			this.match(Python3Parser.PASS);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public flow_stmt(): Flow_stmtContext {
		let _localctx: Flow_stmtContext = new Flow_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, Python3Parser.RULE_flow_stmt);
		try {
			this.state = 572;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.BREAK:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 567;
				this.break_stmt();
				}
				break;
			case Python3Parser.CONTINUE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 568;
				this.continue_stmt();
				}
				break;
			case Python3Parser.RETURN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 569;
				this.return_stmt();
				}
				break;
			case Python3Parser.RAISE:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 570;
				this.raise_stmt();
				}
				break;
			case Python3Parser.YIELD:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 571;
				this.yield_stmt();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public break_stmt(): Break_stmtContext {
		let _localctx: Break_stmtContext = new Break_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, Python3Parser.RULE_break_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 574;
			this.match(Python3Parser.BREAK);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public continue_stmt(): Continue_stmtContext {
		let _localctx: Continue_stmtContext = new Continue_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, Python3Parser.RULE_continue_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 576;
			this.match(Python3Parser.CONTINUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public return_stmt(): Return_stmtContext {
		let _localctx: Return_stmtContext = new Return_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, Python3Parser.RULE_return_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 578;
			this.match(Python3Parser.RETURN);
			this.state = 580;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
				{
				this.state = 579;
				this.testlist();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public yield_stmt(): Yield_stmtContext {
		let _localctx: Yield_stmtContext = new Yield_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, Python3Parser.RULE_yield_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 582;
			this.yield_expr();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public raise_stmt(): Raise_stmtContext {
		let _localctx: Raise_stmtContext = new Raise_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, Python3Parser.RULE_raise_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 584;
			this.match(Python3Parser.RAISE);
			this.state = 590;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
				{
				this.state = 585;
				this.test();
				this.state = 588;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.FROM) {
					{
					this.state = 586;
					this.match(Python3Parser.FROM);
					this.state = 587;
					this.test();
					}
				}

				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public import_stmt(): Import_stmtContext {
		let _localctx: Import_stmtContext = new Import_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, Python3Parser.RULE_import_stmt);
		try {
			this.state = 594;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.IMPORT:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 592;
				this.import_name();
				}
				break;
			case Python3Parser.FROM:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 593;
				this.import_from();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public import_name(): Import_nameContext {
		let _localctx: Import_nameContext = new Import_nameContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, Python3Parser.RULE_import_name);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 596;
			this.match(Python3Parser.IMPORT);
			this.state = 597;
			this.dotted_as_names();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public import_from(): Import_fromContext {
		let _localctx: Import_fromContext = new Import_fromContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, Python3Parser.RULE_import_from);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 599;
			this.match(Python3Parser.FROM);
			this.state = 612;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 71, this._ctx) ) {
			case 1:
				{
				this.state = 603;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === Python3Parser.DOT || _la === Python3Parser.ELLIPSIS) {
					{
					{
					this.state = 600;
					_la = this._input.LA(1);
					if (!(_la === Python3Parser.DOT || _la === Python3Parser.ELLIPSIS)) {
					this._errHandler.recoverInline(this);
					} else {
						if (this._input.LA(1) === Token.EOF) {
							this.matchedEOF = true;
						}

						this._errHandler.reportMatch(this);
						this.consume();
					}
					}
					}
					this.state = 605;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 606;
				this.dotted_name();
				}
				break;

			case 2:
				{
				this.state = 608;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 607;
					_la = this._input.LA(1);
					if (!(_la === Python3Parser.DOT || _la === Python3Parser.ELLIPSIS)) {
					this._errHandler.recoverInline(this);
					} else {
						if (this._input.LA(1) === Token.EOF) {
							this.matchedEOF = true;
						}

						this._errHandler.reportMatch(this);
						this.consume();
					}
					}
					}
					this.state = 610;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la === Python3Parser.DOT || _la === Python3Parser.ELLIPSIS);
				}
				break;
			}
			this.state = 614;
			this.match(Python3Parser.IMPORT);
			this.state = 621;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STAR:
				{
				this.state = 615;
				this.match(Python3Parser.STAR);
				}
				break;
			case Python3Parser.OPEN_PAREN:
				{
				this.state = 616;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 617;
				this.import_as_names();
				this.state = 618;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;
			case Python3Parser.MATCH:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
				{
				this.state = 620;
				this.import_as_names();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public import_as_name(): Import_as_nameContext {
		let _localctx: Import_as_nameContext = new Import_as_nameContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, Python3Parser.RULE_import_as_name);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 623;
			this.name();
			this.state = 626;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.AS) {
				{
				this.state = 624;
				this.match(Python3Parser.AS);
				this.state = 625;
				this.name();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dotted_as_name(): Dotted_as_nameContext {
		let _localctx: Dotted_as_nameContext = new Dotted_as_nameContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, Python3Parser.RULE_dotted_as_name);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 628;
			this.dotted_name();
			this.state = 631;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.AS) {
				{
				this.state = 629;
				this.match(Python3Parser.AS);
				this.state = 630;
				this.name();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public import_as_names(): Import_as_namesContext {
		let _localctx: Import_as_namesContext = new Import_as_namesContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, Python3Parser.RULE_import_as_names);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 633;
			this.import_as_name();
			this.state = 638;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 75, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 634;
					this.match(Python3Parser.COMMA);
					this.state = 635;
					this.import_as_name();
					}
					}
				}
				this.state = 640;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 75, this._ctx);
			}
			this.state = 642;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 641;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dotted_as_names(): Dotted_as_namesContext {
		let _localctx: Dotted_as_namesContext = new Dotted_as_namesContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, Python3Parser.RULE_dotted_as_names);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 644;
			this.dotted_as_name();
			this.state = 649;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.COMMA) {
				{
				{
				this.state = 645;
				this.match(Python3Parser.COMMA);
				this.state = 646;
				this.dotted_as_name();
				}
				}
				this.state = 651;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dotted_name(): Dotted_nameContext {
		let _localctx: Dotted_nameContext = new Dotted_nameContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, Python3Parser.RULE_dotted_name);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 652;
			this.name();
			this.state = 657;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.DOT) {
				{
				{
				this.state = 653;
				this.match(Python3Parser.DOT);
				this.state = 654;
				this.name();
				}
				}
				this.state = 659;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public global_stmt(): Global_stmtContext {
		let _localctx: Global_stmtContext = new Global_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, Python3Parser.RULE_global_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 660;
			this.match(Python3Parser.GLOBAL);
			this.state = 661;
			this.name();
			this.state = 666;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.COMMA) {
				{
				{
				this.state = 662;
				this.match(Python3Parser.COMMA);
				this.state = 663;
				this.name();
				}
				}
				this.state = 668;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public nonlocal_stmt(): Nonlocal_stmtContext {
		let _localctx: Nonlocal_stmtContext = new Nonlocal_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, Python3Parser.RULE_nonlocal_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 669;
			this.match(Python3Parser.NONLOCAL);
			this.state = 670;
			this.name();
			this.state = 675;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.COMMA) {
				{
				{
				this.state = 671;
				this.match(Python3Parser.COMMA);
				this.state = 672;
				this.name();
				}
				}
				this.state = 677;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public assert_stmt(): Assert_stmtContext {
		let _localctx: Assert_stmtContext = new Assert_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 76, Python3Parser.RULE_assert_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 678;
			this.match(Python3Parser.ASSERT);
			this.state = 679;
			this.test();
			this.state = 682;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 680;
				this.match(Python3Parser.COMMA);
				this.state = 681;
				this.test();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public compound_stmt(): Compound_stmtContext {
		let _localctx: Compound_stmtContext = new Compound_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 78, Python3Parser.RULE_compound_stmt);
		try {
			this.state = 694;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.IF:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 684;
				this.if_stmt();
				}
				break;
			case Python3Parser.WHILE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 685;
				this.while_stmt();
				}
				break;
			case Python3Parser.FOR:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 686;
				this.for_stmt();
				}
				break;
			case Python3Parser.TRY:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 687;
				this.try_stmt();
				}
				break;
			case Python3Parser.WITH:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 688;
				this.with_stmt();
				}
				break;
			case Python3Parser.DEF:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 689;
				this.funcdef();
				}
				break;
			case Python3Parser.CLASS:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 690;
				this.classdef();
				}
				break;
			case Python3Parser.AT:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 691;
				this.decorated();
				}
				break;
			case Python3Parser.ASYNC:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 692;
				this.async_stmt();
				}
				break;
			case Python3Parser.MATCH:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 693;
				this.match_stmt();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public async_stmt(): Async_stmtContext {
		let _localctx: Async_stmtContext = new Async_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 80, Python3Parser.RULE_async_stmt);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 696;
			this.match(Python3Parser.ASYNC);
			this.state = 700;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.DEF:
				{
				this.state = 697;
				this.funcdef();
				}
				break;
			case Python3Parser.WITH:
				{
				this.state = 698;
				this.with_stmt();
				}
				break;
			case Python3Parser.FOR:
				{
				this.state = 699;
				this.for_stmt();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public if_stmt(): If_stmtContext {
		let _localctx: If_stmtContext = new If_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 82, Python3Parser.RULE_if_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 702;
			this.match(Python3Parser.IF);
			this.state = 703;
			this.test();
			this.state = 704;
			this.match(Python3Parser.COLON);
			this.state = 705;
			this.block();
			this.state = 713;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.ELIF) {
				{
				{
				this.state = 706;
				this.match(Python3Parser.ELIF);
				this.state = 707;
				this.test();
				this.state = 708;
				this.match(Python3Parser.COLON);
				this.state = 709;
				this.block();
				}
				}
				this.state = 715;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 719;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ELSE) {
				{
				this.state = 716;
				this.match(Python3Parser.ELSE);
				this.state = 717;
				this.match(Python3Parser.COLON);
				this.state = 718;
				this.block();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public while_stmt(): While_stmtContext {
		let _localctx: While_stmtContext = new While_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 84, Python3Parser.RULE_while_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 721;
			this.match(Python3Parser.WHILE);
			this.state = 722;
			this.test();
			this.state = 723;
			this.match(Python3Parser.COLON);
			this.state = 724;
			this.block();
			this.state = 728;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ELSE) {
				{
				this.state = 725;
				this.match(Python3Parser.ELSE);
				this.state = 726;
				this.match(Python3Parser.COLON);
				this.state = 727;
				this.block();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public for_stmt(): For_stmtContext {
		let _localctx: For_stmtContext = new For_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 86, Python3Parser.RULE_for_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 730;
			this.match(Python3Parser.FOR);
			this.state = 731;
			this.exprlist();
			this.state = 732;
			this.match(Python3Parser.IN);
			this.state = 733;
			this.testlist();
			this.state = 734;
			this.match(Python3Parser.COLON);
			this.state = 735;
			this.block();
			this.state = 739;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ELSE) {
				{
				this.state = 736;
				this.match(Python3Parser.ELSE);
				this.state = 737;
				this.match(Python3Parser.COLON);
				this.state = 738;
				this.block();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public try_stmt(): Try_stmtContext {
		let _localctx: Try_stmtContext = new Try_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 88, Python3Parser.RULE_try_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 741;
			this.match(Python3Parser.TRY);
			this.state = 742;
			this.match(Python3Parser.COLON);
			this.state = 743;
			this.block();
			this.state = 765;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.EXCEPT:
				{
				this.state = 748;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 744;
					this.except_clause();
					this.state = 745;
					this.match(Python3Parser.COLON);
					this.state = 746;
					this.block();
					}
					}
					this.state = 750;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la === Python3Parser.EXCEPT);
				this.state = 755;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.ELSE) {
					{
					this.state = 752;
					this.match(Python3Parser.ELSE);
					this.state = 753;
					this.match(Python3Parser.COLON);
					this.state = 754;
					this.block();
					}
				}

				this.state = 760;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.FINALLY) {
					{
					this.state = 757;
					this.match(Python3Parser.FINALLY);
					this.state = 758;
					this.match(Python3Parser.COLON);
					this.state = 759;
					this.block();
					}
				}

				}
				break;
			case Python3Parser.FINALLY:
				{
				this.state = 762;
				this.match(Python3Parser.FINALLY);
				this.state = 763;
				this.match(Python3Parser.COLON);
				this.state = 764;
				this.block();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public with_stmt(): With_stmtContext {
		let _localctx: With_stmtContext = new With_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 90, Python3Parser.RULE_with_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 767;
			this.match(Python3Parser.WITH);
			this.state = 768;
			this.with_item();
			this.state = 773;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.COMMA) {
				{
				{
				this.state = 769;
				this.match(Python3Parser.COMMA);
				this.state = 770;
				this.with_item();
				}
				}
				this.state = 775;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 776;
			this.match(Python3Parser.COLON);
			this.state = 777;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public with_item(): With_itemContext {
		let _localctx: With_itemContext = new With_itemContext(this._ctx, this.state);
		this.enterRule(_localctx, 92, Python3Parser.RULE_with_item);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 779;
			this.test();
			this.state = 782;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.AS) {
				{
				this.state = 780;
				this.match(Python3Parser.AS);
				this.state = 781;
				this.expr();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public except_clause(): Except_clauseContext {
		let _localctx: Except_clauseContext = new Except_clauseContext(this._ctx, this.state);
		this.enterRule(_localctx, 94, Python3Parser.RULE_except_clause);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 784;
			this.match(Python3Parser.EXCEPT);
			this.state = 790;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
				{
				this.state = 785;
				this.test();
				this.state = 788;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.AS) {
					{
					this.state = 786;
					this.match(Python3Parser.AS);
					this.state = 787;
					this.name();
					}
				}

				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let _localctx: BlockContext = new BlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 96, Python3Parser.RULE_block);
		let _la: number;
		try {
			this.state = 802;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.ASSERT:
			case Python3Parser.AWAIT:
			case Python3Parser.BREAK:
			case Python3Parser.CONTINUE:
			case Python3Parser.DEL:
			case Python3Parser.FALSE:
			case Python3Parser.FROM:
			case Python3Parser.GLOBAL:
			case Python3Parser.IMPORT:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NONLOCAL:
			case Python3Parser.NOT:
			case Python3Parser.PASS:
			case Python3Parser.RAISE:
			case Python3Parser.RETURN:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.YIELD:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.STAR:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 792;
				this.simple_stmts();
				}
				break;
			case Python3Parser.NEWLINE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 793;
				this.match(Python3Parser.NEWLINE);
				this.state = 794;
				this.match(Python3Parser.INDENT);
				this.state = 796;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 795;
					this.stmt();
					}
					}
					this.state = 798;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.ASSERT) | (1 << Python3Parser.ASYNC) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.BREAK) | (1 << Python3Parser.CLASS) | (1 << Python3Parser.CONTINUE) | (1 << Python3Parser.DEF) | (1 << Python3Parser.DEL) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.FOR) | (1 << Python3Parser.FROM) | (1 << Python3Parser.GLOBAL) | (1 << Python3Parser.IF) | (1 << Python3Parser.IMPORT) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (Python3Parser.NONLOCAL - 32)) | (1 << (Python3Parser.NOT - 32)) | (1 << (Python3Parser.PASS - 32)) | (1 << (Python3Parser.RAISE - 32)) | (1 << (Python3Parser.RETURN - 32)) | (1 << (Python3Parser.TRUE - 32)) | (1 << (Python3Parser.TRY - 32)) | (1 << (Python3Parser.UNDERSCORE - 32)) | (1 << (Python3Parser.WHILE - 32)) | (1 << (Python3Parser.WITH - 32)) | (1 << (Python3Parser.YIELD - 32)) | (1 << (Python3Parser.NAME - 32)) | (1 << (Python3Parser.ELLIPSIS - 32)) | (1 << (Python3Parser.STAR - 32)) | (1 << (Python3Parser.OPEN_PAREN - 32)))) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & ((1 << (Python3Parser.OPEN_BRACK - 64)) | (1 << (Python3Parser.ADD - 64)) | (1 << (Python3Parser.MINUS - 64)) | (1 << (Python3Parser.NOT_OP - 64)) | (1 << (Python3Parser.OPEN_BRACE - 64)) | (1 << (Python3Parser.AT - 64)))) !== 0));
				this.state = 800;
				this.match(Python3Parser.DEDENT);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public match_stmt(): Match_stmtContext {
		let _localctx: Match_stmtContext = new Match_stmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 98, Python3Parser.RULE_match_stmt);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 804;
			this.match(Python3Parser.MATCH);
			this.state = 805;
			this.subject_expr();
			this.state = 806;
			this.match(Python3Parser.COLON);
			this.state = 807;
			this.match(Python3Parser.NEWLINE);
			this.state = 808;
			this.match(Python3Parser.INDENT);
			this.state = 810;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 809;
				this.case_block();
				}
				}
				this.state = 812;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === Python3Parser.CASE);
			this.state = 814;
			this.match(Python3Parser.DEDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subject_expr(): Subject_exprContext {
		let _localctx: Subject_exprContext = new Subject_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 100, Python3Parser.RULE_subject_expr);
		let _la: number;
		try {
			this.state = 822;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 100, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 816;
				this.star_named_expression();
				this.state = 817;
				this.match(Python3Parser.COMMA);
				this.state = 819;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 818;
					this.star_named_expressions();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 821;
				this.test();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public star_named_expressions(): Star_named_expressionsContext {
		let _localctx: Star_named_expressionsContext = new Star_named_expressionsContext(this._ctx, this.state);
		this.enterRule(_localctx, 102, Python3Parser.RULE_star_named_expressions);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 824;
			this.match(Python3Parser.COMMA);
			this.state = 826;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 825;
				this.star_named_expression();
				}
				}
				this.state = 828;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0));
			this.state = 831;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 830;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public star_named_expression(): Star_named_expressionContext {
		let _localctx: Star_named_expressionContext = new Star_named_expressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 104, Python3Parser.RULE_star_named_expression);
		try {
			this.state = 836;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STAR:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 833;
				this.match(Python3Parser.STAR);
				this.state = 834;
				this.expr();
				}
				break;
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 835;
				this.test();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public case_block(): Case_blockContext {
		let _localctx: Case_blockContext = new Case_blockContext(this._ctx, this.state);
		this.enterRule(_localctx, 106, Python3Parser.RULE_case_block);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 838;
			this.match(Python3Parser.CASE);
			this.state = 839;
			this.patterns();
			this.state = 841;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.IF) {
				{
				this.state = 840;
				this.guard();
				}
			}

			this.state = 843;
			this.match(Python3Parser.COLON);
			this.state = 844;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public guard(): GuardContext {
		let _localctx: GuardContext = new GuardContext(this._ctx, this.state);
		this.enterRule(_localctx, 108, Python3Parser.RULE_guard);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 846;
			this.match(Python3Parser.IF);
			this.state = 847;
			this.test();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public patterns(): PatternsContext {
		let _localctx: PatternsContext = new PatternsContext(this._ctx, this.state);
		this.enterRule(_localctx, 110, Python3Parser.RULE_patterns);
		try {
			this.state = 851;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 105, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 849;
				this.open_sequence_pattern();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 850;
				this.pattern();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pattern(): PatternContext {
		let _localctx: PatternContext = new PatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 112, Python3Parser.RULE_pattern);
		try {
			this.state = 855;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 106, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 853;
				this.as_pattern();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 854;
				this.or_pattern();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public as_pattern(): As_patternContext {
		let _localctx: As_patternContext = new As_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 114, Python3Parser.RULE_as_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 857;
			this.or_pattern();
			this.state = 858;
			this.match(Python3Parser.AS);
			this.state = 859;
			this.pattern_capture_target();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public or_pattern(): Or_patternContext {
		let _localctx: Or_patternContext = new Or_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 116, Python3Parser.RULE_or_pattern);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 861;
			this.closed_pattern();
			this.state = 866;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.OR_OP) {
				{
				{
				this.state = 862;
				this.match(Python3Parser.OR_OP);
				this.state = 863;
				this.closed_pattern();
				}
				}
				this.state = 868;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public closed_pattern(): Closed_patternContext {
		let _localctx: Closed_patternContext = new Closed_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 118, Python3Parser.RULE_closed_pattern);
		try {
			this.state = 877;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 108, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 869;
				this.literal_pattern();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 870;
				this.capture_pattern();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 871;
				this.wildcard_pattern();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 872;
				this.value_pattern();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 873;
				this.group_pattern();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 874;
				this.sequence_pattern();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 875;
				this.mapping_pattern();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 876;
				this.class_pattern();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal_pattern(): Literal_patternContext {
		let _localctx: Literal_patternContext = new Literal_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 120, Python3Parser.RULE_literal_pattern);
		try {
			this.state = 887;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 109, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 879;
				this.signed_number();
				this.state = 880;
				if (!( this.CannotBePlusMinus() )) {
					throw this.createFailedPredicateException(" this.CannotBePlusMinus() ");
				}
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 882;
				this.complex_number();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 883;
				this.strings();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 884;
				this.match(Python3Parser.NONE);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 885;
				this.match(Python3Parser.TRUE);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 886;
				this.match(Python3Parser.FALSE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal_expr(): Literal_exprContext {
		let _localctx: Literal_exprContext = new Literal_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 122, Python3Parser.RULE_literal_expr);
		try {
			this.state = 897;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 110, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 889;
				this.signed_number();
				this.state = 890;
				if (!( this.CannotBePlusMinus() )) {
					throw this.createFailedPredicateException(" this.CannotBePlusMinus() ");
				}
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 892;
				this.complex_number();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 893;
				this.strings();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 894;
				this.match(Python3Parser.NONE);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 895;
				this.match(Python3Parser.TRUE);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 896;
				this.match(Python3Parser.FALSE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public complex_number(): Complex_numberContext {
		let _localctx: Complex_numberContext = new Complex_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 124, Python3Parser.RULE_complex_number);
		try {
			this.state = 907;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 111, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 899;
				this.signed_real_number();
				this.state = 900;
				this.match(Python3Parser.ADD);
				this.state = 901;
				this.imaginary_number();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 903;
				this.signed_real_number();
				this.state = 904;
				this.match(Python3Parser.MINUS);
				this.state = 905;
				this.imaginary_number();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public signed_number(): Signed_numberContext {
		let _localctx: Signed_numberContext = new Signed_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 126, Python3Parser.RULE_signed_number);
		try {
			this.state = 912;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 909;
				this.match(Python3Parser.NUMBER);
				}
				break;
			case Python3Parser.MINUS:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 910;
				this.match(Python3Parser.MINUS);
				this.state = 911;
				this.match(Python3Parser.NUMBER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public signed_real_number(): Signed_real_numberContext {
		let _localctx: Signed_real_numberContext = new Signed_real_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 128, Python3Parser.RULE_signed_real_number);
		try {
			this.state = 917;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 914;
				this.real_number();
				}
				break;
			case Python3Parser.MINUS:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 915;
				this.match(Python3Parser.MINUS);
				this.state = 916;
				this.real_number();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public real_number(): Real_numberContext {
		let _localctx: Real_numberContext = new Real_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 130, Python3Parser.RULE_real_number);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 919;
			this.match(Python3Parser.NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public imaginary_number(): Imaginary_numberContext {
		let _localctx: Imaginary_numberContext = new Imaginary_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 132, Python3Parser.RULE_imaginary_number);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 921;
			this.match(Python3Parser.NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public capture_pattern(): Capture_patternContext {
		let _localctx: Capture_patternContext = new Capture_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 134, Python3Parser.RULE_capture_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 923;
			this.pattern_capture_target();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pattern_capture_target(): Pattern_capture_targetContext {
		let _localctx: Pattern_capture_targetContext = new Pattern_capture_targetContext(this._ctx, this.state);
		this.enterRule(_localctx, 136, Python3Parser.RULE_pattern_capture_target);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 925;
			this.name();
			this.state = 926;
			if (!( this.CannotBeDotLpEq() )) {
				throw this.createFailedPredicateException(" this.CannotBeDotLpEq() ");
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public wildcard_pattern(): Wildcard_patternContext {
		let _localctx: Wildcard_patternContext = new Wildcard_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 138, Python3Parser.RULE_wildcard_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 928;
			this.match(Python3Parser.UNDERSCORE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public value_pattern(): Value_patternContext {
		let _localctx: Value_patternContext = new Value_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 140, Python3Parser.RULE_value_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 930;
			this.attr();
			this.state = 931;
			if (!( this.CannotBeDotLpEq() )) {
				throw this.createFailedPredicateException(" this.CannotBeDotLpEq() ");
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public attr(): AttrContext {
		let _localctx: AttrContext = new AttrContext(this._ctx, this.state);
		this.enterRule(_localctx, 142, Python3Parser.RULE_attr);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 933;
			this.name();
			this.state = 936;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 934;
					this.match(Python3Parser.DOT);
					this.state = 935;
					this.name();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 938;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 114, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public name_or_attr(): Name_or_attrContext {
		let _localctx: Name_or_attrContext = new Name_or_attrContext(this._ctx, this.state);
		this.enterRule(_localctx, 144, Python3Parser.RULE_name_or_attr);
		try {
			this.state = 942;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 115, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 940;
				this.attr();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 941;
				this.name();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public group_pattern(): Group_patternContext {
		let _localctx: Group_patternContext = new Group_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 146, Python3Parser.RULE_group_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 944;
			this.match(Python3Parser.OPEN_PAREN);
			this.state = 945;
			this.pattern();
			this.state = 946;
			this.match(Python3Parser.CLOSE_PAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public sequence_pattern(): Sequence_patternContext {
		let _localctx: Sequence_patternContext = new Sequence_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 148, Python3Parser.RULE_sequence_pattern);
		let _la: number;
		try {
			this.state = 958;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.OPEN_BRACK:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 948;
				this.match(Python3Parser.OPEN_BRACK);
				this.state = 950;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (Python3Parser.TRUE - 38)) | (1 << (Python3Parser.UNDERSCORE - 38)) | (1 << (Python3Parser.NAME - 38)) | (1 << (Python3Parser.STAR - 38)) | (1 << (Python3Parser.OPEN_PAREN - 38)) | (1 << (Python3Parser.OPEN_BRACK - 38)))) !== 0) || _la === Python3Parser.MINUS || _la === Python3Parser.OPEN_BRACE) {
					{
					this.state = 949;
					this.maybe_sequence_pattern();
					}
				}

				this.state = 952;
				this.match(Python3Parser.CLOSE_BRACK);
				}
				break;
			case Python3Parser.OPEN_PAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 953;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 955;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (Python3Parser.TRUE - 38)) | (1 << (Python3Parser.UNDERSCORE - 38)) | (1 << (Python3Parser.NAME - 38)) | (1 << (Python3Parser.STAR - 38)) | (1 << (Python3Parser.OPEN_PAREN - 38)) | (1 << (Python3Parser.OPEN_BRACK - 38)))) !== 0) || _la === Python3Parser.MINUS || _la === Python3Parser.OPEN_BRACE) {
					{
					this.state = 954;
					this.open_sequence_pattern();
					}
				}

				this.state = 957;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public open_sequence_pattern(): Open_sequence_patternContext {
		let _localctx: Open_sequence_patternContext = new Open_sequence_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 150, Python3Parser.RULE_open_sequence_pattern);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 960;
			this.maybe_star_pattern();
			this.state = 961;
			this.match(Python3Parser.COMMA);
			this.state = 963;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (Python3Parser.TRUE - 38)) | (1 << (Python3Parser.UNDERSCORE - 38)) | (1 << (Python3Parser.NAME - 38)) | (1 << (Python3Parser.STAR - 38)) | (1 << (Python3Parser.OPEN_PAREN - 38)) | (1 << (Python3Parser.OPEN_BRACK - 38)))) !== 0) || _la === Python3Parser.MINUS || _la === Python3Parser.OPEN_BRACE) {
				{
				this.state = 962;
				this.maybe_sequence_pattern();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public maybe_sequence_pattern(): Maybe_sequence_patternContext {
		let _localctx: Maybe_sequence_patternContext = new Maybe_sequence_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 152, Python3Parser.RULE_maybe_sequence_pattern);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 965;
			this.maybe_star_pattern();
			this.state = 970;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 120, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 966;
					this.match(Python3Parser.COMMA);
					this.state = 967;
					this.maybe_star_pattern();
					}
					}
				}
				this.state = 972;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 120, this._ctx);
			}
			this.state = 974;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 973;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public maybe_star_pattern(): Maybe_star_patternContext {
		let _localctx: Maybe_star_patternContext = new Maybe_star_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 154, Python3Parser.RULE_maybe_star_pattern);
		try {
			this.state = 978;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STAR:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 976;
				this.star_pattern();
				}
				break;
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.MINUS:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 977;
				this.pattern();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public star_pattern(): Star_patternContext {
		let _localctx: Star_patternContext = new Star_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 156, Python3Parser.RULE_star_pattern);
		try {
			this.state = 984;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 123, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 980;
				this.match(Python3Parser.STAR);
				this.state = 981;
				this.pattern_capture_target();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 982;
				this.match(Python3Parser.STAR);
				this.state = 983;
				this.wildcard_pattern();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public mapping_pattern(): Mapping_patternContext {
		let _localctx: Mapping_patternContext = new Mapping_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 158, Python3Parser.RULE_mapping_pattern);
		let _la: number;
		try {
			this.state = 1011;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 127, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 986;
				this.match(Python3Parser.OPEN_BRACE);
				this.state = 987;
				this.match(Python3Parser.CLOSE_BRACE);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 988;
				this.match(Python3Parser.OPEN_BRACE);
				this.state = 989;
				this.double_star_pattern();
				this.state = 991;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 990;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 993;
				this.match(Python3Parser.CLOSE_BRACE);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 995;
				this.match(Python3Parser.OPEN_BRACE);
				this.state = 996;
				this.items_pattern();
				this.state = 997;
				this.match(Python3Parser.COMMA);
				this.state = 998;
				this.double_star_pattern();
				this.state = 1000;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 999;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 1002;
				this.match(Python3Parser.CLOSE_BRACE);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 1004;
				this.match(Python3Parser.OPEN_BRACE);
				this.state = 1005;
				this.items_pattern();
				this.state = 1007;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 1006;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 1009;
				this.match(Python3Parser.CLOSE_BRACE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public items_pattern(): Items_patternContext {
		let _localctx: Items_patternContext = new Items_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 160, Python3Parser.RULE_items_pattern);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1013;
			this.key_value_pattern();
			this.state = 1018;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 128, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1014;
					this.match(Python3Parser.COMMA);
					this.state = 1015;
					this.key_value_pattern();
					}
					}
				}
				this.state = 1020;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 128, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public key_value_pattern(): Key_value_patternContext {
		let _localctx: Key_value_patternContext = new Key_value_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 162, Python3Parser.RULE_key_value_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1023;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.FALSE:
			case Python3Parser.NONE:
			case Python3Parser.TRUE:
			case Python3Parser.MINUS:
				{
				this.state = 1021;
				this.literal_expr();
				}
				break;
			case Python3Parser.MATCH:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
				{
				this.state = 1022;
				this.attr();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 1025;
			this.match(Python3Parser.COLON);
			this.state = 1026;
			this.pattern();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public double_star_pattern(): Double_star_patternContext {
		let _localctx: Double_star_patternContext = new Double_star_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 164, Python3Parser.RULE_double_star_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1028;
			this.match(Python3Parser.POWER);
			this.state = 1029;
			this.pattern_capture_target();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public class_pattern(): Class_patternContext {
		let _localctx: Class_patternContext = new Class_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 166, Python3Parser.RULE_class_pattern);
		let _la: number;
		try {
			this.state = 1061;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 133, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1031;
				this.name_or_attr();
				this.state = 1032;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1033;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1035;
				this.name_or_attr();
				this.state = 1036;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1037;
				this.positional_patterns();
				this.state = 1039;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 1038;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 1041;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 1043;
				this.name_or_attr();
				this.state = 1044;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1045;
				this.keyword_patterns();
				this.state = 1047;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 1046;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 1049;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 1051;
				this.name_or_attr();
				this.state = 1052;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1053;
				this.positional_patterns();
				this.state = 1054;
				this.match(Python3Parser.COMMA);
				this.state = 1055;
				this.keyword_patterns();
				this.state = 1057;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 1056;
					this.match(Python3Parser.COMMA);
					}
				}

				this.state = 1059;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public positional_patterns(): Positional_patternsContext {
		let _localctx: Positional_patternsContext = new Positional_patternsContext(this._ctx, this.state);
		this.enterRule(_localctx, 168, Python3Parser.RULE_positional_patterns);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1063;
			this.pattern();
			this.state = 1068;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 134, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1064;
					this.match(Python3Parser.COMMA);
					this.state = 1065;
					this.pattern();
					}
					}
				}
				this.state = 1070;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 134, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public keyword_patterns(): Keyword_patternsContext {
		let _localctx: Keyword_patternsContext = new Keyword_patternsContext(this._ctx, this.state);
		this.enterRule(_localctx, 170, Python3Parser.RULE_keyword_patterns);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1071;
			this.keyword_pattern();
			this.state = 1076;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 135, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1072;
					this.match(Python3Parser.COMMA);
					this.state = 1073;
					this.keyword_pattern();
					}
					}
				}
				this.state = 1078;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 135, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public keyword_pattern(): Keyword_patternContext {
		let _localctx: Keyword_patternContext = new Keyword_patternContext(this._ctx, this.state);
		this.enterRule(_localctx, 172, Python3Parser.RULE_keyword_pattern);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1079;
			this.name();
			this.state = 1080;
			this.match(Python3Parser.ASSIGN);
			this.state = 1081;
			this.pattern();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public test(): TestContext {
		let _localctx: TestContext = new TestContext(this._ctx, this.state);
		this.enterRule(_localctx, 174, Python3Parser.RULE_test);
		let _la: number;
		try {
			this.state = 1092;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1083;
				this.or_test();
				this.state = 1089;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.IF) {
					{
					this.state = 1084;
					this.match(Python3Parser.IF);
					this.state = 1085;
					this.or_test();
					this.state = 1086;
					this.match(Python3Parser.ELSE);
					this.state = 1087;
					this.test();
					}
				}

				}
				break;
			case Python3Parser.LAMBDA:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1091;
				this.lambdef();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public test_nocond(): Test_nocondContext {
		let _localctx: Test_nocondContext = new Test_nocondContext(this._ctx, this.state);
		this.enterRule(_localctx, 176, Python3Parser.RULE_test_nocond);
		try {
			this.state = 1096;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1094;
				this.or_test();
				}
				break;
			case Python3Parser.LAMBDA:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1095;
				this.lambdef_nocond();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public lambdef(): LambdefContext {
		let _localctx: LambdefContext = new LambdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 178, Python3Parser.RULE_lambdef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1098;
			this.match(Python3Parser.LAMBDA);
			this.state = 1100;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.MATCH || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (Python3Parser.UNDERSCORE - 40)) | (1 << (Python3Parser.NAME - 40)) | (1 << (Python3Parser.STAR - 40)) | (1 << (Python3Parser.POWER - 40)))) !== 0)) {
				{
				this.state = 1099;
				this.varargslist();
				}
			}

			this.state = 1102;
			this.match(Python3Parser.COLON);
			this.state = 1103;
			this.test();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public lambdef_nocond(): Lambdef_nocondContext {
		let _localctx: Lambdef_nocondContext = new Lambdef_nocondContext(this._ctx, this.state);
		this.enterRule(_localctx, 180, Python3Parser.RULE_lambdef_nocond);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1105;
			this.match(Python3Parser.LAMBDA);
			this.state = 1107;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.MATCH || ((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (Python3Parser.UNDERSCORE - 40)) | (1 << (Python3Parser.NAME - 40)) | (1 << (Python3Parser.STAR - 40)) | (1 << (Python3Parser.POWER - 40)))) !== 0)) {
				{
				this.state = 1106;
				this.varargslist();
				}
			}

			this.state = 1109;
			this.match(Python3Parser.COLON);
			this.state = 1110;
			this.test_nocond();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public or_test(): Or_testContext {
		let _localctx: Or_testContext = new Or_testContext(this._ctx, this.state);
		this.enterRule(_localctx, 182, Python3Parser.RULE_or_test);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1112;
			this.and_test();
			this.state = 1117;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.OR) {
				{
				{
				this.state = 1113;
				this.match(Python3Parser.OR);
				this.state = 1114;
				this.and_test();
				}
				}
				this.state = 1119;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public and_test(): And_testContext {
		let _localctx: And_testContext = new And_testContext(this._ctx, this.state);
		this.enterRule(_localctx, 184, Python3Parser.RULE_and_test);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1120;
			this.not_test();
			this.state = 1125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.AND) {
				{
				{
				this.state = 1121;
				this.match(Python3Parser.AND);
				this.state = 1122;
				this.not_test();
				}
				}
				this.state = 1127;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public not_test(): Not_testContext {
		let _localctx: Not_testContext = new Not_testContext(this._ctx, this.state);
		this.enterRule(_localctx, 186, Python3Parser.RULE_not_test);
		try {
			this.state = 1131;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.NOT:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1128;
				this.match(Python3Parser.NOT);
				this.state = 1129;
				this.not_test();
				}
				break;
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1130;
				this.comparison();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comparison(): ComparisonContext {
		let _localctx: ComparisonContext = new ComparisonContext(this._ctx, this.state);
		this.enterRule(_localctx, 188, Python3Parser.RULE_comparison);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1133;
			this.expr();
			this.state = 1139;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 144, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1134;
					this.comp_op();
					this.state = 1135;
					this.expr();
					}
					}
				}
				this.state = 1141;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 144, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comp_op(): Comp_opContext {
		let _localctx: Comp_opContext = new Comp_opContext(this._ctx, this.state);
		this.enterRule(_localctx, 190, Python3Parser.RULE_comp_op);
		try {
			this.state = 1155;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 145, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1142;
				this.match(Python3Parser.LESS_THAN);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1143;
				this.match(Python3Parser.GREATER_THAN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 1144;
				this.match(Python3Parser.EQUALS);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 1145;
				this.match(Python3Parser.GT_EQ);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 1146;
				this.match(Python3Parser.LT_EQ);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 1147;
				this.match(Python3Parser.NOT_EQ_1);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 1148;
				this.match(Python3Parser.NOT_EQ_2);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 1149;
				this.match(Python3Parser.IN);
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 1150;
				this.match(Python3Parser.NOT);
				this.state = 1151;
				this.match(Python3Parser.IN);
				}
				break;

			case 10:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 1152;
				this.match(Python3Parser.IS);
				}
				break;

			case 11:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 1153;
				this.match(Python3Parser.IS);
				this.state = 1154;
				this.match(Python3Parser.NOT);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public star_expr(): Star_exprContext {
		let _localctx: Star_exprContext = new Star_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 192, Python3Parser.RULE_star_expr);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1157;
			this.match(Python3Parser.STAR);
			this.state = 1158;
			this.expr();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expr(): ExprContext {
		let _localctx: ExprContext = new ExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 194, Python3Parser.RULE_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1160;
			this.xor_expr();
			this.state = 1165;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.OR_OP) {
				{
				{
				this.state = 1161;
				this.match(Python3Parser.OR_OP);
				this.state = 1162;
				this.xor_expr();
				}
				}
				this.state = 1167;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public xor_expr(): Xor_exprContext {
		let _localctx: Xor_exprContext = new Xor_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 196, Python3Parser.RULE_xor_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1168;
			this.and_expr();
			this.state = 1173;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.XOR) {
				{
				{
				this.state = 1169;
				this.match(Python3Parser.XOR);
				this.state = 1170;
				this.and_expr();
				}
				}
				this.state = 1175;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public and_expr(): And_exprContext {
		let _localctx: And_exprContext = new And_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 198, Python3Parser.RULE_and_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1176;
			this.shift_expr();
			this.state = 1181;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.AND_OP) {
				{
				{
				this.state = 1177;
				this.match(Python3Parser.AND_OP);
				this.state = 1178;
				this.shift_expr();
				}
				}
				this.state = 1183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public shift_expr(): Shift_exprContext {
		let _localctx: Shift_exprContext = new Shift_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 200, Python3Parser.RULE_shift_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1184;
			this.arith_expr();
			this.state = 1189;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === Python3Parser.LEFT_SHIFT || _la === Python3Parser.RIGHT_SHIFT) {
				{
				{
				this.state = 1185;
				_la = this._input.LA(1);
				if (!(_la === Python3Parser.LEFT_SHIFT || _la === Python3Parser.RIGHT_SHIFT)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 1186;
				this.arith_expr();
				}
				}
				this.state = 1191;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arith_expr(): Arith_exprContext {
		let _localctx: Arith_exprContext = new Arith_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 202, Python3Parser.RULE_arith_expr);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1192;
			this.term();
			this.state = 1197;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 150, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1193;
					_la = this._input.LA(1);
					if (!(_la === Python3Parser.ADD || _la === Python3Parser.MINUS)) {
					this._errHandler.recoverInline(this);
					} else {
						if (this._input.LA(1) === Token.EOF) {
							this.matchedEOF = true;
						}

						this._errHandler.reportMatch(this);
						this.consume();
					}
					this.state = 1194;
					this.term();
					}
					}
				}
				this.state = 1199;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 150, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public term(): TermContext {
		let _localctx: TermContext = new TermContext(this._ctx, this.state);
		this.enterRule(_localctx, 204, Python3Parser.RULE_term);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1200;
			this.factor();
			this.state = 1205;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 151, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1201;
					_la = this._input.LA(1);
					if (!(((((_la - 56)) & ~0x1F) === 0 && ((1 << (_la - 56)) & ((1 << (Python3Parser.STAR - 56)) | (1 << (Python3Parser.DIV - 56)) | (1 << (Python3Parser.MOD - 56)) | (1 << (Python3Parser.IDIV - 56)) | (1 << (Python3Parser.AT - 56)))) !== 0))) {
					this._errHandler.recoverInline(this);
					} else {
						if (this._input.LA(1) === Token.EOF) {
							this.matchedEOF = true;
						}

						this._errHandler.reportMatch(this);
						this.consume();
					}
					this.state = 1202;
					this.factor();
					}
					}
				}
				this.state = 1207;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 151, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public factor(): FactorContext {
		let _localctx: FactorContext = new FactorContext(this._ctx, this.state);
		this.enterRule(_localctx, 206, Python3Parser.RULE_factor);
		let _la: number;
		try {
			this.state = 1211;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1208;
				_la = this._input.LA(1);
				if (!(((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 1209;
				this.factor();
				}
				break;
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1210;
				this.power();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public power(): PowerContext {
		let _localctx: PowerContext = new PowerContext(this._ctx, this.state);
		this.enterRule(_localctx, 208, Python3Parser.RULE_power);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1213;
			this.atom_expr();
			this.state = 1216;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.POWER) {
				{
				this.state = 1214;
				this.match(Python3Parser.POWER);
				this.state = 1215;
				this.factor();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atom_expr(): Atom_exprContext {
		let _localctx: Atom_exprContext = new Atom_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 210, Python3Parser.RULE_atom_expr);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1219;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.AWAIT) {
				{
				this.state = 1218;
				this.match(Python3Parser.AWAIT);
				}
			}

			this.state = 1221;
			this.atom();
			this.state = 1225;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 155, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1222;
					this.trailer();
					}
					}
				}
				this.state = 1227;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 155, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atom(): AtomContext {
		let _localctx: AtomContext = new AtomContext(this._ctx, this.state);
		this.enterRule(_localctx, 212, Python3Parser.RULE_atom);
		let _la: number;
		try {
			let _alt: number;
			this.state = 1255;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.OPEN_PAREN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1228;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1231;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.YIELD:
					{
					this.state = 1229;
					this.yield_expr();
					}
					break;
				case Python3Parser.STRING:
				case Python3Parser.NUMBER:
				case Python3Parser.AWAIT:
				case Python3Parser.FALSE:
				case Python3Parser.LAMBDA:
				case Python3Parser.MATCH:
				case Python3Parser.NONE:
				case Python3Parser.NOT:
				case Python3Parser.TRUE:
				case Python3Parser.UNDERSCORE:
				case Python3Parser.NAME:
				case Python3Parser.ELLIPSIS:
				case Python3Parser.STAR:
				case Python3Parser.OPEN_PAREN:
				case Python3Parser.OPEN_BRACK:
				case Python3Parser.ADD:
				case Python3Parser.MINUS:
				case Python3Parser.NOT_OP:
				case Python3Parser.OPEN_BRACE:
					{
					this.state = 1230;
					this.testlist_comp();
					}
					break;
				case Python3Parser.CLOSE_PAREN:
					break;
				default:
					break;
				}
				this.state = 1233;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;
			case Python3Parser.OPEN_BRACK:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1234;
				this.match(Python3Parser.OPEN_BRACK);
				this.state = 1236;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1235;
					this.testlist_comp();
					}
				}

				this.state = 1238;
				this.match(Python3Parser.CLOSE_BRACK);
				}
				break;
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 1239;
				this.match(Python3Parser.OPEN_BRACE);
				this.state = 1241;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.POWER - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1240;
					this.dictorsetmaker();
					}
				}

				this.state = 1243;
				this.match(Python3Parser.CLOSE_BRACE);
				}
				break;
			case Python3Parser.MATCH:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 1244;
				this.name();
				}
				break;
			case Python3Parser.NUMBER:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 1245;
				this.match(Python3Parser.NUMBER);
				}
				break;
			case Python3Parser.STRING:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 1247;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 1246;
						this.match(Python3Parser.STRING);
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 1249;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 159, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;
			case Python3Parser.ELLIPSIS:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 1251;
				this.match(Python3Parser.ELLIPSIS);
				}
				break;
			case Python3Parser.NONE:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 1252;
				this.match(Python3Parser.NONE);
				}
				break;
			case Python3Parser.TRUE:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 1253;
				this.match(Python3Parser.TRUE);
				}
				break;
			case Python3Parser.FALSE:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 1254;
				this.match(Python3Parser.FALSE);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public name(): NameContext {
		let _localctx: NameContext = new NameContext(this._ctx, this.state);
		this.enterRule(_localctx, 214, Python3Parser.RULE_name);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1257;
			_la = this._input.LA(1);
			if (!(((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & ((1 << (Python3Parser.MATCH - 30)) | (1 << (Python3Parser.UNDERSCORE - 30)) | (1 << (Python3Parser.NAME - 30)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public testlist_comp(): Testlist_compContext {
		let _localctx: Testlist_compContext = new Testlist_compContext(this._ctx, this.state);
		this.enterRule(_localctx, 216, Python3Parser.RULE_testlist_comp);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1261;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				{
				this.state = 1259;
				this.test();
				}
				break;
			case Python3Parser.STAR:
				{
				this.state = 1260;
				this.star_expr();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 1277;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.ASYNC:
			case Python3Parser.FOR:
				{
				this.state = 1263;
				this.comp_for();
				}
				break;
			case Python3Parser.CLOSE_PAREN:
			case Python3Parser.COMMA:
			case Python3Parser.CLOSE_BRACK:
				{
				this.state = 1271;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 163, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 1264;
						this.match(Python3Parser.COMMA);
						this.state = 1267;
						this._errHandler.sync(this);
						switch (this._input.LA(1)) {
						case Python3Parser.STRING:
						case Python3Parser.NUMBER:
						case Python3Parser.AWAIT:
						case Python3Parser.FALSE:
						case Python3Parser.LAMBDA:
						case Python3Parser.MATCH:
						case Python3Parser.NONE:
						case Python3Parser.NOT:
						case Python3Parser.TRUE:
						case Python3Parser.UNDERSCORE:
						case Python3Parser.NAME:
						case Python3Parser.ELLIPSIS:
						case Python3Parser.OPEN_PAREN:
						case Python3Parser.OPEN_BRACK:
						case Python3Parser.ADD:
						case Python3Parser.MINUS:
						case Python3Parser.NOT_OP:
						case Python3Parser.OPEN_BRACE:
							{
							this.state = 1265;
							this.test();
							}
							break;
						case Python3Parser.STAR:
							{
							this.state = 1266;
							this.star_expr();
							}
							break;
						default:
							throw new NoViableAltException(this);
						}
						}
						}
					}
					this.state = 1273;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 163, this._ctx);
				}
				this.state = 1275;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COMMA) {
					{
					this.state = 1274;
					this.match(Python3Parser.COMMA);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public trailer(): TrailerContext {
		let _localctx: TrailerContext = new TrailerContext(this._ctx, this.state);
		this.enterRule(_localctx, 218, Python3Parser.RULE_trailer);
		let _la: number;
		try {
			this.state = 1290;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.OPEN_PAREN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1279;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1281;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.POWER - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1280;
					this.arglist();
					}
				}

				this.state = 1283;
				this.match(Python3Parser.CLOSE_PAREN);
				}
				break;
			case Python3Parser.OPEN_BRACK:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1284;
				this.match(Python3Parser.OPEN_BRACK);
				this.state = 1285;
				this.subscriptlist();
				this.state = 1286;
				this.match(Python3Parser.CLOSE_BRACK);
				}
				break;
			case Python3Parser.DOT:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 1288;
				this.match(Python3Parser.DOT);
				this.state = 1289;
				this.name();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subscriptlist(): SubscriptlistContext {
		let _localctx: SubscriptlistContext = new SubscriptlistContext(this._ctx, this.state);
		this.enterRule(_localctx, 220, Python3Parser.RULE_subscriptlist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1292;
			this.subscript_();
			this.state = 1297;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 168, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1293;
					this.match(Python3Parser.COMMA);
					this.state = 1294;
					this.subscript_();
					}
					}
				}
				this.state = 1299;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 168, this._ctx);
			}
			this.state = 1301;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 1300;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subscript_(): Subscript_Context {
		let _localctx: Subscript_Context = new Subscript_Context(this._ctx, this.state);
		this.enterRule(_localctx, 222, Python3Parser.RULE_subscript_);
		let _la: number;
		try {
			this.state = 1314;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 173, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1303;
				this.test();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1305;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1304;
					this.test();
					}
				}

				this.state = 1307;
				this.match(Python3Parser.COLON);
				this.state = 1309;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1308;
					this.test();
					}
				}

				this.state = 1312;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.COLON) {
					{
					this.state = 1311;
					this.sliceop();
					}
				}

				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public sliceop(): SliceopContext {
		let _localctx: SliceopContext = new SliceopContext(this._ctx, this.state);
		this.enterRule(_localctx, 224, Python3Parser.RULE_sliceop);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1316;
			this.match(Python3Parser.COLON);
			this.state = 1318;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
				{
				this.state = 1317;
				this.test();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public exprlist(): ExprlistContext {
		let _localctx: ExprlistContext = new ExprlistContext(this._ctx, this.state);
		this.enterRule(_localctx, 226, Python3Parser.RULE_exprlist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1322;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				{
				this.state = 1320;
				this.expr();
				}
				break;
			case Python3Parser.STAR:
				{
				this.state = 1321;
				this.star_expr();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 1331;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 177, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1324;
					this.match(Python3Parser.COMMA);
					this.state = 1327;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case Python3Parser.STRING:
					case Python3Parser.NUMBER:
					case Python3Parser.AWAIT:
					case Python3Parser.FALSE:
					case Python3Parser.MATCH:
					case Python3Parser.NONE:
					case Python3Parser.TRUE:
					case Python3Parser.UNDERSCORE:
					case Python3Parser.NAME:
					case Python3Parser.ELLIPSIS:
					case Python3Parser.OPEN_PAREN:
					case Python3Parser.OPEN_BRACK:
					case Python3Parser.ADD:
					case Python3Parser.MINUS:
					case Python3Parser.NOT_OP:
					case Python3Parser.OPEN_BRACE:
						{
						this.state = 1325;
						this.expr();
						}
						break;
					case Python3Parser.STAR:
						{
						this.state = 1326;
						this.star_expr();
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
				}
				this.state = 1333;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 177, this._ctx);
			}
			this.state = 1335;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 1334;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public testlist(): TestlistContext {
		let _localctx: TestlistContext = new TestlistContext(this._ctx, this.state);
		this.enterRule(_localctx, 228, Python3Parser.RULE_testlist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1337;
			this.test();
			this.state = 1342;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 179, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1338;
					this.match(Python3Parser.COMMA);
					this.state = 1339;
					this.test();
					}
					}
				}
				this.state = 1344;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 179, this._ctx);
			}
			this.state = 1346;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 1345;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dictorsetmaker(): DictorsetmakerContext {
		let _localctx: DictorsetmakerContext = new DictorsetmakerContext(this._ctx, this.state);
		this.enterRule(_localctx, 230, Python3Parser.RULE_dictorsetmaker);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1396;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 191, this._ctx) ) {
			case 1:
				{
				{
				this.state = 1354;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.STRING:
				case Python3Parser.NUMBER:
				case Python3Parser.AWAIT:
				case Python3Parser.FALSE:
				case Python3Parser.LAMBDA:
				case Python3Parser.MATCH:
				case Python3Parser.NONE:
				case Python3Parser.NOT:
				case Python3Parser.TRUE:
				case Python3Parser.UNDERSCORE:
				case Python3Parser.NAME:
				case Python3Parser.ELLIPSIS:
				case Python3Parser.OPEN_PAREN:
				case Python3Parser.OPEN_BRACK:
				case Python3Parser.ADD:
				case Python3Parser.MINUS:
				case Python3Parser.NOT_OP:
				case Python3Parser.OPEN_BRACE:
					{
					this.state = 1348;
					this.test();
					this.state = 1349;
					this.match(Python3Parser.COLON);
					this.state = 1350;
					this.test();
					}
					break;
				case Python3Parser.POWER:
					{
					this.state = 1352;
					this.match(Python3Parser.POWER);
					this.state = 1353;
					this.expr();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 1374;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.ASYNC:
				case Python3Parser.FOR:
					{
					this.state = 1356;
					this.comp_for();
					}
					break;
				case Python3Parser.COMMA:
				case Python3Parser.CLOSE_BRACE:
					{
					this.state = 1368;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 183, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 1357;
							this.match(Python3Parser.COMMA);
							this.state = 1364;
							this._errHandler.sync(this);
							switch (this._input.LA(1)) {
							case Python3Parser.STRING:
							case Python3Parser.NUMBER:
							case Python3Parser.AWAIT:
							case Python3Parser.FALSE:
							case Python3Parser.LAMBDA:
							case Python3Parser.MATCH:
							case Python3Parser.NONE:
							case Python3Parser.NOT:
							case Python3Parser.TRUE:
							case Python3Parser.UNDERSCORE:
							case Python3Parser.NAME:
							case Python3Parser.ELLIPSIS:
							case Python3Parser.OPEN_PAREN:
							case Python3Parser.OPEN_BRACK:
							case Python3Parser.ADD:
							case Python3Parser.MINUS:
							case Python3Parser.NOT_OP:
							case Python3Parser.OPEN_BRACE:
								{
								this.state = 1358;
								this.test();
								this.state = 1359;
								this.match(Python3Parser.COLON);
								this.state = 1360;
								this.test();
								}
								break;
							case Python3Parser.POWER:
								{
								this.state = 1362;
								this.match(Python3Parser.POWER);
								this.state = 1363;
								this.expr();
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							}
							}
						}
						this.state = 1370;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 183, this._ctx);
					}
					this.state = 1372;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === Python3Parser.COMMA) {
						{
						this.state = 1371;
						this.match(Python3Parser.COMMA);
						}
					}

					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				}
				break;

			case 2:
				{
				{
				this.state = 1378;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.STRING:
				case Python3Parser.NUMBER:
				case Python3Parser.AWAIT:
				case Python3Parser.FALSE:
				case Python3Parser.LAMBDA:
				case Python3Parser.MATCH:
				case Python3Parser.NONE:
				case Python3Parser.NOT:
				case Python3Parser.TRUE:
				case Python3Parser.UNDERSCORE:
				case Python3Parser.NAME:
				case Python3Parser.ELLIPSIS:
				case Python3Parser.OPEN_PAREN:
				case Python3Parser.OPEN_BRACK:
				case Python3Parser.ADD:
				case Python3Parser.MINUS:
				case Python3Parser.NOT_OP:
				case Python3Parser.OPEN_BRACE:
					{
					this.state = 1376;
					this.test();
					}
					break;
				case Python3Parser.STAR:
					{
					this.state = 1377;
					this.star_expr();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 1394;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case Python3Parser.ASYNC:
				case Python3Parser.FOR:
					{
					this.state = 1380;
					this.comp_for();
					}
					break;
				case Python3Parser.COMMA:
				case Python3Parser.CLOSE_BRACE:
					{
					this.state = 1388;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 188, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 1381;
							this.match(Python3Parser.COMMA);
							this.state = 1384;
							this._errHandler.sync(this);
							switch (this._input.LA(1)) {
							case Python3Parser.STRING:
							case Python3Parser.NUMBER:
							case Python3Parser.AWAIT:
							case Python3Parser.FALSE:
							case Python3Parser.LAMBDA:
							case Python3Parser.MATCH:
							case Python3Parser.NONE:
							case Python3Parser.NOT:
							case Python3Parser.TRUE:
							case Python3Parser.UNDERSCORE:
							case Python3Parser.NAME:
							case Python3Parser.ELLIPSIS:
							case Python3Parser.OPEN_PAREN:
							case Python3Parser.OPEN_BRACK:
							case Python3Parser.ADD:
							case Python3Parser.MINUS:
							case Python3Parser.NOT_OP:
							case Python3Parser.OPEN_BRACE:
								{
								this.state = 1382;
								this.test();
								}
								break;
							case Python3Parser.STAR:
								{
								this.state = 1383;
								this.star_expr();
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							}
							}
						}
						this.state = 1390;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 188, this._ctx);
					}
					this.state = 1392;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === Python3Parser.COMMA) {
						{
						this.state = 1391;
						this.match(Python3Parser.COMMA);
						}
					}

					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public classdef(): ClassdefContext {
		let _localctx: ClassdefContext = new ClassdefContext(this._ctx, this.state);
		this.enterRule(_localctx, 232, Python3Parser.RULE_classdef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1398;
			this.match(Python3Parser.CLASS);
			this.state = 1399;
			this.name();
			this.state = 1405;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.OPEN_PAREN) {
				{
				this.state = 1400;
				this.match(Python3Parser.OPEN_PAREN);
				this.state = 1402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.STAR - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.POWER - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
					{
					this.state = 1401;
					this.arglist();
					}
				}

				this.state = 1404;
				this.match(Python3Parser.CLOSE_PAREN);
				}
			}

			this.state = 1407;
			this.match(Python3Parser.COLON);
			this.state = 1408;
			this.block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arglist(): ArglistContext {
		let _localctx: ArglistContext = new ArglistContext(this._ctx, this.state);
		this.enterRule(_localctx, 234, Python3Parser.RULE_arglist);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1410;
			this.argument();
			this.state = 1415;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 194, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1411;
					this.match(Python3Parser.COMMA);
					this.state = 1412;
					this.argument();
					}
					}
				}
				this.state = 1417;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 194, this._ctx);
			}
			this.state = 1419;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.COMMA) {
				{
				this.state = 1418;
				this.match(Python3Parser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public argument(): ArgumentContext {
		let _localctx: ArgumentContext = new ArgumentContext(this._ctx, this.state);
		this.enterRule(_localctx, 236, Python3Parser.RULE_argument);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1433;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 197, this._ctx) ) {
			case 1:
				{
				this.state = 1421;
				this.test();
				this.state = 1423;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === Python3Parser.ASYNC || _la === Python3Parser.FOR) {
					{
					this.state = 1422;
					this.comp_for();
					}
				}

				}
				break;

			case 2:
				{
				this.state = 1425;
				this.test();
				this.state = 1426;
				this.match(Python3Parser.ASSIGN);
				this.state = 1427;
				this.test();
				}
				break;

			case 3:
				{
				this.state = 1429;
				this.match(Python3Parser.POWER);
				this.state = 1430;
				this.test();
				}
				break;

			case 4:
				{
				this.state = 1431;
				this.match(Python3Parser.STAR);
				this.state = 1432;
				this.test();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comp_iter(): Comp_iterContext {
		let _localctx: Comp_iterContext = new Comp_iterContext(this._ctx, this.state);
		this.enterRule(_localctx, 238, Python3Parser.RULE_comp_iter);
		try {
			this.state = 1437;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.ASYNC:
			case Python3Parser.FOR:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1435;
				this.comp_for();
				}
				break;
			case Python3Parser.IF:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1436;
				this.comp_if();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comp_for(): Comp_forContext {
		let _localctx: Comp_forContext = new Comp_forContext(this._ctx, this.state);
		this.enterRule(_localctx, 240, Python3Parser.RULE_comp_for);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1440;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === Python3Parser.ASYNC) {
				{
				this.state = 1439;
				this.match(Python3Parser.ASYNC);
				}
			}

			this.state = 1442;
			this.match(Python3Parser.FOR);
			this.state = 1443;
			this.exprlist();
			this.state = 1444;
			this.match(Python3Parser.IN);
			this.state = 1445;
			this.or_test();
			this.state = 1447;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.ASYNC) | (1 << Python3Parser.FOR) | (1 << Python3Parser.IF))) !== 0)) {
				{
				this.state = 1446;
				this.comp_iter();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comp_if(): Comp_ifContext {
		let _localctx: Comp_ifContext = new Comp_ifContext(this._ctx, this.state);
		this.enterRule(_localctx, 242, Python3Parser.RULE_comp_if);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1449;
			this.match(Python3Parser.IF);
			this.state = 1450;
			this.test_nocond();
			this.state = 1452;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.ASYNC) | (1 << Python3Parser.FOR) | (1 << Python3Parser.IF))) !== 0)) {
				{
				this.state = 1451;
				this.comp_iter();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public encoding_decl(): Encoding_declContext {
		let _localctx: Encoding_declContext = new Encoding_declContext(this._ctx, this.state);
		this.enterRule(_localctx, 244, Python3Parser.RULE_encoding_decl);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1454;
			this.name();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public yield_expr(): Yield_exprContext {
		let _localctx: Yield_exprContext = new Yield_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 246, Python3Parser.RULE_yield_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1456;
			this.match(Python3Parser.YIELD);
			this.state = 1458;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << Python3Parser.STRING) | (1 << Python3Parser.NUMBER) | (1 << Python3Parser.AWAIT) | (1 << Python3Parser.FALSE) | (1 << Python3Parser.FROM) | (1 << Python3Parser.LAMBDA) | (1 << Python3Parser.MATCH) | (1 << Python3Parser.NONE))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (Python3Parser.NOT - 33)) | (1 << (Python3Parser.TRUE - 33)) | (1 << (Python3Parser.UNDERSCORE - 33)) | (1 << (Python3Parser.NAME - 33)) | (1 << (Python3Parser.ELLIPSIS - 33)) | (1 << (Python3Parser.OPEN_PAREN - 33)) | (1 << (Python3Parser.OPEN_BRACK - 33)))) !== 0) || ((((_la - 71)) & ~0x1F) === 0 && ((1 << (_la - 71)) & ((1 << (Python3Parser.ADD - 71)) | (1 << (Python3Parser.MINUS - 71)) | (1 << (Python3Parser.NOT_OP - 71)) | (1 << (Python3Parser.OPEN_BRACE - 71)))) !== 0)) {
				{
				this.state = 1457;
				this.yield_arg();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public yield_arg(): Yield_argContext {
		let _localctx: Yield_argContext = new Yield_argContext(this._ctx, this.state);
		this.enterRule(_localctx, 248, Python3Parser.RULE_yield_arg);
		try {
			this.state = 1463;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case Python3Parser.FROM:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 1460;
				this.match(Python3Parser.FROM);
				this.state = 1461;
				this.test();
				}
				break;
			case Python3Parser.STRING:
			case Python3Parser.NUMBER:
			case Python3Parser.AWAIT:
			case Python3Parser.FALSE:
			case Python3Parser.LAMBDA:
			case Python3Parser.MATCH:
			case Python3Parser.NONE:
			case Python3Parser.NOT:
			case Python3Parser.TRUE:
			case Python3Parser.UNDERSCORE:
			case Python3Parser.NAME:
			case Python3Parser.ELLIPSIS:
			case Python3Parser.OPEN_PAREN:
			case Python3Parser.OPEN_BRACK:
			case Python3Parser.ADD:
			case Python3Parser.MINUS:
			case Python3Parser.NOT_OP:
			case Python3Parser.OPEN_BRACE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 1462;
				this.testlist();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public strings(): StringsContext {
		let _localctx: StringsContext = new StringsContext(this._ctx, this.state);
		this.enterRule(_localctx, 250, Python3Parser.RULE_strings);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 1466;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 1465;
				this.match(Python3Parser.STRING);
				}
				}
				this.state = 1468;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === Python3Parser.STRING);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 60:
			return this.literal_pattern_sempred(_localctx as Literal_patternContext, predIndex);

		case 61:
			return this.literal_expr_sempred(_localctx as Literal_exprContext, predIndex);

		case 68:
			return this.pattern_capture_target_sempred(_localctx as Pattern_capture_targetContext, predIndex);

		case 70:
			return this.value_pattern_sempred(_localctx as Value_patternContext, predIndex);
		}
		return true;
	}
	private literal_pattern_sempred(_localctx: Literal_patternContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  this.CannotBePlusMinus() ;
		}
		return true;
	}
	private literal_expr_sempred(_localctx: Literal_exprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return  this.CannotBePlusMinus() ;
		}
		return true;
	}
	private pattern_capture_target_sempred(_localctx: Pattern_capture_targetContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return  this.CannotBeDotLpEq() ;
		}
		return true;
	}
	private value_pattern_sempred(_localctx: Value_patternContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  this.CannotBeDotLpEq() ;
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 3;
	private static readonly _serializedATNSegment0: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03h\u05C1\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x044" +
		"\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04" +
		"=\t=\x04>\t>\x04?\t?\x04@\t@\x04A\tA\x04B\tB\x04C\tC\x04D\tD\x04E\tE\x04" +
		"F\tF\x04G\tG\x04H\tH\x04I\tI\x04J\tJ\x04K\tK\x04L\tL\x04M\tM\x04N\tN\x04" +
		"O\tO\x04P\tP\x04Q\tQ\x04R\tR\x04S\tS\x04T\tT\x04U\tU\x04V\tV\x04W\tW\x04" +
		"X\tX\x04Y\tY\x04Z\tZ\x04[\t[\x04\\\t\\\x04]\t]\x04^\t^\x04_\t_\x04`\t" +
		"`\x04a\ta\x04b\tb\x04c\tc\x04d\td\x04e\te\x04f\tf\x04g\tg\x04h\th\x04" +
		"i\ti\x04j\tj\x04k\tk\x04l\tl\x04m\tm\x04n\tn\x04o\to\x04p\tp\x04q\tq\x04" +
		"r\tr\x04s\ts\x04t\tt\x04u\tu\x04v\tv\x04w\tw\x04x\tx\x04y\ty\x04z\tz\x04" +
		"{\t{\x04|\t|\x04}\t}\x04~\t~\x04\x7F\t\x7F\x03\x02\x03\x02\x03\x02\x03" +
		"\x02\x03\x02\x05\x02\u0104\n\x02\x03\x03\x03\x03\x07\x03\u0108\n\x03\f" +
		"\x03\x0E\x03\u010B\v\x03\x03\x03\x03\x03\x03\x04\x03\x04\x07\x04\u0111" +
		"\n\x04\f\x04\x0E\x04\u0114\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x05\x05\u011C\n\x05\x03\x05\x05\x05\u011F\n\x05\x03\x05\x03\x05" +
		"\x03\x06\x06\x06\u0124\n\x06\r\x06\x0E\x06\u0125\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x05\x07\u012C\n\x07\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t" +
		"\x03\t\x05\t\u0136\n\t\x03\t\x03\t\x03\t\x03\n\x03\n\x05\n\u013D\n\n\x03" +
		"\n\x03\n\x03\v\x03\v\x03\v\x05\v\u0144\n\v\x03\v\x03\v\x03\v\x03\v\x05" +
		"\v\u014A\n\v\x07\v\u014C\n\v\f\v\x0E\v\u014F\v\v\x03\v\x03\v\x03\v\x05" +
		"\v\u0154\n\v\x03\v\x03\v\x03\v\x03\v\x05\v\u015A\n\v\x07\v\u015C\n\v\f" +
		"\v\x0E\v\u015F\v\v\x03\v\x03\v\x03\v\x03\v\x05\v\u0165\n\v\x05\v\u0167" +
		"\n\v\x05\v\u0169\n\v\x03\v\x03\v\x03\v\x05\v\u016E\n\v\x05\v\u0170\n\v" +
		"\x05\v\u0172\n\v\x03\v\x03\v\x05\v\u0176\n\v\x03\v\x03\v\x03\v\x03\v\x05" +
		"\v\u017C\n\v\x07\v\u017E\n\v\f\v\x0E\v\u0181\v\v\x03\v\x03\v\x03\v\x03" +
		"\v\x05\v\u0187\n\v\x05\v\u0189\n\v\x05\v\u018B\n\v\x03\v\x03\v\x03\v\x05" +
		"\v\u0190\n\v\x05\v\u0192\n\v\x03\f\x03\f\x03\f\x05\f\u0197\n\f\x03\r\x03" +
		"\r\x03\r\x05\r\u019C\n\r\x03\r\x03\r\x03\r\x03\r\x05\r\u01A2\n\r\x07\r" +
		"\u01A4\n\r\f\r\x0E\r\u01A7\v\r\x03\r\x03\r\x03\r\x05\r\u01AC\n\r\x03\r" +
		"\x03\r\x03\r\x03\r\x05\r\u01B2\n\r\x07\r\u01B4\n\r\f\r\x0E\r\u01B7\v\r" +
		"\x03\r\x03\r\x03\r\x03\r\x05\r\u01BD\n\r\x05\r\u01BF\n\r\x05\r\u01C1\n" +
		"\r\x03\r\x03\r\x03\r\x05\r\u01C6\n\r\x05\r\u01C8\n\r\x05\r\u01CA\n\r\x03" +
		"\r\x03\r\x05\r\u01CE\n\r\x03\r\x03\r\x03\r\x03\r\x05\r\u01D4\n\r\x07\r" +
		"\u01D6\n\r\f\r\x0E\r\u01D9\v\r\x03\r\x03\r\x03\r\x03\r\x05\r\u01DF\n\r" +
		"\x05\r\u01E1\n\r\x05\r\u01E3\n\r\x03\r\x03\r\x03\r\x05\r\u01E8\n\r\x05" +
		"\r\u01EA\n\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x05\x0F\u01F0\n\x0F\x03\x10" +
		"\x03\x10\x03\x10\x07\x10\u01F5\n\x10\f\x10\x0E\x10\u01F8\v\x10\x03\x10" +
		"\x05\x10\u01FB\n\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03" +
		"\x11\x03\x11\x03\x11\x03\x11\x05\x11\u0207\n\x11\x03\x12\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x05\x12\u020E\n\x12\x03\x12\x03\x12\x03\x12\x05\x12\u0213" +
		"\n\x12\x07\x12\u0215\n\x12\f\x12\x0E\x12\u0218\v\x12\x05\x12\u021A\n\x12" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\u0220\n\x13\x03\x14\x03\x14\x05" +
		"\x14\u0224\n\x14\x03\x14\x03\x14\x03\x14\x05\x14\u0229\n\x14\x07\x14\u022B" +
		"\n\x14\f\x14\x0E\x14\u022E\v\x14\x03\x14\x05\x14\u0231\n\x14\x03\x15\x03" +
		"\x15\x03\x16\x03\x16\x03\x16\x03\x17\x03\x17\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x05\x18\u023F\n\x18\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1B" +
		"\x03\x1B\x05\x1B\u0247\n\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03" +
		"\x1D\x05\x1D\u024F\n\x1D\x05\x1D\u0251\n\x1D\x03\x1E\x03\x1E\x05\x1E\u0255" +
		"\n\x1E\x03\x1F\x03\x1F\x03\x1F\x03 \x03 \x07 \u025C\n \f \x0E \u025F\v" +
		" \x03 \x03 \x06 \u0263\n \r \x0E \u0264\x05 \u0267\n \x03 \x03 \x03 \x03" +
		" \x03 \x03 \x03 \x05 \u0270\n \x03!\x03!\x03!\x05!\u0275\n!\x03\"\x03" +
		"\"\x03\"\x05\"\u027A\n\"\x03#\x03#\x03#\x07#\u027F\n#\f#\x0E#\u0282\v" +
		"#\x03#\x05#\u0285\n#\x03$\x03$\x03$\x07$\u028A\n$\f$\x0E$\u028D\v$\x03" +
		"%\x03%\x03%\x07%\u0292\n%\f%\x0E%\u0295\v%\x03&\x03&\x03&\x03&\x07&\u029B" +
		"\n&\f&\x0E&\u029E\v&\x03\'\x03\'\x03\'\x03\'\x07\'\u02A4\n\'\f\'\x0E\'" +
		"\u02A7\v\'\x03(\x03(\x03(\x03(\x05(\u02AD\n(\x03)\x03)\x03)\x03)\x03)" +
		"\x03)\x03)\x03)\x03)\x03)\x05)\u02B9\n)\x03*\x03*\x03*\x03*\x05*\u02BF" +
		"\n*\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x07+\u02CA\n+\f+\x0E" +
		"+\u02CD\v+\x03+\x03+\x03+\x05+\u02D2\n+\x03,\x03,\x03,\x03,\x03,\x03," +
		"\x03,\x05,\u02DB\n,\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x05-" +
		"\u02E6\n-\x03.\x03.\x03.\x03.\x03.\x03.\x03.\x06.\u02EF\n.\r.\x0E.\u02F0" +
		"\x03.\x03.\x03.\x05.\u02F6\n.\x03.\x03.\x03.\x05.\u02FB\n.\x03.\x03.\x03" +
		".\x05.\u0300\n.\x03/\x03/\x03/\x03/\x07/\u0306\n/\f/\x0E/\u0309\v/\x03" +
		"/\x03/\x03/\x030\x030\x030\x050\u0311\n0\x031\x031\x031\x031\x051\u0317" +
		"\n1\x051\u0319\n1\x032\x032\x032\x032\x062\u031F\n2\r2\x0E2\u0320\x03" +
		"2\x032\x052\u0325\n2\x033\x033\x033\x033\x033\x033\x063\u032D\n3\r3\x0E" +
		"3\u032E\x033\x033\x034\x034\x034\x054\u0336\n4\x034\x054\u0339\n4\x03" +
		"5\x035\x065\u033D\n5\r5\x0E5\u033E\x035\x055\u0342\n5\x036\x036\x036\x05" +
		"6\u0347\n6\x037\x037\x037\x057\u034C\n7\x037\x037\x037\x038\x038\x038" +
		"\x039\x039\x059\u0356\n9\x03:\x03:\x05:\u035A\n:\x03;\x03;\x03;\x03;\x03" +
		"<\x03<\x03<\x07<\u0363\n<\f<\x0E<\u0366\v<\x03=\x03=\x03=\x03=\x03=\x03" +
		"=\x03=\x03=\x05=\u0370\n=\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x05" +
		">\u037A\n>\x03?\x03?\x03?\x03?\x03?\x03?\x03?\x03?\x05?\u0384\n?\x03@" +
		"\x03@\x03@\x03@\x03@\x03@\x03@\x03@\x05@\u038E\n@\x03A\x03A\x03A\x05A" +
		"\u0393\nA\x03B\x03B\x03B\x05B\u0398\nB\x03C\x03C\x03D\x03D\x03E\x03E\x03" +
		"F\x03F\x03F\x03G\x03G\x03H\x03H\x03H\x03I\x03I\x03I\x06I\u03AB\nI\rI\x0E" +
		"I\u03AC\x03J\x03J\x05J\u03B1\nJ\x03K\x03K\x03K\x03K\x03L\x03L\x05L\u03B9" +
		"\nL\x03L\x03L\x03L\x05L\u03BE\nL\x03L\x05L\u03C1\nL\x03M\x03M\x03M\x05" +
		"M\u03C6\nM\x03N\x03N\x03N\x07N\u03CB\nN\fN\x0EN\u03CE\vN\x03N\x05N\u03D1" +
		"\nN\x03O\x03O\x05O\u03D5\nO\x03P\x03P\x03P\x03P\x05P\u03DB\nP\x03Q\x03" +
		"Q\x03Q\x03Q\x03Q\x05Q\u03E2\nQ\x03Q\x03Q\x03Q\x03Q\x03Q\x03Q\x03Q\x05" +
		"Q\u03EB\nQ\x03Q\x03Q\x03Q\x03Q\x03Q\x05Q\u03F2\nQ\x03Q\x03Q\x05Q\u03F6" +
		"\nQ\x03R\x03R\x03R\x07R\u03FB\nR\fR\x0ER\u03FE\vR\x03S\x03S\x05S\u0402" +
		"\nS\x03S\x03S\x03S\x03T\x03T\x03T\x03U\x03U\x03U\x03U\x03U\x03U\x03U\x03" +
		"U\x05U\u0412\nU\x03U\x03U\x03U\x03U\x03U\x03U\x05U\u041A\nU\x03U\x03U" +
		"\x03U\x03U\x03U\x03U\x03U\x03U\x05U\u0424\nU\x03U\x03U\x05U\u0428\nU\x03" +
		"V\x03V\x03V\x07V\u042D\nV\fV\x0EV\u0430\vV\x03W\x03W\x03W\x07W\u0435\n" +
		"W\fW\x0EW\u0438\vW\x03X\x03X\x03X\x03X\x03Y\x03Y\x03Y\x03Y\x03Y\x03Y\x05" +
		"Y\u0444\nY\x03Y\x05Y\u0447\nY\x03Z\x03Z\x05Z\u044B\nZ\x03[\x03[\x05[\u044F" +
		"\n[\x03[\x03[\x03[\x03\\\x03\\\x05\\\u0456\n\\\x03\\\x03\\\x03\\\x03]" +
		"\x03]\x03]\x07]\u045E\n]\f]\x0E]\u0461\v]\x03^\x03^\x03^\x07^\u0466\n" +
		"^\f^\x0E^\u0469\v^\x03_\x03_\x03_\x05_\u046E\n_\x03`\x03`\x03`\x03`\x07" +
		"`\u0474\n`\f`\x0E`\u0477\v`\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03" +
		"a\x03a\x03a\x03a\x03a\x05a\u0486\na\x03b\x03b\x03b\x03c\x03c\x03c\x07" +
		"c\u048E\nc\fc\x0Ec\u0491\vc\x03d\x03d\x03d\x07d\u0496\nd\fd\x0Ed\u0499" +
		"\vd\x03e\x03e\x03e\x07e\u049E\ne\fe\x0Ee\u04A1\ve\x03f\x03f\x03f\x07f" +
		"\u04A6\nf\ff\x0Ef\u04A9\vf\x03g\x03g\x03g\x07g\u04AE\ng\fg\x0Eg\u04B1" +
		"\vg\x03h\x03h\x03h\x07h\u04B6\nh\fh\x0Eh\u04B9\vh\x03i\x03i\x03i\x05i" +
		"\u04BE\ni\x03j\x03j\x03j\x05j\u04C3\nj\x03k\x05k\u04C6\nk\x03k\x03k\x07" +
		"k\u04CA\nk\fk\x0Ek\u04CD\vk\x03l\x03l\x03l\x05l\u04D2\nl\x03l\x03l\x03" +
		"l\x05l\u04D7\nl\x03l\x03l\x03l\x05l\u04DC\nl\x03l\x03l\x03l\x03l\x06l" +
		"\u04E2\nl\rl\x0El\u04E3\x03l\x03l\x03l\x03l\x05l\u04EA\nl\x03m\x03m\x03" +
		"n\x03n\x05n\u04F0\nn\x03n\x03n\x03n\x03n\x05n\u04F6\nn\x07n\u04F8\nn\f" +
		"n\x0En\u04FB\vn\x03n\x05n\u04FE\nn\x05n\u0500\nn\x03o\x03o\x05o\u0504" +
		"\no\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x05o\u050D\no\x03p\x03p\x03p\x07" +
		"p\u0512\np\fp\x0Ep\u0515\vp\x03p\x05p\u0518\np\x03q\x03q\x05q\u051C\n" +
		"q\x03q\x03q\x05q\u0520\nq\x03q\x05q\u0523\nq\x05q\u0525\nq\x03r\x03r\x05" +
		"r\u0529\nr\x03s\x03s\x05s\u052D\ns\x03s\x03s\x03s\x05s\u0532\ns\x07s\u0534" +
		"\ns\fs\x0Es\u0537\vs\x03s\x05s\u053A\ns\x03t\x03t\x03t\x07t\u053F\nt\f" +
		"t\x0Et\u0542\vt\x03t\x05t\u0545\nt\x03u\x03u\x03u\x03u\x03u\x03u\x05u" +
		"\u054D\nu\x03u\x03u\x03u\x03u\x03u\x03u\x03u\x03u\x05u\u0557\nu\x07u\u0559" +
		"\nu\fu\x0Eu\u055C\vu\x03u\x05u\u055F\nu\x05u\u0561\nu\x03u\x03u\x05u\u0565" +
		"\nu\x03u\x03u\x03u\x03u\x05u\u056B\nu\x07u\u056D\nu\fu\x0Eu\u0570\vu\x03" +
		"u\x05u\u0573\nu\x05u\u0575\nu\x05u\u0577\nu\x03v\x03v\x03v\x03v\x05v\u057D" +
		"\nv\x03v\x05v\u0580\nv\x03v\x03v\x03v\x03w\x03w\x03w\x07w\u0588\nw\fw" +
		"\x0Ew\u058B\vw\x03w\x05w\u058E\nw\x03x\x03x\x05x\u0592\nx\x03x\x03x\x03" +
		"x\x03x\x03x\x03x\x03x\x03x\x05x\u059C\nx\x03y\x03y\x05y\u05A0\ny\x03z" +
		"\x05z\u05A3\nz\x03z\x03z\x03z\x03z\x03z\x05z\u05AA\nz\x03{\x03{\x03{\x05" +
		"{\u05AF\n{\x03|\x03|\x03}\x03}\x05}\u05B5\n}\x03~\x03~\x03~\x05~\u05BA" +
		"\n~\x03\x7F\x06\x7F\u05BD\n\x7F\r\x7F\x0E\x7F\u05BE\x03\x7F\x02\x02\x02" +
		"\x80\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02" +
		"\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02" +
		"(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02:\x02<\x02>\x02@\x02B\x02" +
		"D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02T\x02V\x02X\x02Z\x02\\\x02^\x02" +
		"`\x02b\x02d\x02f\x02h\x02j\x02l\x02n\x02p\x02r\x02t\x02v\x02x\x02z\x02" +
		"|\x02~\x02\x80\x02\x82\x02\x84\x02\x86\x02\x88\x02\x8A\x02\x8C\x02\x8E" +
		"\x02\x90\x02\x92\x02\x94\x02\x96\x02\x98\x02\x9A\x02\x9C\x02\x9E\x02\xA0" +
		"\x02\xA2\x02\xA4\x02\xA6\x02\xA8\x02\xAA\x02\xAC\x02\xAE\x02\xB0\x02\xB2" +
		"\x02\xB4\x02\xB6\x02\xB8\x02\xBA\x02\xBC\x02\xBE\x02\xC0\x02\xC2\x02\xC4" +
		"\x02\xC6\x02\xC8\x02\xCA\x02\xCC\x02\xCE\x02\xD0\x02\xD2\x02\xD4\x02\xD6" +
		"\x02\xD8\x02\xDA\x02\xDC\x02\xDE\x02\xE0\x02\xE2\x02\xE4\x02\xE6\x02\xE8" +
		"\x02\xEA\x02\xEC\x02\xEE\x02\xF0\x02\xF2\x02\xF4\x02\xF6\x02\xF8\x02\xFA" +
		"\x02\xFC\x02\x02\t\x03\x02Zf\x03\x0289\x03\x02GH\x03\x02IJ\x05\x02::K" +
		"MXX\x04\x02IJNN\x05\x02  **//\x02\u0650\x02\u0103\x03\x02\x02\x02\x04" +
		"\u0109\x03\x02\x02\x02\x06\u010E\x03\x02\x02\x02\b\u0117\x03\x02\x02\x02" +
		"\n\u0123\x03\x02\x02\x02\f\u0127\x03\x02\x02\x02\x0E\u012D\x03\x02\x02" +
		"\x02\x10\u0130\x03\x02\x02\x02\x12\u013A\x03\x02\x02\x02\x14\u0191\x03" +
		"\x02\x02\x02\x16\u0193\x03\x02\x02\x02\x18\u01E9\x03\x02\x02\x02\x1A\u01EB" +
		"\x03\x02\x02\x02\x1C\u01EF\x03\x02\x02\x02\x1E\u01F1\x03\x02\x02\x02 " +
		"\u0206\x03\x02\x02\x02\"\u0208\x03\x02\x02\x02$\u021B\x03\x02\x02\x02" +
		"&\u0223\x03\x02\x02\x02(\u0232\x03\x02\x02\x02*\u0234\x03\x02\x02\x02" +
		",\u0237\x03\x02\x02\x02.\u023E\x03\x02\x02\x020\u0240\x03\x02\x02\x02" +
		"2\u0242\x03\x02\x02\x024\u0244\x03\x02\x02\x026\u0248\x03\x02\x02\x02" +
		"8\u024A\x03\x02\x02\x02:\u0254\x03\x02\x02\x02<\u0256\x03\x02\x02\x02" +
		">\u0259\x03\x02\x02\x02@\u0271\x03\x02\x02\x02B\u0276\x03\x02\x02\x02" +
		"D\u027B\x03\x02\x02\x02F\u0286\x03\x02\x02\x02H\u028E\x03\x02\x02\x02" +
		"J\u0296\x03\x02\x02\x02L\u029F\x03\x02\x02\x02N\u02A8\x03\x02\x02\x02" +
		"P\u02B8\x03\x02\x02\x02R\u02BA\x03\x02\x02\x02T\u02C0\x03\x02\x02\x02" +
		"V\u02D3\x03\x02\x02\x02X\u02DC\x03\x02\x02\x02Z\u02E7\x03\x02\x02\x02" +
		"\\\u0301\x03\x02\x02\x02^\u030D\x03\x02\x02\x02`\u0312\x03\x02\x02\x02" +
		"b\u0324\x03\x02\x02\x02d\u0326\x03\x02\x02\x02f\u0338\x03\x02\x02\x02" +
		"h\u033A\x03\x02\x02\x02j\u0346\x03\x02\x02\x02l\u0348\x03\x02\x02\x02" +
		"n\u0350\x03\x02\x02\x02p\u0355\x03\x02\x02\x02r\u0359\x03\x02\x02\x02" +
		"t\u035B\x03\x02\x02\x02v\u035F\x03\x02\x02\x02x\u036F\x03\x02\x02\x02" +
		"z\u0379\x03\x02\x02\x02|\u0383\x03\x02\x02\x02~\u038D\x03\x02\x02\x02" +
		"\x80\u0392\x03\x02\x02\x02\x82\u0397\x03\x02\x02\x02\x84\u0399\x03\x02" +
		"\x02\x02\x86\u039B\x03\x02\x02\x02\x88\u039D\x03\x02\x02\x02\x8A\u039F" +
		"\x03\x02\x02\x02\x8C\u03A2\x03\x02\x02\x02\x8E\u03A4\x03\x02\x02\x02\x90" +
		"\u03A7\x03\x02\x02\x02\x92\u03B0\x03\x02\x02\x02\x94\u03B2\x03\x02\x02" +
		"\x02\x96\u03C0\x03\x02\x02\x02\x98\u03C2\x03\x02\x02\x02\x9A\u03C7\x03" +
		"\x02\x02\x02\x9C\u03D4\x03\x02\x02\x02\x9E\u03DA\x03\x02\x02\x02\xA0\u03F5" +
		"\x03\x02\x02\x02\xA2\u03F7\x03\x02\x02\x02\xA4\u0401\x03\x02\x02\x02\xA6" +
		"\u0406\x03\x02\x02\x02\xA8\u0427\x03\x02\x02\x02\xAA\u0429\x03\x02\x02" +
		"\x02\xAC\u0431\x03\x02\x02\x02\xAE\u0439\x03\x02\x02\x02\xB0\u0446\x03" +
		"\x02\x02\x02\xB2\u044A\x03\x02\x02\x02\xB4\u044C\x03\x02\x02\x02\xB6\u0453" +
		"\x03\x02\x02\x02\xB8\u045A\x03\x02\x02\x02\xBA\u0462\x03\x02\x02\x02\xBC" +
		"\u046D\x03\x02\x02\x02\xBE\u046F\x03\x02\x02\x02\xC0\u0485\x03\x02\x02" +
		"\x02\xC2\u0487\x03\x02\x02\x02\xC4\u048A\x03\x02\x02\x02\xC6\u0492\x03" +
		"\x02\x02\x02\xC8\u049A\x03\x02\x02\x02\xCA\u04A2\x03\x02\x02\x02\xCC\u04AA" +
		"\x03\x02\x02\x02\xCE\u04B2\x03\x02\x02\x02\xD0\u04BD\x03\x02\x02\x02\xD2" +
		"\u04BF\x03\x02\x02\x02\xD4\u04C5\x03\x02\x02\x02\xD6\u04E9\x03\x02\x02" +
		"\x02\xD8\u04EB\x03\x02\x02\x02\xDA\u04EF\x03\x02\x02\x02\xDC\u050C\x03" +
		"\x02\x02\x02\xDE\u050E\x03\x02\x02\x02\xE0\u0524\x03\x02\x02\x02\xE2\u0526" +
		"\x03\x02\x02\x02\xE4\u052C\x03\x02\x02\x02\xE6\u053B\x03\x02\x02\x02\xE8" +
		"\u0576\x03\x02\x02\x02\xEA\u0578\x03\x02\x02\x02\xEC\u0584\x03\x02\x02" +
		"\x02\xEE\u059B\x03\x02\x02\x02\xF0\u059F\x03\x02\x02\x02\xF2\u05A2\x03" +
		"\x02\x02\x02\xF4\u05AB\x03\x02\x02\x02\xF6\u05B0\x03\x02\x02\x02\xF8\u05B2" +
		"\x03\x02\x02\x02\xFA\u05B9\x03\x02\x02\x02\xFC\u05BC\x03\x02\x02\x02\xFE" +
		"\u0104\x07.\x02\x02\xFF\u0104\x05\x1E\x10\x02\u0100\u0101\x05P)\x02\u0101" +
		"\u0102\x07.\x02\x02\u0102\u0104\x03\x02\x02\x02\u0103\xFE\x03\x02\x02" +
		"\x02\u0103\xFF\x03\x02\x02\x02\u0103\u0100\x03\x02\x02\x02\u0104\x03\x03" +
		"\x02\x02\x02\u0105\u0108\x07.\x02\x02\u0106\u0108\x05\x1C\x0F\x02\u0107" +
		"\u0105\x03\x02\x02\x02\u0107\u0106\x03\x02\x02\x02\u0108\u010B\x03\x02" +
		"\x02\x02\u0109\u0107\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A" +
		"\u010C\x03\x02\x02\x02\u010B\u0109\x03\x02\x02\x02\u010C\u010D\x07\x02" +
		"\x02\x03\u010D\x05\x03\x02\x02\x02\u010E\u0112\x05\xE6t\x02\u010F\u0111" +
		"\x07.\x02\x02\u0110\u010F\x03\x02\x02\x02\u0111\u0114\x03\x02\x02\x02" +
		"\u0112\u0110\x03\x02\x02\x02\u0112\u0113\x03\x02\x02\x02\u0113\u0115\x03" +
		"\x02\x02\x02\u0114\u0112\x03\x02\x02\x02\u0115\u0116\x07\x02\x02\x03\u0116" +
		"\x07\x03\x02\x02\x02\u0117\u0118\x07X\x02\x02\u0118\u011E\x05H%\x02\u0119" +
		"\u011B\x07;\x02\x02\u011A\u011C\x05\xECw\x02\u011B\u011A\x03\x02\x02\x02" +
		"\u011B\u011C\x03\x02\x02\x02\u011C\u011D\x03\x02\x02\x02\u011D\u011F\x07" +
		"<\x02\x02\u011E\u0119\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F" +
		"\u0120\x03\x02\x02\x02\u0120\u0121\x07.\x02\x02\u0121\t\x03\x02\x02\x02" +
		"\u0122\u0124\x05\b\x05\x02\u0123\u0122\x03\x02\x02\x02\u0124\u0125\x03" +
		"\x02\x02\x02\u0125\u0123\x03\x02\x02\x02\u0125\u0126\x03\x02\x02\x02\u0126" +
		"\v\x03\x02\x02\x02\u0127\u012B\x05\n\x06\x02\u0128\u012C\x05\xEAv\x02" +
		"\u0129\u012C\x05\x10\t\x02\u012A\u012C\x05\x0E\b\x02\u012B\u0128\x03\x02" +
		"\x02\x02\u012B\u0129\x03\x02\x02\x02\u012B\u012A\x03\x02\x02\x02\u012C" +
		"\r\x03\x02\x02\x02\u012D\u012E\x07\v\x02\x02\u012E\u012F\x05\x10\t\x02" +
		"\u012F\x0F\x03\x02\x02\x02\u0130\u0131\x07\x11\x02\x02\u0131\u0132\x05" +
		"\xD8m\x02\u0132\u0135\x05\x12\n\x02\u0133\u0134\x07Y\x02\x02\u0134\u0136" +
		"\x05\xB0Y\x02\u0135\u0133\x03\x02\x02\x02\u0135\u0136\x03\x02\x02\x02" +
		"\u0136\u0137\x03\x02\x02\x02\u0137\u0138\x07>\x02\x02\u0138\u0139\x05" +
		"b2\x02\u0139\x11\x03\x02\x02\x02\u013A\u013C\x07;\x02\x02\u013B\u013D" +
		"\x05\x14\v\x02\u013C\u013B\x03\x02\x02\x02\u013C\u013D\x03\x02\x02\x02" +
		"\u013D\u013E\x03\x02\x02\x02\u013E\u013F\x07<\x02\x02\u013F\x13\x03\x02" +
		"\x02\x02\u0140\u0143\x05\x16\f\x02\u0141\u0142\x07A\x02\x02\u0142\u0144" +
		"\x05\xB0Y\x02\u0143\u0141\x03\x02\x02\x02\u0143\u0144\x03\x02\x02\x02" +
		"\u0144\u014D\x03\x02\x02\x02\u0145\u0146\x07=\x02\x02\u0146\u0149\x05" +
		"\x16\f\x02\u0147\u0148\x07A\x02\x02\u0148\u014A\x05\xB0Y\x02\u0149\u0147" +
		"\x03\x02\x02\x02\u0149\u014A\x03\x02\x02\x02\u014A\u014C\x03\x02\x02\x02" +
		"\u014B\u0145\x03\x02\x02\x02\u014C\u014F\x03\x02\x02\x02\u014D\u014B\x03" +
		"\x02\x02\x02\u014D\u014E\x03\x02\x02\x02\u014E\u0171\x03\x02\x02\x02\u014F" +
		"\u014D\x03\x02\x02\x02\u0150\u016F\x07=\x02\x02\u0151\u0153\x07:\x02\x02" +
		"\u0152\u0154\x05\x16\f\x02\u0153\u0152\x03\x02\x02\x02\u0153\u0154\x03" +
		"\x02\x02\x02\u0154\u015D\x03\x02\x02\x02\u0155\u0156\x07=\x02\x02\u0156" +
		"\u0159\x05\x16\f\x02\u0157\u0158\x07A\x02\x02\u0158\u015A\x05\xB0Y\x02" +
		"\u0159\u0157\x03\x02\x02\x02\u0159\u015A\x03\x02\x02\x02\u015A\u015C\x03" +
		"\x02\x02\x02\u015B\u0155\x03\x02\x02\x02\u015C\u015F\x03\x02\x02\x02\u015D" +
		"\u015B\x03\x02\x02\x02\u015D\u015E\x03\x02\x02\x02\u015E\u0168\x03\x02" +
		"\x02\x02\u015F\u015D\x03\x02\x02\x02\u0160\u0166\x07=\x02\x02\u0161\u0162" +
		"\x07@\x02\x02\u0162\u0164\x05\x16\f\x02\u0163\u0165\x07=\x02\x02\u0164" +
		"\u0163\x03\x02\x02\x02\u0164\u0165\x03\x02\x02\x02\u0165\u0167\x03\x02" +
		"\x02\x02";
	private static readonly _serializedATNSegment1: string =
		"\u0166\u0161\x03\x02\x02\x02\u0166\u0167\x03\x02\x02\x02\u0167\u0169\x03" +
		"\x02\x02\x02\u0168\u0160\x03\x02\x02\x02\u0168\u0169\x03\x02\x02\x02\u0169" +
		"\u0170\x03\x02\x02\x02\u016A\u016B\x07@\x02\x02\u016B\u016D\x05\x16\f" +
		"\x02\u016C\u016E\x07=\x02\x02\u016D\u016C\x03\x02\x02\x02\u016D\u016E" +
		"\x03\x02\x02\x02\u016E\u0170\x03\x02\x02\x02\u016F\u0151\x03\x02\x02\x02" +
		"\u016F\u016A\x03\x02\x02\x02\u016F\u0170\x03\x02\x02\x02\u0170\u0172\x03" +
		"\x02\x02\x02\u0171\u0150\x03\x02\x02\x02\u0171\u0172\x03\x02\x02\x02\u0172" +
		"\u0192\x03\x02\x02\x02\u0173\u0175\x07:\x02\x02\u0174\u0176\x05\x16\f" +
		"\x02\u0175\u0174\x03\x02\x02\x02\u0175\u0176\x03\x02\x02\x02\u0176\u017F" +
		"\x03\x02\x02\x02\u0177\u0178\x07=\x02\x02\u0178\u017B\x05\x16\f\x02\u0179" +
		"\u017A\x07A\x02\x02\u017A\u017C\x05\xB0Y\x02\u017B\u0179\x03\x02\x02\x02" +
		"\u017B\u017C\x03\x02\x02\x02\u017C\u017E\x03\x02\x02\x02\u017D\u0177\x03" +
		"\x02\x02\x02\u017E\u0181\x03\x02\x02\x02\u017F\u017D\x03\x02\x02\x02\u017F" +
		"\u0180\x03\x02\x02\x02\u0180\u018A\x03\x02\x02\x02\u0181\u017F\x03\x02" +
		"\x02\x02\u0182\u0188\x07=\x02\x02\u0183\u0184\x07@\x02\x02\u0184\u0186" +
		"\x05\x16\f\x02\u0185\u0187\x07=\x02\x02\u0186\u0185\x03\x02\x02\x02\u0186" +
		"\u0187\x03\x02\x02\x02\u0187\u0189\x03\x02\x02\x02\u0188\u0183\x03\x02" +
		"\x02\x02\u0188\u0189\x03\x02\x02\x02\u0189\u018B\x03\x02\x02\x02\u018A" +
		"\u0182\x03\x02\x02\x02\u018A\u018B\x03\x02\x02\x02\u018B\u0192\x03\x02" +
		"\x02\x02\u018C\u018D\x07@\x02\x02\u018D\u018F\x05\x16\f\x02\u018E\u0190" +
		"\x07=\x02\x02\u018F\u018E\x03\x02\x02\x02\u018F\u0190\x03\x02\x02\x02" +
		"\u0190\u0192\x03\x02\x02\x02\u0191\u0140\x03\x02\x02\x02\u0191\u0173\x03" +
		"\x02\x02\x02\u0191\u018C\x03\x02\x02\x02\u0192\x15\x03\x02\x02\x02\u0193" +
		"\u0196\x05\xD8m\x02\u0194\u0195\x07>\x02\x02\u0195\u0197\x05\xB0Y\x02" +
		"\u0196\u0194\x03\x02\x02\x02\u0196\u0197\x03\x02\x02\x02\u0197\x17\x03" +
		"\x02\x02\x02\u0198\u019B\x05\x1A\x0E\x02\u0199\u019A\x07A\x02\x02\u019A" +
		"\u019C\x05\xB0Y\x02\u019B\u0199\x03\x02\x02\x02\u019B\u019C\x03\x02\x02" +
		"\x02\u019C\u01A5\x03\x02\x02\x02\u019D\u019E\x07=\x02\x02\u019E\u01A1" +
		"\x05\x1A\x0E\x02\u019F\u01A0\x07A\x02\x02\u01A0\u01A2\x05\xB0Y\x02\u01A1" +
		"\u019F\x03\x02\x02\x02\u01A1\u01A2\x03\x02\x02\x02\u01A2\u01A4\x03\x02" +
		"\x02\x02\u01A3\u019D\x03\x02\x02\x02\u01A4\u01A7\x03\x02\x02\x02\u01A5" +
		"\u01A3\x03\x02\x02\x02\u01A5\u01A6\x03\x02\x02\x02\u01A6\u01C9\x03\x02" +
		"\x02\x02\u01A7\u01A5\x03\x02\x02\x02\u01A8\u01C7\x07=\x02\x02\u01A9\u01AB" +
		"\x07:\x02\x02\u01AA\u01AC\x05\x1A\x0E\x02\u01AB\u01AA\x03\x02\x02\x02" +
		"\u01AB\u01AC\x03\x02\x02\x02\u01AC\u01B5\x03\x02\x02\x02\u01AD\u01AE\x07" +
		"=\x02\x02\u01AE\u01B1\x05\x1A\x0E\x02\u01AF\u01B0\x07A\x02\x02\u01B0\u01B2" +
		"\x05\xB0Y\x02\u01B1\u01AF\x03\x02\x02\x02\u01B1\u01B2\x03\x02\x02\x02" +
		"\u01B2\u01B4\x03\x02\x02\x02\u01B3\u01AD\x03\x02\x02\x02\u01B4\u01B7\x03" +
		"\x02\x02\x02\u01B5\u01B3\x03\x02\x02\x02\u01B5\u01B6\x03\x02\x02\x02\u01B6" +
		"\u01C0\x03\x02\x02\x02\u01B7\u01B5\x03\x02\x02\x02\u01B8\u01BE\x07=\x02" +
		"\x02\u01B9\u01BA\x07@\x02\x02\u01BA\u01BC\x05\x1A\x0E\x02\u01BB\u01BD" +
		"\x07=\x02\x02\u01BC\u01BB\x03\x02\x02\x02\u01BC\u01BD\x03\x02\x02\x02" +
		"\u01BD\u01BF\x03\x02\x02\x02\u01BE\u01B9\x03\x02\x02\x02\u01BE\u01BF\x03" +
		"\x02\x02\x02\u01BF\u01C1\x03\x02\x02\x02\u01C0\u01B8\x03\x02\x02\x02\u01C0" +
		"\u01C1\x03\x02\x02\x02\u01C1\u01C8\x03\x02\x02\x02\u01C2\u01C3\x07@\x02" +
		"\x02\u01C3\u01C5\x05\x1A\x0E\x02\u01C4\u01C6\x07=\x02\x02\u01C5\u01C4" +
		"\x03\x02\x02\x02\u01C5\u01C6\x03\x02\x02\x02\u01C6\u01C8\x03\x02\x02\x02" +
		"\u01C7\u01A9\x03\x02\x02\x02\u01C7\u01C2\x03\x02\x02\x02\u01C7\u01C8\x03" +
		"\x02\x02\x02\u01C8\u01CA\x03\x02\x02\x02\u01C9\u01A8\x03\x02\x02\x02\u01C9" +
		"\u01CA\x03\x02\x02\x02\u01CA\u01EA\x03\x02\x02\x02\u01CB\u01CD\x07:\x02" +
		"\x02\u01CC\u01CE\x05\x1A\x0E\x02\u01CD\u01CC\x03\x02\x02\x02\u01CD\u01CE" +
		"\x03\x02\x02\x02\u01CE\u01D7\x03\x02\x02\x02\u01CF\u01D0\x07=\x02\x02" +
		"\u01D0\u01D3\x05\x1A\x0E\x02\u01D1\u01D2\x07A\x02\x02\u01D2\u01D4\x05" +
		"\xB0Y\x02\u01D3\u01D1\x03\x02\x02\x02\u01D3\u01D4\x03\x02\x02\x02\u01D4" +
		"\u01D6\x03\x02\x02\x02\u01D5\u01CF\x03\x02\x02\x02\u01D6\u01D9\x03\x02" +
		"\x02\x02\u01D7\u01D5\x03\x02\x02\x02\u01D7\u01D8\x03\x02\x02\x02\u01D8" +
		"\u01E2\x03\x02\x02\x02\u01D9\u01D7\x03\x02\x02\x02\u01DA\u01E0\x07=\x02" +
		"\x02\u01DB\u01DC\x07@\x02\x02\u01DC\u01DE\x05\x1A\x0E\x02\u01DD\u01DF" +
		"\x07=\x02\x02\u01DE\u01DD\x03\x02\x02\x02\u01DE\u01DF\x03\x02\x02\x02" +
		"\u01DF\u01E1\x03\x02\x02\x02\u01E0\u01DB\x03\x02\x02\x02\u01E0\u01E1\x03" +
		"\x02\x02\x02\u01E1\u01E3\x03\x02\x02\x02\u01E2\u01DA\x03\x02\x02\x02\u01E2" +
		"\u01E3\x03\x02\x02\x02\u01E3\u01EA\x03\x02\x02\x02\u01E4\u01E5\x07@\x02" +
		"\x02\u01E5\u01E7\x05\x1A\x0E\x02\u01E6\u01E8\x07=\x02\x02\u01E7\u01E6" +
		"\x03\x02\x02\x02\u01E7\u01E8\x03\x02\x02\x02\u01E8\u01EA\x03\x02\x02\x02" +
		"\u01E9\u0198\x03\x02\x02\x02\u01E9\u01CB\x03\x02\x02\x02\u01E9\u01E4\x03" +
		"\x02\x02\x02\u01EA\x19\x03\x02\x02\x02\u01EB\u01EC\x05\xD8m\x02\u01EC" +
		"\x1B\x03\x02\x02\x02\u01ED\u01F0\x05\x1E\x10\x02\u01EE\u01F0\x05P)\x02" +
		"\u01EF\u01ED\x03\x02\x02\x02\u01EF\u01EE\x03\x02\x02\x02\u01F0\x1D\x03" +
		"\x02\x02\x02\u01F1\u01F6\x05 \x11\x02\u01F2\u01F3\x07?\x02\x02\u01F3\u01F5" +
		"\x05 \x11\x02\u01F4\u01F2\x03\x02\x02\x02\u01F5\u01F8\x03\x02\x02\x02" +
		"\u01F6\u01F4\x03\x02\x02\x02\u01F6\u01F7\x03\x02\x02\x02\u01F7\u01FA\x03" +
		"\x02\x02\x02\u01F8\u01F6\x03\x02\x02\x02\u01F9\u01FB\x07?\x02\x02\u01FA" +
		"\u01F9\x03\x02\x02\x02\u01FA\u01FB\x03\x02\x02\x02\u01FB\u01FC\x03\x02" +
		"\x02\x02\u01FC\u01FD\x07.\x02\x02\u01FD\x1F\x03\x02\x02\x02\u01FE\u0207" +
		"\x05\"\x12\x02\u01FF\u0207\x05*\x16\x02\u0200\u0207\x05,\x17\x02\u0201" +
		"\u0207\x05.\x18\x02\u0202\u0207\x05:\x1E\x02\u0203\u0207\x05J&\x02\u0204" +
		"\u0207\x05L\'\x02\u0205\u0207\x05N(\x02\u0206\u01FE\x03\x02\x02\x02\u0206" +
		"\u01FF\x03\x02\x02\x02\u0206\u0200\x03\x02\x02\x02\u0206\u0201\x03\x02" +
		"\x02\x02\u0206\u0202\x03\x02\x02\x02\u0206\u0203\x03\x02\x02\x02\u0206" +
		"\u0204\x03\x02\x02\x02\u0206\u0205\x03\x02\x02\x02\u0207!\x03\x02\x02" +
		"\x02\u0208\u0219\x05&\x14\x02\u0209\u021A\x05$\x13\x02\u020A\u020D\x05" +
		"(\x15\x02\u020B\u020E\x05\xF8}\x02\u020C\u020E\x05\xE6t\x02\u020D\u020B" +
		"\x03\x02\x02\x02\u020D\u020C\x03\x02\x02\x02\u020E\u021A\x03\x02\x02\x02" +
		"\u020F\u0212\x07A\x02\x02\u0210\u0213\x05\xF8}\x02\u0211\u0213\x05&\x14" +
		"\x02\u0212\u0210\x03\x02\x02\x02\u0212\u0211\x03\x02\x02\x02\u0213\u0215" +
		"\x03\x02\x02\x02\u0214\u020F\x03\x02\x02\x02\u0215\u0218\x03\x02\x02\x02" +
		"\u0216\u0214\x03\x02\x02\x02\u0216\u0217\x03\x02\x02\x02\u0217\u021A\x03" +
		"\x02\x02\x02\u0218\u0216\x03\x02\x02\x02\u0219\u0209\x03\x02\x02\x02\u0219" +
		"\u020A\x03\x02\x02\x02\u0219\u0216\x03\x02\x02\x02\u021A#\x03\x02\x02" +
		"\x02\u021B\u021C\x07>\x02\x02\u021C\u021F\x05\xB0Y\x02\u021D\u021E\x07" +
		"A\x02\x02\u021E\u0220\x05\xB0Y\x02\u021F\u021D\x03\x02\x02\x02\u021F\u0220" +
		"\x03\x02\x02\x02\u0220%\x03\x02\x02\x02\u0221\u0224\x05\xB0Y\x02\u0222" +
		"\u0224\x05\xC2b\x02\u0223\u0221\x03\x02\x02\x02\u0223\u0222\x03\x02\x02" +
		"\x02\u0224\u022C\x03\x02\x02\x02\u0225\u0228\x07=\x02\x02\u0226\u0229" +
		"\x05\xB0Y\x02\u0227\u0229\x05\xC2b\x02\u0228\u0226\x03\x02\x02\x02\u0228" +
		"\u0227\x03\x02\x02\x02\u0229\u022B\x03\x02\x02\x02\u022A\u0225\x03\x02" +
		"\x02\x02\u022B\u022E\x03\x02\x02\x02\u022C\u022A\x03\x02\x02\x02\u022C" +
		"\u022D\x03\x02\x02\x02\u022D\u0230\x03\x02\x02\x02\u022E\u022C\x03\x02" +
		"\x02\x02\u022F\u0231\x07=\x02\x02\u0230\u022F\x03\x02\x02\x02\u0230\u0231" +
		"\x03\x02\x02\x02\u0231\'\x03\x02\x02\x02\u0232\u0233\t\x02\x02\x02\u0233" +
		")\x03\x02\x02\x02\u0234\u0235\x07\x12\x02\x02\u0235\u0236\x05\xE4s\x02" +
		"\u0236+\x03\x02\x02\x02\u0237\u0238\x07%\x02\x02\u0238-\x03\x02\x02\x02" +
		"\u0239\u023F\x050\x19\x02\u023A\u023F\x052\x1A\x02\u023B\u023F\x054\x1B" +
		"\x02\u023C\u023F\x058\x1D\x02\u023D\u023F\x056\x1C\x02\u023E\u0239\x03" +
		"\x02\x02\x02\u023E\u023A\x03\x02\x02\x02\u023E\u023B\x03\x02\x02\x02\u023E" +
		"\u023C\x03\x02\x02\x02\u023E\u023D\x03\x02\x02\x02\u023F/\x03\x02\x02" +
		"\x02\u0240\u0241\x07\r\x02\x02\u02411\x03\x02\x02\x02\u0242\u0243\x07" +
		"\x10\x02\x02\u02433\x03\x02\x02\x02\u0244\u0246\x07\'\x02\x02\u0245\u0247" +
		"\x05\xE6t\x02\u0246\u0245\x03\x02\x02\x02\u0246\u0247\x03\x02\x02\x02" +
		"\u02475\x03\x02\x02\x02\u0248\u0249\x05\xF8}\x02\u02497\x03\x02\x02\x02" +
		"\u024A\u0250\x07&\x02\x02\u024B\u024E\x05\xB0Y\x02\u024C\u024D\x07\x19" +
		"\x02\x02\u024D\u024F\x05\xB0Y\x02\u024E\u024C\x03\x02\x02\x02\u024E\u024F" +
		"\x03\x02\x02\x02\u024F\u0251\x03\x02\x02\x02\u0250\u024B\x03\x02\x02\x02" +
		"\u0250\u0251\x03\x02\x02\x02\u02519\x03\x02\x02\x02\u0252\u0255\x05<\x1F" +
		"\x02\u0253\u0255\x05> \x02\u0254\u0252\x03\x02\x02\x02\u0254\u0253\x03" +
		"\x02\x02\x02\u0255;\x03\x02\x02\x02\u0256\u0257\x07\x1C\x02\x02\u0257" +
		"\u0258\x05F$\x02\u0258=\x03\x02\x02\x02\u0259\u0266\x07\x19\x02\x02\u025A" +
		"\u025C\t\x03\x02\x02\u025B\u025A\x03\x02\x02\x02\u025C\u025F\x03\x02\x02" +
		"\x02\u025D\u025B\x03\x02\x02\x02\u025D\u025E\x03\x02\x02\x02\u025E\u0260" +
		"\x03\x02\x02\x02\u025F\u025D\x03\x02\x02\x02\u0260\u0267\x05H%\x02\u0261" +
		"\u0263\t\x03\x02\x02\u0262\u0261\x03\x02\x02\x02\u0263\u0264\x03\x02\x02" +
		"\x02\u0264\u0262\x03\x02\x02\x02\u0264\u0265\x03\x02\x02\x02\u0265\u0267" +
		"\x03\x02\x02\x02\u0266\u025D\x03\x02\x02\x02\u0266\u0262\x03\x02\x02\x02" +
		"\u0267\u0268\x03\x02\x02\x02\u0268\u026F\x07\x1C\x02\x02\u0269\u0270\x07" +
		":\x02\x02\u026A\u026B\x07;\x02\x02\u026B\u026C\x05D#\x02\u026C\u026D\x07" +
		"<\x02\x02\u026D\u0270\x03\x02\x02\x02\u026E\u0270\x05D#\x02\u026F\u0269" +
		"\x03\x02\x02\x02\u026F\u026A\x03\x02\x02\x02\u026F\u026E\x03\x02\x02\x02" +
		"\u0270?\x03\x02\x02\x02\u0271\u0274\x05\xD8m\x02\u0272\u0273\x07\t\x02" +
		"\x02\u0273\u0275\x05\xD8m\x02\u0274\u0272\x03\x02\x02\x02\u0274\u0275" +
		"\x03\x02\x02\x02\u0275A\x03\x02\x02\x02\u0276\u0279\x05H%\x02\u0277\u0278" +
		"\x07\t\x02\x02\u0278\u027A\x05\xD8m\x02\u0279\u0277\x03\x02\x02\x02\u0279" +
		"\u027A\x03\x02\x02\x02\u027AC\x03\x02\x02\x02\u027B\u0280\x05@!\x02\u027C" +
		"\u027D\x07=\x02\x02\u027D\u027F\x05@!\x02\u027E\u027C\x03\x02\x02\x02" +
		"\u027F\u0282\x03\x02\x02\x02\u0280\u027E\x03\x02\x02\x02\u0280\u0281\x03" +
		"\x02\x02\x02\u0281\u0284\x03\x02\x02\x02\u0282\u0280\x03\x02\x02\x02\u0283" +
		"\u0285\x07=\x02\x02\u0284\u0283\x03\x02\x02\x02\u0284\u0285\x03\x02\x02" +
		"\x02\u0285E\x03\x02\x02\x02\u0286\u028B\x05B\"\x02\u0287\u0288\x07=\x02" +
		"\x02\u0288\u028A\x05B\"\x02\u0289\u0287\x03\x02\x02\x02\u028A\u028D\x03" +
		"\x02\x02\x02\u028B\u0289\x03\x02\x02\x02\u028B\u028C\x03\x02\x02\x02\u028C" +
		"G\x03\x02\x02\x02\u028D\u028B\x03\x02\x02\x02\u028E\u0293\x05\xD8m\x02" +
		"\u028F\u0290\x078\x02\x02\u0290\u0292\x05\xD8m\x02\u0291\u028F\x03\x02" +
		"\x02\x02\u0292\u0295\x03\x02\x02\x02\u0293\u0291\x03\x02\x02\x02\u0293" +
		"\u0294\x03\x02\x02\x02\u0294I\x03\x02\x02\x02\u0295\u0293\x03\x02\x02" +
		"\x02\u0296\u0297\x07\x1A\x02\x02\u0297\u029C\x05\xD8m\x02\u0298\u0299" +
		"\x07=\x02\x02\u0299\u029B\x05\xD8m\x02\u029A\u0298\x03\x02\x02\x02\u029B" +
		"\u029E\x03\x02\x02\x02\u029C\u029A\x03\x02\x02\x02\u029C\u029D\x03\x02" +
		"\x02\x02\u029DK\x03\x02\x02\x02\u029E\u029C\x03\x02\x02\x02\u029F\u02A0" +
		"\x07\"\x02\x02\u02A0\u02A5\x05\xD8m\x02\u02A1\u02A2\x07=\x02\x02\u02A2" +
		"\u02A4\x05\xD8m\x02\u02A3\u02A1\x03\x02\x02\x02\u02A4\u02A7\x03\x02\x02" +
		"\x02\u02A5\u02A3\x03\x02\x02\x02\u02A5\u02A6\x03\x02\x02\x02\u02A6M\x03" +
		"\x02\x02\x02\u02A7\u02A5\x03\x02\x02\x02\u02A8\u02A9\x07\n\x02\x02\u02A9" +
		"\u02AC\x05\xB0Y\x02\u02AA\u02AB\x07=\x02\x02\u02AB\u02AD\x05\xB0Y\x02" +
		"\u02AC\u02AA\x03\x02\x02\x02\u02AC\u02AD\x03\x02\x02\x02\u02ADO\x03\x02" +
		"\x02\x02\u02AE\u02B9\x05T+\x02\u02AF\u02B9\x05V,\x02\u02B0\u02B9\x05X" +
		"-\x02\u02B1\u02B9\x05Z.\x02\u02B2\u02B9\x05\\/\x02\u02B3\u02B9\x05\x10" +
		"\t\x02\u02B4\u02B9\x05\xEAv\x02\u02B5\u02B9\x05\f\x07\x02\u02B6\u02B9" +
		"\x05R*\x02\u02B7\u02B9\x05d3\x02\u02B8\u02AE\x03\x02\x02\x02\u02B8\u02AF" +
		"\x03\x02\x02\x02\u02B8\u02B0\x03\x02\x02\x02\u02B8\u02B1\x03\x02\x02\x02" +
		"\u02B8\u02B2\x03\x02\x02\x02\u02B8\u02B3\x03\x02\x02\x02\u02B8\u02B4\x03" +
		"\x02\x02\x02\u02B8\u02B5\x03\x02\x02\x02\u02B8\u02B6\x03\x02\x02\x02\u02B8" +
		"\u02B7\x03\x02\x02\x02\u02B9Q\x03\x02\x02\x02\u02BA\u02BE\x07\v\x02\x02" +
		"\u02BB\u02BF\x05\x10\t\x02\u02BC\u02BF\x05\\/\x02\u02BD\u02BF\x05X-\x02" +
		"\u02BE\u02BB\x03\x02\x02\x02\u02BE\u02BC\x03\x02\x02\x02\u02BE\u02BD\x03" +
		"\x02\x02\x02\u02BFS\x03\x02\x02\x02\u02C0\u02C1\x07\x1B\x02\x02\u02C1" +
		"\u02C2\x05\xB0Y\x02\u02C2\u02C3\x07>\x02\x02\u02C3\u02CB\x05b2\x02\u02C4" +
		"\u02C5\x07\x13\x02\x02\u02C5\u02C6\x05\xB0Y\x02\u02C6\u02C7\x07>\x02\x02" +
		"\u02C7\u02C8\x05b2\x02\u02C8\u02CA\x03\x02\x02\x02\u02C9\u02C4\x03\x02" +
		"\x02\x02\u02CA\u02CD\x03\x02\x02\x02\u02CB\u02C9\x03\x02\x02\x02\u02CB" +
		"\u02CC\x03\x02\x02\x02\u02CC\u02D1\x03\x02\x02\x02\u02CD\u02CB\x03\x02" +
		"\x02\x02\u02CE\u02CF\x07\x14\x02\x02\u02CF\u02D0\x07>\x02\x02\u02D0\u02D2" +
		"\x05b2\x02\u02D1\u02CE\x03\x02\x02\x02\u02D1\u02D2\x03\x02\x02\x02\u02D2" +
		"U\x03\x02\x02\x02\u02D3\u02D4\x07+\x02\x02\u02D4\u02D5\x05\xB0Y\x02\u02D5" +
		"\u02D6\x07>\x02\x02\u02D6\u02DA\x05b2\x02\u02D7\u02D8\x07\x14\x02\x02" +
		"\u02D8\u02D9\x07>\x02\x02\u02D9\u02DB\x05b2\x02\u02DA\u02D7\x03\x02\x02" +
		"\x02\u02DA\u02DB\x03\x02\x02\x02\u02DBW\x03\x02\x02\x02\u02DC\u02DD\x07" +
		"\x18\x02\x02\u02DD\u02DE\x05\xE4s\x02\u02DE\u02DF\x07\x1D\x02\x02\u02DF" +
		"\u02E0\x05\xE6t\x02\u02E0\u02E1\x07>\x02\x02\u02E1\u02E5\x05b2\x02\u02E2" +
		"\u02E3\x07\x14\x02\x02\u02E3\u02E4\x07>\x02\x02\u02E4\u02E6\x05b2\x02" +
		"\u02E5\u02E2\x03\x02\x02\x02\u02E5\u02E6\x03\x02\x02\x02\u02E6Y\x03\x02" +
		"\x02\x02\u02E7\u02E8\x07)\x02\x02\u02E8\u02E9\x07>\x02\x02\u02E9\u02FF" +
		"\x05b2\x02\u02EA\u02EB\x05`1\x02\u02EB\u02EC\x07>\x02\x02\u02EC\u02ED" +
		"\x05b2\x02\u02ED\u02EF\x03\x02\x02\x02\u02EE\u02EA\x03\x02\x02\x02\u02EF" +
		"\u02F0\x03\x02\x02\x02\u02F0\u02EE\x03\x02\x02\x02\u02F0\u02F1\x03\x02" +
		"\x02\x02\u02F1\u02F5\x03\x02\x02\x02\u02F2\u02F3\x07\x14\x02\x02\u02F3" +
		"\u02F4\x07>\x02\x02\u02F4\u02F6\x05b2\x02\u02F5\u02F2\x03\x02\x02\x02" +
		"\u02F5\u02F6\x03\x02\x02\x02\u02F6\u02FA\x03\x02\x02\x02\u02F7\u02F8\x07" +
		"\x17\x02\x02\u02F8\u02F9\x07>\x02\x02\u02F9\u02FB\x05b2\x02\u02FA\u02F7" +
		"\x03\x02\x02\x02\u02FA\u02FB\x03\x02\x02\x02\u02FB\u0300\x03\x02\x02\x02" +
		"\u02FC\u02FD\x07\x17\x02\x02\u02FD\u02FE\x07>\x02\x02\u02FE\u0300\x05" +
		"b2\x02\u02FF\u02EE\x03\x02\x02\x02\u02FF\u02FC\x03\x02\x02\x02\u0300[" +
		"\x03\x02\x02\x02\u0301\u0302\x07,\x02\x02\u0302\u0307\x05^0\x02\u0303" +
		"\u0304\x07=\x02\x02\u0304\u0306\x05^0\x02\u0305\u0303\x03\x02\x02\x02" +
		"\u0306\u0309\x03\x02\x02\x02\u0307\u0305\x03\x02\x02\x02\u0307\u0308\x03" +
		"\x02\x02\x02\u0308\u030A\x03\x02\x02\x02\u0309\u0307\x03\x02\x02\x02\u030A" +
		"\u030B\x07>\x02\x02\u030B\u030C\x05b2\x02\u030C]\x03\x02\x02\x02\u030D" +
		"\u0310\x05\xB0Y\x02\u030E\u030F\x07\t\x02\x02\u030F\u0311\x05\xC4c\x02" +
		"\u0310\u030E\x03\x02\x02\x02\u0310\u0311\x03\x02\x02\x02\u0311_\x03\x02" +
		"\x02\x02\u0312\u0318\x07\x15\x02\x02\u0313\u0316\x05\xB0Y\x02\u0314\u0315" +
		"\x07\t\x02\x02\u0315\u0317\x05\xD8m\x02\u0316\u0314\x03\x02\x02\x02\u0316" +
		"\u0317\x03\x02\x02\x02\u0317\u0319\x03\x02\x02\x02\u0318\u0313\x03\x02" +
		"\x02\x02\u0318\u0319\x03\x02\x02\x02\u0319a\x03\x02\x02\x02\u031A\u0325" +
		"\x05\x1E\x10\x02\u031B\u031C\x07.\x02\x02\u031C\u031E\x07\x03\x02\x02" +
		"\u031D\u031F\x05\x1C\x0F\x02\u031E\u031D\x03\x02\x02\x02\u031F\u0320\x03" +
		"\x02\x02\x02\u0320\u031E\x03\x02\x02\x02\u0320\u0321\x03\x02\x02\x02\u0321" +
		"\u0322\x03\x02\x02\x02\u0322\u0323\x07\x04\x02\x02\u0323\u0325\x03\x02" +
		"\x02\x02\u0324\u031A\x03\x02\x02\x02\u0324\u031B\x03\x02\x02\x02\u0325" +
		"c\x03\x02\x02\x02\u0326\u0327\x07 \x02\x02\u0327\u0328\x05f4\x02\u0328" +
		"\u0329\x07>\x02\x02\u0329\u032A\x07.\x02\x02\u032A\u032C\x07\x03\x02\x02" +
		"\u032B\u032D\x05l7\x02\u032C\u032B\x03\x02\x02\x02\u032D\u032E\x03\x02" +
		"\x02\x02\u032E\u032C\x03\x02\x02\x02\u032E\u032F\x03\x02\x02\x02\u032F" +
		"\u0330\x03\x02\x02\x02\u0330\u0331\x07\x04\x02\x02\u0331e\x03\x02\x02" +
		"\x02\u0332\u0333\x05j6\x02\u0333\u0335\x07=\x02\x02\u0334\u0336\x05h5" +
		"\x02\u0335\u0334\x03\x02\x02\x02\u0335\u0336\x03\x02\x02\x02\u0336\u0339" +
		"\x03\x02\x02\x02\u0337\u0339\x05\xB0Y\x02\u0338\u0332\x03\x02\x02\x02" +
		"\u0338\u0337\x03\x02\x02\x02\u0339g\x03\x02\x02\x02\u033A\u033C\x07=\x02" +
		"\x02\u033B\u033D\x05j6\x02\u033C\u033B\x03\x02\x02\x02\u033D\u033E\x03" +
		"\x02\x02\x02\u033E\u033C\x03\x02\x02\x02\u033E\u033F\x03\x02\x02\x02\u033F" +
		"\u0341\x03\x02\x02\x02\u0340\u0342\x07=\x02\x02\u0341\u0340\x03\x02\x02" +
		"\x02\u0341\u0342\x03\x02\x02\x02\u0342i\x03\x02\x02\x02\u0343\u0344\x07" +
		":\x02\x02\u0344\u0347\x05\xC4c\x02\u0345\u0347\x05\xB0Y\x02\u0346\u0343" +
		"\x03\x02\x02\x02\u0346\u0345\x03\x02\x02\x02\u0347k\x03\x02\x02\x02\u0348" +
		"\u0349\x07\x0E\x02\x02\u0349\u034B\x05p9\x02\u034A\u034C\x05n8\x02\u034B" +
		"\u034A\x03\x02\x02\x02\u034B\u034C\x03\x02\x02\x02\u034C\u034D\x03\x02" +
		"\x02\x02\u034D\u034E\x07>\x02\x02\u034E\u034F\x05b2\x02\u034Fm\x03\x02" +
		"\x02\x02\u0350\u0351\x07\x1B\x02\x02\u0351\u0352\x05\xB0Y\x02\u0352o\x03" +
		"\x02\x02\x02\u0353\u0356\x05\x98M\x02\u0354\u0356\x05r:\x02\u0355\u0353" +
		"\x03\x02\x02\x02\u0355\u0354\x03\x02\x02\x02\u0356q\x03\x02\x02\x02\u0357" +
		"\u035A\x05t;\x02\u0358\u035A\x05v<\x02\u0359\u0357\x03\x02\x02\x02\u0359" +
		"\u0358\x03\x02\x02\x02\u035As\x03\x02\x02\x02\u035B\u035C\x05v<\x02\u035C" +
		"\u035D\x07\t\x02\x02\u035D\u035E\x05\x8AF\x02\u035Eu\x03\x02\x02\x02\u035F" +
		"\u0364\x05x=\x02\u0360\u0361\x07D\x02\x02\u0361\u0363\x05x=\x02\u0362" +
		"\u0360\x03\x02\x02\x02\u0363\u0366\x03\x02\x02\x02\u0364\u0362\x03\x02" +
		"\x02\x02\u0364\u0365\x03\x02\x02\x02\u0365w\x03\x02\x02\x02\u0366\u0364" +
		"\x03\x02\x02\x02\u0367\u0370\x05z>\x02\u0368\u0370\x05\x88E\x02\u0369" +
		"\u0370\x05\x8CG\x02\u036A\u0370\x05\x8EH\x02\u036B\u0370\x05\x94K\x02" +
		"\u036C\u0370\x05\x96L\x02\u036D\u0370\x05\xA0Q\x02\u036E\u0370\x05\xA8" +
		"U\x02\u036F\u0367\x03\x02\x02\x02\u036F\u0368\x03\x02\x02\x02\u036F\u0369" +
		"\x03\x02\x02\x02\u036F\u036A\x03\x02\x02\x02\u036F\u036B\x03\x02\x02\x02" +
		"\u036F\u036C\x03\x02\x02\x02\u036F\u036D\x03\x02\x02\x02\u036F\u036E\x03" +
		"\x02\x02\x02\u0370y\x03\x02\x02\x02\u0371\u0372\x05\x80A\x02\u0372\u0373" +
		"\x06>\x02\x02\u0373\u037A\x03\x02\x02\x02\u0374\u037A\x05~@\x02\u0375" +
		"\u037A\x05\xFC\x7F\x02\u0376\u037A\x07!\x02\x02\u0377\u037A\x07(\x02\x02" +
		"\u0378\u037A\x07\x16\x02\x02\u0379\u0371\x03\x02\x02\x02\u0379\u0374\x03" +
		"\x02\x02\x02\u0379\u0375\x03\x02\x02\x02\u0379\u0376\x03\x02\x02\x02\u0379" +
		"\u0377\x03\x02\x02\x02\u0379\u0378\x03\x02\x02\x02\u037A{\x03\x02\x02" +
		"\x02\u037B\u037C\x05\x80A\x02\u037C\u037D\x06?\x03\x02\u037D\u0384\x03" +
		"\x02\x02\x02\u037E\u0384\x05~@\x02\u037F\u0384\x05\xFC\x7F\x02\u0380\u0384" +
		"\x07!\x02\x02\u0381\u0384\x07(\x02\x02\u0382\u0384\x07\x16\x02\x02\u0383" +
		"\u037B\x03\x02\x02\x02\u0383\u037E\x03\x02\x02\x02\u0383\u037F\x03\x02" +
		"\x02\x02\u0383\u0380\x03\x02\x02\x02\u0383\u0381\x03\x02\x02\x02\u0383" +
		"\u0382\x03\x02\x02\x02\u0384}\x03\x02\x02\x02\u0385\u0386\x05\x82B\x02" +
		"\u0386\u0387\x07I\x02\x02\u0387\u0388\x05\x86D\x02\u0388\u038E\x03\x02" +
		"\x02\x02\u0389\u038A\x05\x82B\x02\u038A\u038B\x07J\x02\x02\u038B\u038C" +
		"\x05\x86D\x02\u038C\u038E\x03\x02\x02\x02\u038D\u0385\x03\x02\x02\x02" +
		"\u038D\u0389\x03\x02\x02\x02\u038E\x7F\x03\x02\x02\x02\u038F\u0393\x07" +
		"\x06\x02\x02\u0390\u0391\x07J\x02\x02\u0391\u0393\x07\x06\x02\x02\u0392" +
		"\u038F\x03\x02\x02\x02\u0392\u0390\x03\x02\x02\x02\u0393\x81\x03\x02\x02" +
		"\x02\u0394\u0398\x05\x84C\x02\u0395\u0396\x07J\x02\x02\u0396\u0398\x05" +
		"\x84C\x02\u0397\u0394\x03\x02\x02\x02\u0397\u0395\x03\x02\x02\x02\u0398" +
		"\x83\x03\x02\x02\x02\u0399\u039A\x07\x06\x02\x02\u039A\x85\x03\x02\x02" +
		"\x02\u039B\u039C\x07\x06\x02\x02\u039C\x87\x03\x02\x02\x02\u039D\u039E" +
		"\x05\x8AF\x02\u039E\x89\x03\x02\x02\x02\u039F\u03A0\x05\xD8m\x02\u03A0" +
		"\u03A1\x06F\x04\x02\u03A1\x8B\x03\x02\x02\x02\u03A2\u03A3\x07*\x02\x02" +
		"\u03A3\x8D\x03\x02\x02\x02\u03A4\u03A5\x05\x90I\x02\u03A5\u03A6\x06H\x05" +
		"\x02\u03A6\x8F\x03\x02\x02\x02\u03A7\u03AA\x05\xD8m\x02\u03A8\u03A9\x07" +
		"8\x02\x02\u03A9\u03AB\x05\xD8m\x02\u03AA\u03A8\x03\x02\x02\x02\u03AB\u03AC" +
		"\x03\x02\x02\x02\u03AC\u03AA\x03\x02\x02\x02\u03AC\u03AD\x03\x02\x02\x02" +
		"\u03AD\x91\x03\x02\x02\x02\u03AE\u03B1\x05\x90I\x02\u03AF\u03B1\x05\xD8" +
		"m\x02\u03B0\u03AE\x03\x02\x02\x02\u03B0\u03AF\x03\x02\x02\x02\u03B1\x93" +
		"\x03\x02\x02\x02\u03B2\u03B3\x07;\x02\x02\u03B3\u03B4\x05r:\x02\u03B4" +
		"\u03B5\x07<\x02\x02\u03B5\x95\x03\x02\x02\x02\u03B6\u03B8\x07B\x02\x02" +
		"\u03B7\u03B9\x05\x9AN\x02\u03B8\u03B7\x03\x02\x02\x02\u03B8\u03B9\x03" +
		"\x02\x02\x02\u03B9\u03BA\x03\x02\x02\x02\u03BA\u03C1\x07C\x02\x02\u03BB" +
		"\u03BD\x07;\x02\x02\u03BC\u03BE\x05\x98M\x02\u03BD\u03BC\x03\x02\x02\x02" +
		"\u03BD\u03BE\x03\x02\x02\x02\u03BE\u03BF\x03\x02\x02\x02\u03BF\u03C1\x07" +
		"<\x02\x02\u03C0\u03B6\x03\x02\x02\x02\u03C0\u03BB\x03\x02\x02\x02\u03C1" +
		"\x97\x03\x02\x02\x02\u03C2\u03C3\x05\x9CO\x02\u03C3\u03C5\x07=\x02\x02" +
		"\u03C4\u03C6\x05\x9AN\x02\u03C5\u03C4\x03\x02\x02\x02\u03C5\u03C6\x03" +
		"\x02\x02\x02\u03C6\x99\x03\x02\x02\x02\u03C7\u03CC\x05\x9CO\x02\u03C8" +
		"\u03C9\x07=\x02\x02\u03C9\u03CB\x05\x9CO\x02\u03CA\u03C8\x03\x02\x02\x02" +
		"\u03CB\u03CE\x03\x02\x02\x02\u03CC\u03CA\x03\x02\x02\x02\u03CC\u03CD\x03" +
		"\x02\x02\x02\u03CD\u03D0\x03\x02\x02\x02\u03CE\u03CC\x03\x02\x02\x02\u03CF" +
		"\u03D1\x07=\x02\x02\u03D0\u03CF\x03\x02\x02\x02\u03D0\u03D1\x03\x02\x02" +
		"\x02\u03D1\x9B\x03\x02\x02\x02\u03D2\u03D5\x05\x9EP\x02\u03D3\u03D5\x05" +
		"r:\x02\u03D4\u03D2\x03\x02\x02\x02\u03D4\u03D3\x03\x02\x02\x02\u03D5\x9D" +
		"\x03\x02\x02\x02\u03D6\u03D7\x07:\x02\x02\u03D7\u03DB\x05\x8AF\x02\u03D8" +
		"\u03D9\x07:\x02\x02\u03D9\u03DB\x05\x8CG\x02\u03DA\u03D6\x03\x02\x02\x02" +
		"\u03DA\u03D8\x03\x02\x02\x02\u03DB\x9F\x03\x02\x02\x02\u03DC\u03DD\x07" +
		"O\x02\x02\u03DD\u03F6\x07P\x02\x02\u03DE\u03DF\x07O\x02\x02\u03DF\u03E1" +
		"\x05\xA6T\x02\u03E0\u03E2\x07=\x02\x02\u03E1\u03E0\x03\x02\x02\x02\u03E1" +
		"\u03E2\x03\x02\x02\x02\u03E2\u03E3\x03\x02\x02\x02\u03E3\u03E4\x07P\x02" +
		"\x02\u03E4\u03F6\x03\x02\x02\x02\u03E5\u03E6\x07O\x02\x02\u03E6\u03E7" +
		"\x05\xA2R\x02\u03E7\u03E8\x07=\x02\x02\u03E8\u03EA\x05\xA6T\x02\u03E9" +
		"\u03EB\x07=\x02\x02\u03EA\u03E9\x03\x02\x02\x02\u03EA\u03EB\x03\x02\x02" +
		"\x02\u03EB\u03EC\x03\x02\x02\x02\u03EC\u03ED\x07P\x02\x02\u03ED\u03F6" +
		"\x03\x02\x02\x02\u03EE\u03EF\x07O\x02\x02\u03EF\u03F1\x05\xA2R\x02\u03F0" +
		"\u03F2\x07=\x02\x02\u03F1\u03F0\x03\x02\x02\x02\u03F1\u03F2\x03\x02\x02" +
		"\x02\u03F2\u03F3\x03\x02\x02\x02\u03F3\u03F4\x07P\x02\x02\u03F4\u03F6" +
		"\x03\x02\x02\x02\u03F5\u03DC\x03\x02\x02\x02\u03F5\u03DE\x03\x02\x02\x02" +
		"\u03F5\u03E5\x03\x02\x02\x02\u03F5\u03EE\x03\x02\x02\x02\u03F6\xA1\x03" +
		"\x02\x02\x02\u03F7\u03FC\x05\xA4S\x02\u03F8\u03F9\x07=\x02\x02\u03F9\u03FB" +
		"\x05\xA4S\x02\u03FA\u03F8\x03\x02\x02\x02\u03FB\u03FE\x03\x02\x02\x02" +
		"\u03FC\u03FA\x03\x02\x02\x02\u03FC\u03FD\x03\x02\x02\x02\u03FD\xA3\x03" +
		"\x02\x02\x02\u03FE\u03FC\x03\x02\x02\x02\u03FF\u0402\x05|?\x02\u0400\u0402" +
		"\x05\x90I\x02\u0401\u03FF\x03\x02\x02\x02\u0401\u0400\x03\x02\x02\x02" +
		"\u0402\u0403\x03\x02\x02\x02\u0403\u0404\x07>\x02\x02\u0404\u0405\x05" +
		"r:\x02\u0405\xA5\x03\x02\x02\x02\u0406\u0407\x07@\x02\x02\u0407\u0408" +
		"\x05\x8AF\x02\u0408\xA7\x03\x02\x02\x02\u0409\u040A\x05\x92J\x02\u040A" +
		"\u040B\x07;\x02\x02\u040B\u040C\x07<\x02\x02\u040C\u0428\x03\x02\x02\x02" +
		"\u040D\u040E\x05\x92J\x02\u040E\u040F";
	private static readonly _serializedATNSegment2: string =
		"\x07;\x02\x02\u040F\u0411\x05\xAAV\x02\u0410\u0412\x07=\x02\x02\u0411" +
		"\u0410\x03\x02\x02\x02\u0411\u0412\x03\x02\x02\x02\u0412\u0413\x03\x02" +
		"\x02\x02\u0413\u0414\x07<\x02\x02\u0414\u0428\x03\x02\x02\x02\u0415\u0416" +
		"\x05\x92J\x02\u0416\u0417\x07;\x02\x02\u0417\u0419\x05\xACW\x02\u0418" +
		"\u041A\x07=\x02\x02\u0419\u0418\x03\x02\x02\x02\u0419\u041A\x03\x02\x02" +
		"\x02\u041A\u041B\x03\x02\x02\x02\u041B\u041C\x07<\x02\x02\u041C\u0428" +
		"\x03\x02\x02\x02\u041D\u041E\x05\x92J\x02\u041E\u041F\x07;\x02\x02\u041F" +
		"\u0420\x05\xAAV\x02\u0420\u0421\x07=\x02\x02\u0421\u0423\x05\xACW\x02" +
		"\u0422\u0424\x07=\x02\x02\u0423\u0422\x03\x02\x02\x02\u0423\u0424\x03" +
		"\x02\x02\x02\u0424\u0425\x03\x02\x02\x02\u0425\u0426\x07<\x02\x02\u0426" +
		"\u0428\x03\x02\x02\x02\u0427\u0409\x03\x02\x02\x02\u0427\u040D\x03\x02" +
		"\x02\x02\u0427\u0415\x03\x02\x02\x02\u0427\u041D\x03\x02\x02\x02\u0428" +
		"\xA9\x03\x02\x02\x02\u0429\u042E\x05r:\x02\u042A\u042B\x07=\x02\x02\u042B" +
		"\u042D\x05r:\x02\u042C\u042A\x03\x02\x02\x02\u042D\u0430\x03\x02\x02\x02" +
		"\u042E\u042C\x03\x02\x02\x02\u042E\u042F\x03\x02\x02\x02\u042F\xAB\x03" +
		"\x02\x02\x02\u0430\u042E\x03\x02\x02\x02\u0431\u0436\x05\xAEX\x02\u0432" +
		"\u0433\x07=\x02\x02\u0433\u0435\x05\xAEX\x02\u0434\u0432\x03\x02\x02\x02" +
		"\u0435\u0438\x03\x02\x02\x02\u0436\u0434\x03\x02\x02\x02\u0436\u0437\x03" +
		"\x02\x02\x02\u0437\xAD\x03\x02\x02\x02\u0438\u0436\x03\x02\x02\x02\u0439" +
		"\u043A\x05\xD8m\x02\u043A\u043B\x07A\x02\x02\u043B\u043C\x05r:\x02\u043C" +
		"\xAF\x03\x02\x02\x02\u043D\u0443\x05\xB8]\x02\u043E\u043F\x07\x1B\x02" +
		"\x02\u043F\u0440\x05\xB8]\x02\u0440\u0441\x07\x14\x02\x02\u0441\u0442" +
		"\x05\xB0Y\x02\u0442\u0444\x03\x02\x02\x02\u0443\u043E\x03\x02\x02\x02" +
		"\u0443\u0444\x03\x02\x02\x02\u0444\u0447\x03\x02\x02\x02\u0445\u0447\x05" +
		"\xB4[\x02\u0446\u043D\x03\x02\x02\x02\u0446\u0445\x03\x02\x02\x02\u0447" +
		"\xB1\x03\x02\x02\x02\u0448\u044B\x05\xB8]\x02\u0449\u044B\x05\xB6\\\x02" +
		"\u044A\u0448\x03\x02\x02\x02\u044A\u0449\x03\x02\x02\x02\u044B\xB3\x03" +
		"\x02\x02\x02\u044C\u044E\x07\x1F\x02\x02\u044D\u044F\x05\x18\r\x02\u044E" +
		"\u044D\x03\x02\x02\x02\u044E\u044F\x03\x02\x02\x02\u044F\u0450\x03\x02" +
		"\x02\x02\u0450\u0451\x07>\x02\x02\u0451\u0452\x05\xB0Y\x02\u0452\xB5\x03" +
		"\x02\x02\x02\u0453\u0455\x07\x1F\x02\x02\u0454\u0456\x05\x18\r\x02\u0455" +
		"\u0454\x03\x02\x02\x02\u0455\u0456\x03\x02\x02\x02\u0456\u0457\x03\x02" +
		"\x02\x02\u0457\u0458\x07>\x02\x02\u0458\u0459\x05\xB2Z\x02\u0459\xB7\x03" +
		"\x02\x02\x02\u045A\u045F\x05\xBA^\x02\u045B\u045C\x07$\x02\x02\u045C\u045E" +
		"\x05\xBA^\x02\u045D\u045B\x03\x02\x02\x02\u045E\u0461\x03\x02\x02\x02" +
		"\u045F\u045D\x03\x02\x02\x02\u045F\u0460\x03\x02\x02\x02\u0460\xB9\x03" +
		"\x02\x02\x02\u0461\u045F\x03\x02\x02\x02\u0462\u0467\x05\xBC_\x02\u0463" +
		"\u0464\x07\b\x02\x02\u0464\u0466\x05\xBC_\x02\u0465\u0463\x03\x02\x02" +
		"\x02\u0466\u0469\x03\x02\x02\x02\u0467\u0465\x03\x02\x02\x02\u0467\u0468" +
		"\x03\x02\x02\x02\u0468\xBB\x03\x02\x02\x02\u0469\u0467\x03\x02\x02\x02" +
		"\u046A\u046B\x07#\x02\x02\u046B\u046E\x05\xBC_\x02\u046C\u046E\x05\xBE" +
		"`\x02\u046D\u046A\x03\x02\x02\x02\u046D\u046C\x03\x02\x02\x02\u046E\xBD" +
		"\x03\x02\x02\x02\u046F\u0475\x05\xC4c\x02\u0470\u0471\x05\xC0a\x02\u0471" +
		"\u0472\x05\xC4c\x02\u0472\u0474\x03\x02\x02\x02\u0473\u0470\x03\x02\x02" +
		"\x02\u0474\u0477\x03\x02\x02\x02\u0475\u0473\x03\x02\x02\x02\u0475\u0476" +
		"\x03\x02\x02\x02\u0476\xBF\x03\x02\x02\x02\u0477\u0475\x03\x02\x02\x02" +
		"\u0478\u0486\x07Q\x02\x02\u0479\u0486\x07R\x02\x02\u047A\u0486\x07S\x02" +
		"\x02\u047B\u0486\x07T\x02\x02\u047C\u0486\x07U\x02\x02\u047D\u0486\x07" +
		"V\x02\x02\u047E\u0486\x07W\x02\x02\u047F\u0486\x07\x1D\x02\x02\u0480\u0481" +
		"\x07#\x02\x02\u0481\u0486\x07\x1D\x02\x02\u0482\u0486\x07\x1E\x02\x02" +
		"\u0483\u0484\x07\x1E\x02\x02\u0484\u0486\x07#\x02\x02\u0485\u0478\x03" +
		"\x02\x02\x02\u0485\u0479\x03\x02\x02\x02\u0485\u047A\x03\x02\x02\x02\u0485" +
		"\u047B\x03\x02\x02\x02\u0485\u047C\x03\x02\x02\x02\u0485\u047D\x03\x02" +
		"\x02\x02\u0485\u047E\x03\x02\x02\x02\u0485\u047F\x03\x02\x02\x02\u0485" +
		"\u0480\x03\x02\x02\x02\u0485\u0482\x03\x02\x02\x02\u0485\u0483\x03\x02" +
		"\x02\x02\u0486\xC1\x03\x02\x02\x02\u0487\u0488\x07:\x02\x02\u0488\u0489" +
		"\x05\xC4c\x02\u0489\xC3\x03\x02\x02\x02\u048A\u048F\x05\xC6d\x02\u048B" +
		"\u048C\x07D\x02\x02\u048C\u048E\x05\xC6d\x02\u048D\u048B\x03\x02\x02\x02" +
		"\u048E\u0491\x03\x02\x02\x02\u048F\u048D\x03\x02\x02\x02\u048F\u0490\x03" +
		"\x02\x02\x02\u0490\xC5\x03\x02\x02\x02\u0491\u048F\x03\x02\x02\x02\u0492" +
		"\u0497\x05\xC8e\x02\u0493\u0494\x07E\x02\x02\u0494\u0496\x05\xC8e\x02" +
		"\u0495\u0493\x03\x02\x02\x02\u0496\u0499\x03\x02\x02\x02\u0497\u0495\x03" +
		"\x02\x02\x02\u0497\u0498\x03\x02\x02\x02\u0498\xC7\x03\x02\x02\x02\u0499" +
		"\u0497\x03\x02\x02\x02\u049A\u049F\x05\xCAf\x02\u049B\u049C\x07F\x02\x02" +
		"\u049C\u049E\x05\xCAf\x02\u049D\u049B\x03\x02\x02\x02\u049E\u04A1\x03" +
		"\x02\x02\x02\u049F\u049D\x03\x02\x02\x02\u049F\u04A0\x03\x02\x02\x02\u04A0" +
		"\xC9\x03\x02\x02\x02\u04A1\u049F\x03\x02\x02\x02\u04A2\u04A7\x05\xCCg" +
		"\x02\u04A3\u04A4\t\x04\x02\x02\u04A4\u04A6\x05\xCCg\x02\u04A5\u04A3\x03" +
		"\x02\x02\x02\u04A6\u04A9\x03\x02\x02\x02\u04A7\u04A5\x03\x02\x02\x02\u04A7" +
		"\u04A8\x03\x02\x02\x02\u04A8\xCB\x03\x02\x02\x02\u04A9\u04A7\x03\x02\x02" +
		"\x02\u04AA\u04AF\x05\xCEh\x02\u04AB\u04AC\t\x05\x02\x02\u04AC\u04AE\x05" +
		"\xCEh\x02\u04AD\u04AB\x03\x02\x02\x02\u04AE\u04B1\x03\x02\x02\x02\u04AF" +
		"\u04AD\x03\x02\x02\x02\u04AF\u04B0\x03\x02\x02\x02\u04B0\xCD\x03\x02\x02" +
		"\x02\u04B1\u04AF\x03\x02\x02\x02\u04B2\u04B7\x05\xD0i\x02\u04B3\u04B4" +
		"\t\x06\x02\x02\u04B4\u04B6\x05\xD0i\x02\u04B5\u04B3\x03\x02\x02\x02\u04B6" +
		"\u04B9\x03\x02\x02\x02\u04B7\u04B5\x03\x02\x02\x02\u04B7\u04B8\x03\x02" +
		"\x02\x02\u04B8\xCF\x03\x02\x02\x02\u04B9\u04B7\x03\x02\x02\x02\u04BA\u04BB" +
		"\t\x07\x02\x02\u04BB\u04BE\x05\xD0i\x02\u04BC\u04BE\x05\xD2j\x02\u04BD" +
		"\u04BA\x03\x02\x02\x02\u04BD\u04BC\x03\x02\x02\x02\u04BE\xD1\x03\x02\x02" +
		"\x02\u04BF\u04C2\x05\xD4k\x02\u04C0\u04C1\x07@\x02\x02\u04C1\u04C3\x05" +
		"\xD0i\x02\u04C2\u04C0\x03\x02\x02\x02\u04C2\u04C3\x03\x02\x02\x02\u04C3" +
		"\xD3\x03\x02\x02\x02\u04C4\u04C6\x07\f\x02\x02\u04C5\u04C4\x03\x02\x02" +
		"\x02\u04C5\u04C6\x03\x02\x02\x02\u04C6\u04C7\x03\x02\x02\x02\u04C7\u04CB" +
		"\x05\xD6l\x02\u04C8\u04CA\x05\xDCo\x02\u04C9\u04C8\x03\x02\x02\x02\u04CA" +
		"\u04CD\x03\x02\x02\x02\u04CB\u04C9\x03\x02\x02\x02\u04CB\u04CC\x03\x02" +
		"\x02\x02\u04CC\xD5\x03\x02\x02\x02\u04CD\u04CB\x03\x02\x02\x02\u04CE\u04D1" +
		"\x07;\x02\x02\u04CF\u04D2\x05\xF8}\x02\u04D0\u04D2\x05\xDAn\x02\u04D1" +
		"\u04CF\x03\x02\x02\x02\u04D1\u04D0\x03\x02\x02\x02\u04D1\u04D2\x03\x02" +
		"\x02\x02\u04D2\u04D3\x03\x02\x02\x02\u04D3\u04EA\x07<\x02\x02\u04D4\u04D6" +
		"\x07B\x02\x02\u04D5\u04D7\x05\xDAn\x02\u04D6\u04D5\x03\x02\x02\x02\u04D6" +
		"\u04D7\x03\x02\x02\x02\u04D7\u04D8\x03\x02\x02\x02\u04D8\u04EA\x07C\x02" +
		"\x02\u04D9\u04DB\x07O\x02\x02\u04DA\u04DC\x05\xE8u\x02\u04DB\u04DA\x03" +
		"\x02\x02\x02\u04DB\u04DC\x03\x02\x02\x02\u04DC\u04DD\x03\x02\x02\x02\u04DD" +
		"\u04EA\x07P\x02\x02\u04DE\u04EA\x05\xD8m\x02\u04DF\u04EA\x07\x06\x02\x02" +
		"\u04E0\u04E2\x07\x05\x02\x02\u04E1\u04E0\x03\x02\x02\x02\u04E2\u04E3\x03" +
		"\x02\x02\x02\u04E3\u04E1\x03\x02\x02\x02\u04E3\u04E4\x03\x02\x02\x02\u04E4" +
		"\u04EA\x03\x02\x02\x02\u04E5\u04EA\x079\x02\x02\u04E6\u04EA\x07!\x02\x02" +
		"\u04E7\u04EA\x07(\x02\x02\u04E8\u04EA\x07\x16\x02\x02\u04E9\u04CE\x03" +
		"\x02\x02\x02\u04E9\u04D4\x03\x02\x02\x02\u04E9\u04D9\x03\x02\x02\x02\u04E9" +
		"\u04DE\x03\x02\x02\x02\u04E9\u04DF\x03\x02\x02\x02\u04E9\u04E1\x03\x02" +
		"\x02\x02\u04E9\u04E5\x03\x02\x02\x02\u04E9\u04E6\x03\x02\x02\x02\u04E9" +
		"\u04E7\x03\x02\x02\x02\u04E9\u04E8\x03\x02\x02\x02\u04EA\xD7\x03\x02\x02" +
		"\x02\u04EB\u04EC\t\b\x02\x02\u04EC\xD9\x03\x02\x02\x02\u04ED\u04F0\x05" +
		"\xB0Y\x02\u04EE\u04F0\x05\xC2b\x02\u04EF\u04ED\x03\x02\x02\x02\u04EF\u04EE" +
		"\x03\x02\x02\x02\u04F0\u04FF\x03\x02\x02\x02\u04F1\u0500\x05\xF2z\x02" +
		"\u04F2\u04F5\x07=\x02\x02\u04F3\u04F6\x05\xB0Y\x02\u04F4\u04F6\x05\xC2" +
		"b\x02\u04F5\u04F3\x03\x02\x02\x02\u04F5\u04F4\x03\x02\x02\x02\u04F6\u04F8" +
		"\x03\x02\x02\x02\u04F7\u04F2\x03\x02\x02\x02\u04F8\u04FB\x03\x02\x02\x02" +
		"\u04F9\u04F7\x03\x02\x02\x02\u04F9\u04FA\x03\x02\x02\x02\u04FA\u04FD\x03" +
		"\x02\x02\x02\u04FB\u04F9\x03\x02\x02\x02\u04FC\u04FE\x07=\x02\x02\u04FD" +
		"\u04FC\x03\x02\x02\x02\u04FD\u04FE\x03\x02\x02\x02\u04FE\u0500\x03\x02" +
		"\x02\x02\u04FF\u04F1\x03\x02\x02\x02\u04FF\u04F9\x03\x02\x02\x02\u0500" +
		"\xDB\x03\x02\x02\x02\u0501\u0503\x07;\x02\x02\u0502\u0504\x05\xECw\x02" +
		"\u0503\u0502\x03\x02\x02\x02\u0503\u0504\x03\x02\x02\x02\u0504\u0505\x03" +
		"\x02\x02\x02\u0505\u050D\x07<\x02\x02\u0506\u0507\x07B\x02\x02\u0507\u0508" +
		"\x05\xDEp\x02\u0508\u0509\x07C\x02\x02\u0509\u050D\x03\x02\x02\x02\u050A" +
		"\u050B\x078\x02\x02\u050B\u050D\x05\xD8m\x02\u050C\u0501\x03\x02\x02\x02" +
		"\u050C\u0506\x03\x02\x02\x02\u050C\u050A\x03\x02\x02\x02\u050D\xDD\x03" +
		"\x02\x02\x02\u050E\u0513\x05\xE0q\x02\u050F\u0510\x07=\x02\x02\u0510\u0512" +
		"\x05\xE0q\x02\u0511\u050F\x03\x02\x02\x02\u0512\u0515\x03\x02\x02\x02" +
		"\u0513\u0511\x03\x02\x02\x02\u0513\u0514\x03\x02\x02\x02\u0514\u0517\x03" +
		"\x02\x02\x02\u0515\u0513\x03\x02\x02\x02\u0516\u0518\x07=\x02\x02\u0517" +
		"\u0516\x03\x02\x02\x02\u0517\u0518\x03\x02\x02\x02\u0518\xDF\x03\x02\x02" +
		"\x02\u0519\u0525\x05\xB0Y\x02\u051A\u051C\x05\xB0Y\x02\u051B\u051A\x03" +
		"\x02\x02\x02\u051B\u051C\x03\x02\x02\x02\u051C\u051D\x03\x02\x02\x02\u051D" +
		"\u051F\x07>\x02\x02\u051E\u0520\x05\xB0Y\x02\u051F\u051E\x03\x02\x02\x02" +
		"\u051F\u0520\x03\x02\x02\x02\u0520\u0522\x03\x02\x02\x02\u0521\u0523\x05" +
		"\xE2r\x02\u0522\u0521\x03\x02\x02\x02\u0522\u0523\x03\x02\x02\x02\u0523" +
		"\u0525\x03\x02\x02\x02\u0524\u0519\x03\x02\x02\x02\u0524\u051B\x03\x02" +
		"\x02\x02\u0525\xE1\x03\x02\x02\x02\u0526\u0528\x07>\x02\x02\u0527\u0529" +
		"\x05\xB0Y\x02\u0528\u0527\x03\x02\x02\x02\u0528\u0529\x03\x02\x02\x02" +
		"\u0529\xE3\x03\x02\x02\x02\u052A\u052D\x05\xC4c\x02\u052B\u052D\x05\xC2" +
		"b\x02\u052C\u052A\x03\x02\x02\x02\u052C\u052B\x03\x02\x02\x02\u052D\u0535" +
		"\x03\x02\x02\x02\u052E\u0531\x07=\x02\x02\u052F\u0532\x05\xC4c\x02\u0530" +
		"\u0532\x05\xC2b\x02\u0531\u052F\x03\x02\x02\x02\u0531\u0530\x03\x02\x02" +
		"\x02\u0532\u0534\x03\x02\x02\x02\u0533\u052E\x03\x02\x02\x02\u0534\u0537" +
		"\x03\x02\x02\x02\u0535\u0533\x03\x02\x02\x02\u0535\u0536\x03\x02\x02\x02" +
		"\u0536\u0539\x03\x02\x02\x02\u0537\u0535\x03\x02\x02\x02\u0538\u053A\x07" +
		"=\x02\x02\u0539\u0538\x03\x02\x02\x02\u0539\u053A\x03\x02\x02\x02\u053A" +
		"\xE5\x03\x02\x02\x02\u053B\u0540\x05\xB0Y\x02\u053C\u053D\x07=\x02\x02" +
		"\u053D\u053F\x05\xB0Y\x02\u053E\u053C\x03\x02\x02\x02\u053F\u0542\x03" +
		"\x02\x02\x02\u0540\u053E\x03\x02\x02\x02\u0540\u0541\x03\x02\x02\x02\u0541" +
		"\u0544\x03\x02\x02\x02\u0542\u0540\x03\x02\x02\x02\u0543\u0545\x07=\x02" +
		"\x02\u0544\u0543\x03\x02\x02\x02\u0544\u0545\x03\x02\x02\x02\u0545\xE7" +
		"\x03\x02\x02\x02\u0546\u0547\x05\xB0Y\x02\u0547\u0548\x07>\x02\x02\u0548" +
		"\u0549\x05\xB0Y\x02\u0549\u054D\x03\x02\x02\x02\u054A\u054B\x07@\x02\x02" +
		"\u054B\u054D\x05\xC4c\x02\u054C\u0546\x03\x02\x02\x02\u054C\u054A\x03" +
		"\x02\x02\x02\u054D\u0560\x03\x02\x02\x02\u054E\u0561\x05\xF2z\x02\u054F" +
		"\u0556\x07=\x02\x02\u0550\u0551\x05\xB0Y\x02\u0551\u0552\x07>\x02\x02" +
		"\u0552\u0553\x05\xB0Y\x02\u0553\u0557\x03\x02\x02\x02\u0554\u0555\x07" +
		"@\x02\x02\u0555\u0557\x05\xC4c\x02\u0556\u0550\x03\x02\x02\x02\u0556\u0554" +
		"\x03\x02\x02\x02\u0557\u0559\x03\x02\x02\x02\u0558\u054F\x03\x02\x02\x02" +
		"\u0559\u055C\x03\x02\x02\x02\u055A\u0558\x03\x02\x02\x02\u055A\u055B\x03" +
		"\x02\x02\x02\u055B\u055E\x03\x02\x02\x02\u055C\u055A\x03\x02\x02\x02\u055D" +
		"\u055F\x07=\x02\x02\u055E\u055D\x03\x02\x02\x02\u055E\u055F\x03\x02\x02" +
		"\x02\u055F\u0561\x03\x02\x02\x02\u0560\u054E\x03\x02\x02\x02\u0560\u055A" +
		"\x03\x02\x02\x02\u0561\u0577\x03\x02\x02\x02\u0562\u0565\x05\xB0Y\x02" +
		"\u0563\u0565\x05\xC2b\x02\u0564\u0562\x03\x02\x02\x02\u0564\u0563\x03" +
		"\x02\x02\x02\u0565\u0574\x03\x02\x02\x02\u0566\u0575\x05\xF2z\x02\u0567" +
		"\u056A\x07=\x02\x02\u0568\u056B\x05\xB0Y\x02\u0569\u056B\x05\xC2b\x02" +
		"\u056A\u0568\x03\x02\x02\x02\u056A\u0569\x03\x02\x02\x02\u056B\u056D\x03" +
		"\x02\x02\x02\u056C\u0567\x03\x02\x02\x02\u056D\u0570\x03\x02\x02\x02\u056E" +
		"\u056C\x03\x02\x02\x02\u056E\u056F\x03\x02\x02\x02\u056F\u0572\x03\x02" +
		"\x02\x02\u0570\u056E\x03\x02\x02\x02\u0571\u0573\x07=\x02\x02\u0572\u0571" +
		"\x03\x02\x02\x02\u0572\u0573\x03\x02\x02\x02\u0573\u0575\x03\x02\x02\x02" +
		"\u0574\u0566\x03\x02\x02\x02\u0574\u056E\x03\x02\x02\x02\u0575\u0577\x03" +
		"\x02\x02\x02\u0576\u054C\x03\x02\x02\x02\u0576\u0564\x03\x02\x02\x02\u0577" +
		"\xE9\x03\x02\x02\x02\u0578\u0579\x07\x0F\x02\x02\u0579\u057F\x05\xD8m" +
		"\x02\u057A\u057C\x07;\x02\x02\u057B\u057D\x05\xECw\x02\u057C\u057B\x03" +
		"\x02\x02\x02\u057C\u057D\x03\x02\x02\x02\u057D\u057E\x03\x02\x02\x02\u057E" +
		"\u0580\x07<\x02\x02\u057F\u057A\x03\x02\x02\x02\u057F\u0580\x03\x02\x02" +
		"\x02\u0580\u0581\x03\x02\x02\x02\u0581\u0582\x07>\x02\x02\u0582\u0583" +
		"\x05b2\x02\u0583\xEB\x03\x02\x02\x02\u0584\u0589\x05\xEEx\x02\u0585\u0586" +
		"\x07=\x02\x02\u0586\u0588\x05\xEEx\x02\u0587\u0585\x03\x02\x02\x02\u0588" +
		"\u058B\x03\x02\x02\x02\u0589\u0587\x03\x02\x02\x02\u0589\u058A\x03\x02" +
		"\x02\x02\u058A\u058D\x03\x02\x02\x02\u058B\u0589\x03\x02\x02\x02\u058C" +
		"\u058E\x07=\x02\x02\u058D\u058C\x03\x02\x02\x02\u058D\u058E\x03\x02\x02" +
		"\x02\u058E\xED\x03\x02\x02\x02\u058F\u0591\x05\xB0Y\x02\u0590\u0592\x05" +
		"\xF2z\x02\u0591\u0590\x03\x02\x02\x02\u0591\u0592\x03\x02\x02\x02\u0592" +
		"\u059C\x03\x02\x02\x02\u0593\u0594\x05\xB0Y\x02\u0594\u0595\x07A\x02\x02" +
		"\u0595\u0596\x05\xB0Y\x02\u0596\u059C\x03\x02\x02\x02\u0597\u0598\x07" +
		"@\x02\x02\u0598\u059C\x05\xB0Y\x02\u0599\u059A\x07:\x02\x02\u059A\u059C" +
		"\x05\xB0Y\x02\u059B\u058F\x03\x02\x02\x02\u059B\u0593\x03\x02\x02\x02" +
		"\u059B\u0597\x03\x02\x02\x02\u059B\u0599\x03\x02\x02\x02\u059C\xEF\x03" +
		"\x02\x02\x02\u059D\u05A0\x05\xF2z\x02\u059E\u05A0\x05\xF4{\x02\u059F\u059D" +
		"\x03\x02\x02\x02\u059F\u059E\x03\x02\x02\x02\u05A0\xF1\x03\x02\x02\x02" +
		"\u05A1\u05A3\x07\v\x02\x02\u05A2\u05A1\x03\x02\x02\x02\u05A2\u05A3\x03" +
		"\x02\x02\x02\u05A3\u05A4\x03\x02\x02\x02\u05A4\u05A5\x07\x18\x02\x02\u05A5" +
		"\u05A6\x05\xE4s\x02\u05A6\u05A7\x07\x1D\x02\x02\u05A7\u05A9\x05\xB8]\x02" +
		"\u05A8\u05AA\x05\xF0y\x02\u05A9\u05A8\x03\x02\x02\x02\u05A9\u05AA\x03" +
		"\x02\x02\x02\u05AA\xF3\x03\x02\x02\x02\u05AB\u05AC\x07\x1B\x02\x02\u05AC" +
		"\u05AE\x05\xB2Z\x02\u05AD\u05AF\x05\xF0y\x02\u05AE\u05AD\x03\x02\x02\x02" +
		"\u05AE\u05AF\x03\x02\x02\x02\u05AF\xF5\x03\x02\x02\x02\u05B0\u05B1\x05" +
		"\xD8m\x02\u05B1\xF7\x03\x02\x02\x02\u05B2\u05B4\x07-\x02\x02\u05B3\u05B5" +
		"\x05\xFA~\x02\u05B4\u05B3\x03\x02\x02\x02\u05B4\u05B5\x03\x02\x02\x02" +
		"\u05B5\xF9\x03\x02\x02\x02\u05B6\u05B7\x07\x19\x02\x02\u05B7\u05BA\x05" +
		"\xB0Y\x02\u05B8\u05BA\x05\xE6t\x02\u05B9\u05B6\x03\x02\x02\x02\u05B9\u05B8" +
		"\x03\x02\x02\x02\u05BA\xFB\x03\x02\x02\x02\u05BB\u05BD\x07\x05\x02\x02" +
		"\u05BC\u05BB\x03\x02\x02\x02\u05BD\u05BE\x03\x02\x02\x02\u05BE\u05BC\x03" +
		"\x02\x02\x02\u05BE\u05BF\x03\x02\x02\x02\u05BF\xFD\x03\x02\x02\x02\xCF" +
		"\u0103\u0107\u0109\u0112\u011B\u011E\u0125\u012B\u0135\u013C\u0143\u0149" +
		"\u014D\u0153\u0159\u015D\u0164\u0166\u0168\u016D\u016F\u0171\u0175\u017B" +
		"\u017F\u0186\u0188\u018A\u018F\u0191\u0196\u019B\u01A1\u01A5\u01AB\u01B1" +
		"\u01B5\u01BC\u01BE\u01C0\u01C5\u01C7\u01C9\u01CD\u01D3\u01D7\u01DE\u01E0" +
		"\u01E2\u01E7\u01E9\u01EF\u01F6\u01FA\u0206\u020D\u0212\u0216\u0219\u021F" +
		"\u0223\u0228\u022C\u0230\u023E\u0246\u024E\u0250\u0254\u025D\u0264\u0266" +
		"\u026F\u0274\u0279\u0280\u0284\u028B\u0293\u029C\u02A5\u02AC\u02B8\u02BE" +
		"\u02CB\u02D1\u02DA\u02E5\u02F0\u02F5\u02FA\u02FF\u0307\u0310\u0316\u0318" +
		"\u0320\u0324\u032E\u0335\u0338\u033E\u0341\u0346\u034B\u0355\u0359\u0364" +
		"\u036F\u0379\u0383\u038D\u0392\u0397\u03AC\u03B0\u03B8\u03BD\u03C0\u03C5" +
		"\u03CC\u03D0\u03D4\u03DA\u03E1\u03EA\u03F1\u03F5\u03FC\u0401\u0411\u0419" +
		"\u0423\u0427\u042E\u0436\u0443\u0446\u044A\u044E\u0455\u045F\u0467\u046D" +
		"\u0475\u0485\u048F\u0497\u049F\u04A7\u04AF\u04B7\u04BD\u04C2\u04C5\u04CB" +
		"\u04D1\u04D6\u04DB\u04E3\u04E9\u04EF\u04F5\u04F9\u04FD\u04FF\u0503\u050C" +
		"\u0513\u0517\u051B\u051F\u0522\u0524\u0528\u052C\u0531\u0535\u0539\u0540" +
		"\u0544\u054C\u0556\u055A\u055E\u0560\u0564\u056A\u056E\u0572\u0574\u0576" +
		"\u057C\u057F\u0589\u058D\u0591\u059B\u059F\u05A2\u05A9\u05AE\u05B4\u05B9" +
		"\u05BE";
	public static readonly _serializedATN: string = Utils.join(
		[
			Python3Parser._serializedATNSegment0,
			Python3Parser._serializedATNSegment1,
			Python3Parser._serializedATNSegment2,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!Python3Parser.__ATN) {
			Python3Parser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(Python3Parser._serializedATN));
		}

		return Python3Parser.__ATN;
	}

}

export class Single_inputContext extends ParserRuleContext {
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NEWLINE, 0); }
	public simple_stmts(): Simple_stmtsContext | undefined {
		return this.tryGetRuleContext(0, Simple_stmtsContext);
	}
	public compound_stmt(): Compound_stmtContext | undefined {
		return this.tryGetRuleContext(0, Compound_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_single_input; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSingle_input) {
			listener.enterSingle_input(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSingle_input) {
			listener.exitSingle_input(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSingle_input) {
			return visitor.visitSingle_input(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class File_inputContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(Python3Parser.EOF, 0); }
	public NEWLINE(): TerminalNode[];
	public NEWLINE(i: number): TerminalNode;
	public NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.NEWLINE);
		} else {
			return this.getToken(Python3Parser.NEWLINE, i);
		}
	}
	public stmt(): StmtContext[];
	public stmt(i: number): StmtContext;
	public stmt(i?: number): StmtContext | StmtContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StmtContext);
		} else {
			return this.getRuleContext(i, StmtContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_file_input; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterFile_input) {
			listener.enterFile_input(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitFile_input) {
			listener.exitFile_input(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitFile_input) {
			return visitor.visitFile_input(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Eval_inputContext extends ParserRuleContext {
	public testlist(): TestlistContext {
		return this.getRuleContext(0, TestlistContext);
	}
	public EOF(): TerminalNode { return this.getToken(Python3Parser.EOF, 0); }
	public NEWLINE(): TerminalNode[];
	public NEWLINE(i: number): TerminalNode;
	public NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.NEWLINE);
		} else {
			return this.getToken(Python3Parser.NEWLINE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_eval_input; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterEval_input) {
			listener.enterEval_input(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitEval_input) {
			listener.exitEval_input(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitEval_input) {
			return visitor.visitEval_input(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DecoratorContext extends ParserRuleContext {
	public AT(): TerminalNode { return this.getToken(Python3Parser.AT, 0); }
	public dotted_name(): Dotted_nameContext {
		return this.getRuleContext(0, Dotted_nameContext);
	}
	public NEWLINE(): TerminalNode { return this.getToken(Python3Parser.NEWLINE, 0); }
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public arglist(): ArglistContext | undefined {
		return this.tryGetRuleContext(0, ArglistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_decorator; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDecorator) {
			listener.enterDecorator(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDecorator) {
			listener.exitDecorator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDecorator) {
			return visitor.visitDecorator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DecoratorsContext extends ParserRuleContext {
	public decorator(): DecoratorContext[];
	public decorator(i: number): DecoratorContext;
	public decorator(i?: number): DecoratorContext | DecoratorContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DecoratorContext);
		} else {
			return this.getRuleContext(i, DecoratorContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_decorators; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDecorators) {
			listener.enterDecorators(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDecorators) {
			listener.exitDecorators(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDecorators) {
			return visitor.visitDecorators(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DecoratedContext extends ParserRuleContext {
	public decorators(): DecoratorsContext {
		return this.getRuleContext(0, DecoratorsContext);
	}
	public classdef(): ClassdefContext | undefined {
		return this.tryGetRuleContext(0, ClassdefContext);
	}
	public funcdef(): FuncdefContext | undefined {
		return this.tryGetRuleContext(0, FuncdefContext);
	}
	public async_funcdef(): Async_funcdefContext | undefined {
		return this.tryGetRuleContext(0, Async_funcdefContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_decorated; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDecorated) {
			listener.enterDecorated(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDecorated) {
			listener.exitDecorated(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDecorated) {
			return visitor.visitDecorated(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Async_funcdefContext extends ParserRuleContext {
	public ASYNC(): TerminalNode { return this.getToken(Python3Parser.ASYNC, 0); }
	public funcdef(): FuncdefContext {
		return this.getRuleContext(0, FuncdefContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_async_funcdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAsync_funcdef) {
			listener.enterAsync_funcdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAsync_funcdef) {
			listener.exitAsync_funcdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAsync_funcdef) {
			return visitor.visitAsync_funcdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FuncdefContext extends ParserRuleContext {
	public DEF(): TerminalNode { return this.getToken(Python3Parser.DEF, 0); }
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	public parameters(): ParametersContext {
		return this.getRuleContext(0, ParametersContext);
	}
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public block(): BlockContext {
		return this.getRuleContext(0, BlockContext);
	}
	public ARROW(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ARROW, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_funcdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterFuncdef) {
			listener.enterFuncdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitFuncdef) {
			listener.exitFuncdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitFuncdef) {
			return visitor.visitFuncdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametersContext extends ParserRuleContext {
	public OPEN_PAREN(): TerminalNode { return this.getToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode { return this.getToken(Python3Parser.CLOSE_PAREN, 0); }
	public typedargslist(): TypedargslistContext | undefined {
		return this.tryGetRuleContext(0, TypedargslistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_parameters; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterParameters) {
			listener.enterParameters(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitParameters) {
			listener.exitParameters(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitParameters) {
			return visitor.visitParameters(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypedargslistContext extends ParserRuleContext {
	public tfpdef(): TfpdefContext[];
	public tfpdef(i: number): TfpdefContext;
	public tfpdef(i?: number): TfpdefContext | TfpdefContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TfpdefContext);
		} else {
			return this.getRuleContext(i, TfpdefContext);
		}
	}
	public STAR(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.STAR, 0); }
	public POWER(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.POWER, 0); }
	public ASSIGN(): TerminalNode[];
	public ASSIGN(i: number): TerminalNode;
	public ASSIGN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ASSIGN);
		} else {
			return this.getToken(Python3Parser.ASSIGN, i);
		}
	}
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_typedargslist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTypedargslist) {
			listener.enterTypedargslist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTypedargslist) {
			listener.exitTypedargslist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTypedargslist) {
			return visitor.visitTypedargslist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TfpdefContext extends ParserRuleContext {
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	public COLON(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.COLON, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_tfpdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTfpdef) {
			listener.enterTfpdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTfpdef) {
			listener.exitTfpdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTfpdef) {
			return visitor.visitTfpdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VarargslistContext extends ParserRuleContext {
	public vfpdef(): VfpdefContext[];
	public vfpdef(i: number): VfpdefContext;
	public vfpdef(i?: number): VfpdefContext | VfpdefContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VfpdefContext);
		} else {
			return this.getRuleContext(i, VfpdefContext);
		}
	}
	public STAR(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.STAR, 0); }
	public POWER(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.POWER, 0); }
	public ASSIGN(): TerminalNode[];
	public ASSIGN(i: number): TerminalNode;
	public ASSIGN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ASSIGN);
		} else {
			return this.getToken(Python3Parser.ASSIGN, i);
		}
	}
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_varargslist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterVarargslist) {
			listener.enterVarargslist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitVarargslist) {
			listener.exitVarargslist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitVarargslist) {
			return visitor.visitVarargslist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VfpdefContext extends ParserRuleContext {
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_vfpdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterVfpdef) {
			listener.enterVfpdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitVfpdef) {
			listener.exitVfpdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitVfpdef) {
			return visitor.visitVfpdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StmtContext extends ParserRuleContext {
	public simple_stmts(): Simple_stmtsContext | undefined {
		return this.tryGetRuleContext(0, Simple_stmtsContext);
	}
	public compound_stmt(): Compound_stmtContext | undefined {
		return this.tryGetRuleContext(0, Compound_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStmt) {
			listener.enterStmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStmt) {
			listener.exitStmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStmt) {
			return visitor.visitStmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_stmtsContext extends ParserRuleContext {
	public simple_stmt(): Simple_stmtContext[];
	public simple_stmt(i: number): Simple_stmtContext;
	public simple_stmt(i?: number): Simple_stmtContext | Simple_stmtContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Simple_stmtContext);
		} else {
			return this.getRuleContext(i, Simple_stmtContext);
		}
	}
	public NEWLINE(): TerminalNode { return this.getToken(Python3Parser.NEWLINE, 0); }
	public SEMI_COLON(): TerminalNode[];
	public SEMI_COLON(i: number): TerminalNode;
	public SEMI_COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.SEMI_COLON);
		} else {
			return this.getToken(Python3Parser.SEMI_COLON, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_simple_stmts; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSimple_stmts) {
			listener.enterSimple_stmts(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSimple_stmts) {
			listener.exitSimple_stmts(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSimple_stmts) {
			return visitor.visitSimple_stmts(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_stmtContext extends ParserRuleContext {
	public expr_stmt(): Expr_stmtContext | undefined {
		return this.tryGetRuleContext(0, Expr_stmtContext);
	}
	public del_stmt(): Del_stmtContext | undefined {
		return this.tryGetRuleContext(0, Del_stmtContext);
	}
	public pass_stmt(): Pass_stmtContext | undefined {
		return this.tryGetRuleContext(0, Pass_stmtContext);
	}
	public flow_stmt(): Flow_stmtContext | undefined {
		return this.tryGetRuleContext(0, Flow_stmtContext);
	}
	public import_stmt(): Import_stmtContext | undefined {
		return this.tryGetRuleContext(0, Import_stmtContext);
	}
	public global_stmt(): Global_stmtContext | undefined {
		return this.tryGetRuleContext(0, Global_stmtContext);
	}
	public nonlocal_stmt(): Nonlocal_stmtContext | undefined {
		return this.tryGetRuleContext(0, Nonlocal_stmtContext);
	}
	public assert_stmt(): Assert_stmtContext | undefined {
		return this.tryGetRuleContext(0, Assert_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_simple_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSimple_stmt) {
			listener.enterSimple_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSimple_stmt) {
			listener.exitSimple_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSimple_stmt) {
			return visitor.visitSimple_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Expr_stmtContext extends ParserRuleContext {
	public testlist_star_expr(): Testlist_star_exprContext[];
	public testlist_star_expr(i: number): Testlist_star_exprContext;
	public testlist_star_expr(i?: number): Testlist_star_exprContext | Testlist_star_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Testlist_star_exprContext);
		} else {
			return this.getRuleContext(i, Testlist_star_exprContext);
		}
	}
	public annassign(): AnnassignContext | undefined {
		return this.tryGetRuleContext(0, AnnassignContext);
	}
	public augassign(): AugassignContext | undefined {
		return this.tryGetRuleContext(0, AugassignContext);
	}
	public yield_expr(): Yield_exprContext[];
	public yield_expr(i: number): Yield_exprContext;
	public yield_expr(i?: number): Yield_exprContext | Yield_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Yield_exprContext);
		} else {
			return this.getRuleContext(i, Yield_exprContext);
		}
	}
	public testlist(): TestlistContext | undefined {
		return this.tryGetRuleContext(0, TestlistContext);
	}
	public ASSIGN(): TerminalNode[];
	public ASSIGN(i: number): TerminalNode;
	public ASSIGN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ASSIGN);
		} else {
			return this.getToken(Python3Parser.ASSIGN, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_expr_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterExpr_stmt) {
			listener.enterExpr_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitExpr_stmt) {
			listener.exitExpr_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitExpr_stmt) {
			return visitor.visitExpr_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AnnassignContext extends ParserRuleContext {
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ASSIGN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_annassign; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAnnassign) {
			listener.enterAnnassign(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAnnassign) {
			listener.exitAnnassign(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAnnassign) {
			return visitor.visitAnnassign(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Testlist_star_exprContext extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public star_expr(): Star_exprContext[];
	public star_expr(i: number): Star_exprContext;
	public star_expr(i?: number): Star_exprContext | Star_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Star_exprContext);
		} else {
			return this.getRuleContext(i, Star_exprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_testlist_star_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTestlist_star_expr) {
			listener.enterTestlist_star_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTestlist_star_expr) {
			listener.exitTestlist_star_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTestlist_star_expr) {
			return visitor.visitTestlist_star_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AugassignContext extends ParserRuleContext {
	public ADD_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ADD_ASSIGN, 0); }
	public SUB_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.SUB_ASSIGN, 0); }
	public MULT_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MULT_ASSIGN, 0); }
	public AT_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AT_ASSIGN, 0); }
	public DIV_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.DIV_ASSIGN, 0); }
	public MOD_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MOD_ASSIGN, 0); }
	public AND_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AND_ASSIGN, 0); }
	public OR_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OR_ASSIGN, 0); }
	public XOR_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.XOR_ASSIGN, 0); }
	public LEFT_SHIFT_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.LEFT_SHIFT_ASSIGN, 0); }
	public RIGHT_SHIFT_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.RIGHT_SHIFT_ASSIGN, 0); }
	public POWER_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.POWER_ASSIGN, 0); }
	public IDIV_ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.IDIV_ASSIGN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_augassign; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAugassign) {
			listener.enterAugassign(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAugassign) {
			listener.exitAugassign(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAugassign) {
			return visitor.visitAugassign(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Del_stmtContext extends ParserRuleContext {
	public DEL(): TerminalNode { return this.getToken(Python3Parser.DEL, 0); }
	public exprlist(): ExprlistContext {
		return this.getRuleContext(0, ExprlistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_del_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDel_stmt) {
			listener.enterDel_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDel_stmt) {
			listener.exitDel_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDel_stmt) {
			return visitor.visitDel_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Pass_stmtContext extends ParserRuleContext {
	public PASS(): TerminalNode { return this.getToken(Python3Parser.PASS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_pass_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPass_stmt) {
			listener.enterPass_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPass_stmt) {
			listener.exitPass_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPass_stmt) {
			return visitor.visitPass_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Flow_stmtContext extends ParserRuleContext {
	public break_stmt(): Break_stmtContext | undefined {
		return this.tryGetRuleContext(0, Break_stmtContext);
	}
	public continue_stmt(): Continue_stmtContext | undefined {
		return this.tryGetRuleContext(0, Continue_stmtContext);
	}
	public return_stmt(): Return_stmtContext | undefined {
		return this.tryGetRuleContext(0, Return_stmtContext);
	}
	public raise_stmt(): Raise_stmtContext | undefined {
		return this.tryGetRuleContext(0, Raise_stmtContext);
	}
	public yield_stmt(): Yield_stmtContext | undefined {
		return this.tryGetRuleContext(0, Yield_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_flow_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterFlow_stmt) {
			listener.enterFlow_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitFlow_stmt) {
			listener.exitFlow_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitFlow_stmt) {
			return visitor.visitFlow_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Break_stmtContext extends ParserRuleContext {
	public BREAK(): TerminalNode { return this.getToken(Python3Parser.BREAK, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_break_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterBreak_stmt) {
			listener.enterBreak_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitBreak_stmt) {
			listener.exitBreak_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitBreak_stmt) {
			return visitor.visitBreak_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Continue_stmtContext extends ParserRuleContext {
	public CONTINUE(): TerminalNode { return this.getToken(Python3Parser.CONTINUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_continue_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterContinue_stmt) {
			listener.enterContinue_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitContinue_stmt) {
			listener.exitContinue_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitContinue_stmt) {
			return visitor.visitContinue_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Return_stmtContext extends ParserRuleContext {
	public RETURN(): TerminalNode { return this.getToken(Python3Parser.RETURN, 0); }
	public testlist(): TestlistContext | undefined {
		return this.tryGetRuleContext(0, TestlistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_return_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterReturn_stmt) {
			listener.enterReturn_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitReturn_stmt) {
			listener.exitReturn_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitReturn_stmt) {
			return visitor.visitReturn_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Yield_stmtContext extends ParserRuleContext {
	public yield_expr(): Yield_exprContext {
		return this.getRuleContext(0, Yield_exprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_yield_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterYield_stmt) {
			listener.enterYield_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitYield_stmt) {
			listener.exitYield_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitYield_stmt) {
			return visitor.visitYield_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Raise_stmtContext extends ParserRuleContext {
	public RAISE(): TerminalNode { return this.getToken(Python3Parser.RAISE, 0); }
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public FROM(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FROM, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_raise_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterRaise_stmt) {
			listener.enterRaise_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitRaise_stmt) {
			listener.exitRaise_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitRaise_stmt) {
			return visitor.visitRaise_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_stmtContext extends ParserRuleContext {
	public import_name(): Import_nameContext | undefined {
		return this.tryGetRuleContext(0, Import_nameContext);
	}
	public import_from(): Import_fromContext | undefined {
		return this.tryGetRuleContext(0, Import_fromContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_import_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImport_stmt) {
			listener.enterImport_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImport_stmt) {
			listener.exitImport_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImport_stmt) {
			return visitor.visitImport_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_nameContext extends ParserRuleContext {
	public IMPORT(): TerminalNode { return this.getToken(Python3Parser.IMPORT, 0); }
	public dotted_as_names(): Dotted_as_namesContext {
		return this.getRuleContext(0, Dotted_as_namesContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_import_name; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImport_name) {
			listener.enterImport_name(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImport_name) {
			listener.exitImport_name(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImport_name) {
			return visitor.visitImport_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_fromContext extends ParserRuleContext {
	public FROM(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FROM, 0); }
	public IMPORT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.IMPORT, 0); }
	public dotted_name(): Dotted_nameContext | undefined {
		return this.tryGetRuleContext(0, Dotted_nameContext);
	}
	public STAR(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.STAR, 0); }
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public import_as_names(): Import_as_namesContext | undefined {
		return this.tryGetRuleContext(0, Import_as_namesContext);
	}
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.DOT);
		} else {
			return this.getToken(Python3Parser.DOT, i);
		}
	}
	public ELLIPSIS(): TerminalNode[];
	public ELLIPSIS(i: number): TerminalNode;
	public ELLIPSIS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ELLIPSIS);
		} else {
			return this.getToken(Python3Parser.ELLIPSIS, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_import_from; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImport_from) {
			listener.enterImport_from(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImport_from) {
			listener.exitImport_from(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImport_from) {
			return visitor.visitImport_from(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_as_nameContext extends ParserRuleContext {
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_import_as_name; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImport_as_name) {
			listener.enterImport_as_name(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImport_as_name) {
			listener.exitImport_as_name(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImport_as_name) {
			return visitor.visitImport_as_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Dotted_as_nameContext extends ParserRuleContext {
	public dotted_name(): Dotted_nameContext {
		return this.getRuleContext(0, Dotted_nameContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AS, 0); }
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_dotted_as_name; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDotted_as_name) {
			listener.enterDotted_as_name(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDotted_as_name) {
			listener.exitDotted_as_name(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDotted_as_name) {
			return visitor.visitDotted_as_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_as_namesContext extends ParserRuleContext {
	public import_as_name(): Import_as_nameContext[];
	public import_as_name(i: number): Import_as_nameContext;
	public import_as_name(i?: number): Import_as_nameContext | Import_as_nameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Import_as_nameContext);
		} else {
			return this.getRuleContext(i, Import_as_nameContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_import_as_names; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImport_as_names) {
			listener.enterImport_as_names(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImport_as_names) {
			listener.exitImport_as_names(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImport_as_names) {
			return visitor.visitImport_as_names(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Dotted_as_namesContext extends ParserRuleContext {
	public dotted_as_name(): Dotted_as_nameContext[];
	public dotted_as_name(i: number): Dotted_as_nameContext;
	public dotted_as_name(i?: number): Dotted_as_nameContext | Dotted_as_nameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Dotted_as_nameContext);
		} else {
			return this.getRuleContext(i, Dotted_as_nameContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_dotted_as_names; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDotted_as_names) {
			listener.enterDotted_as_names(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDotted_as_names) {
			listener.exitDotted_as_names(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDotted_as_names) {
			return visitor.visitDotted_as_names(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Dotted_nameContext extends ParserRuleContext {
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.DOT);
		} else {
			return this.getToken(Python3Parser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_dotted_name; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDotted_name) {
			listener.enterDotted_name(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDotted_name) {
			listener.exitDotted_name(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDotted_name) {
			return visitor.visitDotted_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Global_stmtContext extends ParserRuleContext {
	public GLOBAL(): TerminalNode { return this.getToken(Python3Parser.GLOBAL, 0); }
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_global_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterGlobal_stmt) {
			listener.enterGlobal_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitGlobal_stmt) {
			listener.exitGlobal_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitGlobal_stmt) {
			return visitor.visitGlobal_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Nonlocal_stmtContext extends ParserRuleContext {
	public NONLOCAL(): TerminalNode { return this.getToken(Python3Parser.NONLOCAL, 0); }
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_nonlocal_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterNonlocal_stmt) {
			listener.enterNonlocal_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitNonlocal_stmt) {
			listener.exitNonlocal_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitNonlocal_stmt) {
			return visitor.visitNonlocal_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assert_stmtContext extends ParserRuleContext {
	public ASSERT(): TerminalNode { return this.getToken(Python3Parser.ASSERT, 0); }
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COMMA(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.COMMA, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_assert_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAssert_stmt) {
			listener.enterAssert_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAssert_stmt) {
			listener.exitAssert_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAssert_stmt) {
			return visitor.visitAssert_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_stmtContext extends ParserRuleContext {
	public if_stmt(): If_stmtContext | undefined {
		return this.tryGetRuleContext(0, If_stmtContext);
	}
	public while_stmt(): While_stmtContext | undefined {
		return this.tryGetRuleContext(0, While_stmtContext);
	}
	public for_stmt(): For_stmtContext | undefined {
		return this.tryGetRuleContext(0, For_stmtContext);
	}
	public try_stmt(): Try_stmtContext | undefined {
		return this.tryGetRuleContext(0, Try_stmtContext);
	}
	public with_stmt(): With_stmtContext | undefined {
		return this.tryGetRuleContext(0, With_stmtContext);
	}
	public funcdef(): FuncdefContext | undefined {
		return this.tryGetRuleContext(0, FuncdefContext);
	}
	public classdef(): ClassdefContext | undefined {
		return this.tryGetRuleContext(0, ClassdefContext);
	}
	public decorated(): DecoratedContext | undefined {
		return this.tryGetRuleContext(0, DecoratedContext);
	}
	public async_stmt(): Async_stmtContext | undefined {
		return this.tryGetRuleContext(0, Async_stmtContext);
	}
	public match_stmt(): Match_stmtContext | undefined {
		return this.tryGetRuleContext(0, Match_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_compound_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterCompound_stmt) {
			listener.enterCompound_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitCompound_stmt) {
			listener.exitCompound_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitCompound_stmt) {
			return visitor.visitCompound_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Async_stmtContext extends ParserRuleContext {
	public ASYNC(): TerminalNode { return this.getToken(Python3Parser.ASYNC, 0); }
	public funcdef(): FuncdefContext | undefined {
		return this.tryGetRuleContext(0, FuncdefContext);
	}
	public with_stmt(): With_stmtContext | undefined {
		return this.tryGetRuleContext(0, With_stmtContext);
	}
	public for_stmt(): For_stmtContext | undefined {
		return this.tryGetRuleContext(0, For_stmtContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_async_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAsync_stmt) {
			listener.enterAsync_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAsync_stmt) {
			listener.exitAsync_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAsync_stmt) {
			return visitor.visitAsync_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class If_stmtContext extends ParserRuleContext {
	public IF(): TerminalNode { return this.getToken(Python3Parser.IF, 0); }
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COLON);
		} else {
			return this.getToken(Python3Parser.COLON, i);
		}
	}
	public block(): BlockContext[];
	public block(i: number): BlockContext;
	public block(i?: number): BlockContext | BlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BlockContext);
		} else {
			return this.getRuleContext(i, BlockContext);
		}
	}
	public ELIF(): TerminalNode[];
	public ELIF(i: number): TerminalNode;
	public ELIF(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ELIF);
		} else {
			return this.getToken(Python3Parser.ELIF, i);
		}
	}
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_if_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterIf_stmt) {
			listener.enterIf_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitIf_stmt) {
			listener.exitIf_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitIf_stmt) {
			return visitor.visitIf_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class While_stmtContext extends ParserRuleContext {
	public WHILE(): TerminalNode { return this.getToken(Python3Parser.WHILE, 0); }
	public test(): TestContext {
		return this.getRuleContext(0, TestContext);
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COLON);
		} else {
			return this.getToken(Python3Parser.COLON, i);
		}
	}
	public block(): BlockContext[];
	public block(i: number): BlockContext;
	public block(i?: number): BlockContext | BlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BlockContext);
		} else {
			return this.getRuleContext(i, BlockContext);
		}
	}
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_while_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterWhile_stmt) {
			listener.enterWhile_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitWhile_stmt) {
			listener.exitWhile_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitWhile_stmt) {
			return visitor.visitWhile_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class For_stmtContext extends ParserRuleContext {
	public FOR(): TerminalNode { return this.getToken(Python3Parser.FOR, 0); }
	public exprlist(): ExprlistContext {
		return this.getRuleContext(0, ExprlistContext);
	}
	public IN(): TerminalNode { return this.getToken(Python3Parser.IN, 0); }
	public testlist(): TestlistContext {
		return this.getRuleContext(0, TestlistContext);
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COLON);
		} else {
			return this.getToken(Python3Parser.COLON, i);
		}
	}
	public block(): BlockContext[];
	public block(i: number): BlockContext;
	public block(i?: number): BlockContext | BlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BlockContext);
		} else {
			return this.getRuleContext(i, BlockContext);
		}
	}
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_for_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterFor_stmt) {
			listener.enterFor_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitFor_stmt) {
			listener.exitFor_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitFor_stmt) {
			return visitor.visitFor_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Try_stmtContext extends ParserRuleContext {
	public TRY(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.TRY, 0); }
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COLON);
		} else {
			return this.getToken(Python3Parser.COLON, i);
		}
	}
	public block(): BlockContext[];
	public block(i: number): BlockContext;
	public block(i?: number): BlockContext | BlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BlockContext);
		} else {
			return this.getRuleContext(i, BlockContext);
		}
	}
	public FINALLY(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FINALLY, 0); }
	public except_clause(): Except_clauseContext[];
	public except_clause(i: number): Except_clauseContext;
	public except_clause(i?: number): Except_clauseContext | Except_clauseContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Except_clauseContext);
		} else {
			return this.getRuleContext(i, Except_clauseContext);
		}
	}
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_try_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTry_stmt) {
			listener.enterTry_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTry_stmt) {
			listener.exitTry_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTry_stmt) {
			return visitor.visitTry_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class With_stmtContext extends ParserRuleContext {
	public WITH(): TerminalNode { return this.getToken(Python3Parser.WITH, 0); }
	public with_item(): With_itemContext[];
	public with_item(i: number): With_itemContext;
	public with_item(i?: number): With_itemContext | With_itemContext[] {
		if (i === undefined) {
			return this.getRuleContexts(With_itemContext);
		} else {
			return this.getRuleContext(i, With_itemContext);
		}
	}
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public block(): BlockContext {
		return this.getRuleContext(0, BlockContext);
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_with_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterWith_stmt) {
			listener.enterWith_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitWith_stmt) {
			listener.exitWith_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitWith_stmt) {
			return visitor.visitWith_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class With_itemContext extends ParserRuleContext {
	public test(): TestContext {
		return this.getRuleContext(0, TestContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AS, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_with_item; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterWith_item) {
			listener.enterWith_item(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitWith_item) {
			listener.exitWith_item(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitWith_item) {
			return visitor.visitWith_item(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Except_clauseContext extends ParserRuleContext {
	public EXCEPT(): TerminalNode { return this.getToken(Python3Parser.EXCEPT, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AS, 0); }
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_except_clause; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterExcept_clause) {
			listener.enterExcept_clause(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitExcept_clause) {
			listener.exitExcept_clause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitExcept_clause) {
			return visitor.visitExcept_clause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	public simple_stmts(): Simple_stmtsContext | undefined {
		return this.tryGetRuleContext(0, Simple_stmtsContext);
	}
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NEWLINE, 0); }
	public INDENT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.INDENT, 0); }
	public DEDENT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.DEDENT, 0); }
	public stmt(): StmtContext[];
	public stmt(i: number): StmtContext;
	public stmt(i?: number): StmtContext | StmtContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StmtContext);
		} else {
			return this.getRuleContext(i, StmtContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_block; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterBlock) {
			listener.enterBlock(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitBlock) {
			listener.exitBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Match_stmtContext extends ParserRuleContext {
	public MATCH(): TerminalNode { return this.getToken(Python3Parser.MATCH, 0); }
	public subject_expr(): Subject_exprContext {
		return this.getRuleContext(0, Subject_exprContext);
	}
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public NEWLINE(): TerminalNode { return this.getToken(Python3Parser.NEWLINE, 0); }
	public INDENT(): TerminalNode { return this.getToken(Python3Parser.INDENT, 0); }
	public DEDENT(): TerminalNode { return this.getToken(Python3Parser.DEDENT, 0); }
	public case_block(): Case_blockContext[];
	public case_block(i: number): Case_blockContext;
	public case_block(i?: number): Case_blockContext | Case_blockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Case_blockContext);
		} else {
			return this.getRuleContext(i, Case_blockContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_match_stmt; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterMatch_stmt) {
			listener.enterMatch_stmt(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitMatch_stmt) {
			listener.exitMatch_stmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitMatch_stmt) {
			return visitor.visitMatch_stmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Subject_exprContext extends ParserRuleContext {
	public star_named_expression(): Star_named_expressionContext | undefined {
		return this.tryGetRuleContext(0, Star_named_expressionContext);
	}
	public COMMA(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.COMMA, 0); }
	public star_named_expressions(): Star_named_expressionsContext | undefined {
		return this.tryGetRuleContext(0, Star_named_expressionsContext);
	}
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_subject_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSubject_expr) {
			listener.enterSubject_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSubject_expr) {
			listener.exitSubject_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSubject_expr) {
			return visitor.visitSubject_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Star_named_expressionsContext extends ParserRuleContext {
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	public star_named_expression(): Star_named_expressionContext[];
	public star_named_expression(i: number): Star_named_expressionContext;
	public star_named_expression(i?: number): Star_named_expressionContext | Star_named_expressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Star_named_expressionContext);
		} else {
			return this.getRuleContext(i, Star_named_expressionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_star_named_expressions; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStar_named_expressions) {
			listener.enterStar_named_expressions(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStar_named_expressions) {
			listener.exitStar_named_expressions(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStar_named_expressions) {
			return visitor.visitStar_named_expressions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Star_named_expressionContext extends ParserRuleContext {
	public STAR(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.STAR, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_star_named_expression; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStar_named_expression) {
			listener.enterStar_named_expression(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStar_named_expression) {
			listener.exitStar_named_expression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStar_named_expression) {
			return visitor.visitStar_named_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Case_blockContext extends ParserRuleContext {
	public CASE(): TerminalNode { return this.getToken(Python3Parser.CASE, 0); }
	public patterns(): PatternsContext {
		return this.getRuleContext(0, PatternsContext);
	}
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public block(): BlockContext {
		return this.getRuleContext(0, BlockContext);
	}
	public guard(): GuardContext | undefined {
		return this.tryGetRuleContext(0, GuardContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_case_block; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterCase_block) {
			listener.enterCase_block(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitCase_block) {
			listener.exitCase_block(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitCase_block) {
			return visitor.visitCase_block(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class GuardContext extends ParserRuleContext {
	public IF(): TerminalNode { return this.getToken(Python3Parser.IF, 0); }
	public test(): TestContext {
		return this.getRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_guard; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterGuard) {
			listener.enterGuard(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitGuard) {
			listener.exitGuard(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitGuard) {
			return visitor.visitGuard(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PatternsContext extends ParserRuleContext {
	public open_sequence_pattern(): Open_sequence_patternContext | undefined {
		return this.tryGetRuleContext(0, Open_sequence_patternContext);
	}
	public pattern(): PatternContext | undefined {
		return this.tryGetRuleContext(0, PatternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_patterns; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPatterns) {
			listener.enterPatterns(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPatterns) {
			listener.exitPatterns(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPatterns) {
			return visitor.visitPatterns(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PatternContext extends ParserRuleContext {
	public as_pattern(): As_patternContext | undefined {
		return this.tryGetRuleContext(0, As_patternContext);
	}
	public or_pattern(): Or_patternContext | undefined {
		return this.tryGetRuleContext(0, Or_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPattern) {
			listener.enterPattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPattern) {
			listener.exitPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPattern) {
			return visitor.visitPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class As_patternContext extends ParserRuleContext {
	public or_pattern(): Or_patternContext {
		return this.getRuleContext(0, Or_patternContext);
	}
	public AS(): TerminalNode { return this.getToken(Python3Parser.AS, 0); }
	public pattern_capture_target(): Pattern_capture_targetContext {
		return this.getRuleContext(0, Pattern_capture_targetContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_as_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAs_pattern) {
			listener.enterAs_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAs_pattern) {
			listener.exitAs_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAs_pattern) {
			return visitor.visitAs_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Or_patternContext extends ParserRuleContext {
	public closed_pattern(): Closed_patternContext[];
	public closed_pattern(i: number): Closed_patternContext;
	public closed_pattern(i?: number): Closed_patternContext | Closed_patternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Closed_patternContext);
		} else {
			return this.getRuleContext(i, Closed_patternContext);
		}
	}
	public OR_OP(): TerminalNode[];
	public OR_OP(i: number): TerminalNode;
	public OR_OP(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.OR_OP);
		} else {
			return this.getToken(Python3Parser.OR_OP, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_or_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterOr_pattern) {
			listener.enterOr_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitOr_pattern) {
			listener.exitOr_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitOr_pattern) {
			return visitor.visitOr_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Closed_patternContext extends ParserRuleContext {
	public literal_pattern(): Literal_patternContext | undefined {
		return this.tryGetRuleContext(0, Literal_patternContext);
	}
	public capture_pattern(): Capture_patternContext | undefined {
		return this.tryGetRuleContext(0, Capture_patternContext);
	}
	public wildcard_pattern(): Wildcard_patternContext | undefined {
		return this.tryGetRuleContext(0, Wildcard_patternContext);
	}
	public value_pattern(): Value_patternContext | undefined {
		return this.tryGetRuleContext(0, Value_patternContext);
	}
	public group_pattern(): Group_patternContext | undefined {
		return this.tryGetRuleContext(0, Group_patternContext);
	}
	public sequence_pattern(): Sequence_patternContext | undefined {
		return this.tryGetRuleContext(0, Sequence_patternContext);
	}
	public mapping_pattern(): Mapping_patternContext | undefined {
		return this.tryGetRuleContext(0, Mapping_patternContext);
	}
	public class_pattern(): Class_patternContext | undefined {
		return this.tryGetRuleContext(0, Class_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_closed_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterClosed_pattern) {
			listener.enterClosed_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitClosed_pattern) {
			listener.exitClosed_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitClosed_pattern) {
			return visitor.visitClosed_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_patternContext extends ParserRuleContext {
	public signed_number(): Signed_numberContext | undefined {
		return this.tryGetRuleContext(0, Signed_numberContext);
	}
	public complex_number(): Complex_numberContext | undefined {
		return this.tryGetRuleContext(0, Complex_numberContext);
	}
	public strings(): StringsContext | undefined {
		return this.tryGetRuleContext(0, StringsContext);
	}
	public NONE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NONE, 0); }
	public TRUE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.TRUE, 0); }
	public FALSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FALSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_literal_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterLiteral_pattern) {
			listener.enterLiteral_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitLiteral_pattern) {
			listener.exitLiteral_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitLiteral_pattern) {
			return visitor.visitLiteral_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_exprContext extends ParserRuleContext {
	public signed_number(): Signed_numberContext | undefined {
		return this.tryGetRuleContext(0, Signed_numberContext);
	}
	public complex_number(): Complex_numberContext | undefined {
		return this.tryGetRuleContext(0, Complex_numberContext);
	}
	public strings(): StringsContext | undefined {
		return this.tryGetRuleContext(0, StringsContext);
	}
	public NONE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NONE, 0); }
	public TRUE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.TRUE, 0); }
	public FALSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FALSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_literal_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterLiteral_expr) {
			listener.enterLiteral_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitLiteral_expr) {
			listener.exitLiteral_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitLiteral_expr) {
			return visitor.visitLiteral_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Complex_numberContext extends ParserRuleContext {
	public signed_real_number(): Signed_real_numberContext {
		return this.getRuleContext(0, Signed_real_numberContext);
	}
	public ADD(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ADD, 0); }
	public imaginary_number(): Imaginary_numberContext {
		return this.getRuleContext(0, Imaginary_numberContext);
	}
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_complex_number; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComplex_number) {
			listener.enterComplex_number(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComplex_number) {
			listener.exitComplex_number(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComplex_number) {
			return visitor.visitComplex_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Signed_numberContext extends ParserRuleContext {
	public NUMBER(): TerminalNode { return this.getToken(Python3Parser.NUMBER, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_signed_number; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSigned_number) {
			listener.enterSigned_number(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSigned_number) {
			listener.exitSigned_number(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSigned_number) {
			return visitor.visitSigned_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Signed_real_numberContext extends ParserRuleContext {
	public real_number(): Real_numberContext {
		return this.getRuleContext(0, Real_numberContext);
	}
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_signed_real_number; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSigned_real_number) {
			listener.enterSigned_real_number(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSigned_real_number) {
			listener.exitSigned_real_number(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSigned_real_number) {
			return visitor.visitSigned_real_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Real_numberContext extends ParserRuleContext {
	public NUMBER(): TerminalNode { return this.getToken(Python3Parser.NUMBER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_real_number; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterReal_number) {
			listener.enterReal_number(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitReal_number) {
			listener.exitReal_number(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitReal_number) {
			return visitor.visitReal_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Imaginary_numberContext extends ParserRuleContext {
	public NUMBER(): TerminalNode { return this.getToken(Python3Parser.NUMBER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_imaginary_number; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterImaginary_number) {
			listener.enterImaginary_number(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitImaginary_number) {
			listener.exitImaginary_number(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitImaginary_number) {
			return visitor.visitImaginary_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Capture_patternContext extends ParserRuleContext {
	public pattern_capture_target(): Pattern_capture_targetContext {
		return this.getRuleContext(0, Pattern_capture_targetContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_capture_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterCapture_pattern) {
			listener.enterCapture_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitCapture_pattern) {
			listener.exitCapture_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitCapture_pattern) {
			return visitor.visitCapture_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Pattern_capture_targetContext extends ParserRuleContext {
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_pattern_capture_target; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPattern_capture_target) {
			listener.enterPattern_capture_target(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPattern_capture_target) {
			listener.exitPattern_capture_target(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPattern_capture_target) {
			return visitor.visitPattern_capture_target(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Wildcard_patternContext extends ParserRuleContext {
	public UNDERSCORE(): TerminalNode { return this.getToken(Python3Parser.UNDERSCORE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_wildcard_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterWildcard_pattern) {
			listener.enterWildcard_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitWildcard_pattern) {
			listener.exitWildcard_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitWildcard_pattern) {
			return visitor.visitWildcard_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Value_patternContext extends ParserRuleContext {
	public attr(): AttrContext {
		return this.getRuleContext(0, AttrContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_value_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterValue_pattern) {
			listener.enterValue_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitValue_pattern) {
			listener.exitValue_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitValue_pattern) {
			return visitor.visitValue_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AttrContext extends ParserRuleContext {
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.DOT);
		} else {
			return this.getToken(Python3Parser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_attr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAttr) {
			listener.enterAttr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAttr) {
			listener.exitAttr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAttr) {
			return visitor.visitAttr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Name_or_attrContext extends ParserRuleContext {
	public attr(): AttrContext | undefined {
		return this.tryGetRuleContext(0, AttrContext);
	}
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_name_or_attr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterName_or_attr) {
			listener.enterName_or_attr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitName_or_attr) {
			listener.exitName_or_attr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitName_or_attr) {
			return visitor.visitName_or_attr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Group_patternContext extends ParserRuleContext {
	public OPEN_PAREN(): TerminalNode { return this.getToken(Python3Parser.OPEN_PAREN, 0); }
	public pattern(): PatternContext {
		return this.getRuleContext(0, PatternContext);
	}
	public CLOSE_PAREN(): TerminalNode { return this.getToken(Python3Parser.CLOSE_PAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_group_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterGroup_pattern) {
			listener.enterGroup_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitGroup_pattern) {
			listener.exitGroup_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitGroup_pattern) {
			return visitor.visitGroup_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Sequence_patternContext extends ParserRuleContext {
	public OPEN_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_BRACK, 0); }
	public CLOSE_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_BRACK, 0); }
	public maybe_sequence_pattern(): Maybe_sequence_patternContext | undefined {
		return this.tryGetRuleContext(0, Maybe_sequence_patternContext);
	}
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public open_sequence_pattern(): Open_sequence_patternContext | undefined {
		return this.tryGetRuleContext(0, Open_sequence_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_sequence_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSequence_pattern) {
			listener.enterSequence_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSequence_pattern) {
			listener.exitSequence_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSequence_pattern) {
			return visitor.visitSequence_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Open_sequence_patternContext extends ParserRuleContext {
	public maybe_star_pattern(): Maybe_star_patternContext {
		return this.getRuleContext(0, Maybe_star_patternContext);
	}
	public COMMA(): TerminalNode { return this.getToken(Python3Parser.COMMA, 0); }
	public maybe_sequence_pattern(): Maybe_sequence_patternContext | undefined {
		return this.tryGetRuleContext(0, Maybe_sequence_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_open_sequence_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterOpen_sequence_pattern) {
			listener.enterOpen_sequence_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitOpen_sequence_pattern) {
			listener.exitOpen_sequence_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitOpen_sequence_pattern) {
			return visitor.visitOpen_sequence_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Maybe_sequence_patternContext extends ParserRuleContext {
	public maybe_star_pattern(): Maybe_star_patternContext[];
	public maybe_star_pattern(i: number): Maybe_star_patternContext;
	public maybe_star_pattern(i?: number): Maybe_star_patternContext | Maybe_star_patternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Maybe_star_patternContext);
		} else {
			return this.getRuleContext(i, Maybe_star_patternContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_maybe_sequence_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterMaybe_sequence_pattern) {
			listener.enterMaybe_sequence_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitMaybe_sequence_pattern) {
			listener.exitMaybe_sequence_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitMaybe_sequence_pattern) {
			return visitor.visitMaybe_sequence_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Maybe_star_patternContext extends ParserRuleContext {
	public star_pattern(): Star_patternContext | undefined {
		return this.tryGetRuleContext(0, Star_patternContext);
	}
	public pattern(): PatternContext | undefined {
		return this.tryGetRuleContext(0, PatternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_maybe_star_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterMaybe_star_pattern) {
			listener.enterMaybe_star_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitMaybe_star_pattern) {
			listener.exitMaybe_star_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitMaybe_star_pattern) {
			return visitor.visitMaybe_star_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Star_patternContext extends ParserRuleContext {
	public STAR(): TerminalNode { return this.getToken(Python3Parser.STAR, 0); }
	public pattern_capture_target(): Pattern_capture_targetContext | undefined {
		return this.tryGetRuleContext(0, Pattern_capture_targetContext);
	}
	public wildcard_pattern(): Wildcard_patternContext | undefined {
		return this.tryGetRuleContext(0, Wildcard_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_star_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStar_pattern) {
			listener.enterStar_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStar_pattern) {
			listener.exitStar_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStar_pattern) {
			return visitor.visitStar_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Mapping_patternContext extends ParserRuleContext {
	public OPEN_BRACE(): TerminalNode { return this.getToken(Python3Parser.OPEN_BRACE, 0); }
	public CLOSE_BRACE(): TerminalNode { return this.getToken(Python3Parser.CLOSE_BRACE, 0); }
	public double_star_pattern(): Double_star_patternContext | undefined {
		return this.tryGetRuleContext(0, Double_star_patternContext);
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	public items_pattern(): Items_patternContext | undefined {
		return this.tryGetRuleContext(0, Items_patternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_mapping_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterMapping_pattern) {
			listener.enterMapping_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitMapping_pattern) {
			listener.exitMapping_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitMapping_pattern) {
			return visitor.visitMapping_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Items_patternContext extends ParserRuleContext {
	public key_value_pattern(): Key_value_patternContext[];
	public key_value_pattern(i: number): Key_value_patternContext;
	public key_value_pattern(i?: number): Key_value_patternContext | Key_value_patternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Key_value_patternContext);
		} else {
			return this.getRuleContext(i, Key_value_patternContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_items_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterItems_pattern) {
			listener.enterItems_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitItems_pattern) {
			listener.exitItems_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitItems_pattern) {
			return visitor.visitItems_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Key_value_patternContext extends ParserRuleContext {
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public pattern(): PatternContext {
		return this.getRuleContext(0, PatternContext);
	}
	public literal_expr(): Literal_exprContext | undefined {
		return this.tryGetRuleContext(0, Literal_exprContext);
	}
	public attr(): AttrContext | undefined {
		return this.tryGetRuleContext(0, AttrContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_key_value_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterKey_value_pattern) {
			listener.enterKey_value_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitKey_value_pattern) {
			listener.exitKey_value_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitKey_value_pattern) {
			return visitor.visitKey_value_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Double_star_patternContext extends ParserRuleContext {
	public POWER(): TerminalNode { return this.getToken(Python3Parser.POWER, 0); }
	public pattern_capture_target(): Pattern_capture_targetContext {
		return this.getRuleContext(0, Pattern_capture_targetContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_double_star_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDouble_star_pattern) {
			listener.enterDouble_star_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDouble_star_pattern) {
			listener.exitDouble_star_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDouble_star_pattern) {
			return visitor.visitDouble_star_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Class_patternContext extends ParserRuleContext {
	public name_or_attr(): Name_or_attrContext {
		return this.getRuleContext(0, Name_or_attrContext);
	}
	public OPEN_PAREN(): TerminalNode { return this.getToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode { return this.getToken(Python3Parser.CLOSE_PAREN, 0); }
	public positional_patterns(): Positional_patternsContext | undefined {
		return this.tryGetRuleContext(0, Positional_patternsContext);
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	public keyword_patterns(): Keyword_patternsContext | undefined {
		return this.tryGetRuleContext(0, Keyword_patternsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_class_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterClass_pattern) {
			listener.enterClass_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitClass_pattern) {
			listener.exitClass_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitClass_pattern) {
			return visitor.visitClass_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Positional_patternsContext extends ParserRuleContext {
	public pattern(): PatternContext[];
	public pattern(i: number): PatternContext;
	public pattern(i?: number): PatternContext | PatternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PatternContext);
		} else {
			return this.getRuleContext(i, PatternContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_positional_patterns; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPositional_patterns) {
			listener.enterPositional_patterns(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPositional_patterns) {
			listener.exitPositional_patterns(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPositional_patterns) {
			return visitor.visitPositional_patterns(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Keyword_patternsContext extends ParserRuleContext {
	public keyword_pattern(): Keyword_patternContext[];
	public keyword_pattern(i: number): Keyword_patternContext;
	public keyword_pattern(i?: number): Keyword_patternContext | Keyword_patternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Keyword_patternContext);
		} else {
			return this.getRuleContext(i, Keyword_patternContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_keyword_patterns; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterKeyword_patterns) {
			listener.enterKeyword_patterns(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitKeyword_patterns) {
			listener.exitKeyword_patterns(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitKeyword_patterns) {
			return visitor.visitKeyword_patterns(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Keyword_patternContext extends ParserRuleContext {
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(Python3Parser.ASSIGN, 0); }
	public pattern(): PatternContext {
		return this.getRuleContext(0, PatternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_keyword_pattern; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterKeyword_pattern) {
			listener.enterKeyword_pattern(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitKeyword_pattern) {
			listener.exitKeyword_pattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitKeyword_pattern) {
			return visitor.visitKeyword_pattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TestContext extends ParserRuleContext {
	public or_test(): Or_testContext[];
	public or_test(i: number): Or_testContext;
	public or_test(i?: number): Or_testContext | Or_testContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Or_testContext);
		} else {
			return this.getRuleContext(i, Or_testContext);
		}
	}
	public IF(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.IF, 0); }
	public ELSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELSE, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	public lambdef(): LambdefContext | undefined {
		return this.tryGetRuleContext(0, LambdefContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_test; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTest) {
			listener.enterTest(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTest) {
			listener.exitTest(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTest) {
			return visitor.visitTest(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Test_nocondContext extends ParserRuleContext {
	public or_test(): Or_testContext | undefined {
		return this.tryGetRuleContext(0, Or_testContext);
	}
	public lambdef_nocond(): Lambdef_nocondContext | undefined {
		return this.tryGetRuleContext(0, Lambdef_nocondContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_test_nocond; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTest_nocond) {
			listener.enterTest_nocond(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTest_nocond) {
			listener.exitTest_nocond(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTest_nocond) {
			return visitor.visitTest_nocond(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdefContext extends ParserRuleContext {
	public LAMBDA(): TerminalNode { return this.getToken(Python3Parser.LAMBDA, 0); }
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public test(): TestContext {
		return this.getRuleContext(0, TestContext);
	}
	public varargslist(): VarargslistContext | undefined {
		return this.tryGetRuleContext(0, VarargslistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_lambdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterLambdef) {
			listener.enterLambdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitLambdef) {
			listener.exitLambdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitLambdef) {
			return visitor.visitLambdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Lambdef_nocondContext extends ParserRuleContext {
	public LAMBDA(): TerminalNode { return this.getToken(Python3Parser.LAMBDA, 0); }
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public test_nocond(): Test_nocondContext {
		return this.getRuleContext(0, Test_nocondContext);
	}
	public varargslist(): VarargslistContext | undefined {
		return this.tryGetRuleContext(0, VarargslistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_lambdef_nocond; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterLambdef_nocond) {
			listener.enterLambdef_nocond(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitLambdef_nocond) {
			listener.exitLambdef_nocond(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitLambdef_nocond) {
			return visitor.visitLambdef_nocond(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Or_testContext extends ParserRuleContext {
	public and_test(): And_testContext[];
	public and_test(i: number): And_testContext;
	public and_test(i?: number): And_testContext | And_testContext[] {
		if (i === undefined) {
			return this.getRuleContexts(And_testContext);
		} else {
			return this.getRuleContext(i, And_testContext);
		}
	}
	public OR(): TerminalNode[];
	public OR(i: number): TerminalNode;
	public OR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.OR);
		} else {
			return this.getToken(Python3Parser.OR, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_or_test; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterOr_test) {
			listener.enterOr_test(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitOr_test) {
			listener.exitOr_test(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitOr_test) {
			return visitor.visitOr_test(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class And_testContext extends ParserRuleContext {
	public not_test(): Not_testContext[];
	public not_test(i: number): Not_testContext;
	public not_test(i?: number): Not_testContext | Not_testContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Not_testContext);
		} else {
			return this.getRuleContext(i, Not_testContext);
		}
	}
	public AND(): TerminalNode[];
	public AND(i: number): TerminalNode;
	public AND(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.AND);
		} else {
			return this.getToken(Python3Parser.AND, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_and_test; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAnd_test) {
			listener.enterAnd_test(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAnd_test) {
			listener.exitAnd_test(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAnd_test) {
			return visitor.visitAnd_test(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Not_testContext extends ParserRuleContext {
	public NOT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NOT, 0); }
	public not_test(): Not_testContext | undefined {
		return this.tryGetRuleContext(0, Not_testContext);
	}
	public comparison(): ComparisonContext | undefined {
		return this.tryGetRuleContext(0, ComparisonContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_not_test; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterNot_test) {
			listener.enterNot_test(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitNot_test) {
			listener.exitNot_test(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitNot_test) {
			return visitor.visitNot_test(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ComparisonContext extends ParserRuleContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public comp_op(): Comp_opContext[];
	public comp_op(i: number): Comp_opContext;
	public comp_op(i?: number): Comp_opContext | Comp_opContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Comp_opContext);
		} else {
			return this.getRuleContext(i, Comp_opContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_comparison; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComparison) {
			listener.enterComparison(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComparison) {
			listener.exitComparison(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComparison) {
			return visitor.visitComparison(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Comp_opContext extends ParserRuleContext {
	public LESS_THAN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.LESS_THAN, 0); }
	public GREATER_THAN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.GREATER_THAN, 0); }
	public EQUALS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.EQUALS, 0); }
	public GT_EQ(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.GT_EQ, 0); }
	public LT_EQ(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.LT_EQ, 0); }
	public NOT_EQ_1(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NOT_EQ_1, 0); }
	public NOT_EQ_2(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NOT_EQ_2, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.IN, 0); }
	public NOT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NOT, 0); }
	public IS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.IS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_comp_op; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComp_op) {
			listener.enterComp_op(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComp_op) {
			listener.exitComp_op(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComp_op) {
			return visitor.visitComp_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Star_exprContext extends ParserRuleContext {
	public STAR(): TerminalNode { return this.getToken(Python3Parser.STAR, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_star_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStar_expr) {
			listener.enterStar_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStar_expr) {
			listener.exitStar_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStar_expr) {
			return visitor.visitStar_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	public xor_expr(): Xor_exprContext[];
	public xor_expr(i: number): Xor_exprContext;
	public xor_expr(i?: number): Xor_exprContext | Xor_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Xor_exprContext);
		} else {
			return this.getRuleContext(i, Xor_exprContext);
		}
	}
	public OR_OP(): TerminalNode[];
	public OR_OP(i: number): TerminalNode;
	public OR_OP(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.OR_OP);
		} else {
			return this.getToken(Python3Parser.OR_OP, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterExpr) {
			listener.enterExpr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitExpr) {
			listener.exitExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitExpr) {
			return visitor.visitExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Xor_exprContext extends ParserRuleContext {
	public and_expr(): And_exprContext[];
	public and_expr(i: number): And_exprContext;
	public and_expr(i?: number): And_exprContext | And_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(And_exprContext);
		} else {
			return this.getRuleContext(i, And_exprContext);
		}
	}
	public XOR(): TerminalNode[];
	public XOR(i: number): TerminalNode;
	public XOR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.XOR);
		} else {
			return this.getToken(Python3Parser.XOR, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_xor_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterXor_expr) {
			listener.enterXor_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitXor_expr) {
			listener.exitXor_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitXor_expr) {
			return visitor.visitXor_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class And_exprContext extends ParserRuleContext {
	public shift_expr(): Shift_exprContext[];
	public shift_expr(i: number): Shift_exprContext;
	public shift_expr(i?: number): Shift_exprContext | Shift_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Shift_exprContext);
		} else {
			return this.getRuleContext(i, Shift_exprContext);
		}
	}
	public AND_OP(): TerminalNode[];
	public AND_OP(i: number): TerminalNode;
	public AND_OP(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.AND_OP);
		} else {
			return this.getToken(Python3Parser.AND_OP, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_and_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAnd_expr) {
			listener.enterAnd_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAnd_expr) {
			listener.exitAnd_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAnd_expr) {
			return visitor.visitAnd_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shift_exprContext extends ParserRuleContext {
	public arith_expr(): Arith_exprContext[];
	public arith_expr(i: number): Arith_exprContext;
	public arith_expr(i?: number): Arith_exprContext | Arith_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Arith_exprContext);
		} else {
			return this.getRuleContext(i, Arith_exprContext);
		}
	}
	public LEFT_SHIFT(): TerminalNode[];
	public LEFT_SHIFT(i: number): TerminalNode;
	public LEFT_SHIFT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.LEFT_SHIFT);
		} else {
			return this.getToken(Python3Parser.LEFT_SHIFT, i);
		}
	}
	public RIGHT_SHIFT(): TerminalNode[];
	public RIGHT_SHIFT(i: number): TerminalNode;
	public RIGHT_SHIFT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.RIGHT_SHIFT);
		} else {
			return this.getToken(Python3Parser.RIGHT_SHIFT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_shift_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterShift_expr) {
			listener.enterShift_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitShift_expr) {
			listener.exitShift_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitShift_expr) {
			return visitor.visitShift_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Arith_exprContext extends ParserRuleContext {
	public term(): TermContext[];
	public term(i: number): TermContext;
	public term(i?: number): TermContext | TermContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TermContext);
		} else {
			return this.getRuleContext(i, TermContext);
		}
	}
	public ADD(): TerminalNode[];
	public ADD(i: number): TerminalNode;
	public ADD(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.ADD);
		} else {
			return this.getToken(Python3Parser.ADD, i);
		}
	}
	public MINUS(): TerminalNode[];
	public MINUS(i: number): TerminalNode;
	public MINUS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.MINUS);
		} else {
			return this.getToken(Python3Parser.MINUS, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_arith_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterArith_expr) {
			listener.enterArith_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitArith_expr) {
			listener.exitArith_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitArith_expr) {
			return visitor.visitArith_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TermContext extends ParserRuleContext {
	public factor(): FactorContext[];
	public factor(i: number): FactorContext;
	public factor(i?: number): FactorContext | FactorContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FactorContext);
		} else {
			return this.getRuleContext(i, FactorContext);
		}
	}
	public STAR(): TerminalNode[];
	public STAR(i: number): TerminalNode;
	public STAR(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.STAR);
		} else {
			return this.getToken(Python3Parser.STAR, i);
		}
	}
	public AT(): TerminalNode[];
	public AT(i: number): TerminalNode;
	public AT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.AT);
		} else {
			return this.getToken(Python3Parser.AT, i);
		}
	}
	public DIV(): TerminalNode[];
	public DIV(i: number): TerminalNode;
	public DIV(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.DIV);
		} else {
			return this.getToken(Python3Parser.DIV, i);
		}
	}
	public MOD(): TerminalNode[];
	public MOD(i: number): TerminalNode;
	public MOD(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.MOD);
		} else {
			return this.getToken(Python3Parser.MOD, i);
		}
	}
	public IDIV(): TerminalNode[];
	public IDIV(i: number): TerminalNode;
	public IDIV(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.IDIV);
		} else {
			return this.getToken(Python3Parser.IDIV, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_term; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTerm) {
			listener.enterTerm(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTerm) {
			listener.exitTerm(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTerm) {
			return visitor.visitTerm(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FactorContext extends ParserRuleContext {
	public factor(): FactorContext | undefined {
		return this.tryGetRuleContext(0, FactorContext);
	}
	public ADD(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ADD, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MINUS, 0); }
	public NOT_OP(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NOT_OP, 0); }
	public power(): PowerContext | undefined {
		return this.tryGetRuleContext(0, PowerContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_factor; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterFactor) {
			listener.enterFactor(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitFactor) {
			listener.exitFactor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitFactor) {
			return visitor.visitFactor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PowerContext extends ParserRuleContext {
	public atom_expr(): Atom_exprContext {
		return this.getRuleContext(0, Atom_exprContext);
	}
	public POWER(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.POWER, 0); }
	public factor(): FactorContext | undefined {
		return this.tryGetRuleContext(0, FactorContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_power; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterPower) {
			listener.enterPower(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitPower) {
			listener.exitPower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitPower) {
			return visitor.visitPower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Atom_exprContext extends ParserRuleContext {
	public atom(): AtomContext {
		return this.getRuleContext(0, AtomContext);
	}
	public AWAIT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.AWAIT, 0); }
	public trailer(): TrailerContext[];
	public trailer(i: number): TrailerContext;
	public trailer(i?: number): TrailerContext | TrailerContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TrailerContext);
		} else {
			return this.getRuleContext(i, TrailerContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_atom_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAtom_expr) {
			listener.enterAtom_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAtom_expr) {
			listener.exitAtom_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAtom_expr) {
			return visitor.visitAtom_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtomContext extends ParserRuleContext {
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public yield_expr(): Yield_exprContext | undefined {
		return this.tryGetRuleContext(0, Yield_exprContext);
	}
	public testlist_comp(): Testlist_compContext | undefined {
		return this.tryGetRuleContext(0, Testlist_compContext);
	}
	public OPEN_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_BRACK, 0); }
	public CLOSE_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_BRACK, 0); }
	public OPEN_BRACE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_BRACE, 0); }
	public CLOSE_BRACE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_BRACE, 0); }
	public dictorsetmaker(): DictorsetmakerContext | undefined {
		return this.tryGetRuleContext(0, DictorsetmakerContext);
	}
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NUMBER, 0); }
	public STRING(): TerminalNode[];
	public STRING(i: number): TerminalNode;
	public STRING(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.STRING);
		} else {
			return this.getToken(Python3Parser.STRING, i);
		}
	}
	public ELLIPSIS(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ELLIPSIS, 0); }
	public NONE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NONE, 0); }
	public TRUE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.TRUE, 0); }
	public FALSE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FALSE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_atom; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterAtom) {
			listener.enterAtom(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitAtom) {
			listener.exitAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitAtom) {
			return visitor.visitAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameContext extends ParserRuleContext {
	public NAME(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.NAME, 0); }
	public UNDERSCORE(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.UNDERSCORE, 0); }
	public MATCH(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.MATCH, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_name; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterName) {
			listener.enterName(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitName) {
			listener.exitName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitName) {
			return visitor.visitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Testlist_compContext extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public star_expr(): Star_exprContext[];
	public star_expr(i: number): Star_exprContext;
	public star_expr(i?: number): Star_exprContext | Star_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Star_exprContext);
		} else {
			return this.getRuleContext(i, Star_exprContext);
		}
	}
	public comp_for(): Comp_forContext | undefined {
		return this.tryGetRuleContext(0, Comp_forContext);
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_testlist_comp; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTestlist_comp) {
			listener.enterTestlist_comp(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTestlist_comp) {
			listener.exitTestlist_comp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTestlist_comp) {
			return visitor.visitTestlist_comp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TrailerContext extends ParserRuleContext {
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public arglist(): ArglistContext | undefined {
		return this.tryGetRuleContext(0, ArglistContext);
	}
	public OPEN_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_BRACK, 0); }
	public subscriptlist(): SubscriptlistContext | undefined {
		return this.tryGetRuleContext(0, SubscriptlistContext);
	}
	public CLOSE_BRACK(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_BRACK, 0); }
	public DOT(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.DOT, 0); }
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_trailer; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTrailer) {
			listener.enterTrailer(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTrailer) {
			listener.exitTrailer(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTrailer) {
			return visitor.visitTrailer(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubscriptlistContext extends ParserRuleContext {
	public subscript_(): Subscript_Context[];
	public subscript_(i: number): Subscript_Context;
	public subscript_(i?: number): Subscript_Context | Subscript_Context[] {
		if (i === undefined) {
			return this.getRuleContexts(Subscript_Context);
		} else {
			return this.getRuleContext(i, Subscript_Context);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_subscriptlist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSubscriptlist) {
			listener.enterSubscriptlist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSubscriptlist) {
			listener.exitSubscriptlist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSubscriptlist) {
			return visitor.visitSubscriptlist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Subscript_Context extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COLON(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.COLON, 0); }
	public sliceop(): SliceopContext | undefined {
		return this.tryGetRuleContext(0, SliceopContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_subscript_; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSubscript_) {
			listener.enterSubscript_(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSubscript_) {
			listener.exitSubscript_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSubscript_) {
			return visitor.visitSubscript_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SliceopContext extends ParserRuleContext {
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_sliceop; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterSliceop) {
			listener.enterSliceop(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitSliceop) {
			listener.exitSliceop(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitSliceop) {
			return visitor.visitSliceop(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprlistContext extends ParserRuleContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public star_expr(): Star_exprContext[];
	public star_expr(i: number): Star_exprContext;
	public star_expr(i?: number): Star_exprContext | Star_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Star_exprContext);
		} else {
			return this.getRuleContext(i, Star_exprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_exprlist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterExprlist) {
			listener.enterExprlist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitExprlist) {
			listener.exitExprlist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitExprlist) {
			return visitor.visitExprlist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TestlistContext extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_testlist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterTestlist) {
			listener.enterTestlist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitTestlist) {
			listener.exitTestlist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitTestlist) {
			return visitor.visitTestlist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DictorsetmakerContext extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public COLON(): TerminalNode[];
	public COLON(i: number): TerminalNode;
	public COLON(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COLON);
		} else {
			return this.getToken(Python3Parser.COLON, i);
		}
	}
	public POWER(): TerminalNode[];
	public POWER(i: number): TerminalNode;
	public POWER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.POWER);
		} else {
			return this.getToken(Python3Parser.POWER, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public comp_for(): Comp_forContext | undefined {
		return this.tryGetRuleContext(0, Comp_forContext);
	}
	public star_expr(): Star_exprContext[];
	public star_expr(i: number): Star_exprContext;
	public star_expr(i?: number): Star_exprContext | Star_exprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Star_exprContext);
		} else {
			return this.getRuleContext(i, Star_exprContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_dictorsetmaker; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterDictorsetmaker) {
			listener.enterDictorsetmaker(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitDictorsetmaker) {
			listener.exitDictorsetmaker(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitDictorsetmaker) {
			return visitor.visitDictorsetmaker(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ClassdefContext extends ParserRuleContext {
	public CLASS(): TerminalNode { return this.getToken(Python3Parser.CLASS, 0); }
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	public COLON(): TerminalNode { return this.getToken(Python3Parser.COLON, 0); }
	public block(): BlockContext {
		return this.getRuleContext(0, BlockContext);
	}
	public OPEN_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.OPEN_PAREN, 0); }
	public CLOSE_PAREN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.CLOSE_PAREN, 0); }
	public arglist(): ArglistContext | undefined {
		return this.tryGetRuleContext(0, ArglistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_classdef; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterClassdef) {
			listener.enterClassdef(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitClassdef) {
			listener.exitClassdef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitClassdef) {
			return visitor.visitClassdef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArglistContext extends ParserRuleContext {
	public argument(): ArgumentContext[];
	public argument(i: number): ArgumentContext;
	public argument(i?: number): ArgumentContext | ArgumentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ArgumentContext);
		} else {
			return this.getRuleContext(i, ArgumentContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.COMMA);
		} else {
			return this.getToken(Python3Parser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_arglist; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterArglist) {
			listener.enterArglist(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitArglist) {
			listener.exitArglist(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitArglist) {
			return visitor.visitArglist(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArgumentContext extends ParserRuleContext {
	public test(): TestContext[];
	public test(i: number): TestContext;
	public test(i?: number): TestContext | TestContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TestContext);
		} else {
			return this.getRuleContext(i, TestContext);
		}
	}
	public ASSIGN(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ASSIGN, 0); }
	public POWER(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.POWER, 0); }
	public STAR(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.STAR, 0); }
	public comp_for(): Comp_forContext | undefined {
		return this.tryGetRuleContext(0, Comp_forContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_argument; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterArgument) {
			listener.enterArgument(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitArgument) {
			listener.exitArgument(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitArgument) {
			return visitor.visitArgument(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Comp_iterContext extends ParserRuleContext {
	public comp_for(): Comp_forContext | undefined {
		return this.tryGetRuleContext(0, Comp_forContext);
	}
	public comp_if(): Comp_ifContext | undefined {
		return this.tryGetRuleContext(0, Comp_ifContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_comp_iter; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComp_iter) {
			listener.enterComp_iter(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComp_iter) {
			listener.exitComp_iter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComp_iter) {
			return visitor.visitComp_iter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Comp_forContext extends ParserRuleContext {
	public FOR(): TerminalNode { return this.getToken(Python3Parser.FOR, 0); }
	public exprlist(): ExprlistContext {
		return this.getRuleContext(0, ExprlistContext);
	}
	public IN(): TerminalNode { return this.getToken(Python3Parser.IN, 0); }
	public or_test(): Or_testContext {
		return this.getRuleContext(0, Or_testContext);
	}
	public ASYNC(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.ASYNC, 0); }
	public comp_iter(): Comp_iterContext | undefined {
		return this.tryGetRuleContext(0, Comp_iterContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_comp_for; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComp_for) {
			listener.enterComp_for(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComp_for) {
			listener.exitComp_for(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComp_for) {
			return visitor.visitComp_for(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Comp_ifContext extends ParserRuleContext {
	public IF(): TerminalNode { return this.getToken(Python3Parser.IF, 0); }
	public test_nocond(): Test_nocondContext {
		return this.getRuleContext(0, Test_nocondContext);
	}
	public comp_iter(): Comp_iterContext | undefined {
		return this.tryGetRuleContext(0, Comp_iterContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_comp_if; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterComp_if) {
			listener.enterComp_if(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitComp_if) {
			listener.exitComp_if(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitComp_if) {
			return visitor.visitComp_if(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Encoding_declContext extends ParserRuleContext {
	public name(): NameContext {
		return this.getRuleContext(0, NameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_encoding_decl; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterEncoding_decl) {
			listener.enterEncoding_decl(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitEncoding_decl) {
			listener.exitEncoding_decl(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitEncoding_decl) {
			return visitor.visitEncoding_decl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Yield_exprContext extends ParserRuleContext {
	public YIELD(): TerminalNode { return this.getToken(Python3Parser.YIELD, 0); }
	public yield_arg(): Yield_argContext | undefined {
		return this.tryGetRuleContext(0, Yield_argContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_yield_expr; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterYield_expr) {
			listener.enterYield_expr(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitYield_expr) {
			listener.exitYield_expr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitYield_expr) {
			return visitor.visitYield_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Yield_argContext extends ParserRuleContext {
	public FROM(): TerminalNode | undefined { return this.tryGetToken(Python3Parser.FROM, 0); }
	public test(): TestContext | undefined {
		return this.tryGetRuleContext(0, TestContext);
	}
	public testlist(): TestlistContext | undefined {
		return this.tryGetRuleContext(0, TestlistContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_yield_arg; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterYield_arg) {
			listener.enterYield_arg(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitYield_arg) {
			listener.exitYield_arg(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitYield_arg) {
			return visitor.visitYield_arg(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringsContext extends ParserRuleContext {
	public STRING(): TerminalNode[];
	public STRING(i: number): TerminalNode;
	public STRING(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(Python3Parser.STRING);
		} else {
			return this.getToken(Python3Parser.STRING, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return Python3Parser.RULE_strings; }
	// @Override
	public enterRule(listener: Python3ParserListener): void {
		if (listener.enterStrings) {
			listener.enterStrings(this);
		}
	}
	// @Override
	public exitRule(listener: Python3ParserListener): void {
		if (listener.exitStrings) {
			listener.exitStrings(this);
		}
	}
	// @Override
	public accept<Result>(visitor: Python3ParserVisitor<Result>): Result {
		if (visitor.visitStrings) {
			return visitor.visitStrings(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


