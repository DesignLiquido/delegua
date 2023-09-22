import { Agrupamento, ConstanteOuVariavel, Construto, Literal, Logico } from '../../../construtos';
import { Declaracao } from '../../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../../interfaces/retornos';
import { MicroAvaliadorSintaticoBase } from '../../micro-avaliador-sintatico-base';
import { SeletorTuplas, Tupla } from '../../../construtos/tuplas';
import { SimboloInterface } from '../../../interfaces';

import tiposDeSimbolos from '../../../tipos-de-simbolos/potigol';

export class MicroAvaliadorSintaticoPotigol extends MicroAvaliadorSintaticoBase {
    hashArquivo: number;

    constructor(hashArquivo: number) {
        super();
        this.hashArquivo = hashArquivo;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.ou();
                switch (this.simbolos[this.atual].tipo) {
                    case tiposDeSimbolos.VIRGULA:
                        // Tupla
                        const argumentos = [expressao];
                        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
                            this.avancarEDevolverAnterior();
                            argumentos.push(this.ou());
                        }

                        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                        return new SeletorTuplas(...argumentos) as Tupla;
                    default:
                        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                        return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
                }

            case tiposDeSimbolos.CARACTERE:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.LOGICO:
            case tiposDeSimbolos.REAL:
            case tiposDeSimbolos.TEXTO:
                const simboloLiteral: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloLiteral.linha), simboloLiteral.literal);
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                const simboloVerdadeiroFalso: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloVerdadeiroFalso.linha),
                    simboloVerdadeiroFalso.tipo === tiposDeSimbolos.VERDADEIRO
                );
            case tiposDeSimbolos.VIRGULA:
                return undefined;
            default:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                return new ConstanteOuVariavel(this.hashArquivo, simboloIdentificador);
        }
    }

    chamar(): Construto {
        return this.primario();
    }

    analisar(retornoLexador: RetornoLexador<SimboloInterface>, linha: number): RetornoAvaliadorSintatico<Declaracao> {
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
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
