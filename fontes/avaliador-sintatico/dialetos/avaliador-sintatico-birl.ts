import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Literal,
    Unario,
    Variavel,
} from '../../construtos';
import {
    Bloco,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Leia,
    Para,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../../declaracoes';
import { RetornoAvaliadorSintatico, RetornoLexador } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import { Construto } from '../../construtos/construto';
import { ParametroInterface, SimboloInterface } from '../../interfaces';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';

/**
 * Avaliador Sintático de BIRL
 */
export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    private validarEscopoPrograma(): Declaracao[] {
        let declaracoes: Declaracao[] = [];
        this.validarSegmentoHoraDoShow();

        while (!this.estaNoFinal()) {
            const declaracaoVetor = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoVetor)) {
                declaracoes = declaracoes.concat(declaracaoVetor);
            } else {
                declaracoes.push(declaracaoVetor);
            }
        }

        this.validarSegmentoBirlFinal();
        return declaracoes;
    }

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
        this.regredirEDevolverAtual();
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.BIRL)) {
            this.consumir(
                tiposDeSimbolos.QUEBRA_LINHA,
                'Esperado expressão `QUEBRA_LINHA` após a declaração de variáveis'
            );
            this.regredirEDevolverAtual();
            this.regredirEDevolverAtual();
        }
        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechamento do programa');
        this.blocos -= 1;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ADICAO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), true);

        // Simplesmente avança o símbolo por enquanto.
        // O `if` de baixo irá tratar a referência.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTEIRO);

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

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else {
                break;
            }
        }

        return expressao;
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
                return new AtribuicaoPorIndice(this.hashArquivo, 0, expressao.entidadeChamada, expressao.indice, valor);
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
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
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

        let declaracaoInicial: Variavel | Expressao | null | any[] = null;

        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.IDENTIFICADOR) {
            const variavelLoop = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado expressão `IDENTIFICADOR` após `(` para iniciar o bloco `PARA`.'
            );
            this.consumir(
                tiposDeSimbolos.IGUAL,
                'Esperado expressão `=` após `IDENTIFICADOR` para iniciar o bloco `PARA`.'
            );
            const valor = this.consumir(
                tiposDeSimbolos.NUMERO,
                'Esperado expressão `NUMERO` após `=` para iniciar o bloco `PARA`.'
            );
            declaracaoInicial = [
                new Variavel(this.hashArquivo, variavelLoop),
                new Literal(this.hashArquivo, Number(valor.linha), Number(valor.literal)),
            ];
        } else {
            const declaracaoVetor = this.resolverDeclaracaoForaDeBloco(); // inicialização da variável de controle
            if (Array.isArray(declaracaoVetor)) {
                declaracaoInicial = declaracaoVetor[0];
            } else {
                declaracaoInicial = declaracaoVetor;
            }
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `;` após a inicialização do `PARA`.');

        const condicao = this.resolverDeclaracaoForaDeBloco(); // condição de parada

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `;` após a condição do `PARA`.');

        const incremento = this.resolverDeclaracaoForaDeBloco();

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado expressão `)` após a condição do `PARA`.');
        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, 'Esperado expressão `QUEBRA_LINHA` após a condição do `PARA`.');

        const declaracoes = [];

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIRL)) {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        const corpo = new Bloco(
            this.hashArquivo,
            Number(this.simbolos[this.atual].linha) + 1,
            declaracoes.filter((d) => d)
        );

        return new Para(
            this.hashArquivo,
            Number(this.simbolos[this.atual].linha),
            declaracaoInicial,
            condicao,
            incremento,
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
        const argumentos = [];

        argumentos.push(this.resolverDeclaracaoForaDeBloco());

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.VIRGULA)) {
            this.avancarEDevolverAnterior(); // Vírgula
            const variavelParaEscrita = this.resolverDeclaracaoForaDeBloco();
            argumentos.push(variavelParaEscrita);
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado parêntese direito após argumento para escrever mensagem.'
        );

        return new Escreva(Number(primeiroSimbolo.linha), this.hashArquivo, argumentos);
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
        let eLiteral = true;

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'FRANGO'."
            );

            let valorInicializacao: string | Array<string>;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                if (this.verificarTipoSimboloAtual(tiposDeSimbolos.AJUDA)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.TEXTO)) {
                    const literalInicializacao = this.consumir(
                        tiposDeSimbolos.TEXTO,
                        "Esperado ' para começar o texto."
                    );
                    valorInicializacao = String(literalInicializacao.literal);
                } else {
                    throw new Error(
                        'Erro ao declarar variável do tipo texto. Verifique se esta atribuindo um valor do tipo texto.'
                    );
                }
                inicializacoes.push(
                    new Var(
                        identificador,
                        eLiteral
                            ? new Literal(this.hashArquivo, Number(simboloCaractere.linha), valorInicializacao)
                            : (valorInicializacao as any),
                        'texto'
                    )
                );
            } else {
                inicializacoes.push(
                    new Var(
                        identificador,
                        new Literal(this.hashArquivo, Number(simboloCaractere.hashArquivo), ''),
                        'texto'
                    )
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    validarTipoDeclaracaoInteiro(): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRO)) {
            return this.consumir(tiposDeSimbolos.MONSTRO, '');
        } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRINHO)) {
            return this.consumir(tiposDeSimbolos.MONSTRINHO, '');
        } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MONSTRAO)) {
            return this.consumir(tiposDeSimbolos.MONSTRAO, '');
        } else {
            throw new Error('Simbolo referente a inteiro não especificado.');
        }
    }

    declaracaoInteiros(): Var[] {
        let simboloInteiro: SimboloInterface = this.validarTipoDeclaracaoInteiro();
        let eLiteral = true;
        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${simboloInteiro.lexema}'.`
            );
            let valorInicializacao: any = 0x00;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                if (this.verificarTipoSimboloAtual(tiposDeSimbolos.AJUDA)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.NUMERO)) {
                    const literalInicializacao = this.consumir(
                        tiposDeSimbolos.NUMERO,
                        `Esperado literal de ${simboloInteiro.lexema} após símbolo de igual em declaração de variável.`
                    );
                    valorInicializacao = Number(literalInicializacao.literal);
                } else {
                    throw new Error(
                        `Simbolo passado para inicialização de variável do tipo ${simboloInteiro.lexema} não é válido.`
                    );
                }
                inicializacoes.push(
                    new Var(
                        identificador,
                        eLiteral
                            ? new Literal(this.hashArquivo, Number(simboloInteiro.linha), valorInicializacao)
                            : valorInicializacao,
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
        let eLiteral = true;
        const inicializacoes = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'TRAPEZIO'."
            );

            let valorInicializacao: any = 0x00;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                if (this.verificarTipoSimboloAtual(tiposDeSimbolos.AJUDA)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
                    eLiteral = false;
                    valorInicializacao = this.resolverDeclaracaoForaDeBloco();
                } else if (this.verificarTipoSimboloAtual(tiposDeSimbolos.NUMERO)) {
                    const literalInicializacao = this.consumir(
                        tiposDeSimbolos.NUMERO,
                        "Esperado literal de 'TRAPEZIO' após símbolo de igual em declaração de variável."
                    );
                    valorInicializacao = parseFloat(literalInicializacao.literal);
                } else {
                    throw new Error(`Simbolo passado para inicialização de variável do tipo 'TRAPEZIO' não é válido.`);
                }
                inicializacoes.push(
                    new Var(
                        identificador,
                        eLiteral
                            ? new Literal(this.hashArquivo, Number(simboloFloat.linha), valorInicializacao)
                            : valorInicializacao,
                        'numero'
                    )
                );
            } else {
                inicializacoes.push(
                    new Var(identificador, new Literal(this.hashArquivo, Number(simboloFloat.linha), 0), 'numero')
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return inicializacoes;
    }

    declaracaoRetorna(): Retorna {
        const primeiroSimbolo = this.consumir(tiposDeSimbolos.BORA, 'Esperado expressão `BORA` para retornar valor.');
        this.consumir(tiposDeSimbolos.CUMPADE, 'Esperado expressão `CUMPADE` após `BORA` para retornar valor.');
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.INTERROGACAO)) {
            this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado interrogação após `CUMPADE` para retornar valor.');
        }

        const valor = this.resolverDeclaracaoForaDeBloco();

        return new Retorna(primeiroSimbolo, valor);
    }

    protected validaTipoDeclaracaoLeia(caracteres: string): string {
        const tipoCaractere = caracteres.charAt(1);

        const tipos = {
            d: 'número',
            i: 'número',
            u: 'número',
            f: 'número',
            F: 'número',
            e: 'número',
            E: 'número',
            g: 'número',
            G: 'número',
            x: 'número',
            X: 'número',
            o: 'número',
            c: 'texto',
            s: 'texto',
            p: 'texto',
        };

        return tipos[tipoCaractere] || 'desconhecido';
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
        const textoOuSimbolo = this.consumir(
            tiposDeSimbolos.TEXTO,
            'Esperado texto após parêntese esquerdo para ler valor.'
        );
        this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula após texto para ler valor.');
        this.consumir(tiposDeSimbolos.PONTEIRO, 'Esperado expressão `&` após texto para ler valor.');
        const variavel = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador após `&` para ler valor.'
        );

        const tipo = this.validaTipoDeclaracaoLeia(textoOuSimbolo.literal);

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado parêntese direito após identificador para ler valor.'
        );

        return new Leia(primeiroSimbolo, [
            new Variavel(this.hashArquivo, variavel),
            new Literal(this.hashArquivo, Number(textoOuSimbolo.linha), tipo),
        ]);
    }

    protected consomeSeSenao() {
        this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` após `SE`.');
        this.consumir(tiposDeSimbolos.NAO, 'Esperado expressão `NAO` após `QUE`.');
        this.consumir(tiposDeSimbolos.VAI, 'Esperado expressão `VAI` após `NAO`.');
        this.consumir(tiposDeSimbolos.DAR, 'Esperado expressão `DAR` após `VAI`.');
        this.consumir(tiposDeSimbolos.O, 'Esperado expressão `O` após `DAR`.');
        this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` após `O`.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado expressão `?` após `QUE`.');
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após `?`.');
        const condicaoSeSenao = this.resolverDeclaracaoForaDeBloco();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado parêntese direito após expressão de condição.');

        return {
            condicaoSeSenao,
        };
    }

    protected consomeSe() {
        const simboloSe: SimboloInterface = this.consumir(tiposDeSimbolos.ELE, 'Esperado expressão `ELE`.');
        this.consumir(tiposDeSimbolos.QUE, 'Esperado expressão `QUE` após `ELE`.');
        this.consumir(tiposDeSimbolos.A, 'Esperado expressão `A` após `QUE`.');
        this.consumir(tiposDeSimbolos.GENTE, 'Esperado expressão `GENTE` após `A`.');
        this.consumir(tiposDeSimbolos.QUER, 'Esperado expressão `QUER` após `GENTE`.');
        this.consumir(tiposDeSimbolos.INTERROGACAO, 'Esperado expressão `?` após `QUER`.');
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após `?`.');
        const condicaoSe = this.resolverDeclaracaoForaDeBloco();
        // @TODO: Verificar se é possível consumir os dois símbolos juntos.
        // Consumindo n == 1 || n == 2 separado.
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado parêntese direito após expressão de condição.');

        return {
            simboloSe,
            condicaoSe,
        };
    }

    consumeSenao() {
        this.consumir(tiposDeSimbolos.NAO, 'Esperado expressão `NAO` após `SE`.');
        this.consumir(tiposDeSimbolos.VAI, 'Esperado expressão `VAI` após `NAO`.');
        this.consumir(tiposDeSimbolos.DAR, 'Esperado expressão `DAR` após `VAI`.');
        this.consumir(tiposDeSimbolos.NAO, 'Esperado expressão `NAO` após `DAR`.');
    }

    resolveCaminhoSe() {
        let controle: boolean = true;
        const declaracoesEntao = [];
        while (controle) {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.BIRL:
                case tiposDeSimbolos.NAO:
                    controle = false;
                    break;
                case tiposDeSimbolos.QUE:
                    if (this.verificarTipoProximoSimbolo(tiposDeSimbolos.NAO)) {
                        controle = false;
                        break;
                    }
                default:
                    declaracoesEntao.push(this.resolverDeclaracaoForaDeBloco());
            }
        }

        return new Bloco(
            this.hashArquivo,
            Number(this.simbolos[this.atual].linha),
            declaracoesEntao.filter((d) => d)
        );
    }

    declaracaoSe(): Se {
        const { condicaoSe, simboloSe } = this.consomeSe();

        const caminhoEntão = this.resolveCaminhoSe();

        const caminhoSeSenao = [];

        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.BIRL) &&
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.NAO)
        ) {
            const { condicaoSeSenao } = this.consomeSeSenao();

            const caminho = this.resolveCaminhoSe();

            caminhoSeSenao.push({
                condicao: condicaoSeSenao,
                caminho: caminho,
            });
        }

        let caminhoSenao = null;

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.NAO)) {
            this.consumeSenao();
            const declaraçõesSenao = [];
            while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.BIRL)) {
                declaraçõesSenao.push(this.resolverDeclaracaoForaDeBloco());
            }
            caminhoSenao = new Bloco(
                this.hashArquivo,
                Number(this.simbolos[this.atual].linha),
                declaraçõesSenao.filter((d) => d)
            );
        }

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.BIRL)) {
            this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` após `SE`.');
        }

        return new Se(condicaoSe, caminhoEntão, caminhoSeSenao, caminhoSenao);
    }

    resolveSimboloInterfaceParaTiposDadosInterface(simbolo: SimboloInterface) {
        switch (simbolo.tipo) {
            case tiposDeSimbolos.TRAPEZIO:
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DESCENDENTE);
            case tiposDeSimbolos.MONSTRO:
            case tiposDeSimbolos.MONSTRINHO:
            case tiposDeSimbolos.MONSTRAO:
                return 'numero';
            case tiposDeSimbolos.FRANGO:
                return 'texto';
            default:
                throw new Error('Tipo desconhecido');
        }
    }

    protected logicaComumParamentros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {
                abrangencia: 'padrao',
            };

            const tipo = this.resolveTipo(this.simbolos[this.atual].tipo);
            const resolucaoTipo = this.resolveSimboloInterfaceParaTiposDadosInterface(tipo);
            parametro.tipoDado = {
                nome: this.simbolos[this.atual].lexema,
                tipo: resolucaoTipo
            }
            this.avancarEDevolverAnterior();
            parametro.nome = this.simbolos[this.atual];

            parametros.push(parametro as ParametroInterface);
            this.avancarEDevolverAnterior();

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
                this.avancarEDevolverAnterior();
            }
        } while (![tiposDeSimbolos.PARENTESE_DIREITO].includes(this.simbolos[this.atual].tipo));
        return parametros;
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        const parenteseEsquerdo = this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, `Esperado '(' após o nome ${tipo}`);

        let paramentros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            paramentros = this.logicaComumParamentros();
        }
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        let corpo = [];

        do {
            const declaracaoVetor = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoVetor)) {
                corpo = corpo.concat(declaracaoVetor);
            } else {
                corpo.push(declaracaoVetor);
            }
        } while (![tiposDeSimbolos.BIRL].includes(this.simbolos[this.atual].tipo));

        return new FuncaoConstruto(
            this.hashArquivo,
            Number(parenteseEsquerdo.linha),
            paramentros,
            corpo.filter((c) => c)
        );
    }

    declacacaoEnquanto(): Enquanto {
        const simboloEnquanto: SimboloInterface = this.consumir(
            tiposDeSimbolos.NEGATIVA,
            'Esperado expressão `NEGATIVA`.'
        );
        this.consumir(tiposDeSimbolos.BAMBAM, 'Esperado expressão `BAMBAM` após `NEGATIVA`.');
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após `BAMBAM`.');
        const condicao = this.resolverDeclaracaoForaDeBloco(); // E para ser um binario.
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado parêntese direito após expressão de condição.');
        const declaracoes = [];
        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIRL)) {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        return new Enquanto(
            condicao,
            new Bloco(
                simboloEnquanto.hashArquivo,
                Number(simboloEnquanto.linha),
                declaracoes.filter((d) => d)
            )
        );
    }

    declaracaoSustar(): Sustar {
        this.consumir(tiposDeSimbolos.SAI, 'Esperado expressão `SAI`.');
        this.consumir(tiposDeSimbolos.FILHO, 'Esperado expressão `FILHO` após `SAI`.');
        this.consumir(tiposDeSimbolos.DA, 'Esperado expressão `DA` após `FILHO`.');
        this.consumir(tiposDeSimbolos.PUTA, 'Esperado expressão `PUTA` após `DA`.');
        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `PONTO_E_VIRGULA` após `PUTA`.');
        return new Sustar(this.simbolos[this.atual - 1]);
    }

    declaracaoContinua(): Continua {
        this.consumir(tiposDeSimbolos.VAMO, 'Esperado expressão `VAMO`.');
        this.consumir(tiposDeSimbolos.MONSTRO, 'Esperado expressão `MONSTRO` após `VAMO`.');
        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado expressão `PONTO_E_VIRGULA` após `MONSTRO`.');

        return new Continua(this.simbolos[this.atual - 1]);
    }

    resolveTipo(tipo: string): SimboloInterface {
        switch (tipo) {
            case tiposDeSimbolos.TRAPEZIO:
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DESCENDENTE);
            case tiposDeSimbolos.MONSTRAO:
            case tiposDeSimbolos.MONSTRINHO:
            case tiposDeSimbolos.MONSTRO:
            case tiposDeSimbolos.FRANGO:
            case tiposDeSimbolos.BICEPS:
                return this.simbolos[this.atual];
            default:
                throw new Error('Esperado tipo da função');
        }
    }

    funcao(tipo: string): FuncaoDeclaracao {
        this.consumir(tiposDeSimbolos.OH, 'Esperado expressão `OH`.');
        this.consumir(tiposDeSimbolos.O, 'Esperado expressão `O` após `OH`.');
        this.consumir(tiposDeSimbolos.HOME, 'Esperado expressão `HOME` após `O`.');
        this.consumir(tiposDeSimbolos.AI, 'Esperado expressão `AI` após `HOME`.');
        this.consumir(tiposDeSimbolos.PO, 'Esperado expressão `PO` após `AI`.');
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após `PO`.');

        let tipoRetorno: SimboloInterface = this.resolveTipo(this.simbolos[this.atual].tipo);
        this.avancarEDevolverAnterior();
        const nomeFuncao: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da função apos a declaração do tipo.'
        );

        return new FuncaoDeclaracao(nomeFuncao, this.corpoDaFuncao(tipo), tipoRetorno);
    }

    declaracaoChamaFuncao(): Chamada {
        const declaracaoInicio = this.consumir(tiposDeSimbolos.AJUDA, 'Esperado expressão `AJUDA`.');
        this.consumir(tiposDeSimbolos.O, 'Esperado expressão `O` após `AJUDA`.');
        this.consumir(tiposDeSimbolos.MALUCO, 'Esperado expressão `MALUCO` após `O`.');
        this.consumir(tiposDeSimbolos.TA, 'Esperado expressão `TA` após `MALUCO`.');
        this.consumir(tiposDeSimbolos.DOENTE, 'Esperado expressão `DOENTE` após `TA`.');
        let expressao = this.primario();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado parêntese esquerdo após `DOENTE`.');

        const paramentros = [];
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            paramentros.push(this.resolverDeclaracaoForaDeBloco());
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.VIRGULA)) {
                this.avancarEDevolverAnterior();
            }
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado parêntese direito após lista de parâmetros.');
        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, 'Esperado ponto e vírgula após a chamada de função.');

        return new Chamada(declaracaoInicio.hashArquivo, expressao, null, paramentros);
    }

    resolverDeclaracaoForaDeBloco(): any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
            case tiposDeSimbolos.DECREMENTAR:
                let adicionaOuSubtrai;
                if ([tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(simboloAtual.tipo)) {
                    adicionaOuSubtrai = this.consumir(
                        tiposDeSimbolos[simboloAtual.tipo],
                        'Esperado expressão `INCREMENTAR` ou `DECREMENTAR`.'
                    );
                }
                if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
                    const identificador = this.consumir(
                        tiposDeSimbolos.IDENTIFICADOR,
                        'Esperado expressão `IDENTIFICADOR`.'
                    );
                    return new Unario(
                        this.hashArquivo,
                        adicionaOuSubtrai,
                        new Variavel(this.hashArquivo, identificador),
                        'ANTES'
                    );
                }
                return;
            case tiposDeSimbolos.BORA:
                return this.declaracaoRetorna();
            case tiposDeSimbolos.SAI:
                return this.declaracaoSustar();
            case tiposDeSimbolos.VAMO:
                return this.declaracaoContinua();
            case tiposDeSimbolos.QUE:
                return this.declaracaoLeia();
            case tiposDeSimbolos.ELE:
                return this.declaracaoSe();
            case tiposDeSimbolos.NEGATIVA:
                return this.declacacaoEnquanto();
            case tiposDeSimbolos.MAIS:
                return this.declaracaoPara();
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
                return this.funcao('funcao');
            case tiposDeSimbolos.AJUDA:
                return this.declaracaoChamaFuncao();
            case tiposDeSimbolos.CE:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.PONTO_E_VIRGULA:
            case tiposDeSimbolos.QUEBRA_LINHA:
            case tiposDeSimbolos.BIRL:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.simbolos[this.atual];
                if (
                    this.simbolos[this.atual + 1] &&
                    [tiposDeSimbolos.DECREMENTAR, tiposDeSimbolos.INCREMENTAR].includes(
                        this.simbolos[this.atual + 1].tipo
                    )
                ) {
                    this.avancarEDevolverAnterior();
                    const simboloIncrementoDecremento: SimboloInterface = this.avancarEDevolverAnterior();
                    return new Unario(
                        this.hashArquivo,
                        simboloIncrementoDecremento,
                        new Variavel(this.hashArquivo, simboloIdentificador),
                        'DEPOIS'
                    );
                }

                return this.expressao();

            default:
                return this.expressao();
        }
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.blocos = 0;
        this.atual = 0;

        this.simbolos = retornoLexador.simbolos;
        const declaracoes: Declaracao[] = this.validarEscopoPrograma();

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
