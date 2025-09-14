import { ParaCadaComoConstruto } from "../construtos/para-cada-como-construto";
import { VisitanteComumInterface } from "./visitante-comum-interface";

export interface VisitanteDeleguaInterface extends VisitanteComumInterface {
    visitarExpressaoParaCada(expressao: ParaCadaComoConstruto): Promise<any> | void;
}