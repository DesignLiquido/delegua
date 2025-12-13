import { AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade, AcessoIntervaloVariavel } from "../../../construtos";
import { Interpretador } from "../../interpretador";

import * as comum from './comum';

export class InterpretadorPitugues extends Interpretador {
    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoMetodoOuPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> {
        return comum.visitarExpressaoAcessoIntervaloVariavel(this, expressao);
    }
}
