import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoSobrescrita,
    Atribuir,
    DefinirValor,
    FuncaoConstruto,
    Literal,
    Variavel,
} from '../../construtos';
import {
    Bloco,
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

import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { Construto } from '../../construtos/construto';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    tratarSimbolos(simbolos: Array<SimboloInterface>): string | void {
        let identificador = 0,
            adicao = 0,
            subtracao = 0;

        for (const simbolo of simbolos) {
            if (simbolo.tipo === tiposDeSimbolos.IDENTIFICADOR) {
                identificador++;
            } else if (simbolo.tipo === tiposDeSimbolos.ADICAO) {
                adicao++;
            } else if (simbolo.tipo === tiposDeSimbolos.SUBTRACAO) {
                subtracao++;
            }
        }

        if (identificador !== 1 || (adicao > 0 && subtracao > 0)) {
            this.erros.push({
                message: 'Erro: Combinação desconhecida de símbolos.',
                name: 'ErroSintatico',
                simbolo: simbolos[0],
            });
            return;
        }

        if (adicao === 2) {
            return 'ADICAO';
        } else if (subtracao === 2) {
            return 'SUBTRACAO';
        }

        this.erros.push({
            message: 'Erro: Combinação desconhecida de símbolos.',
            name: 'ErroSintatico',
            simbolo: simbolos[0],
        });
        return;
    }

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

    declaracaoPara(): any {
        const primeiroSimbolo = this.consumir(
            tiposDeSimbolos.MAIS,
            'Esperado expressão `MAIS` para iniciar o bloco `PARA`.'
        );
        this.consumir(tiposDeSimbolos.QUERO, 'Esperado expressão `QUERO` após `MAIS` para iniciar o bloco `PARA`.');
        this.consumir(tiposDeSimbolos.MAIS, 'Esperado expressão `MAIS` após `QUERO` para iniciar o bloco `PARA`.');
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado expressão `(` após `MAIS` para iniciar o bloco `PARA`.'
        );

        let declaracaoInicial: any = null;

        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.IDENTIFICADOR) {
            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                this.atual++;
            }
            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO)) {
                this.atual++;
            }
            const valor = this.simbolos[this.atual - 1].literal;
            declaracaoInicial = new Var(
                this.simbolos[this.atual],
                new Literal(this.simbolos[this.atual].linha, this.hashArquivo, valor),
                'numero'
            );
        } else {
            declaracaoInicial = this.declaracao(); // inicialização da variável de controle
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `;` após a inicialização do `PARA`.');

        const condicao = this.declaracao(); // condição de parada

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `;` após a condição do `PARA`.');

        const incremento: Array<any> = [];

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_DIREITO)) {
            incremento.push(this.simbolos[this.atual]);
            this.avancarEDevolverAnterior();
        }

        const declaracoes = [];

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIRL)) {
            declaracoes.push(this.declaracao());
        }

        const incrementoValor = this.tratarSimbolos(incremento);

        const incrementoConstruto: Construto = new Literal(
            this.hashArquivo,
            Number(primeiroSimbolo.linha) + 1,
            incrementoValor as string
        );
        const corpo = new Bloco(
            this.hashArquivo,
            Number(primeiroSimbolo.linha) + 1,
            declaracoes.filter((d) => d)
        );

        return new Para(
            this.hashArquivo,
            Number(primeiroSimbolo.linha),
            declaracaoInicial,
            condicao,
            incrementoConstruto,
            corpo
        );
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
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.BICEPS)) {
            this.consumir(tiposDeSimbolos.BICEPS, '');
        }
        const simboloCaractere = this.consumir(tiposDeSimbolos.FRANGO, '');

        const inicializacoes = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'FRANGO'."
            );
            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloCaractere.hashArquivo), 0), 'texto')
            );

            // Inicialização de variáveis que podem ter valor definido;
            let valorInicializacao: string | Array<string>;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                this.consumir(tiposDeSimbolos.TEXTO, "Esperado ' para começar o texto.");
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado literal de FRANGO após símbolo de igual em declaração de variável.'
                );
                this.consumir(tiposDeSimbolos.TEXTO, "Esperado ' para terminar o texto.");
                valorInicializacao = String(literalInicializacao.literal);
            }

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(simboloCaractere.linha), valorInicializacao),
                    'texto'
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoInteiros(): Var[] {
        let simboloInteiro: SimboloInterface;
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRO)) {
            simboloInteiro = this.consumir(tiposDeSimbolos.MONSTRO, '');
        } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRINHO)) {
            simboloInteiro = this.consumir(tiposDeSimbolos.MONSTRINHO, '');
        } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRAO)) {
            simboloInteiro = this.consumir(tiposDeSimbolos.MONSTRAO, '');
        } else {
            throw new Error('Simbolo referente a inteiro não especificado.');
        }

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${simboloInteiro.lexema}'.`
            );
            let valorInicializacao = 0x00;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    `Esperado literal de ${simboloInteiro.lexema} após símbolo de igual em declaração de variável.`
                );
                valorInicializacao = Number(literalInicializacao.literal);
                inicializacoes.push(
                    new Var(
                        identificador,
                        new Literal(this.hashArquivo, Number(simboloInteiro.linha), valorInicializacao),
                        'numero'
                    )
                );
            } else {
                inicializacoes.push(
                    new Var(identificador, new Literal(this.hashArquivo, Number(simboloInteiro.linha), 0), 'numero')
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return inicializacoes;
    }

    declaracaoPontoFlutuante(): Var[] {
        const simboloFloat = this.consumir(tiposDeSimbolos.TRAPEZIO, '');
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.DESCENDENTE)) {
            this.consumir(tiposDeSimbolos.DESCENDENTE, '');
        }

        const inicializacoes = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'TRAPEZIO'."
            );

            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloFloat.linha), 0), 'numero')
            );

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
                new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(simboloFloat.linha), valorInicializacao),
                    'numero'
                )
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
        const simboloSe: SimboloInterface = this.consumir(
            tiposDeSimbolos.ELE,
            'Esperado expressão `ELE` para condição.'
        );
        this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` após `ELE` para condição.');
        this.consumir(tiposDeSimbolos.A, 'Esperado expressão `A` após `QUE` para condição.');
        this.consumir(tiposDeSimbolos.GENTE, 'Esperado expressão `GENTE` após `A` para condição.');
        this.consumir(tiposDeSimbolos.QUER, 'Esperado expressão `QUER` após `GENTE` para condição.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `QUER` para condição.');

        const condicao = this.declaracao();

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            'Esperado quebra de linha após expressão de condição para condição.'
        );
        const declaracoes = [];
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.consumir(tiposDeSimbolos.QUEBRA_LINHA, '');
        }
        do {
            declaracoes.push(this.declaracao());
            this.avancarEDevolverAnterior();
        } while (![tiposDeSimbolos.BIRL].includes(this.simbolos[this.atual].tipo));

        let caminhoSenao = null;
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.NAO)) {
            const simboloSenao: SimboloInterface = this.consumir(
                tiposDeSimbolos.NAO,
                'Esperado expressão `NAO` após expressão de condição.'
            );
            this.consumir(tiposDeSimbolos.VAI, 'Esperado expressão `VAI` após `NAO`.');
            this.consumir(tiposDeSimbolos.DAR, 'Esperado expressão `DAR` após `VAI`.');
            this.consumir(tiposDeSimbolos.NAO, 'Esperado expressão `NAO` após `DAR`.');

            const declaracaoSenao = [];

            do {
                declaracaoSenao.push(this.declaracao());
            } while (![tiposDeSimbolos.BIRL].includes(this.simbolos[this.atual].tipo));

            caminhoSenao = new Bloco(
                this.hashArquivo,
                Number(simboloSe.linha),
                declaracaoSenao.filter((d) => d)
            );
        }

        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` após expressão de condição.');

        return new Se(
            condicao,
            new Bloco(
                this.hashArquivo,
                Number(simboloSe.linha),
                declaracoes.filter((d) => d)
            ),
            [],
            caminhoSenao
        );
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error('Método não implementado.');
    }

    declaracao(): any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.BORA:
                return this.declaracaoRetorna();
            case tiposDeSimbolos.QUE:
                return this.declaracaoLeia();
            case tiposDeSimbolos.ELE:
                return this.declaracaoSe();
            case tiposDeSimbolos.NEGATIVA:
            // Retornar uma declaração de WHILE
            case tiposDeSimbolos.MAIS:
                return this.declaracaoPara();
            // Declaração de inteiros
            case tiposDeSimbolos.MONSTRO:
            case tiposDeSimbolos.MONSTRINHO:
            case tiposDeSimbolos.MONSTRAO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.BICEPS:
            case tiposDeSimbolos.FRANGO:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.TRAPEZIO:
                return this.declaracaoPontoFlutuante();
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

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
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
