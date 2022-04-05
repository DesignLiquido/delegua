import { Construto } from "./construto";

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de 
 * classe.
 */
export class AcessoMetodo implements Construto {
    linha: number;
    objeto: Construto;
    nome: any;

    constructor(objeto: Construto, nome: any) {
        this.linha = objeto.linha;
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoObter(this);
    }
}
