import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de 
 * classe.
 */
export class AcessoMetodo implements Construto {
    linha: number;
    objeto: Construto;
    simbolo: SimboloInterface;

    constructor(objeto: Construto, simbolo: SimboloInterface) {
        this.linha = objeto.linha;
        this.objeto = objeto;
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAcessoMetodo(this);
    }
}
