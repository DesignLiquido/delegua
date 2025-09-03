import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Variavel,
} from '../../construtos';
import {
    Bloco,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Fazer,
    Para,
    ParaCada,
    Se,
    Var,
} from '../../declaracoes';
import { RetornoLexador, SimboloInterface, RetornoAvaliadorSintatico } from '../../interfaces';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import tiposDeSimbolos from '../../tipos-de-simbolos/calango';
import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoVariavelOuConstante } from '../../informacao-variavel-ou-constante';

export class AvaliadorSintaticoCalango extends AvaliadorSintaticoBase {

    pilhaEscopos: PilhaEscopos;

    protected atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

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
        throw new Error('Método não implementado.');
    }
    protected chamar(): Construto {
        return this.primario();
    }
    protected declaracaoEnquanto(): Enquanto {
        throw new Error('Método não implementado.');
    }
    protected declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    // Em Calango, método "escreval"
    protected declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        return new Escreva(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    /** 
     * Em Calango, este é o método `escreva()`.
     * @returns {EscrevaMesmaLinha} Uma declaracao de escrita na mesma linha.
     */
    protected declaracaoEscrevaMesmaLinha(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    protected declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = 0;

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(
                        this.hashArquivo,
                        Number(simboloInteiro.linha),
                        valorInicializacao,
                        'inteiro'
                    )
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração de variáveis.'
        );

        return inicializacoes;
    }

    protected declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    protected declaracaoPara(): Para | ParaCada {
        throw new Error('Método não implementado.');
    }

    protected resolverBloco(simbolosParada: string[]): Bloco {
        const declararoes = [];

        while(  
            ![tiposDeSimbolos.FIM_SE].includes(this.simbolos[this.atual].tipo) && !this.estaNoFinal()
        ) {
            declararoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        this.avancarEDevolverAnterior()

        return new Bloco(
            this.hashArquivo,
            Number(this.simbolos[this.atual]),
            declararoes.filter((d) => d)
        );
    }

    protected declaracaoSe(): Se {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do 'se'");
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'entao' após condição");

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const caminhoEntao = this.resolverBloco([
            tiposDeSimbolos.SENAO,
            tiposDeSimbolos.FIM_SE,
        ]); 

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);
            caminhoSenao = this.resolverBloco([
                tiposDeSimbolos.SENAO,
                tiposDeSimbolos.FIM_SE,
            ]);
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        this.consumir(
            tiposDeSimbolos.FIM_SE,
            "Esperado 'fimSe' para finalização de uma instrução se."
        );

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    protected expressaoLeia(): Leia {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' depois da declaração 'leia'"
        );

        const argumentos = [];

        do {
            argumentos.push(this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração 'leia'");

        this.consumir( 
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração leia'
        );

        return new Leia(simboloAtual, argumentos);
    }

    protected primario(): Construto {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                
                try {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                } catch (erro: any) {
                    throw this.erro(simboloIdentificador, erro.message);
                }

                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.NUMERO:               // Precisamos substituir 'NUMERO' por 'REAL' pois Calango não possui 'NUMERO'
            case tiposDeSimbolos.TEXTO:
                const simboloAnterior: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloAnterior.linha),
                    simboloAnterior.literal,
                    simboloAnterior.tipo == tiposDeSimbolos.TEXTO ? 'texto' : 'inteiro', 
                );
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, this.simbolos[this.atual].linha, expressao);
        }
    }

    override resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.ESCREVAL:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.LEIA:
                return this.expressaoLeia();
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return this.expressao();
        }
    }

    protected corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error('Método não implementado.');
    }

    private validarSegmentoAlgoritmo(): void {
        this.consumir(tiposDeSimbolos.ALGORITMO, `Expressão 'algoritmo' não declarada`);

        this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado identificador após 'algoritmo'.`);

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            `Esperado ponto e vírgula após identificador do algoritmo.`
        );
    }

    private validarSegmentoPrincipal(algoritmoOuFuncao: string): void {
        this.consumir(tiposDeSimbolos.PRINCIPAL, `Expressão 'principal' não declarada`);
    }


    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        ((this.atual = 0), (this.blocos = 0));

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];
        
        /* No lexador, o ponto e vírgula é consumido, o que pode gerar algum
         problema já que a expressão "principal" não exige ponto e vírgula(?) */
        this.validarSegmentoAlgoritmo(); 
        this.validarSegmentoPrincipal('principal'); 

        while(!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_PRINCIPAL) {
            const resolucaoDeclaracao = this. resolverDeclaracaoForaDeBloco();

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
