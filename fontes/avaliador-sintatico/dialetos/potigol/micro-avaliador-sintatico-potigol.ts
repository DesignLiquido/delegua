import { Construto, Logico } from "../../../construtos";
import { Declaracao } from "../../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../../interfaces/retornos";
import { MicroAvaliadorSintaticoBase } from "../../micro-avaliador-sintatico-base";

// import tiposDeSimbolos from '../../../tipos-de-simbolos/potigol';

export class MicroAvaliadorSintaticoPotigol 
    extends MicroAvaliadorSintaticoBase
{
    hashArquivo: number;

    constructor(hashArquivo: number) {
        super();
        this.hashArquivo = hashArquivo;
    }

    chamar(): Construto {
        throw new Error("Método não implementado.");
    }

    analisar(retornoLexador: RetornoLexador, linha: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.linha = linha;

        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        while (this.atual < this.simbolos.length) {
            declaracoes.push(this.declaracao() as Declaracao);
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}