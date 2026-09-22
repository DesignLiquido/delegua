import { LexadorBaseLinhaUnica } from '../../fontes/lexador';
import { SimboloInterface } from '../../fontes/interfaces';
import { RetornoLexadorInterface } from '../../fontes/interfaces/retornos';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

class LexadorTeste extends LexadorBaseLinhaUnica {
    analisarTexto(_delimitador: string): void {}
    analisarNumero(): void {}
    identificarPalavraChave(): void {}
    analisarToken(): void {}
    mapear(codigo: string[], hashArquivo: number): RetornoLexadorInterface<SimboloInterface> {
        this.simbolos = [];
        this.erros = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo[0] || '';
        this.hashArquivo = hashArquivo;
        return { simbolos: this.simbolos, erros: this.erros };
    }
}

describe('LexadorBaseLinhaUnica', () => {
    let lexador: LexadorTeste;

    beforeEach(() => {
        lexador = new LexadorTeste();
    });

    describe('construtor', () => {
        it('inicializa todos os campos', () => {
            expect(lexador.simbolos).toEqual([]);
            expect(lexador.erros).toEqual([]);
            expect(lexador.inicioSimbolo).toBe(0);
            expect(lexador.atual).toBe(0);
            expect(lexador.linha).toBe(0);
        });
    });

    describe('eDigito()', () => {
        it('retorna true para dígitos 0-9', () => {
            expect(lexador.eDigito('0')).toBe(true);
            expect(lexador.eDigito('5')).toBe(true);
            expect(lexador.eDigito('9')).toBe(true);
        });

        it('retorna false para não-dígitos', () => {
            expect(lexador.eDigito('a')).toBe(false);
            expect(lexador.eDigito('!')).toBe(false);
        });
    });

    describe('eAlfabeto()', () => {
        it('retorna true para letras a-z e A-Z', () => {
            expect(lexador.eAlfabeto('a')).toBe(true);
            expect(lexador.eAlfabeto('Z')).toBe(true);
            expect(lexador.eAlfabeto('_')).toBe(true);
        });

        it('retorna true para letras acentuadas', () => {
            expect(lexador.eAlfabeto('á')).toBe(true);
            expect(lexador.eAlfabeto('ç')).toBe(true);
            expect(lexador.eAlfabeto('Ã')).toBe(true);
        });

        it('retorna false para dígitos e símbolos', () => {
            expect(lexador.eAlfabeto('1')).toBe(false);
            expect(lexador.eAlfabeto('!')).toBe(false);
        });
    });

    describe('eAlfabetoOuDigito()', () => {
        it('retorna true para letras e dígitos', () => {
            expect(lexador.eAlfabetoOuDigito('a')).toBe(true);
            expect(lexador.eAlfabetoOuDigito('5')).toBe(true);
        });

        it('retorna false para símbolos', () => {
            expect(lexador.eAlfabetoOuDigito('!')).toBe(false);
        });
    });

    describe('eFinalDoCodigo()', () => {
        it('retorna true quando atual >= comprimento do código', () => {
            lexador.codigo = 'ab';
            lexador.atual = 2;
            expect(lexador.eFinalDoCodigo()).toBe(true);
        });

        it('retorna false quando ainda há código', () => {
            lexador.codigo = 'ab';
            lexador.atual = 1;
            expect(lexador.eFinalDoCodigo()).toBe(false);
        });
    });

    describe('eFinalDaLinha()', () => {
        it('retorna true quando codigo.length === linha', () => {
            lexador.codigo = 'ab';
            lexador.linha = 2;
            expect(lexador.eFinalDaLinha()).toBe(true);
        });

        it('retorna true quando atual >= comprimento do char na posição linha', () => {
            lexador.codigo = 'abc';
            lexador.linha = 0;
            lexador.atual = 1;
            expect(lexador.eFinalDaLinha()).toBe(true);
        });

        it('retorna false quando ainda há conteúdo na linha', () => {
            lexador.codigo = 'abc';
            lexador.linha = 0;
            lexador.atual = 0;
            expect(lexador.eFinalDaLinha()).toBe(false);
        });
    });

    describe('avancar()', () => {
        it('incrementa atual e retorna o caractere anterior', () => {
            lexador.codigo = 'abc';
            lexador.atual = 0;
            expect(lexador.avancar()).toBe('a');
            expect(lexador.atual).toBe(1);
        });
    });

    describe('adicionarSimbolo()', () => {
        it('adiciona símbolo à lista com tipo e lexema', () => {
            lexador.codigo = 'abc';
            lexador.hashArquivo = 0;
            lexador.inicioSimbolo = 0;
            lexador.atual = 3;
            lexador.linha = 0;
            lexador.adicionarSimbolo(tiposDeSimbolos.IDENTIFICADOR);
            expect(lexador.simbolos).toHaveLength(1);
            expect(lexador.simbolos[0].tipo).toBe(tiposDeSimbolos.IDENTIFICADOR);
            expect(lexador.simbolos[0].lexema).toBe('abc');
        });

        it('usa literal quando fornecido', () => {
            lexador.codigo = '+';
            lexador.hashArquivo = 0;
            lexador.inicioSimbolo = 0;
            lexador.atual = 1;
            lexador.linha = 0;
            lexador.adicionarSimbolo(tiposDeSimbolos.ADICAO, 'mais');
            expect(lexador.simbolos[0].literal).toBe('mais');
        });

        it('lida com literal numérico sem chamar .length', () => {
            lexador.codigo = '42';
            lexador.hashArquivo = 0;
            lexador.inicioSimbolo = 0;
            lexador.atual = 2;
            lexador.linha = 0;
            lexador.adicionarSimbolo(tiposDeSimbolos.NUMERO, 42);
            expect(lexador.simbolos[0].literal).toBe(42);
            expect(lexador.simbolos).toHaveLength(1);
        });

        it('usa comprimento mínimo 1 quando texto e literal numérico ambos com tamanho zero', () => {
            lexador.codigo = 'x';
            lexador.hashArquivo = 0;
            lexador.inicioSimbolo = 1;
            lexador.atual = 1;
            lexador.linha = 0;
            lexador.adicionarSimbolo(tiposDeSimbolos.NUMERO, 0);
            const simbolo = lexador.simbolos[0];
            expect(simbolo).toBeDefined();
            expect(simbolo.colunaFim).toBeGreaterThanOrEqual(simbolo.colunaInicio);
        });
    });

    describe('simboloAtual()', () => {
        it('retorna \\0 quando está no final do código', () => {
            lexador.codigo = 'a';
            lexador.atual = 1;
            expect(lexador.simboloAtual()).toBe('\0');
        });

        it('retorna o caractere na posição atual', () => {
            lexador.codigo = 'abc';
            lexador.atual = 1;
            expect(lexador.simboloAtual()).toBe('b');
        });
    });

    describe('proximoSimbolo()', () => {
        it('retorna \\0 quando está no final do código', () => {
            lexador.codigo = 'a';
            lexador.atual = 0;
            expect(lexador.proximoSimbolo()).toBe('\0');
        });

        it('retorna o próximo caractere', () => {
            lexador.codigo = 'abc';
            lexador.atual = 1;
            expect(lexador.proximoSimbolo()).toBe('c');
        });
    });

    describe('simboloAnterior()', () => {
        it('retorna o caractere anterior ao atual', () => {
            lexador.codigo = 'abc';
            lexador.atual = 2;
            expect(lexador.simboloAnterior()).toBe('b');
        });
    });
});
