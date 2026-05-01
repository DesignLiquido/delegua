import { AvaliadorSintaticoBase } from '../../fontes/avaliador-sintatico/avaliador-sintatico-base';
import { ConstrutoInterface } from '../../fontes/interfaces/construtos/construto-interface';
import {
    Binario,
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
import { RetornoAvaliadorSintaticoInterface, RetornoLexadorInterface } from '../../fontes/interfaces/retornos';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

/**
 * Implementação concreta do AvaliadorSintaticoBase para fins de teste.
 * Implementa os métodos abstratos de forma mínima para permitir testes.
 */
class AvaliadorSintaticoBaseMock extends AvaliadorSintaticoBase {
    protected async atribuir(): Promise<ConstrutoInterface> {
        return await this.ou();
    }

    protected async blocoEscopo(): Promise<Declaracao[]> {
        return Promise.resolve([]);
    }

    protected async chamar(): Promise<ConstrutoInterface> {
        let expressao = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = await this.finalizarChamada(expressao);
            } else {
                break;
            }
        }

        return expressao;
    }

    protected async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        const linha = this.simboloAnterior().linha;

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos parâmetros.");

        const parametros = !this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)
            ? await this.logicaComumParametros()
            : [];

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os parâmetros.");
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do corpo ${tipo}.`);

        const corpo = await this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, linha, parametros, corpo);
    }

    protected async declaracaoEnquanto(): Promise<Enquanto> {
        throw new Error('Método não implementado em mock.');
    }

    protected async declaracaoEscreva(): Promise<Escreva> {
        throw new Error('Método não implementado em mock.');
    }

    protected async declaracaoPara(): Promise<Para | ParaCada> {
        throw new Error('Método não implementado em mock.');
    }

    protected async declaracaoSe(): Promise<Se> {
        throw new Error('Método não implementado em mock.');
    }

    protected async expressaoLeia(): Promise<Leia> {
        throw new Error('Método não implementado em mock.');
    }

    protected async primario(): Promise<ConstrutoInterface> {
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
            const expressao = await this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
            return expressao;
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    protected async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        throw new Error('Método não implementado em mock.');
    }

    async analisar(
        retornoLexador: RetornoLexadorInterface<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintaticoInterface<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.hashArquivo = hashArquivo;
        this.simbolos = retornoLexador.simbolos;

        const declaracoes: Declaracao[] = [];

        return {
            declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintaticoInterface<Declaracao>;
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
        it('Deve criar um erro de avaliador sintático', async () => {
            const simbolo = criarSimbolo(tiposDeSimbolos.NUMERO, '123');
            const mensagem = 'Erro de teste';

            const erro = avaliador.erro(simbolo, mensagem);

            expect(erro).toBeDefined();
            expect(erro.simbolo).toBe(simbolo);
            expect(erro.message).toBe(mensagem);
        });
    });

    describe('consumir()', () => {
        it('Deve consumir símbolo quando tipo corresponde', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const simbolo = await avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');

            expect(simbolo.tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
            expect(avaliador.atual).toBe(1);
        });

        it('Deve lançar erro quando tipo não corresponde', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow('Esperado identificador');
        });

        it('Deve lançar erro quando lista de símbolos está vazia', async () => {
            avaliador.simbolos = [];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow('Esperado identificador');
        });

        it('Deve lançar erro quando atual excede tamanho da lista', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 5;
            avaliador.hashArquivo = -1;

            expect(() => {
                avaliador['consumir'](tiposDeSimbolos.IDENTIFICADOR, 'Esperado identificador');
            }).toThrow();
        });
    });

    describe('simboloAnterior()', () => {
        it('Deve retornar símbolo anterior', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
            ];
            avaliador.atual = 1;

            const simbolo = await avaliador['simboloAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
        });

        it('Deve lançar erro quando não há símbolo anterior', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x')];
            avaliador.atual = 0;

            expect(() => {
                avaliador['simboloAnterior']();
            }).toThrow('Este é o primeiro símbolo da sequência vinda do Lexador.');
        });
    });

    describe('verificarTipoSimboloAtual()', () => {
        it('Deve retornar verdadeiro quando tipo corresponde', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.NUMERO);

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando tipo não corresponde', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.TEXTO);

            expect(resultado).toBe(false);
        });

        it('Deve retornar falso quando está no final', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const resultado = await avaliador['verificarTipoSimboloAtual'](tiposDeSimbolos.NUMERO);

            expect(resultado).toBe(false);
        });
    });

    describe('verificarTipoProximoSimbolo()', () => {
        it('Deve retornar verdadeiro quando próximo símbolo tem o tipo correto', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarTipoProximoSimbolo'](tiposDeSimbolos.ADICAO);

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando próximo símbolo tem tipo diferente', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarTipoProximoSimbolo'](tiposDeSimbolos.SUBTRACAO);

            expect(resultado).toBe(false);
        });
    });

    describe('estaNoFinal()', () => {
        it('Deve retornar verdadeiro quando atual está no final', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const resultado = await avaliador['estaNoFinal']();

            expect(resultado).toBe(true);
        });

        it('Deve retornar falso quando atual não está no final', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = await avaliador['estaNoFinal']();

            expect(resultado).toBe(false);
        });
    });

    describe('avancarEDevolverAnterior()', () => {
        it('Deve avançar e retornar símbolo anterior', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '123'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
            ];
            avaliador.atual = 0;

            const simbolo = await avaliador['avancarEDevolverAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.NUMERO);
            expect(avaliador.atual).toBe(1);
        });

        it('Não deve avançar quando está no final', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 1;

            const simbolo = await avaliador['avancarEDevolverAnterior']();

            expect(simbolo.tipo).toBe(tiposDeSimbolos.NUMERO);
            expect(avaliador.atual).toBe(1);
        });
    });

    describe('verificarSeSimboloAtualEIgualA()', () => {
        it('Deve retornar verdadeiro e avançar quando tipo corresponde', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO
            );

            expect(resultado).toBe(true);
            expect(avaliador.atual).toBe(1);
        });

        it('Deve retornar falso e não avançar quando tipo não corresponde', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '123')];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO
            );

            expect(resultado).toBe(false);
            expect(avaliador.atual).toBe(0);
        });

        it('Deve verificar múltiplos tipos', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-')];
            avaliador.atual = 0;

            const resultado = await avaliador['verificarSeSimboloAtualEIgualA'](
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.MULTIPLICACAO
            );

            expect(resultado).toBe(true);
            expect(avaliador.atual).toBe(1);
        });
    });

    describe('finalizarChamada()', () => {
        it('Deve criar chamada sem argumentos', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));
            const chamada = await avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(0);
        });

        it('Deve criar chamada com um argumento', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));
            const chamada = await avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(1);
        });

        it('Deve criar chamada com múltiplos argumentos', async () => {
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
            const chamada = await avaliador['finalizarChamada'](entidade);

            expect(chamada).toBeInstanceOf(Chamada);
            expect(chamada.argumentos.length).toBe(3);
        });

        it('Deve lançar erro quando falta parêntese direito', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const entidade = new Variavel(-1, criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'));

            await expect(avaliador['finalizarChamada'](entidade)).rejects.toThrow();
        });

        it('Deve lançar erro quando há mais de 255 argumentos', async () => {
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

            await expect(avaliador['finalizarChamada'](entidade)).rejects.toThrow('Não pode haver mais de 255 argumentos.');
        });
    });

    describe('unario()', () => {
        it('Deve processar operador de negação', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NEGACAO, '!'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['unario']();

            expect(expressao).toBeInstanceOf(Unario);
            expect((expressao as Unario).operador.tipo).toBe(tiposDeSimbolos.NEGACAO);
        });

        it('Deve processar operador de subtração unária', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['unario']();

            expect(expressao).toBeInstanceOf(Unario);
            expect((expressao as Unario).operador.tipo).toBe(tiposDeSimbolos.SUBTRACAO);
        });

        it('Deve processar valor sem operador unário', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['unario']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('exponenciacao()', () => {
        it('Deve processar exponenciação', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.EXPONENCIACAO);
        });

        it('Deve processar múltiplas exponenciações (associatividade à direita)', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Binario);
        });

        it('Deve processar expressão sem exponenciação', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '5')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['exponenciacao']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('multiplicar()', () => {
        it('Deve processar multiplicação', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MULTIPLICACAO);
        });

        it('Deve processar divisão', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.DIVISAO, '/'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIVISAO);
        });

        it('Deve processar divisão inteira', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA, '//'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIVISAO_INTEIRA);
        });

        it('Deve processar módulo', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MODULO, '%'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MODULO);
        });

        it('Deve processar múltiplas operações de multiplicação', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.DIVISAO, '/'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['multiplicar']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('adicaoOuSubtracao()', () => {
        it('Deve processar adição', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.ADICAO);
        });

        it('Deve processar subtração', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.SUBTRACAO);
        });

        it('Deve processar múltiplas operações de adição e subtração', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.SUBTRACAO, '-'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['adicaoOuSubtracao']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('comparar()', () => {
        it('Deve processar maior que', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MAIOR, '>'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MAIOR);
        });

        it('Deve processar maior ou igual', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
                criarSimbolo(tiposDeSimbolos.MAIOR_IGUAL, '>='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MAIOR_IGUAL);
        });

        it('Deve processar menor que', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MENOR, '<'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MENOR);
        });

        it('Deve processar menor ou igual', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.MENOR_IGUAL, '<='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparar']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.MENOR_IGUAL);
        });
    });

    describe('comparacaoIgualdade()', () => {
        it('Deve processar igualdade com ==', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.IGUAL_IGUAL, '=='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.IGUAL_IGUAL);
        });

        it('Deve processar igualdade com =', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.IGUAL);
        });

        it('Deve processar diferença', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.DIFERENTE, '!='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['comparacaoIgualdade']();

            expect(expressao).toBeInstanceOf(Binario);
            expect((expressao as Binario).operador.tipo).toBe(tiposDeSimbolos.DIFERENTE);
        });
    });

    describe('e()', () => {
        it('Deve processar operador lógico E', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['e']();

            expect(expressao).toBeInstanceOf(Logico);
            expect((expressao as Logico).operador.tipo).toBe(tiposDeSimbolos.E);
        });

        it('Deve processar múltiplos operadores E', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.E, 'e'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['e']();

            expect(expressao).toBeInstanceOf(Logico);
        });

        it('Deve processar expressão sem operador E', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['e']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('ou()', () => {
        it('Deve processar operador lógico OU', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['ou']();

            expect(expressao).toBeInstanceOf(Logico);
            expect((expressao as Logico).operador.tipo).toBe(tiposDeSimbolos.OU);
        });

        it('Deve processar múltiplos operadores OU', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.FALSO, 'falso'),
                criarSimbolo(tiposDeSimbolos.OU, 'ou'),
                criarSimbolo(tiposDeSimbolos.VERDADEIRO, 'verdadeiro'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['ou']();

            expect(expressao).toBeInstanceOf(Logico);
        });
    });

    describe('expressao()', () => {
        it('Deve processar expressão simples', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '42')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['expressao']();

            expect(expressao).toBeInstanceOf(Literal);
        });

        it('Deve processar expressão complexa', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.ADICAO, '+'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '3'),
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.NUMERO, '2'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['expressao']();

            expect(expressao).toBeInstanceOf(Binario);
        });
    });

    describe('logicaComumParametros()', () => {
        it('Deve processar parâmetro simples', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = await avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].nome.lexema).toBe('x');
            expect(parametros[0].abrangencia).toBe('padrao');
        });

        it('Deve processar múltiplos parâmetros', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'y'),
                criarSimbolo(tiposDeSimbolos.VIRGULA, ','),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'z'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = await avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(3);
            expect(parametros[0].nome.lexema).toBe('x');
            expect(parametros[1].nome.lexema).toBe('y');
            expect(parametros[2].nome.lexema).toBe('z');
        });

        it('Deve processar parâmetro com valor padrão', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'x'),
                criarSimbolo(tiposDeSimbolos.IGUAL, '='),
                criarSimbolo(tiposDeSimbolos.NUMERO, '10'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = await avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].valorPadrao).toBeDefined();
        });

        it('Deve processar parâmetro múltiplo com *', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.MULTIPLICACAO, '*'),
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'args'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const parametros = await avaliador['logicaComumParametros']();

            expect(parametros.length).toBe(1);
            expect(parametros[0].abrangencia).toBe('multiplo');
        });

        it('Deve lançar erro quando há mais de 255 parâmetros', async () => {
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

            await expect(avaliador['logicaComumParametros']()).rejects.toThrow('Função não pode ter mais de 255 parâmetros.');
        });
    });

    describe('Métodos não implementados', () => {
        it('declaracaoDeVariaveis deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoDeVariaveis']();
            }).toThrow('Método não implementado.');
        });

        it('bitShift deve lançar erro', async () => {
            expect(() => {
                avaliador['bitShift']();
            }).toThrow('Método não implementado.');
        });

        it('bitE deve lançar erro', async () => {
            expect(() => {
                avaliador['bitE']();
            }).toThrow('Método não implementado.');
        });

        it('bitOu deve lançar erro', async () => {
            expect(() => {
                avaliador['bitOu']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoContinua deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoContinua']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoDeClasse deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoDeClasse']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoDeVariavel deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoDeVariavel']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoExpressao deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoExpressao']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoRetorna deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoRetorna']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoSustar deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoSustar']();
            }).toThrow('Método não implementado.');
        });

        it('declaracaoTente deve lançar erro', async () => {
            expect(() => {
                avaliador['declaracaoTente']();
            }).toThrow('Método não implementado.');
        });

        it('em deve lançar erro', async () => {
            expect(() => {
                avaliador['em']();
            }).toThrow('Método não implementado.');
        });

        it('resolverDeclaracao deve lançar erro', async () => {
            expect(() => {
                avaliador['resolverDeclaracao']();
            }).toThrow('Método não implementado.');
        });
    });

    describe('chamar()', () => {
        it('Deve processar chamada de função', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '('),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Chamada);
        });

        it('Deve processar chamada de função com argumentos', async () => {
            avaliador.simbolos = [
                criarSimbolo(tiposDeSimbolos.IDENTIFICADOR, 'funcao'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '('),
                criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                criarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')'),
            ];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Chamada);
            expect((expressao as Chamada).argumentos.length).toBe(1);
        });

        it('Deve processar expressão sem chamada', async () => {
            avaliador.simbolos = [criarSimbolo(tiposDeSimbolos.NUMERO, '42')];
            avaliador.atual = 0;
            avaliador.hashArquivo = -1;

            const expressao = await avaliador['chamar']();

            expect(expressao).toBeInstanceOf(Literal);
        });
    });

    describe('funcao()', () => {
        it('Deve processar declaração de função', async () => {
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

            const funcao = await avaliador['funcao']('função');

            expect(funcao).toBeInstanceOf(FuncaoDeclaracao);
            expect(funcao.simbolo.lexema).toBe('minhaFuncao');
        });
    });

    describe('analisar()', () => {
        it('Deve inicializar estado corretamente', async () => {
            const retornoLexador: RetornoLexadorInterface<SimboloInterface> = {
                simbolos: [
                    criarSimbolo(tiposDeSimbolos.NUMERO, '5'),
                ],
                erros: [],
            };

            const resultado = await avaliador.analisar(retornoLexador, 123);

            expect(avaliador.atual).toBe(0);
            expect(avaliador.hashArquivo).toBe(123);
            expect(avaliador.simbolos.length).toBe(1);
            expect(resultado.erros.length).toBe(0);
        });
    });
});
