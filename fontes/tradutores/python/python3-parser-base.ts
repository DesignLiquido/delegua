import { Parser } from "antlr4ts";

export abstract class Python3ParserBase extends Parser {
    CannotBePlusMinus(): boolean {
        return true;
    }

    CannotBeDotLpEq(): boolean {
        return true;
    }
}