import { Construto, FuncaoConstruto, Leia } from "../../construtos";
import { Declaracao, Enquanto, Escolha, Escreva, Fazer, Para, ParaCada, Se } from "../../declaracoes";
import { RetornoLexador, SimboloInterface, RetornoAvaliadorSintatico } from "../../interfaces";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from "../../tipos-de-simbolos/calango" 

export class AvaliadorSintaticoCalango extends AvaliadorSintaticoBase {
    protected atribuir(): Construto {
        throw new Error("Método não implementado.");
    }
    protected blocoEscopo(): Declaracao[] {
        throw new Error("Método não implementado.");
    }
    protected chamar(): Construto {
        throw new Error("Método não implementado.");
    }
    protected declaracaoEnquanto(): Enquanto {
        throw new Error("Método não implementado.");
    }
    protected declaracaoEscolha(): Escolha {
        throw new Error("Método não implementado.");
    }
    protected declaracaoEscreva(): Escreva {
        throw new Error("Método não implementado.");
    }
    protected declaracaoFazer(): Fazer {
        throw new Error("Método não implementado.");
    }
    protected declaracaoPara(): Para | ParaCada {
        throw new Error("Método não implementado.");
    }
    protected declaracaoSe(): Se {
        throw new Error("Método não implementado.");
    }
    protected expressaoLeia(): Leia {
        throw new Error("Método não implementado.");
    }
    protected primario(): Construto {
        throw new Error("Método não implementado.");
    }
    protected resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] {
        throw new Error("Método não implementado.");
    }

    protected corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error("Método não implementado.");
    }

    private validarSegmentoAlgoritmo(algoritmoOuFuncao: string): void {
        this.consumir(
            tiposDeSimbolos.ALGORITMO,
            `Expresão 'Algoritmo' não declarada`
        );
    }

    private validarSegmentoPrincipal(algoritmoOuFuncao: string): void {
        this.consumir(
            tiposDeSimbolos.PRINCIPAL,
            `Expresão 'principal' não declarada`
        );
    }

    analisar(retornoLexador: RetornoLexador<SimboloInterface>, hashArquivo: number): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0,
        this.blocos = 0;

        // Calango é insensível a quebra de linha
        // while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
        //     this.avancarEDevolverAnterior();
        // }

        let declaracoes = [];
        this.validarSegmentoAlgoritmo('algoritmo');
        declaracoes = declaracoes.concat(this.validarSegmentoAlgoritmo('algoritmo'));
        this.validarSegmentoPrincipal('algoritmo');

        while(!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_PRINCIPAL) {
            declaracoes.push(this.declaracao());
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
    
}