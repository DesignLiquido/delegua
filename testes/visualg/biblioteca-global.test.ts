import { registrarBibliotecaGlobalVisuAlg } from '../../fontes/bibliotecas/dialetos/visualg';
import { DeleguaFuncao, FuncaoPadrao } from '../../fontes/estruturas';
import { SimboloInterface, VariavelInterface } from '../../fontes/interfaces';
import { EscopoExecucao } from '../../fontes/interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../../fontes/interfaces/pilha-escopos-execucao-interface';
import { InterpretadorVisuAlg } from '../../fontes/interpretador/dialetos/visualg/interpretador-visualg';

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
    }
};

describe('Biblioteca Global', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        registrarBibliotecaGlobalVisuAlg(interpretador, mockPilha);
    });

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