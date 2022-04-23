import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de 
 * classe.
 */
export class AcessoMetodo implements Construto {
    linha: number;
    hashArquivo?: number;

    objeto: Construto;
    simbolo: SimboloInterface;

    constructor(hashArquivo: number, objeto: Construto, simbolo: SimboloInterface) {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;
        
        this.objeto = objeto;
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAcessoMetodo(this);
    }
}
