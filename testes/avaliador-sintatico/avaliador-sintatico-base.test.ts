import { AvaliadorSintaticoBase } from '../../fontes/avaliador-sintatico/avaliador-sintatico-base';
import {
    Binario,
    Construto,
    FuncaoConstruto,
    Literal,
    Logico,
    Unario,
    Variavel,
    Chamada,
    Leia,
} from '../../fontes/construtos';
import {
    Declaracao,
    Enquanto,
    Escreva,
    Para,
    ParaCada,
    Se,
    Var,
    Bloco,
    FuncaoDeclaracao,
} from '../../fontes/declaracoes';
import { SimboloInterface } from '../../fontes/interfaces';
import { RetornoAvaliadorSintatico, RetornoLexador } from '../../fontes/interfaces/retornos';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

/**
 * Implementação concreta do AvaliadorSintaticoBase para fins de teste.
 * Implementa os métodos abstratos de forma mínima para permitir testes.
 */
class AvaliadorSintaticoBaseMock extends AvaliadorSintaticoBase {
    protected atribuir(): Construto {
        return this.ou();
    }

    protected blocoEscopo(): Declaracao[] {
        return [];
    }

    protected chamar(): Construto {
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

    protected corpoDaFuncao(tipo: string): FuncaoConstruto {
        const linha = this.simboloAnterior().linha;

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos parâmetros.");

        const parametros = !this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)
            ? this.logicaComumParametros()
            : [];

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os parâmetros.");
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do corpo ${tipo}.`);

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, linha, parametros, corpo);
    }

    protected declaracaoEnquanto(): Enquanto {
        throw new Error('Método não implementado em mock.');
    }

    protected declaracaoEscreva(): Escreva {
        throw new Error('Método não implementado em mock.');
    }

    protected declaracaoPara(): Para | ParaCada {
        throw new Error('Método não implementado em mock.');
    }

    protected declaracaoSe(): Se {
        throw new Error('Método não implementado em mock.');
    }

    protected expressaoLeia(): Leia {
        throw new Error('Método não implementado em mock.');
    }

    protected primario(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO)) {
            return new Literal(this.hashArquivo, this.simboloAnterior().linha, false);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO)) {
            return new Literal(this.hashArquivo, this.simboloAnterior().linha, true);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO)) {
            return new Literal(this.hashArquivo, this.simboloAnterior().linha, Number(this.simboloAnterior().lexema));
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TEXTO)) {
            return new Literal(this.hashArquivo, this.simboloAnterior().linha, String(this.simboloAnterior().lexema));
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
            return new Variavel(this.hashArquivo, this.simboloAnterior());
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            const expressao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
            return expressao;
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    protected resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] {
        throw new Error('Método não implementado em mock.');
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.hashArquivo = hashArquivo;
        this.simbolos = retornoLexador.simbolos;

        const declaracoes: Declaracao[] = [];

        return {
            declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}

describe('Avaliador Sintático Base', () => {
    let avaliador: AvaliadorSintaticoBaseMock;

    beforeEach(() => {
        avaliador = new AvaliadorSintaticoBaseMock();
    });

    function criarSimbolo(tipo: string, lexema: string = '', linha: number = 1): SimboloInterface {
        return {
            tipo,
            lexema,
            literal: lexema,
            linha,
            hashArquivo: -1,
        } as SimboloInterface;
    }

    describe('erro()', () => {
        it('Deve criar um erro de avaliador sintático', () => {
            const simbolo = criarSimbolo(tiposDeSimbolos.NUMERO, '123');
            const mensagem = 'Erro de teste';

            const erro = avaliador.erro(simbolo, mensagem);

            expect(erro).toBeDefined();
            expect(erro.simbolo).toBe(simbolo);
            expect(erro.message).toBe(mensagem);
        });
    });

    describe('consumir()', () => {
        it('Deve consumir símbolo quando tipo corresponde', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const simbolo = avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');

            expect(simbolo.tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
            expect(avaliador.atual).toBe(1);
        });

        it('Deve lançar erro quando tipo não corresponde', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow('Esperado identificador');
        });

        it('Deve lançar erro quando lista de símbolos está vazia', () => {
            avaliador.simbolos = [];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow('Esperado identificador');
        });

        it('Deve lançar erro quando atual excede tamanho da lista', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 5;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow();
        });
    });

    describe('simboloAnterior()', () => {
        it('Deve retornar símbolo anterior', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
            ];
            avaliador.atual = 1;

            const simbolo = avaliador['simboloAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
        });

        it('Deve lançar erro quando não há símbolo anterior', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x')];
            avaliador.atual = 0;

            expect(() => {
                avaliador['simboloAnterior']();
            }).toThrow('Este é o primeiro símbolo da sequência vinda do Lexador.');
        });
    });

    describe('verificarTipoSimboloAtual()', () => {
        it('Deve retornar verdadeiro quando tipo corresponde', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.NUMERO);

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando tipo não corresponde', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.TEXTO);

            expect(resultado).toBe(false);
        });

        it('Deve retornar falso quando está no final', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const resultado = avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.NUMERO);

            expect(resultado).toBe(false);
        });
    });

    describe('verificarTipoProximoSimbolo()', () => {
        it('Deve retornar verdadeiro quando próximo símbolo tem o tipo correto', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const resultado = avaliador['verificarTipoProximoSimbolo'](tiposDeSimbolos.ADICAO);

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando próximo símbolo tem tipo diferente', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const resultado = avaliador['verificarTipoProximoSimbolo'](tiposDeSimbolos.SUBTRACAO);

            expect(resultado).toBe(false);
        });
    });

    describe('estaNoFinal()', () => {
        it('Deve retornar verdadeiro quando atual está no final', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const resultado = avaliador['estaNoFinal']();

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando atual não está no final', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = avaliador['estaNoFinal']();

            expect(resultado).toBe(false);
        });
    });

    describe('avancarEDevolverAnterior()', () => {
        it('Deve avançar e retornar símbolo anterior', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const simbolo = avaliador['avancarEDevolverAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.NUMERO);
            expect(avaliador.atual).toBe(1);
        });

        it('Não deve avançar quando está no final', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const simbolo = avaliador['avancarEDevolverAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.NUMERO);
            expect(avaliador.atual).toBe(1);
        });
    });

    describe('verificarSeSimboloAtualEIgualA()', () => {
        it('Deve retornar verdadeiro e avançar quando tipo corresponde', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;

            const resultado = avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO
            );

            expect(resultado).toBe(true);
            expect(avaliador.atual).toBe(1);
        });

        it('Deve retornar falso e não avançar quando tipo não corresponde', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO
            );

            expect(resultado).toBe(false);
            expect(avaliador.atual).toBe(0);
        });

        it('Deve verificar múltiplos tipos', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-')];
            avaliador.atual = 0;

            const resultado = avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.MULTIPLICACAO
            );

            expect(resultado).toBe(true);
            expect(avaliador.atual).toBe(1);
        });
    });

    describe('finalizarChamada()', () => {
        it('Deve criar chamada sem argumentos', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));
            const chamada = avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(0);
        });

        it('Deve criar chamada com um argumento', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));
            const chamada = avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(1);
        });

        it('Deve criar chamada com múltiplos argumentos', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.NUMERO, '15'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));
            const chamada = avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(3);
        });

        it('Deve lançar erro quando falta parêntese direito', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));

            expect(() => {
                avaliador['finalizarChamada'](entidade);
            }).toThrow();
        });

        it('Deve lançar erro quando há mais de 255 argumentos', () => {
            // Criar 256 argumentos
            const simbolos: SimboloInterface[] = [];
            for (let i = 0; i < 256; i++) {
                simbolos.push(criarSimbolo(tiposDeSimbolos.NUMERO, String(i)));
                if (i < 255) {
                    simbolos.push(criarSimbolo(tiposDeSimbolos.VIRGULA, ','));
                }
            }
            simbolos.push(criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'));

            avaliador.simbolos = simbolos;
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));

            expect(() => {
                avaliador['finalizarChamada'](entidade);
            }).toThrow('Não pode haver mais de 255 argumentos.');
        });
    });

    describe('unario()', () => {
        it('Deve processar operador de negação', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NEGACAO, '!'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['unario']();

            expect(expressao).toBeInstanceOf(Unario);
            expect((expressao as Unario).operador.tipo).toBe(tiposDeSimbolos.NEGACAO);
        });

        it('Deve processar operador de subtração unária', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['unario']();

            expect(expressao).toBeInstanceOf(Unario);
            expect((expressao as Unario).operador.tipo).toBe(tiposDeSimbolos.SUBTRACAO);
        });

        it('Deve processar valor sem operador unário', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['unario']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('exponenciacao()', () => {
        it('Deve processar exponenciação', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.EXPONENCIACAO);
        });

        it('Deve processar múltiplas exponenciações (associatividade à direita)', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Binario);
        });

        it('Deve processar expressão sem exponenciação', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('multiplicar()', () => {
        it('Deve processar multiplicação', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MULTIPLICACAO);
        });

        it('Deve processar divisão', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.DIVISAO, '/'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIVISAO);
        });

        it('Deve processar divisão inteira', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA, '//'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIVISAO_INTEIRA);
        });

        it('Deve processar módulo', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MODULO, '%'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MODULO);
        });

        it('Deve processar múltiplas operações de multiplicação', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.DIVISAO, '/'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('adicaoOuSubtracao()', () => {
        it('Deve processar adição', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.ADICAO);
        });

        it('Deve processar subtração', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.SUBTRACAO);
        });

        it('Deve processar múltiplas operações de adição e subtração', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('comparar()', () => {
        it('Deve processar maior que', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MAIOR, '>'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MAIOR);
        });

        it('Deve processar maior ou igual', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MAIOR_IGUAL, '>='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MAIOR_IGUAL);
        });

        it('Deve processar menor que', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MENOR, '<'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MENOR);
        });

        it('Deve processar menor ou igual', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MENOR_IGUAL, '<='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MENOR_IGUAL);
        });
    });

    describe('comparacaoIgualdade()', () => {
        it('Deve processar igualdade com ==', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.IGUAL_IGUAL, '=='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.IGUAL_IGUAL);
        });

        it('Deve processar igualdade com =', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.IGUAL);
        });

        it('Deve processar diferença', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.DIFERENTE, '!='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIFERENTE);
        });
    });

    describe('e()', () => {
        it('Deve processar operador lógico E', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['e']();

            expect(expressao).toBeInstanceOf(Logico);
            expect((expressao as Logico).operador.tipo).toBe(tiposDeSimbolos.E);
        });

        it('Deve processar múltiplos operadores E', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['e']();

            expect(expressao).toBeInstanceOf(Logico);
        });

        it('Deve processar expressão sem operador E', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['e']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('ou()', () => {
        it('Deve processar operador lógico OU', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['ou']();

            expect(expressao).toBeInstanceOf(Logico);
            expect((expressao as Logico).operador.tipo).toBe(tiposDeSimbolos.OU);
        });

        it('Deve processar múltiplos operadores OU', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['ou']();

            expect(expressao).toBeInstanceOf(Logico);
        });
    });

    describe('expressao()', () => {
        it('Deve processar expressão simples', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '42')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['expressao']();

            expect(expressao).toBeInstanceOf(Literal);
        });

        it('Deve processar expressão complexa', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['expressao']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('logicaComumParametros()', () => {
        it('Deve processar parâmetro simples', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].nome.lexema).toBe('x');
            expect(parametros[0].abrangencia).toBe('padrao');
        });

        it('Deve processar múltiplos parâmetros', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'y'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'z'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(3);
            expect(parametros[0].nome.lexema).toBe('x');
            expect(parametros[1].nome.lexema).toBe('y');
            expect(parametros[2].nome.lexema).toBe('z');
        });

        it('Deve processar parâmetro com valor padrão', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].valorPadrao).toBeDefined();
        });

        it('Deve processar parâmetro múltiplo com *', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'args'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].abrangencia).toBe('multiplo');
        });

        it('Deve lançar erro quando há mais de 255 parâmetros', () => {
            // Criar 256 parâmetros
            const simbolos: SimboloInterface[] = [];
            for (let i = 0; i < 256; i++) {
                simbolos.push(criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, `param${i}`));
                if (i < 255) {
                    simbolos.push(criarSimbolo(tiposDeSimbolos.VIRGULA, ','));
                }
            }

            avaliador.simbolos = simbolos;
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['logicaComumParametros']();
            }).toThrow('Função não pode ter mais de 255 parâmetros.');
        });
    });

    describe('Métodos não implementados', () => {
        it('declaracaoDeVariaveis deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoDeVariaveis']();
            }).toThrow('Método não implementado.');
        });

        it('bitShift deve lançar erro', () => {
            expect(() => {
                avaliador['bitShift']();
            }).toThrow('Método não implementado.');
        });

        it('bitE deve lançar erro', () => {
            expect(() => {
                avaliador['bitE']();
            }).toThrow('Método não implementado.');
        });

        it('bitOu deve lançar erro', () => {
            expect(() => {
                avaliador['bitOu']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoContinua deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoContinua']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoDeClasse deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoDeClasse']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoDeVariavel deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoDeVariavel']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoExpressao deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoExpressao']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoRetorna deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoRetorna']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoSustar deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoSustar']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoTente deve lançar erro', () => {
            expect(() => {
                avaliador['declaracaoTente']();
            }).toThrow('Método não implementado.');
        });

        it('em deve lançar erro', () => {
            expect(() => {
                avaliador['em']();
            }).toThrow('Método não implementado.');
        });

        it('resolverDeclaracao deve lançar erro', () => {
            expect(() => {
                avaliador['resolverDeclaracao']();
            }).toThrow('Método não implementado.');
        });
    });

    describe('chamar()', () => {
        it('Deve processar chamada de função', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '('),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Chamada);
        });

        it('Deve processar chamada de função com argumentos', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '('),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Chamada);
            expect((expressao as Chamada).argumentos.length).toBe(1);
        });

        it('Deve processar expressão sem chamada', () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '42')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('funcao()', () => {
        it('Deve processar declaração de função', () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.FUNCAO, 'funcao'),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'minhaFuncao'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '('),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
                criarSimbolo(tiposDeSimbolos.CHAVE_ESQUERDA, '{'),
                criarSimbolo(tiposDeSimbolos.CHAVE_DIREITA, '}'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const funcao = avaliador['funcao']('função');

            expect(funcao).toBeInstanceOf(FuncaoDeclaracao);
            expect(funcao.simbolo.lexema).toBe('minhaFuncao');
        });
    });

    describe('analisar()', () => {
        it('Deve inicializar estado corretamente', () => {
            const retornoLexador: RetornoLexador<SimboloInterface> = {
                simbolos: [
                    criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                ],
                erros: [],
            };

            const resultado = avaliador.analisar(retornoLexador, 123);

            expect(avaliador.atual).toBe(0);
            expect(avaliador.hashArquivo).toBe(123);
            expect(avaliador.simbolos.length).toBe(1);
            expect(resultado.erros.length).toBe(0);
        });
    });
});
