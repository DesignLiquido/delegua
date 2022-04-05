import { Construto } from "./construto";

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de 
 * classe.
 */
export class AcessoMetodo implements Construto {
    linha: number;
    objeto: any;
    nome: any;

    constructor(linha: number, objeto: any, nome: any) {
        this.linha = linha;
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoObter(this);
    }
}
