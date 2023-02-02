import { AcessoIndiceVariavel, AcessoMetodo, Agrupamento, AtribuicaoSobrescrita, Atribuir, Construto, DefinirValor, FuncaoConstruto, Literal, Variavel } from '../../construtos';
import { Escreva, Declaracao, Enquanto, Para, Escolha, Fazer, Se, Retorna } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';

import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { SimboloInterface } from '../../interfaces';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    validarSegmentoHoraDoShow(): void {
        this.consumir(tiposDeSimbolos.HORA, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.consumir(tiposDeSimbolos.DO, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.consumir(tiposDeSimbolos.SHOW, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.blocos += 1;
    }

    validarSegmentoBirlFinal(): void {
        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechamento do programa');
        this.blocos -= 1;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NEGATIVO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.POSITIVO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), true);

        /* if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR, tiposDeSimbolos.METODO_BIBLIOTECA_GLOBAL)
        ) {
            return new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        } */

        if (this.verificarSeSimboloAtualEIgualA(
            tiposDeSimbolos.NUMERO,
            tiposDeSimbolos.FRANGAO,
            tiposDeSimbolos.FRANGÃO,
            tiposDeSimbolos.FRANGO,
            tiposDeSimbolos.TEXTO)) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            const expressao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

            return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
        }
    }

    chamar(): Construto {
        return this.primario();
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new DefinirValor(this.hashArquivo, 0, get.objeto, get.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(
                    this.hashArquivo,
                    0,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    blocoEscopo(): Declaracao[] {
        throw new Error('Método não implementado.');
    }

    declaracaoEnquanto(): Enquanto {
        throw new Error('Método não implementado.');
    }

    declaracaoPara(): Para {
        throw new Error('Método não implementado.');
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    declaracaoEscreva(): Escreva {
        const primeiroSimbolo = this.consumir(tiposDeSimbolos.CE, 'Esperado expressão `CE` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.QUER, 'Esperado expressão `QUER` após `CE` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.VER, 'Esperado expressão `VER` após `QUER` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.ESSA, 'Esperado expressão `ESSA` após `VER` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.PORRA, 'Esperado expressão `PORRA` após `ESSA` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `PORRA` para escrever mensagem.');
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após interrogação para escrever mensagem.');

        const argumento = this.declaracao();

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado parêntese direito após argumento para escrever mensagem.');

        return new Escreva(Number(primeiroSimbolo.linha), this.hashArquivo, [argumento]);
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    declaracaoRetorna(): Retorna {
        const primeiroSimbolo = this.consumir(tiposDeSimbolos.BORA, 'Esperado expressão `BORA` para retornar valor.');
        this.consumir(tiposDeSimbolos.CUMPADE, 'Esperado expressão `CUMPADE` após `BORA` para retornar valor.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `CUMPADE` para retornar valor.');

        const valor = this.declaracao();

        return new Retorna(primeiroSimbolo, valor);
    }

    declaracaoSe(): Se {
        throw new Error('Método não implementado.');
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error('Método não implementado.');
    }



    declaracao(): any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.BORA: // BORA CUMPADE?
                return this.declaracaoRetorna();
            case tiposDeSimbolos.QUE:
            // Retornar uma declaração de leia
            case tiposDeSimbolos.ELE:
            // Retornar uma declaração de IF
            case tiposDeSimbolos.NEGATIVA:
            // Retornar uma declaração de WHILE
            case tiposDeSimbolos.MAIS:
            // Retornar uma declaração de FOR
            case tiposDeSimbolos.VAMO:
            // Retornar uma declaração de continue
            case tiposDeSimbolos.SAI:
            // Retornar uma declaração de break
            case tiposDeSimbolos.OH:
            // Retornar uma declaração de funcao
            case tiposDeSimbolos.AJUDA:
            // Retornar uma declaração de chamar funcao
            case tiposDeSimbolos.CE: // "CE QUER VER ESSA PORRA?"
                return this.declaracaoEscreva();
            case tiposDeSimbolos.PONTO_E_VIRGULA:
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return this.expressao();
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.blocos = 0;
        this.atual = 0;

        // 1 validação
        /* if (this.blocos > 0) {
            throw new ErroAvaliadorSintatico(
                null,
                'Quantidade de blocos abertos não corresponde com a quantidade de blocos fechados'
            );
        } */

        this.simbolos = retornoLexador.simbolos;
        const declaracoes = [];

        this.validarSegmentoHoraDoShow();

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.BIRL) {
            declaracoes.push(this.declaracao());
        }

        this.validarSegmentoBirlFinal();

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}
