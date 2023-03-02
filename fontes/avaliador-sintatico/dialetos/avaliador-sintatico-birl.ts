import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoSobrescrita,
    Atribuir,
    Construto,
    DefinirValor,
    FuncaoConstruto,
    Literal,
    Variavel,
} from '../../construtos';
import {
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Leia,
    Para,
    Retorna,
    Se,
    Var,
} from '../../declaracoes';
import { RetornoAvaliadorSintatico, RetornoLexador } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import { SimboloInterface } from '../../interfaces';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';

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

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
            return new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.FRANGAO,
                tiposDeSimbolos.FRANGÃO,
                tiposDeSimbolos.FRANGO,
                tiposDeSimbolos.TEXTO
            )
        ) {
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
        this.consumir(tiposDeSimbolos.NEGATIVA, 'Esperado expressão `NEGATIVA` para iniciar o bloco `ENQUANTO`.');
        this.consumir(
            tiposDeSimbolos.BAMBAM,
            'Esperado expressão `BAMBAM` após `NEGATIVA` para iniciar o bloco `ENQUANTO`.'
        );
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado expressão `(` após `BAMBAM` para iniciar o bloco `ENQUANTO`.'
        );
        const codicao = this.expressao();
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado expressão `)` após a condição para iniciar o bloco `ENQUANTO`.'
        );

        const declaracoes = [];

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIRL)) {
            declaracoes.push(this.declaracao());
        }

        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechar o bloco `ENQUANTO`.');
        return new Enquanto(codicao, declaracoes);
    }

    declaracaoExpressao(): Expressao {
        const expressao = this.expressao();
        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após expressão.");
        return new Expressao(expressao);
    }

    declaracaoPara(): Para {
        const simboloPara: SimboloInterface = this.consumir(
            tiposDeSimbolos.MAIS,
            'Esperado expressão `MAIS` para iniciar o bloco `PARA`.'
        );
        this.consumir(tiposDeSimbolos.QUERO, 'Esperado expressão `QUERO` após `MAIS` para iniciar o bloco `PARA`.');
        this.consumir(tiposDeSimbolos.MAIS, 'Esperado expressão `MAIS` após `QUERO` para iniciar o bloco `PARA`.');
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado expressão `(` após `MAIS` para iniciar o bloco `PARA`.'
        );

        let inicializador: Var | Expressao;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            inicializador = null;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MONSTRO)) {
            inicializador = this.declaracaoDeVariavel();
        } else {
            inicializador = this.declaracaoExpressao();
        }

        let condicao = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            condicao = this.expressao();
        }

        let incrementar = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            incrementar = this.expressao();
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado expressão `)` após a condição para iniciar o bloco `PARA`.'
        );

        const declaracao = [];

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIRL)) {
            declaracao.push(this.declaracao());
        }

        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechar o bloco `PARA`.');

        return new Para(this.hashArquivo, simboloPara.linha, 0, 0, 0, 0);
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
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado parêntese esquerdo após interrogação para escrever mensagem.'
        );

        const argumento = this.declaracao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado parêntese direito após argumento para escrever mensagem.'
        );

        return new Escreva(Number(primeiroSimbolo.linha), this.hashArquivo, [argumento]);
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    declaracaoCaracteres(): Var[] {
        const simboloCaractere = this.consumir(tiposDeSimbolos.FRANGO, '');

        const inicializacoes = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'FRANGO'."
            );
            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloCaractere.hashArquivo), 0))
            );

            // Inicialização de variáveis que podem ter valor definido;
            let valorInicializacao = '';
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                this.consumir(tiposDeSimbolos.TEXTO, "Esperado ' para começar o texto.");
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado literal de FRANGO após símbolo de igual em declaração de variável.'
                );
                this.consumir(tiposDeSimbolos.TEXTO, "Esperado ' para terminar o texto.");
                valorInicializacao = String(literalInicializacao.literal); // Error nessa linha
            }

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(simboloCaractere.linha), valorInicializacao)
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.MONSTRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'MONSTRO'."
            );
            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloInteiro.linha), 0)));

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = 0;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado literal de MONSTRO após símbolo de igual em declaração de variável.'
                );
                valorInicializacao = Number(literalInicializacao.literal);
            }

            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloInteiro.linha), valorInicializacao))
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoPontoFlutuante(): Var[] {
        const simboloFloat = this.consumir(tiposDeSimbolos.TRAPEZIO, '');

        const inicializacoes = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'TRAPEZIO'."
            );

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloFloat.linha), 0)));

            // Inicializações de variáveis que podem ter valores definidos
            let valorInicializacao = 0x00;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado literal de TRAPEZIO após símbolo de igual em declaração de variavel.'
                );
                valorInicializacao = parseFloat(literalInicializacao.literal);
            }

            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloFloat.linha), valorInicializacao))
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return inicializacoes;
    }

    declaracaoRetorna(): Retorna {
        const primeiroSimbolo = this.consumir(tiposDeSimbolos.BORA, 'Esperado expressão `BORA` para retornar valor.');
        this.consumir(tiposDeSimbolos.CUMPADE, 'Esperado expressão `CUMPADE` após `BORA` para retornar valor.');
        // this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `CUMPADE` para retornar valor.');

        const valor = this.declaracao();

        return new Retorna(primeiroSimbolo, valor);
    }

    declaracaoLeia(): Leia {
        const primeiroSimbolo = this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` para ler valor.');
        this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` após `QUE` para ler valor.');
        this.consumir(tiposDeSimbolos.CE, 'Esperado expressão `CE` após `QUE` para ler valor.');
        this.consumir(tiposDeSimbolos.QUER, 'Esperado expressão `QUER` após `CE` para ler valor.');
        this.consumir(tiposDeSimbolos.MONSTRAO, 'Esperado expressão `MONSTRAO` após `QUER` para ler valor.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `MONSTRAO` para ler valor.');
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado parêntese esquerdo após interrogação para ler valor.'
        );
        const simbolo = this.consumir(tiposDeSimbolos.TEXTO, 'Esperado texto após parêntese esquerdo para ler valor.');
        const ponteiro = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador após texto para ler valor.'
        );
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado parêntese direito após identificador para ler valor.'
        );
        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após parêntese direito para ler valor.'
        );

        return new Leia(Number(primeiroSimbolo.linha), this.hashArquivo, []);
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
                return this.declaracaoLeia();
            case tiposDeSimbolos.ELE:
            // Retornar uma declaração de IF
            case tiposDeSimbolos.NEGATIVA:
            // Retornar uma declaração de WHILE
            case tiposDeSimbolos.MAIS:
                return this.declaracaoPara();
            // Declaração de inteiros
            case tiposDeSimbolos.MONSTRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.FRANGO:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.TRAPEZIO:
                return this.declaracaoPontoFlutuante();
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
