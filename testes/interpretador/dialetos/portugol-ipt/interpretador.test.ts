import { AvaliadorSintaticoPortugolIpt } from "../../../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorPortugolIpt } from "../../../../fontes/interpretador/dialetos";
import { LexadorPortugolIpt } from "../../../../fontes/lexador/dialetos";

describe('Interpretador (Portugol IPT)', () => {
    let lexador: LexadorPortugolIpt;
    let avaliadorSintatico: AvaliadorSintaticoPortugolIpt;
    let interpretador: InterpretadorPortugolIpt;

    async function interpretar(linhas: string[]): Promise<{ saidas: string[]; erros: any[] }> {
        const saidas: string[] = [];
        const retornoLexador = lexador.mapear(linhas, -1);
        const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);
        interpretador.funcaoDeRetorno = (s: string) => saidas.push(String(s));
        interpretador.funcaoDeRetornoMesmaLinha = (s: string) => saidas.push(String(s));
        const retorno = await interpretador.interpretar(retornoAvaliador.declaracoes);
        return { saidas, erros: retorno.erros };
    }

    beforeEach(() => {
        lexador = new LexadorPortugolIpt();
        avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();
        interpretador = new InterpretadorPortugolIpt(process.cwd());
    });

    describe('Saída', () => {
        it('escrever texto literal', async () => {
            const { saidas, erros } = await interpretar(['inicio', 'escrever "Olá mundo"', 'fim']);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('Olá mundo');
        });

        it('palavras-chave em maiúsculas', async () => {
            const { saidas, erros } = await interpretar(['INICIO', 'ESCREVER "ok"', 'FIM']);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('ok');
        });
    });

    describe('Variáveis', () => {
        it('declaração e atribuição de inteiro', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 42',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('42');
        });

        it('declaração com valor inicial', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 7',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('7');
        });

        it('declaração de texto e atribuição', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'texto t',
                't <- "ola"',
                'escrever t',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('ola');
        });

        it('constante inteira', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'constante inteiro PI = 3',
                'escrever PI',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('3');
        });

        it('constante texto', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'constante texto MSG = "oi"',
                'escrever MSG',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('oi');
        });

        it('múltiplas variáveis na mesma linha', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro a, b, c',
                'a <- 1',
                'b <- 2',
                'c <- 3',
                'escrever a',
                'escrever b',
                'escrever c',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });
    });

    describe('Aritmética', () => {
        it('adição', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 3 + 4',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('7');
        });

        it('subtração', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 10 - 3',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('7');
        });

        it('multiplicação', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 6 * 7',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('42');
        });

        it('divisão', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- 10 / 4',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(2.5);
        });

        it('módulo', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 10 % 3',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('1');
        });

        it('exponenciação', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- 2 ^ 10',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('1024');
        });
    });

    describe('Condicional se', () => {
        it('se verdadeiro', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 5',
                'se x > 3 entao',
                'escrever "maior"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('maior');
        });

        it('se falso não executa', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 1',
                'se x > 3 entao',
                'escrever "maior"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toHaveLength(0);
        });

        it('se com senao', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 1',
                'se x > 3 entao',
                'escrever "maior"',
                'senao',
                'escrever "menor"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('menor');
        });

        it('operador lógico e', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 5',
                'se x > 0 e x < 10 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('ok');
        });

        it('operador lógico ou', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 0',
                'se x = 0 ou x = 1 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('ok');
        });

        it('operador nao', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 5',
                'se nao x = 0 entao',
                'escrever "nonzero"',
                'fimse',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('nonzero');
        });
    });

    describe('Laço enquanto', () => {
        it('enquanto com contador', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 0',
                'enquanto x < 3 faz',
                'escrever x',
                'x <- x + 1',
                'fimenquanto',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['0', '1', '2']);
        });

        it('enquanto com fechamento fim enquanto', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 0',
                'enquanto x < 3 faz',
                'escrever x',
                'x <- x + 1',
                'fim enquanto',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['0', '1', '2']);
        });
    });

    describe('Laço para', () => {
        it('para sem passo', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro i',
                'para i de 1 ate 3',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });

        it('para com passo 2', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro i',
                'para i de 0 ate 6 passo 2',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['0', '2', '4', '6']);
        });
    });

    describe('Laço repete...ate', () => {
        it('repete executa pelo menos uma vez', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 0',
                'repete',
                'x <- x + 1',
                'escrever x',
                'ate x >= 3',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });
    });

    describe('Laço faz...enquanto', () => {
        it('faz enquanto executa pelo menos uma vez', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 0',
                'faz',
                'x <- x + 1',
                'escrever x',
                'enquanto x < 3',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });
    });

    describe('Escolhe', () => {
        it('caso correspondente', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 2',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'caso 2:',
                'escrever "dois"',
                'defeito:',
                'escrever "outro"',
                'fimescolhe',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('dois');
        });

        it('defeito quando nenhum caso corresponde', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 99',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'defeito:',
                'escrever "outro"',
                'fimescolhe',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('outro');
        });

        it('fecha com fim escolhe', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x = 1',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'fim escolhe',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('um');
        });
    });

    describe('Arrays', () => {
        it('declaração de array e acesso por índice', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro v[3]',
                'v[0] <- 10',
                'v[1] <- 20',
                'v[2] <- 30',
                'escrever v[1]',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('20');
        });
    });

    describe('Funções embutidas', () => {
        it('ABS retorna valor absoluto', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ABS(-5)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('5');
        });

        it('POTENCIA calcula potência', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- POTENCIA(2, 8)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('256');
        });

        it('RAIZ calcula raiz quadrada', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- RAIZ(9)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('3');
        });

        it('INT trunca decimal', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- INT(3.9)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('3');
        });

        it('COMPRIMENTO retorna comprimento da cadeia', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro n',
                'n <- COMPRIMENTO("hello")',
                'escrever n',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('5');
        });

        it('ALEATORIO retorna valor entre 0 e 1', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ALEATORIO()',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeGreaterThanOrEqual(0);
            expect(Number(saidas[0])).toBeLessThan(1);
        });

        it('SEN calcula seno', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- SEN(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('CTG calcula cotangente', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- CTG(1)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1 / Math.tan(1), 8);
        });

        it('COS calcula cosseno', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- COS(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1, 8);
        });

        it('TAN calcula tangente', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- TAN(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('ASEN calcula arco seno', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ASEN(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('ACOS calcula arco cosseno', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ACOS(1)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('ATAN calcula arco tangente', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ATAN(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('ACTG calcula arco cotangente', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- ACTG(1)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1 / Math.atan(1), 8);
        });

        it('SENH calcula seno hiperbólico', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- SENH(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('COSH calcula cosseno hiperbólico', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- COSH(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1, 8);
        });

        it('TANH calcula tangente hiperbólica', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- TANH(0)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0, 8);
        });

        it('CTGH calcula cotangente hiperbólica', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- CTGH(1)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1 / Math.tanh(1), 8);
        });

        it('EXP calcula exponencial', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- EXP(1)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(Math.E, 8);
        });

        it('LOG calcula logaritmo base 10', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- LOG(100)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(2, 8);
        });

        it('LN calcula logaritmo natural', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- LN(EXP(1))',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(1, 8);
        });

        it('FRAC retorna parte fracionária', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'real x',
                'x <- FRAC(3.75)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(Number(saidas[0])).toBeCloseTo(0.75, 8);
        });

        it('ARRED arredonda para inteiro mais próximo', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro x',
                'x <- ARRED(3.6)',
                'escrever x',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('4');
        });

        it('LETRA retorna caractere pela posição', async () => {
            const { saidas, erros } = await interpretar([
                'inicio',
                'caracter c',
                'c <- LETRA("abc", 1)',
                'escrever c',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas[0]).toEqual('b');
        });
    });

    describe('Idade (cenário completo)', () => {
        it('maior de idade', async () => {
            const respostas = [19];
            interpretador.interfaceEntradaSaida = {
                question: (_: string, callback: Function) => callback(respostas.pop()),
            };

            const { saidas, erros } = await interpretar([
                'inicio',
                'inteiro idade',
                'escrever "Qual é a sua idade?"',
                'ler idade',
                'se (idade >= 18) entao',
                'escrever "Você é maior de idade"',
                'senao',
                'escrever "Você é menor de idade"',
                'fimse',
                'fim',
            ]);

            expect(erros).toHaveLength(0);
            expect(saidas).toContain('Você é maior de idade');
        });
    });
});
