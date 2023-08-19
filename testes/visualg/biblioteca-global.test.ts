import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';
import { registrarBibliotecaCaracteresVisuAlg, registrarBibliotecaNumericaVisuAlg } from '../../fontes/bibliotecas/dialetos/visualg';
import { DeleguaFuncao, FuncaoPadrao } from '../../fontes/estruturas';
import { SimboloInterface, VariavelInterface } from '../../fontes/interfaces';
import { EscopoExecucao } from '../../fontes/interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../../fontes/interfaces/pilha-escopos-execucao-interface';
import { InterpretadorVisuAlg } from '../../fontes/interpretador/dialetos/visualg/interpretador-visualg';
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';

const funcoes = {};
const mockPilha: PilhaEscoposExecucaoInterface = {
    atribuirVariavel: function (simbolo: SimboloInterface, valor: any): void {
        throw new Error('Função não implementada.');
    },

    atribuirVariavelEm: function (distancia: number, simbolo: SimboloInterface, valor: any): void {
        throw new Error('Função não implementada.');
    },

    definirVariavel: function (nomeVariavel: string, valor: any): void {
        funcoes[nomeVariavel] = valor;
    },

    definirConstante: function (nomeConstante: string, valor: any, subtipo?: string | undefined): void {
        funcoes[nomeConstante] = valor;
    },

    elementos: function (): number {
        throw new Error('Função não implementada.');
    },

    naPosicao: function (posicao: number): EscopoExecucao {
        throw new Error('Função não implementada.');
    },

    obterEscopoPorTipo: function (idChamada: string): EscopoExecucao | undefined {
        throw new Error('Função não implementada.');
    },

    obterTodasVariaveis: function (todasVariaveis: any[]): { valor: any; nome: string; tipo: string; }[] {
        throw new Error('Função não implementada.');
    },

    obterValorVariavel: function (simbolo: SimboloInterface): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterVariavelEm: function (distancia: number, nome: string): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterVariavelPorNome: function (nome: string): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterTodasDeclaracaoClasse: function () {
        throw new Error('Função não implementada.');
    },

    obterTodasDeleguaFuncao: function (): { [nome: string]: DeleguaFuncao; } {
        throw new Error('Função não implementada.');
    },

    pilha: [],

    empilhar: function (item: EscopoExecucao): void {
        throw new Error('Função não implementada.');
    },

    eVazio: function (): boolean {
        throw new Error('Função não implementada.');
    },

    topoDaPilha: function (): EscopoExecucao {
        throw new Error('Função não implementada.');
    },

    removerUltimo: function (): EscopoExecucao {
        throw new Error('Função não implementada.');
    },
};

describe('Biblioteca Numérica', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        registrarBibliotecaNumericaVisuAlg(interpretador, mockPilha);
    });

    describe('Testes triviais', () => {
        it('abs', () => {
            const funcaoAbs = funcoes['abs'].funcao;
            expect(funcaoAbs(-5)).toBe(5);
        });

        it('arcCos', () => {
            const funcaoArcCos = funcoes['arccos'].funcao;
            expect(funcaoArcCos(0)).toBe(1.5707963267948966);
        });

        it('arcSen', () => {
            const funcaoArcSen = funcoes['arcsen'].funcao;
            expect(funcaoArcSen(0)).toBe(0);
        });

        it('arcTan', () => {
            const funcaoArcTan = funcoes['arctan'].funcao;
            expect(funcaoArcTan(0)).toBe(0);
        });

        it('cos', () => {
            const funcaoCos = funcoes['cos'].funcao;
            expect(funcaoCos(0)).toBe(1);
        });

        it('cotan', () => {
            const funcaoCoTan = funcoes['cotan'].funcao;
            expect(funcaoCoTan(1)).toBe(0.6420926159343306);
        });

        it('exp', () => {
            const funcaoExp = funcoes['exp'].funcao;
            expect(funcaoExp(10, 2)).toBe(100);
        });

        it('grauprad', () => {
            const funcaoGrauPRad = funcoes['grauprad'].funcao;
            expect(funcaoGrauPRad(0)).toBe(0);
        });

        it('int', () => {
            const funcaoInt = funcoes['int'].funcao;
            expect(funcaoInt('0')).toBe(0);
        });

        it('log', () => {
            const funcaoLog = funcoes['log'].funcao;
            expect(funcaoLog(100)).toBe(2);
        });

        it('logn', () => {
            const funcaoLogN = funcoes['logn'].funcao;
            expect(funcaoLogN(Math.E)).toBe(1);
        });

        it('pi', () => {
            const funcaoPi = funcoes['pi'].funcao;
            expect(funcaoPi()).toBe(3.141592653589793);
        });

        it('quad', () => {
            const funcaoQuad = funcoes['quad'].funcao;
            expect(funcaoQuad(0)).toBe(0);
        });

        it('radpgrau', () => {
            const funcaoRadPGrau = funcoes['radpgrau'].funcao;
            expect(funcaoRadPGrau(0)).toBe(0);
        });

        it('raizq', () => {
            const funcaoRaizQ = funcoes['raizq'].funcao;
            expect(funcaoRaizQ(0)).toBe(0);
        });

        it('rand', () => {
            const funcaoRand = funcoes['rand'].funcao;
            expect(funcaoRand()).toBeGreaterThanOrEqual(0);
            expect(funcaoRand()).toBeLessThanOrEqual(1);
        });

        it('randi', () => {
            const funcaoRandI = funcoes['randi'].funcao;
            expect(funcaoRandI(0)).toBeGreaterThanOrEqual(0);
            expect(funcaoRandI(0)).toBeLessThanOrEqual(0);
        });

        it('sen', () => {
            const funcaoSen = funcoes['sen'].funcao;
            expect(funcaoSen(0)).toBe(0);
        });

        it('tan', () => {
            const funcaoTan = funcoes['tan'].funcao;
            expect(funcaoTan(0)).toBe(0);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd());
        });
        
        it.skip('Chamadas diversas', async () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "exemplo_funcoes"',
                'var a, b, c : real',
                'inicio',
                'a <- 2',
                'b <- 9',
                'escreval( b - a )',
                'escreval( abs( a - b ) )',
                'c <- raizq( b )',
                'escreval("A área do circulo com raio " , c , " é " , pi * quad(c) )',
                'escreval("Um ângulo de 90 graus tem " , grauprad(90) , " radianos" )',
                'escreval( exp(a,b) )',
                'escreval( int( b / ( a + c ) ) )',
                'Fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});

describe('Biblioteca de caracteres', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        registrarBibliotecaCaracteresVisuAlg(interpretador, mockPilha);
    });

    describe('Testes triviais', () => {
        it('asc', () => {
            const funcaoAsc = funcoes['asc'].funcao;
            expect(funcaoAsc('a')).toBe(97);
        });

        it('carac', () => {
            const funcaoCarac = funcoes['carac'].funcao;
            expect(funcaoCarac(97)).toBe('a');
        });

        it('caracpnum', () => {
            const funcaoCaracPNum = funcoes['caracpnum'].funcao;
            expect(funcaoCaracPNum('97')).toBe(97);
        });

        it('compr', () => {
            const funcaoCompr = funcoes['compr'].funcao;
            expect(funcaoCompr('a')).toBe(1);
        });

        it('copia', () => {
            const funcaoCopia = funcoes['copia'].funcao;
            expect(funcaoCopia('Uma cadeia de caracteres', 4, 6)).toBe('cadeia');
        });

        it('maiusc', () => {
            const funcaoMaiusc = funcoes['maiusc'].funcao;
            expect(funcaoMaiusc('a')).toBe('A');
        });

        it('minusc', () => {
            const funcaoMinusc = funcoes['minusc'].funcao;
            expect(funcaoMinusc('A')).toBe('a');
        });

        it('numpcarac', () => {
            const funcaoNumPCarac = funcoes['numpcarac'].funcao;
            expect(funcaoNumPCarac(1)).toBe('1');
        });

        it('pos', () => {
            const funcaoPos = funcoes['pos'].funcao;
            expect(funcaoPos('a', 'a')).toBe(1);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd());
        });
        
        it.skip('Chamadas diversas', async () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "exemplo_funcoes2"',
                'var',
                'a, b, c : caractere',
                'inicio',
                'a <- "2"',
                'b <- "9"',
                'escreval( b + a ) // será escrito "92" na tela',
                'escreval( caracpnum(b) + caracpnum(a) ) // será escrito 11 na tela',
                'escreval( numpcarac(3+3) + a ) // será escrito "62" na tela',
                'c <- "Brasil"',
                'escreval(maiusc(c)) // será escrito "BRASIL" na tela',
                'escreval(compr(c)) // será escrito 6 na tela',
                'b <- "O melhor do Brasil"',
                'escreval(pos(c,b)) // será escrito 13 na tela',
                'escreval(asc(c)) // será escrito 66 na tela - código ASCII de "B"',
                'a <- carac(65) + carac(66) + carac(67)',
                'escreval(a) // será escrito "ABC" na tela',
                'Fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});