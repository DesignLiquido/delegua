import { AcessoIndiceVariavel, AtribuicaoPorIndice, Atribuir, Construto, FormatacaoEscrita, FuncaoConstruto, Leia, Literal, Variavel } from "../../construtos";
import { Declaracao, Enquanto, Escolha, Escreva, EscrevaMesmaLinha, Fazer, Para, ParaCada, Se } from "../../declaracoes";
import { RetornoLexador, SimboloInterface, RetornoAvaliadorSintatico } from "../../interfaces";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from "../../tipos-de-simbolos/calango" 

export class AvaliadorSintaticoCalango extends AvaliadorSintaticoBase {
    protected atribuir(): Construto {
    const expressao = this.ou();

    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL_ATRIBUICAO)) {
        const setaAtribuicao = this.simbolos[this.atual - 1];
        const valor = this.atribuir();

        if (expressao instanceof Variavel) {
            return new Atribuir(this.hashArquivo, expressao, valor);
        }

        if (expressao instanceof AcessoIndiceVariavel) {
            return new AtribuicaoPorIndice(
                this.hashArquivo,
                expressao.linha,
                expressao.entidadeChamada,
                expressao.indice,
                valor
            );
        }

        throw this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
    }
    return expressao;     
}

    protected blocoEscopo(): Declaracao[] {
        throw new Error("Método não implementado.");
    }
    protected chamar(): Construto {
        return this.primario();
    }
    protected declaracaoEnquanto(): Enquanto {
        throw new Error("Método não implementado.");
    }
    protected declaracaoEscolha(): Escolha {
        throw new Error("Método não implementado.");
    }

    // Em Calango, método "escreval"
    protected declaracaoEscreva(): Escreva {               
        throw new Error("Método não implementado.");
    }

    //Em Calango, método "escreva"
    protected declaracaoEscrevaMesmaLinha(): Escreva {     
        const simboloAtual = this. avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");
        
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        
        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
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
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();

                return new Variavel(this.hashArquivo, simboloIdentificador);
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.TEXTO:
                const simboloAnterior: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }
    }

    resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return this.expressao();
        }
    }

    protected corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error("Método não implementado.");
    }
   

    private validarSegmentoAlgoritmo(algoritmoOuFuncao: string): void {
        this.consumir(
            tiposDeSimbolos.ALGORITMO,
            `Expressão 'algoritmo' não declarada`
        );
    }

    private validarSegmentoPrincipal(algoritmoOuFuncao: string): void {
        this.consumir(
            tiposDeSimbolos.PRINCIPAL,
            `Expressão 'principal' não declarada`
        )
    }

    analisar(retornoLexador: RetornoLexador<SimboloInterface>, hashArquivo: number): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0,
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];
        
        /* No lexador, o ponto e vírgula é consumido, o que pode gerar algum
         problema já que a expressão "principal" não exige ponto e vírgula */
        this.validarSegmentoAlgoritmo('algoritmo'); 
        this.validarSegmentoPrincipal('principal'); 

        while(!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_PRINCIPAL) {
            const resolucaoDeclaracao = this.resolverDeclaracaoForaDeBloco();

            if (Array.isArray(resolucaoDeclaracao)) {
                declaracoes = declaracoes.concat(resolucaoDeclaracao);
            } else {
                declaracoes.push(resolucaoDeclaracao);
            }
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
    
}