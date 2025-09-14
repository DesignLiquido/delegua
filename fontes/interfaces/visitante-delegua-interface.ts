import { EnquantoComoConstruto, FazerComoConstruto, ParaComoConstruto } from "../construtos";
import { ParaCadaComoConstruto } from "../construtos/para-cada-como-construto";
import { ParaCada } from "../declaracoes";
import { VisitanteComumInterface } from "./visitante-comum-interface";

export interface VisitanteDeleguaInterface extends VisitanteComumInterface {
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void;
    visitarExpressaoEnquanto(expressao: EnquantoComoConstruto): Promise<any> | void;
    visitarExpressaoFazer(expressao: FazerComoConstruto): Promise<any> | void;
    visitarExpressaoPara(expressao: ParaComoConstruto): Promise<any> | void;
    visitarExpressaoParaCada(expressao: ParaCadaComoConstruto): Promise<any> | void;
}
