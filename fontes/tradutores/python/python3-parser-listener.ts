// Generated from D:\Delegua\delegua\fontes\tradutores\python\Python3Parser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { Single_inputContext } from "./python3-parser";
import { File_inputContext } from "./python3-parser";
import { Eval_inputContext } from "./python3-parser";
import { DecoratorContext } from "./python3-parser";
import { DecoratorsContext } from "./python3-parser";
import { DecoratedContext } from "./python3-parser";
import { Async_funcdefContext } from "./python3-parser";
import { FuncdefContext } from "./python3-parser";
import { ParametersContext } from "./python3-parser";
import { TypedargslistContext } from "./python3-parser";
import { TfpdefContext } from "./python3-parser";
import { VarargslistContext } from "./python3-parser";
import { VfpdefContext } from "./python3-parser";
import { StmtContext } from "./python3-parser";
import { Simple_stmtsContext } from "./python3-parser";
import { Simple_stmtContext } from "./python3-parser";
import { Expr_stmtContext } from "./python3-parser";
import { AnnassignContext } from "./python3-parser";
import { Testlist_star_exprContext } from "./python3-parser";
import { AugassignContext } from "./python3-parser";
import { Del_stmtContext } from "./python3-parser";
import { Pass_stmtContext } from "./python3-parser";
import { Flow_stmtContext } from "./python3-parser";
import { Break_stmtContext } from "./python3-parser";
import { Continue_stmtContext } from "./python3-parser";
import { Return_stmtContext } from "./python3-parser";
import { Yield_stmtContext } from "./python3-parser";
import { Raise_stmtContext } from "./python3-parser";
import { Import_stmtContext } from "./python3-parser";
import { Import_nameContext } from "./python3-parser";
import { Import_fromContext } from "./python3-parser";
import { Import_as_nameContext } from "./python3-parser";
import { Dotted_as_nameContext } from "./python3-parser";
import { Import_as_namesContext } from "./python3-parser";
import { Dotted_as_namesContext } from "./python3-parser";
import { Dotted_nameContext } from "./python3-parser";
import { Global_stmtContext } from "./python3-parser";
import { Nonlocal_stmtContext } from "./python3-parser";
import { Assert_stmtContext } from "./python3-parser";
import { Compound_stmtContext } from "./python3-parser";
import { Async_stmtContext } from "./python3-parser";
import { If_stmtContext } from "./python3-parser";
import { While_stmtContext } from "./python3-parser";
import { For_stmtContext } from "./python3-parser";
import { Try_stmtContext } from "./python3-parser";
import { With_stmtContext } from "./python3-parser";
import { With_itemContext } from "./python3-parser";
import { Except_clauseContext } from "./python3-parser";
import { BlockContext } from "./python3-parser";
import { Match_stmtContext } from "./python3-parser";
import { Subject_exprContext } from "./python3-parser";
import { Star_named_expressionsContext } from "./python3-parser";
import { Star_named_expressionContext } from "./python3-parser";
import { Case_blockContext } from "./python3-parser";
import { GuardContext } from "./python3-parser";
import { PatternsContext } from "./python3-parser";
import { PatternContext } from "./python3-parser";
import { As_patternContext } from "./python3-parser";
import { Or_patternContext } from "./python3-parser";
import { Closed_patternContext } from "./python3-parser";
import { Literal_patternContext } from "./python3-parser";
import { Literal_exprContext } from "./python3-parser";
import { Complex_numberContext } from "./python3-parser";
import { Signed_numberContext } from "./python3-parser";
import { Signed_real_numberContext } from "./python3-parser";
import { Real_numberContext } from "./python3-parser";
import { Imaginary_numberContext } from "./python3-parser";
import { Capture_patternContext } from "./python3-parser";
import { Pattern_capture_targetContext } from "./python3-parser";
import { Wildcard_patternContext } from "./python3-parser";
import { Value_patternContext } from "./python3-parser";
import { AttrContext } from "./python3-parser";
import { Name_or_attrContext } from "./python3-parser";
import { Group_patternContext } from "./python3-parser";
import { Sequence_patternContext } from "./python3-parser";
import { Open_sequence_patternContext } from "./python3-parser";
import { Maybe_sequence_patternContext } from "./python3-parser";
import { Maybe_star_patternContext } from "./python3-parser";
import { Star_patternContext } from "./python3-parser";
import { Mapping_patternContext } from "./python3-parser";
import { Items_patternContext } from "./python3-parser";
import { Key_value_patternContext } from "./python3-parser";
import { Double_star_patternContext } from "./python3-parser";
import { Class_patternContext } from "./python3-parser";
import { Positional_patternsContext } from "./python3-parser";
import { Keyword_patternsContext } from "./python3-parser";
import { Keyword_patternContext } from "./python3-parser";
import { TestContext } from "./python3-parser";
import { Test_nocondContext } from "./python3-parser";
import { LambdefContext } from "./python3-parser";
import { Lambdef_nocondContext } from "./python3-parser";
import { Or_testContext } from "./python3-parser";
import { And_testContext } from "./python3-parser";
import { Not_testContext } from "./python3-parser";
import { ComparisonContext } from "./python3-parser";
import { Comp_opContext } from "./python3-parser";
import { Star_exprContext } from "./python3-parser";
import { ExprContext } from "./python3-parser";
import { Xor_exprContext } from "./python3-parser";
import { And_exprContext } from "./python3-parser";
import { Shift_exprContext } from "./python3-parser";
import { Arith_exprContext } from "./python3-parser";
import { TermContext } from "./python3-parser";
import { FactorContext } from "./python3-parser";
import { PowerContext } from "./python3-parser";
import { Atom_exprContext } from "./python3-parser";
import { AtomContext } from "./python3-parser";
import { NameContext } from "./python3-parser";
import { Testlist_compContext } from "./python3-parser";
import { TrailerContext } from "./python3-parser";
import { SubscriptlistContext } from "./python3-parser";
import { Subscript_Context } from "./python3-parser";
import { SliceopContext } from "./python3-parser";
import { ExprlistContext } from "./python3-parser";
import { TestlistContext } from "./python3-parser";
import { DictorsetmakerContext } from "./python3-parser";
import { ClassdefContext } from "./python3-parser";
import { ArglistContext } from "./python3-parser";
import { ArgumentContext } from "./python3-parser";
import { Comp_iterContext } from "./python3-parser";
import { Comp_forContext } from "./python3-parser";
import { Comp_ifContext } from "./python3-parser";
import { Encoding_declContext } from "./python3-parser";
import { Yield_exprContext } from "./python3-parser";
import { Yield_argContext } from "./python3-parser";
import { StringsContext } from "./python3-parser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `Python3Parser`.
 */
export interface Python3ParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `Python3Parser.single_input`.
	 * @param ctx the parse tree
	 */
	enterSingle_input?: (ctx: Single_inputContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.single_input`.
	 * @param ctx the parse tree
	 */
	exitSingle_input?: (ctx: Single_inputContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.file_input`.
	 * @param ctx the parse tree
	 */
	enterFile_input?: (ctx: File_inputContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.file_input`.
	 * @param ctx the parse tree
	 */
	exitFile_input?: (ctx: File_inputContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.eval_input`.
	 * @param ctx the parse tree
	 */
	enterEval_input?: (ctx: Eval_inputContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.eval_input`.
	 * @param ctx the parse tree
	 */
	exitEval_input?: (ctx: Eval_inputContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.decorator`.
	 * @param ctx the parse tree
	 */
	enterDecorator?: (ctx: DecoratorContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.decorator`.
	 * @param ctx the parse tree
	 */
	exitDecorator?: (ctx: DecoratorContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.decorators`.
	 * @param ctx the parse tree
	 */
	enterDecorators?: (ctx: DecoratorsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.decorators`.
	 * @param ctx the parse tree
	 */
	exitDecorators?: (ctx: DecoratorsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.decorated`.
	 * @param ctx the parse tree
	 */
	enterDecorated?: (ctx: DecoratedContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.decorated`.
	 * @param ctx the parse tree
	 */
	exitDecorated?: (ctx: DecoratedContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.async_funcdef`.
	 * @param ctx the parse tree
	 */
	enterAsync_funcdef?: (ctx: Async_funcdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.async_funcdef`.
	 * @param ctx the parse tree
	 */
	exitAsync_funcdef?: (ctx: Async_funcdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.funcdef`.
	 * @param ctx the parse tree
	 */
	enterFuncdef?: (ctx: FuncdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.funcdef`.
	 * @param ctx the parse tree
	 */
	exitFuncdef?: (ctx: FuncdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.parameters`.
	 * @param ctx the parse tree
	 */
	enterParameters?: (ctx: ParametersContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.parameters`.
	 * @param ctx the parse tree
	 */
	exitParameters?: (ctx: ParametersContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.typedargslist`.
	 * @param ctx the parse tree
	 */
	enterTypedargslist?: (ctx: TypedargslistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.typedargslist`.
	 * @param ctx the parse tree
	 */
	exitTypedargslist?: (ctx: TypedargslistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.tfpdef`.
	 * @param ctx the parse tree
	 */
	enterTfpdef?: (ctx: TfpdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.tfpdef`.
	 * @param ctx the parse tree
	 */
	exitTfpdef?: (ctx: TfpdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.varargslist`.
	 * @param ctx the parse tree
	 */
	enterVarargslist?: (ctx: VarargslistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.varargslist`.
	 * @param ctx the parse tree
	 */
	exitVarargslist?: (ctx: VarargslistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.vfpdef`.
	 * @param ctx the parse tree
	 */
	enterVfpdef?: (ctx: VfpdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.vfpdef`.
	 * @param ctx the parse tree
	 */
	exitVfpdef?: (ctx: VfpdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.stmt`.
	 * @param ctx the parse tree
	 */
	enterStmt?: (ctx: StmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.stmt`.
	 * @param ctx the parse tree
	 */
	exitStmt?: (ctx: StmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.simple_stmts`.
	 * @param ctx the parse tree
	 */
	enterSimple_stmts?: (ctx: Simple_stmtsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.simple_stmts`.
	 * @param ctx the parse tree
	 */
	exitSimple_stmts?: (ctx: Simple_stmtsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.simple_stmt`.
	 * @param ctx the parse tree
	 */
	enterSimple_stmt?: (ctx: Simple_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.simple_stmt`.
	 * @param ctx the parse tree
	 */
	exitSimple_stmt?: (ctx: Simple_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.expr_stmt`.
	 * @param ctx the parse tree
	 */
	enterExpr_stmt?: (ctx: Expr_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.expr_stmt`.
	 * @param ctx the parse tree
	 */
	exitExpr_stmt?: (ctx: Expr_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.annassign`.
	 * @param ctx the parse tree
	 */
	enterAnnassign?: (ctx: AnnassignContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.annassign`.
	 * @param ctx the parse tree
	 */
	exitAnnassign?: (ctx: AnnassignContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.testlist_star_expr`.
	 * @param ctx the parse tree
	 */
	enterTestlist_star_expr?: (ctx: Testlist_star_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.testlist_star_expr`.
	 * @param ctx the parse tree
	 */
	exitTestlist_star_expr?: (ctx: Testlist_star_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.augassign`.
	 * @param ctx the parse tree
	 */
	enterAugassign?: (ctx: AugassignContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.augassign`.
	 * @param ctx the parse tree
	 */
	exitAugassign?: (ctx: AugassignContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.del_stmt`.
	 * @param ctx the parse tree
	 */
	enterDel_stmt?: (ctx: Del_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.del_stmt`.
	 * @param ctx the parse tree
	 */
	exitDel_stmt?: (ctx: Del_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.pass_stmt`.
	 * @param ctx the parse tree
	 */
	enterPass_stmt?: (ctx: Pass_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.pass_stmt`.
	 * @param ctx the parse tree
	 */
	exitPass_stmt?: (ctx: Pass_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.flow_stmt`.
	 * @param ctx the parse tree
	 */
	enterFlow_stmt?: (ctx: Flow_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.flow_stmt`.
	 * @param ctx the parse tree
	 */
	exitFlow_stmt?: (ctx: Flow_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.break_stmt`.
	 * @param ctx the parse tree
	 */
	enterBreak_stmt?: (ctx: Break_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.break_stmt`.
	 * @param ctx the parse tree
	 */
	exitBreak_stmt?: (ctx: Break_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.continue_stmt`.
	 * @param ctx the parse tree
	 */
	enterContinue_stmt?: (ctx: Continue_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.continue_stmt`.
	 * @param ctx the parse tree
	 */
	exitContinue_stmt?: (ctx: Continue_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.return_stmt`.
	 * @param ctx the parse tree
	 */
	enterReturn_stmt?: (ctx: Return_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.return_stmt`.
	 * @param ctx the parse tree
	 */
	exitReturn_stmt?: (ctx: Return_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.yield_stmt`.
	 * @param ctx the parse tree
	 */
	enterYield_stmt?: (ctx: Yield_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.yield_stmt`.
	 * @param ctx the parse tree
	 */
	exitYield_stmt?: (ctx: Yield_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.raise_stmt`.
	 * @param ctx the parse tree
	 */
	enterRaise_stmt?: (ctx: Raise_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.raise_stmt`.
	 * @param ctx the parse tree
	 */
	exitRaise_stmt?: (ctx: Raise_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.import_stmt`.
	 * @param ctx the parse tree
	 */
	enterImport_stmt?: (ctx: Import_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.import_stmt`.
	 * @param ctx the parse tree
	 */
	exitImport_stmt?: (ctx: Import_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.import_name`.
	 * @param ctx the parse tree
	 */
	enterImport_name?: (ctx: Import_nameContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.import_name`.
	 * @param ctx the parse tree
	 */
	exitImport_name?: (ctx: Import_nameContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.import_from`.
	 * @param ctx the parse tree
	 */
	enterImport_from?: (ctx: Import_fromContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.import_from`.
	 * @param ctx the parse tree
	 */
	exitImport_from?: (ctx: Import_fromContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.import_as_name`.
	 * @param ctx the parse tree
	 */
	enterImport_as_name?: (ctx: Import_as_nameContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.import_as_name`.
	 * @param ctx the parse tree
	 */
	exitImport_as_name?: (ctx: Import_as_nameContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.dotted_as_name`.
	 * @param ctx the parse tree
	 */
	enterDotted_as_name?: (ctx: Dotted_as_nameContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.dotted_as_name`.
	 * @param ctx the parse tree
	 */
	exitDotted_as_name?: (ctx: Dotted_as_nameContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.import_as_names`.
	 * @param ctx the parse tree
	 */
	enterImport_as_names?: (ctx: Import_as_namesContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.import_as_names`.
	 * @param ctx the parse tree
	 */
	exitImport_as_names?: (ctx: Import_as_namesContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.dotted_as_names`.
	 * @param ctx the parse tree
	 */
	enterDotted_as_names?: (ctx: Dotted_as_namesContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.dotted_as_names`.
	 * @param ctx the parse tree
	 */
	exitDotted_as_names?: (ctx: Dotted_as_namesContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.dotted_name`.
	 * @param ctx the parse tree
	 */
	enterDotted_name?: (ctx: Dotted_nameContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.dotted_name`.
	 * @param ctx the parse tree
	 */
	exitDotted_name?: (ctx: Dotted_nameContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.global_stmt`.
	 * @param ctx the parse tree
	 */
	enterGlobal_stmt?: (ctx: Global_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.global_stmt`.
	 * @param ctx the parse tree
	 */
	exitGlobal_stmt?: (ctx: Global_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.nonlocal_stmt`.
	 * @param ctx the parse tree
	 */
	enterNonlocal_stmt?: (ctx: Nonlocal_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.nonlocal_stmt`.
	 * @param ctx the parse tree
	 */
	exitNonlocal_stmt?: (ctx: Nonlocal_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.assert_stmt`.
	 * @param ctx the parse tree
	 */
	enterAssert_stmt?: (ctx: Assert_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.assert_stmt`.
	 * @param ctx the parse tree
	 */
	exitAssert_stmt?: (ctx: Assert_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.compound_stmt`.
	 * @param ctx the parse tree
	 */
	enterCompound_stmt?: (ctx: Compound_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.compound_stmt`.
	 * @param ctx the parse tree
	 */
	exitCompound_stmt?: (ctx: Compound_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.async_stmt`.
	 * @param ctx the parse tree
	 */
	enterAsync_stmt?: (ctx: Async_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.async_stmt`.
	 * @param ctx the parse tree
	 */
	exitAsync_stmt?: (ctx: Async_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.if_stmt`.
	 * @param ctx the parse tree
	 */
	enterIf_stmt?: (ctx: If_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.if_stmt`.
	 * @param ctx the parse tree
	 */
	exitIf_stmt?: (ctx: If_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.while_stmt`.
	 * @param ctx the parse tree
	 */
	enterWhile_stmt?: (ctx: While_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.while_stmt`.
	 * @param ctx the parse tree
	 */
	exitWhile_stmt?: (ctx: While_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.for_stmt`.
	 * @param ctx the parse tree
	 */
	enterFor_stmt?: (ctx: For_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.for_stmt`.
	 * @param ctx the parse tree
	 */
	exitFor_stmt?: (ctx: For_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.try_stmt`.
	 * @param ctx the parse tree
	 */
	enterTry_stmt?: (ctx: Try_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.try_stmt`.
	 * @param ctx the parse tree
	 */
	exitTry_stmt?: (ctx: Try_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.with_stmt`.
	 * @param ctx the parse tree
	 */
	enterWith_stmt?: (ctx: With_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.with_stmt`.
	 * @param ctx the parse tree
	 */
	exitWith_stmt?: (ctx: With_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.with_item`.
	 * @param ctx the parse tree
	 */
	enterWith_item?: (ctx: With_itemContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.with_item`.
	 * @param ctx the parse tree
	 */
	exitWith_item?: (ctx: With_itemContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.except_clause`.
	 * @param ctx the parse tree
	 */
	enterExcept_clause?: (ctx: Except_clauseContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.except_clause`.
	 * @param ctx the parse tree
	 */
	exitExcept_clause?: (ctx: Except_clauseContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.match_stmt`.
	 * @param ctx the parse tree
	 */
	enterMatch_stmt?: (ctx: Match_stmtContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.match_stmt`.
	 * @param ctx the parse tree
	 */
	exitMatch_stmt?: (ctx: Match_stmtContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.subject_expr`.
	 * @param ctx the parse tree
	 */
	enterSubject_expr?: (ctx: Subject_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.subject_expr`.
	 * @param ctx the parse tree
	 */
	exitSubject_expr?: (ctx: Subject_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.star_named_expressions`.
	 * @param ctx the parse tree
	 */
	enterStar_named_expressions?: (ctx: Star_named_expressionsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.star_named_expressions`.
	 * @param ctx the parse tree
	 */
	exitStar_named_expressions?: (ctx: Star_named_expressionsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.star_named_expression`.
	 * @param ctx the parse tree
	 */
	enterStar_named_expression?: (ctx: Star_named_expressionContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.star_named_expression`.
	 * @param ctx the parse tree
	 */
	exitStar_named_expression?: (ctx: Star_named_expressionContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.case_block`.
	 * @param ctx the parse tree
	 */
	enterCase_block?: (ctx: Case_blockContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.case_block`.
	 * @param ctx the parse tree
	 */
	exitCase_block?: (ctx: Case_blockContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.guard`.
	 * @param ctx the parse tree
	 */
	enterGuard?: (ctx: GuardContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.guard`.
	 * @param ctx the parse tree
	 */
	exitGuard?: (ctx: GuardContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.patterns`.
	 * @param ctx the parse tree
	 */
	enterPatterns?: (ctx: PatternsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.patterns`.
	 * @param ctx the parse tree
	 */
	exitPatterns?: (ctx: PatternsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.pattern`.
	 * @param ctx the parse tree
	 */
	enterPattern?: (ctx: PatternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.pattern`.
	 * @param ctx the parse tree
	 */
	exitPattern?: (ctx: PatternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.as_pattern`.
	 * @param ctx the parse tree
	 */
	enterAs_pattern?: (ctx: As_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.as_pattern`.
	 * @param ctx the parse tree
	 */
	exitAs_pattern?: (ctx: As_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.or_pattern`.
	 * @param ctx the parse tree
	 */
	enterOr_pattern?: (ctx: Or_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.or_pattern`.
	 * @param ctx the parse tree
	 */
	exitOr_pattern?: (ctx: Or_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.closed_pattern`.
	 * @param ctx the parse tree
	 */
	enterClosed_pattern?: (ctx: Closed_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.closed_pattern`.
	 * @param ctx the parse tree
	 */
	exitClosed_pattern?: (ctx: Closed_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.literal_pattern`.
	 * @param ctx the parse tree
	 */
	enterLiteral_pattern?: (ctx: Literal_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.literal_pattern`.
	 * @param ctx the parse tree
	 */
	exitLiteral_pattern?: (ctx: Literal_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.literal_expr`.
	 * @param ctx the parse tree
	 */
	enterLiteral_expr?: (ctx: Literal_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.literal_expr`.
	 * @param ctx the parse tree
	 */
	exitLiteral_expr?: (ctx: Literal_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.complex_number`.
	 * @param ctx the parse tree
	 */
	enterComplex_number?: (ctx: Complex_numberContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.complex_number`.
	 * @param ctx the parse tree
	 */
	exitComplex_number?: (ctx: Complex_numberContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.signed_number`.
	 * @param ctx the parse tree
	 */
	enterSigned_number?: (ctx: Signed_numberContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.signed_number`.
	 * @param ctx the parse tree
	 */
	exitSigned_number?: (ctx: Signed_numberContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.signed_real_number`.
	 * @param ctx the parse tree
	 */
	enterSigned_real_number?: (ctx: Signed_real_numberContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.signed_real_number`.
	 * @param ctx the parse tree
	 */
	exitSigned_real_number?: (ctx: Signed_real_numberContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.real_number`.
	 * @param ctx the parse tree
	 */
	enterReal_number?: (ctx: Real_numberContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.real_number`.
	 * @param ctx the parse tree
	 */
	exitReal_number?: (ctx: Real_numberContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.imaginary_number`.
	 * @param ctx the parse tree
	 */
	enterImaginary_number?: (ctx: Imaginary_numberContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.imaginary_number`.
	 * @param ctx the parse tree
	 */
	exitImaginary_number?: (ctx: Imaginary_numberContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.capture_pattern`.
	 * @param ctx the parse tree
	 */
	enterCapture_pattern?: (ctx: Capture_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.capture_pattern`.
	 * @param ctx the parse tree
	 */
	exitCapture_pattern?: (ctx: Capture_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.pattern_capture_target`.
	 * @param ctx the parse tree
	 */
	enterPattern_capture_target?: (ctx: Pattern_capture_targetContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.pattern_capture_target`.
	 * @param ctx the parse tree
	 */
	exitPattern_capture_target?: (ctx: Pattern_capture_targetContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.wildcard_pattern`.
	 * @param ctx the parse tree
	 */
	enterWildcard_pattern?: (ctx: Wildcard_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.wildcard_pattern`.
	 * @param ctx the parse tree
	 */
	exitWildcard_pattern?: (ctx: Wildcard_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.value_pattern`.
	 * @param ctx the parse tree
	 */
	enterValue_pattern?: (ctx: Value_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.value_pattern`.
	 * @param ctx the parse tree
	 */
	exitValue_pattern?: (ctx: Value_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.attr`.
	 * @param ctx the parse tree
	 */
	enterAttr?: (ctx: AttrContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.attr`.
	 * @param ctx the parse tree
	 */
	exitAttr?: (ctx: AttrContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.name_or_attr`.
	 * @param ctx the parse tree
	 */
	enterName_or_attr?: (ctx: Name_or_attrContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.name_or_attr`.
	 * @param ctx the parse tree
	 */
	exitName_or_attr?: (ctx: Name_or_attrContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.group_pattern`.
	 * @param ctx the parse tree
	 */
	enterGroup_pattern?: (ctx: Group_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.group_pattern`.
	 * @param ctx the parse tree
	 */
	exitGroup_pattern?: (ctx: Group_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.sequence_pattern`.
	 * @param ctx the parse tree
	 */
	enterSequence_pattern?: (ctx: Sequence_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.sequence_pattern`.
	 * @param ctx the parse tree
	 */
	exitSequence_pattern?: (ctx: Sequence_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.open_sequence_pattern`.
	 * @param ctx the parse tree
	 */
	enterOpen_sequence_pattern?: (ctx: Open_sequence_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.open_sequence_pattern`.
	 * @param ctx the parse tree
	 */
	exitOpen_sequence_pattern?: (ctx: Open_sequence_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.maybe_sequence_pattern`.
	 * @param ctx the parse tree
	 */
	enterMaybe_sequence_pattern?: (ctx: Maybe_sequence_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.maybe_sequence_pattern`.
	 * @param ctx the parse tree
	 */
	exitMaybe_sequence_pattern?: (ctx: Maybe_sequence_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.maybe_star_pattern`.
	 * @param ctx the parse tree
	 */
	enterMaybe_star_pattern?: (ctx: Maybe_star_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.maybe_star_pattern`.
	 * @param ctx the parse tree
	 */
	exitMaybe_star_pattern?: (ctx: Maybe_star_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.star_pattern`.
	 * @param ctx the parse tree
	 */
	enterStar_pattern?: (ctx: Star_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.star_pattern`.
	 * @param ctx the parse tree
	 */
	exitStar_pattern?: (ctx: Star_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.mapping_pattern`.
	 * @param ctx the parse tree
	 */
	enterMapping_pattern?: (ctx: Mapping_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.mapping_pattern`.
	 * @param ctx the parse tree
	 */
	exitMapping_pattern?: (ctx: Mapping_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.items_pattern`.
	 * @param ctx the parse tree
	 */
	enterItems_pattern?: (ctx: Items_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.items_pattern`.
	 * @param ctx the parse tree
	 */
	exitItems_pattern?: (ctx: Items_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.key_value_pattern`.
	 * @param ctx the parse tree
	 */
	enterKey_value_pattern?: (ctx: Key_value_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.key_value_pattern`.
	 * @param ctx the parse tree
	 */
	exitKey_value_pattern?: (ctx: Key_value_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.double_star_pattern`.
	 * @param ctx the parse tree
	 */
	enterDouble_star_pattern?: (ctx: Double_star_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.double_star_pattern`.
	 * @param ctx the parse tree
	 */
	exitDouble_star_pattern?: (ctx: Double_star_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.class_pattern`.
	 * @param ctx the parse tree
	 */
	enterClass_pattern?: (ctx: Class_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.class_pattern`.
	 * @param ctx the parse tree
	 */
	exitClass_pattern?: (ctx: Class_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.positional_patterns`.
	 * @param ctx the parse tree
	 */
	enterPositional_patterns?: (ctx: Positional_patternsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.positional_patterns`.
	 * @param ctx the parse tree
	 */
	exitPositional_patterns?: (ctx: Positional_patternsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.keyword_patterns`.
	 * @param ctx the parse tree
	 */
	enterKeyword_patterns?: (ctx: Keyword_patternsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.keyword_patterns`.
	 * @param ctx the parse tree
	 */
	exitKeyword_patterns?: (ctx: Keyword_patternsContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.keyword_pattern`.
	 * @param ctx the parse tree
	 */
	enterKeyword_pattern?: (ctx: Keyword_patternContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.keyword_pattern`.
	 * @param ctx the parse tree
	 */
	exitKeyword_pattern?: (ctx: Keyword_patternContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.test`.
	 * @param ctx the parse tree
	 */
	enterTest?: (ctx: TestContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.test`.
	 * @param ctx the parse tree
	 */
	exitTest?: (ctx: TestContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.test_nocond`.
	 * @param ctx the parse tree
	 */
	enterTest_nocond?: (ctx: Test_nocondContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.test_nocond`.
	 * @param ctx the parse tree
	 */
	exitTest_nocond?: (ctx: Test_nocondContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.lambdef`.
	 * @param ctx the parse tree
	 */
	enterLambdef?: (ctx: LambdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.lambdef`.
	 * @param ctx the parse tree
	 */
	exitLambdef?: (ctx: LambdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.lambdef_nocond`.
	 * @param ctx the parse tree
	 */
	enterLambdef_nocond?: (ctx: Lambdef_nocondContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.lambdef_nocond`.
	 * @param ctx the parse tree
	 */
	exitLambdef_nocond?: (ctx: Lambdef_nocondContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.or_test`.
	 * @param ctx the parse tree
	 */
	enterOr_test?: (ctx: Or_testContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.or_test`.
	 * @param ctx the parse tree
	 */
	exitOr_test?: (ctx: Or_testContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.and_test`.
	 * @param ctx the parse tree
	 */
	enterAnd_test?: (ctx: And_testContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.and_test`.
	 * @param ctx the parse tree
	 */
	exitAnd_test?: (ctx: And_testContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.not_test`.
	 * @param ctx the parse tree
	 */
	enterNot_test?: (ctx: Not_testContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.not_test`.
	 * @param ctx the parse tree
	 */
	exitNot_test?: (ctx: Not_testContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.comparison`.
	 * @param ctx the parse tree
	 */
	enterComparison?: (ctx: ComparisonContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.comparison`.
	 * @param ctx the parse tree
	 */
	exitComparison?: (ctx: ComparisonContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.comp_op`.
	 * @param ctx the parse tree
	 */
	enterComp_op?: (ctx: Comp_opContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.comp_op`.
	 * @param ctx the parse tree
	 */
	exitComp_op?: (ctx: Comp_opContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.star_expr`.
	 * @param ctx the parse tree
	 */
	enterStar_expr?: (ctx: Star_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.star_expr`.
	 * @param ctx the parse tree
	 */
	exitStar_expr?: (ctx: Star_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.xor_expr`.
	 * @param ctx the parse tree
	 */
	enterXor_expr?: (ctx: Xor_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.xor_expr`.
	 * @param ctx the parse tree
	 */
	exitXor_expr?: (ctx: Xor_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.and_expr`.
	 * @param ctx the parse tree
	 */
	enterAnd_expr?: (ctx: And_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.and_expr`.
	 * @param ctx the parse tree
	 */
	exitAnd_expr?: (ctx: And_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.shift_expr`.
	 * @param ctx the parse tree
	 */
	enterShift_expr?: (ctx: Shift_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.shift_expr`.
	 * @param ctx the parse tree
	 */
	exitShift_expr?: (ctx: Shift_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.arith_expr`.
	 * @param ctx the parse tree
	 */
	enterArith_expr?: (ctx: Arith_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.arith_expr`.
	 * @param ctx the parse tree
	 */
	exitArith_expr?: (ctx: Arith_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.term`.
	 * @param ctx the parse tree
	 */
	enterTerm?: (ctx: TermContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.term`.
	 * @param ctx the parse tree
	 */
	exitTerm?: (ctx: TermContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.factor`.
	 * @param ctx the parse tree
	 */
	enterFactor?: (ctx: FactorContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.factor`.
	 * @param ctx the parse tree
	 */
	exitFactor?: (ctx: FactorContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.power`.
	 * @param ctx the parse tree
	 */
	enterPower?: (ctx: PowerContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.power`.
	 * @param ctx the parse tree
	 */
	exitPower?: (ctx: PowerContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.atom_expr`.
	 * @param ctx the parse tree
	 */
	enterAtom_expr?: (ctx: Atom_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.atom_expr`.
	 * @param ctx the parse tree
	 */
	exitAtom_expr?: (ctx: Atom_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.atom`.
	 * @param ctx the parse tree
	 */
	enterAtom?: (ctx: AtomContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.atom`.
	 * @param ctx the parse tree
	 */
	exitAtom?: (ctx: AtomContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.name`.
	 * @param ctx the parse tree
	 */
	enterName?: (ctx: NameContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.name`.
	 * @param ctx the parse tree
	 */
	exitName?: (ctx: NameContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.testlist_comp`.
	 * @param ctx the parse tree
	 */
	enterTestlist_comp?: (ctx: Testlist_compContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.testlist_comp`.
	 * @param ctx the parse tree
	 */
	exitTestlist_comp?: (ctx: Testlist_compContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.trailer`.
	 * @param ctx the parse tree
	 */
	enterTrailer?: (ctx: TrailerContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.trailer`.
	 * @param ctx the parse tree
	 */
	exitTrailer?: (ctx: TrailerContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.subscriptlist`.
	 * @param ctx the parse tree
	 */
	enterSubscriptlist?: (ctx: SubscriptlistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.subscriptlist`.
	 * @param ctx the parse tree
	 */
	exitSubscriptlist?: (ctx: SubscriptlistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.subscript_`.
	 * @param ctx the parse tree
	 */
	enterSubscript_?: (ctx: Subscript_Context) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.subscript_`.
	 * @param ctx the parse tree
	 */
	exitSubscript_?: (ctx: Subscript_Context) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.sliceop`.
	 * @param ctx the parse tree
	 */
	enterSliceop?: (ctx: SliceopContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.sliceop`.
	 * @param ctx the parse tree
	 */
	exitSliceop?: (ctx: SliceopContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.exprlist`.
	 * @param ctx the parse tree
	 */
	enterExprlist?: (ctx: ExprlistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.exprlist`.
	 * @param ctx the parse tree
	 */
	exitExprlist?: (ctx: ExprlistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.testlist`.
	 * @param ctx the parse tree
	 */
	enterTestlist?: (ctx: TestlistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.testlist`.
	 * @param ctx the parse tree
	 */
	exitTestlist?: (ctx: TestlistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.dictorsetmaker`.
	 * @param ctx the parse tree
	 */
	enterDictorsetmaker?: (ctx: DictorsetmakerContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.dictorsetmaker`.
	 * @param ctx the parse tree
	 */
	exitDictorsetmaker?: (ctx: DictorsetmakerContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.classdef`.
	 * @param ctx the parse tree
	 */
	enterClassdef?: (ctx: ClassdefContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.classdef`.
	 * @param ctx the parse tree
	 */
	exitClassdef?: (ctx: ClassdefContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.arglist`.
	 * @param ctx the parse tree
	 */
	enterArglist?: (ctx: ArglistContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.arglist`.
	 * @param ctx the parse tree
	 */
	exitArglist?: (ctx: ArglistContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.argument`.
	 * @param ctx the parse tree
	 */
	enterArgument?: (ctx: ArgumentContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.argument`.
	 * @param ctx the parse tree
	 */
	exitArgument?: (ctx: ArgumentContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.comp_iter`.
	 * @param ctx the parse tree
	 */
	enterComp_iter?: (ctx: Comp_iterContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.comp_iter`.
	 * @param ctx the parse tree
	 */
	exitComp_iter?: (ctx: Comp_iterContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.comp_for`.
	 * @param ctx the parse tree
	 */
	enterComp_for?: (ctx: Comp_forContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.comp_for`.
	 * @param ctx the parse tree
	 */
	exitComp_for?: (ctx: Comp_forContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.comp_if`.
	 * @param ctx the parse tree
	 */
	enterComp_if?: (ctx: Comp_ifContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.comp_if`.
	 * @param ctx the parse tree
	 */
	exitComp_if?: (ctx: Comp_ifContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.encoding_decl`.
	 * @param ctx the parse tree
	 */
	enterEncoding_decl?: (ctx: Encoding_declContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.encoding_decl`.
	 * @param ctx the parse tree
	 */
	exitEncoding_decl?: (ctx: Encoding_declContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.yield_expr`.
	 * @param ctx the parse tree
	 */
	enterYield_expr?: (ctx: Yield_exprContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.yield_expr`.
	 * @param ctx the parse tree
	 */
	exitYield_expr?: (ctx: Yield_exprContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.yield_arg`.
	 * @param ctx the parse tree
	 */
	enterYield_arg?: (ctx: Yield_argContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.yield_arg`.
	 * @param ctx the parse tree
	 */
	exitYield_arg?: (ctx: Yield_argContext) => void;

	/**
	 * Enter a parse tree produced by `Python3Parser.strings`.
	 * @param ctx the parse tree
	 */
	enterStrings?: (ctx: StringsContext) => void;
	/**
	 * Exit a parse tree produced by `Python3Parser.strings`.
	 * @param ctx the parse tree
	 */
	exitStrings?: (ctx: StringsContext) => void;
}

