import { Morsa } from "../construtos";
import { VisitanteComumInterface } from "./visitante-comum-interface";

export interface VisitantePituguesInterface extends VisitanteComumInterface {
    visitarExpressaoMorsa(expressao: Morsa): Promise<any> | void;
}