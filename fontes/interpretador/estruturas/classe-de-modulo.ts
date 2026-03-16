import { Chamavel } from './chamavel';

export type MetodoDeClasseDeModulo = {
    tipoRetorno: string;
    argumentos: { nome: string; tipo: string }[];
};

export type PropriedadeDeClasseDeModulo = {
    tipo: string;
};

/**
 * Uma classe de módulo não é muito diferente de uma `ClassePadrao`, com o adicional
 * de ter documentações extras para métodos e propriedades.
 */
export class ClasseDeModulo extends Chamavel {
    nome: string;
    modulo: string;
    implementacao: any;
    metodos: { [nome: string]: MetodoDeClasseDeModulo };
    propriedades: { [nome: string]: PropriedadeDeClasseDeModulo };

    constructor(
        nome: string,
        modulo: string,
        implementacao: any,
        metodos: { [nome: string]: any },
        propriedades: { [nome: string]: any }
    ) {
        super();
        this.nome = nome;
        this.modulo = modulo;
        this.implementacao = implementacao;
        this.metodos = metodos;
        this.propriedades = propriedades;
    }
}
