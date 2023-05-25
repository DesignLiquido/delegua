// Generated from fontes\tradutores\python\Python3.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';

import { Single_inputContext } from './python3-parser';
import { File_inputContext } from './python3-parser';
import { Eval_inputContext } from './python3-parser';
import { DecoratorContext } from './python3-parser';
import { DecoratorsContext } from './python3-parser';
import { DecoratedContext } from './python3-parser';
import { Async_funcdefContext } from './python3-parser';
import { FuncdefContext } from './python3-parser';
import { ParametersContext } from './python3-parser';
import { TypedargslistContext } from './python3-parser';
import { TfpdefContext } from './python3-parser';
import { VarargslistContext } from './python3-parser';
import { VfpdefContext } from './python3-parser';
import { StmtContext } from './python3-parser';
import { Simple_stmtContext } from './python3-parser';
import { Small_stmtContext } from './python3-parser';
import { Expr_stmtContext } from './python3-parser';
import { Simple_assignContext } from './python3-parser';
import { AnnassignContext } from './python3-parser';
import { Testlist_star_exprContext } from './python3-parser';
import { AugassignContext } from './python3-parser';
import { Del_stmtContext } from './python3-parser';
import { Pass_stmtContext } from './python3-parser';
import { Flow_stmtContext } from './python3-parser';
import { Break_stmtContext } from './python3-parser';
import { Continue_stmtContext } from './python3-parser';
import { Return_stmtContext } from './python3-parser';
import { Yield_stmtContext } from './python3-parser';
import { Raise_stmtContext } from './python3-parser';
import { Import_stmtContext } from './python3-parser';
import { Import_nameContext } from './python3-parser';
import { Import_fromContext } from './python3-parser';
import { Import_as_nameContext } from './python3-parser';
import { Dotted_as_nameContext } from './python3-parser';
import { Import_as_namesContext } from './python3-parser';
import { Dotted_as_namesContext } from './python3-parser';
import { Dotted_nameContext } from './python3-parser';
import { Global_stmtContext } from './python3-parser';
import { Nonlocal_stmtContext } from './python3-parser';
import { Assert_stmtContext } from './python3-parser';
import { Compound_stmtContext } from './python3-parser';
import { Async_stmtContext } from './python3-parser';
import { If_stmtContext } from './python3-parser';
import { While_stmtContext } from './python3-parser';
import { For_stmtContext } from './python3-parser';
import { Try_stmtContext } from './python3-parser';
import { With_stmtContext } from './python3-parser';
import { With_itemContext } from './python3-parser';
import { Except_clauseContext } from './python3-parser';
import { SuiteContext } from './python3-parser';
import { TestContext } from './python3-parser';
import { Test_nocondContext } from './python3-parser';
import { LambdefContext } from './python3-parser';
import { Lambdef_nocondContext } from './python3-parser';
import { Or_testContext } from './python3-parser';
import { And_testContext } from './python3-parser';
import { Not_testContext } from './python3-parser';
import { ComparisonContext } from './python3-parser';
import { Comp_opContext } from './python3-parser';
import { Star_exprContext } from './python3-parser';
import { ExprContext } from './python3-parser';
import { Xor_exprContext } from './python3-parser';
import { And_exprContext } from './python3-parser';
import { Shift_exprContext } from './python3-parser';
import { Arith_exprContext } from './python3-parser';
import { TermContext } from './python3-parser';
import { FactorContext } from './python3-parser';
import { PowerContext } from './python3-parser';
import { Atom_exprContext } from './python3-parser';
import { AtomContext } from './python3-parser';
import { Testlist_compContext } from './python3-parser';
import { TrailerContext } from './python3-parser';
import { SubscriptlistContext } from './python3-parser';
import { SubscriptContext } from './python3-parser';
import { SliceopContext } from './python3-parser';
import { ExprlistContext } from './python3-parser';
import { TestlistContext } from './python3-parser';
import { DictorsetmakerContext } from './python3-parser';
import { ClassdefContext } from './python3-parser';
import { ArglistContext } from './python3-parser';
import { ArgumentContext } from './python3-parser';
import { Comp_iterContext } from './python3-parser';
import { Comp_forContext } from './python3-parser';
import { Comp_ifContext } from './python3-parser';
import { Encoding_declContext } from './python3-parser';
import { Yield_exprContext } from './python3-parser';
import { Yield_argContext } from './python3-parser';

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `Python3Parser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface Python3Visitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `Python3Parser.single_input`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSingle_input?: (ctx: Single_inputContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.file_input`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFile_input?: (ctx: File_inputContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.eval_input`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEval_input?: (ctx: Eval_inputContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.decorator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDecorator?: (ctx: DecoratorContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.decorators`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDecorators?: (ctx: DecoratorsContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.decorated`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDecorated?: (ctx: DecoratedContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.async_funcdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAsync_funcdef?: (ctx: Async_funcdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.funcdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFuncdef?: (ctx: FuncdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.parameters`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameters?: (ctx: ParametersContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.typedargslist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypedargslist?: (ctx: TypedargslistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.tfpdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTfpdef?: (ctx: TfpdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.varargslist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVarargslist?: (ctx: VarargslistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.vfpdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVfpdef?: (ctx: VfpdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStmt?: (ctx: StmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.simple_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimple_stmt?: (ctx: Simple_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.small_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSmall_stmt?: (ctx: Small_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.expr_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpr_stmt?: (ctx: Expr_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.simple_assign`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimple_assign?: (ctx: Simple_assignContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.annassign`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnnassign?: (ctx: AnnassignContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.testlist_star_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTestlist_star_expr?: (ctx: Testlist_star_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.augassign`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAugassign?: (ctx: AugassignContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.del_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDel_stmt?: (ctx: Del_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.pass_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPass_stmt?: (ctx: Pass_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.flow_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_stmt?: (ctx: Flow_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.break_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBreak_stmt?: (ctx: Break_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.continue_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContinue_stmt?: (ctx: Continue_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.return_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReturn_stmt?: (ctx: Return_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.yield_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitYield_stmt?: (ctx: Yield_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.raise_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRaise_stmt?: (ctx: Raise_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.import_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_stmt?: (ctx: Import_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.import_name`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_name?: (ctx: Import_nameContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.import_from`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_from?: (ctx: Import_fromContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.import_as_name`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_as_name?: (ctx: Import_as_nameContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.dotted_as_name`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotted_as_name?: (ctx: Dotted_as_nameContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.import_as_names`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_as_names?: (ctx: Import_as_namesContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.dotted_as_names`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotted_as_names?: (ctx: Dotted_as_namesContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.dotted_name`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotted_name?: (ctx: Dotted_nameContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.global_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGlobal_stmt?: (ctx: Global_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.nonlocal_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNonlocal_stmt?: (ctx: Nonlocal_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.assert_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssert_stmt?: (ctx: Assert_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.compound_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompound_stmt?: (ctx: Compound_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.async_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAsync_stmt?: (ctx: Async_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.if_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIf_stmt?: (ctx: If_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.while_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhile_stmt?: (ctx: While_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.for_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFor_stmt?: (ctx: For_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.try_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTry_stmt?: (ctx: Try_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.with_stmt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWith_stmt?: (ctx: With_stmtContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.with_item`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWith_item?: (ctx: With_itemContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.except_clause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExcept_clause?: (ctx: Except_clauseContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.suite`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSuite?: (ctx: SuiteContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.test`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTest?: (ctx: TestContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.test_nocond`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTest_nocond?: (ctx: Test_nocondContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.lambdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLambdef?: (ctx: LambdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.lambdef_nocond`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLambdef_nocond?: (ctx: Lambdef_nocondContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.or_test`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOr_test?: (ctx: Or_testContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.and_test`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnd_test?: (ctx: And_testContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.not_test`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNot_test?: (ctx: Not_testContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.comparison`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparison?: (ctx: ComparisonContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.comp_op`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComp_op?: (ctx: Comp_opContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.star_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStar_expr?: (ctx: Star_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpr?: (ctx: ExprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.xor_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitXor_expr?: (ctx: Xor_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.and_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnd_expr?: (ctx: And_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.shift_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShift_expr?: (ctx: Shift_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.arith_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArith_expr?: (ctx: Arith_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.term`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerm?: (ctx: TermContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.factor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFactor?: (ctx: FactorContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.power`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPower?: (ctx: PowerContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.atom_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom_expr?: (ctx: Atom_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.testlist_comp`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTestlist_comp?: (ctx: Testlist_compContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.trailer`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTrailer?: (ctx: TrailerContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.subscriptlist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubscriptlist?: (ctx: SubscriptlistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.subscript`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubscript?: (ctx: SubscriptContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.sliceop`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSliceop?: (ctx: SliceopContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.exprlist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExprlist?: (ctx: ExprlistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.testlist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTestlist?: (ctx: TestlistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.dictorsetmaker`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDictorsetmaker?: (ctx: DictorsetmakerContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.classdef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassdef?: (ctx: ClassdefContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.arglist`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArglist?: (ctx: ArglistContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.argument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArgument?: (ctx: ArgumentContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.comp_iter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComp_iter?: (ctx: Comp_iterContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.comp_for`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComp_for?: (ctx: Comp_forContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.comp_if`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComp_if?: (ctx: Comp_ifContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.encoding_decl`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEncoding_decl?: (ctx: Encoding_declContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.yield_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitYield_expr?: (ctx: Yield_exprContext) => Result;

    /**
     * Visit a parse tree produced by `Python3Parser.yield_arg`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitYield_arg?: (ctx: Yield_argContext) => Result;
}
