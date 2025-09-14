import { ParaCadaComoConstruto } from "../construtos/para-cada-como-construto";
import { ParaCada } from "../declaracoes";
import { VisitanteComumInterface } from "./visitante-comum-interface";

export interface VisitanteDeleguaInterface extends VisitanteComumInterface {
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void;
    visitarExpressaoParaCada(expressao: ParaCadaComoConstruto): Promise<any> | void;
}
