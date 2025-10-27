import { Elvis, EnquantoComoConstruto, FazerComoConstruto, ImportarComoConstruto, ListaCompreensao, ParaCadaComoConstruto, ParaComoConstruto, SeTernario } from "../construtos";
import { Importar, ParaCada } from "../declaracoes";
import { VisitanteComumInterface } from "./visitante-comum-interface";

export interface VisitanteDeleguaInterface extends VisitanteComumInterface {
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> | void;
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void;
    visitarExpressaoEnquanto(expressao: EnquantoComoConstruto): Promise<any> | void;
    visitarExpressaoElvis(expressao: Elvis): Promise<any> | void;
    visitarExpressaoFazer(expressao: FazerComoConstruto): Promise<any> | void;
    visitarExpressaoImportar(expressao: ImportarComoConstruto): Promise<any> | void;
    visitarExpressaoListaCompreensao(listaCompreensao: ListaCompreensao): Promise<any> | void;
    visitarExpressaoPara(expressao: ParaComoConstruto): Promise<any> | void;
    visitarExpressaoParaCada(expressao: ParaCadaComoConstruto): Promise<any> | void;
    visitarExpressaoSeTernario(expressao: SeTernario): Promise<any> | void;
}
