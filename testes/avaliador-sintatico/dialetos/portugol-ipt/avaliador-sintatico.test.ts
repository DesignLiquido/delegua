import { LexadorPortugolIpt } from '../../../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPortugolIpt } from '../../../../fontes/avaliador-sintatico/dialetos';
import {
    Enquanto,
    Escolha,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    Para,
    Se,
    Var,
    Const,
} from '../../../../fontes/declaracoes';
import { Vetor } from '../../../../fontes/construtos';

describe('Avaliador sintático (Portugol IPT)', () => {
    let lexador: LexadorPortugolIpt;
    let avaliador: AvaliadorSintaticoPortugolIpt;

    beforeEach(() => {
        lexador = new LexadorPortugolIpt();
        avaliador = new AvaliadorSintaticoPortugolIpt();
    });

    async function analisar(linhas: string[]) {
        const retornoLexador = lexador.mapear(linhas, -1);
        return avaliador.analisar(retornoLexador, -1);
    }

    describe('Estrutura básica', () => {
        it('Olá Mundo', async () => {
            const r = await analisar(['inicio', 'escrever "Olá mundo"', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes).toHaveLength(1);
            expect(r.declaracoes[0]).toBeInstanceOf(EscrevaMesmaLinha);
        });

        it('não trata palavra-chave de tipo como literal em expressão', async () => {
            await expect(analisar(['inicio', 'escrever texto', 'fim'])).rejects.toThrow(
                'Esperado expressão.'
            );
        });
    });

    describe('Declarações de variáveis', () => {
        it('inteiro simples', async () => {
            const r = await analisar(['inicio', 'inteiro x', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('inteiro com valor inicial', async () => {
            const r = await analisar(['inicio', 'inteiro x = 5', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('real', async () => {
            const r = await analisar(['inicio', 'real y', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('texto', async () => {
            const r = await analisar(['inicio', 'texto t', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('logico', async () => {
            const r = await analisar(['inicio', 'logico b', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('caracter', async () => {
            const r = await analisar(['inicio', 'caracter c', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('múltiplas variáveis na mesma linha', async () => {
            const r = await analisar(['inicio', 'inteiro a, b, c', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes).toHaveLength(3);
        });

        it('variavel (com modificador explícito)', async () => {
            const r = await analisar(['inicio', 'variavel inteiro n', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Var);
        });

        it('constante inteira', async () => {
            const r = await analisar(['inicio', 'constante inteiro PI = 3', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Const);
        });

        it('constante texto', async () => {
            const r = await analisar(['inicio', 'constante texto MSG = "oi"', 'fim']);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[0]).toBeInstanceOf(Const);
        });

        it('array inteiro com tamanho', async () => {
            const r = await analisar(['inicio', 'inteiro v[5]', 'fim']);
            expect(r.erros).toHaveLength(0);
            const declaracao = r.declaracoes[0] as Var;
            expect(declaracao).toBeInstanceOf(Var);
            expect(declaracao.inicializador).toBeInstanceOf(Vetor);
            expect((declaracao.inicializador as Vetor).valores).toHaveLength(5);
        });

        it('array com expressão constante no tamanho', async () => {
            const r = await analisar(['inicio', 'inteiro v[2 + 3]', 'fim']);
            expect(r.erros).toHaveLength(0);
            const declaracao = r.declaracoes[0] as Var;
            expect(declaracao).toBeInstanceOf(Var);
            expect(declaracao.inicializador).toBeInstanceOf(Vetor);
            expect((declaracao.inicializador as Vetor).valores).toHaveLength(5);
        });
    });

    describe('Condicional se', () => {
        it('se simples', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'se x = 1 entao',
                'escrever "um"',
                'fimse',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const se = r.declaracoes[1] as Se;
            expect(se).toBeInstanceOf(Se);
            expect(se.caminhoSenao).toBeNull();
        });

        it('se com senao', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'se x = 1 entao',
                'escrever "sim"',
                'senao',
                'escrever "nao"',
                'fimse',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const se = r.declaracoes[1] as Se;
            expect(se).toBeInstanceOf(Se);
            expect(se.caminhoSenao).not.toBeNull();
        });

        it('se com operador lógico e', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'se x > 0 e x < 10 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Se);
        });

        it('se com operador lógico ou', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'se x = 0 ou x = 1 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Se);
        });

        it('se com nao', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'se nao x = 0 entao',
                'escrever "ok"',
                'fimse',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Se);
        });
    });

    describe('Laço enquanto', () => {
        it('enquanto simples', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'enquanto x > 0 faz',
                'escrever x',
                'fimenquanto',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Enquanto);
        });

        it('enquanto aninhado', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'inteiro y',
                'enquanto x > 0 faz',
                'enquanto y > 0 faz',
                'escrever y',
                'fimenquanto',
                'fimenquanto',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const externo = r.declaracoes[2] as Enquanto;
            expect(externo).toBeInstanceOf(Enquanto);
            expect(externo.corpo.declaracoes[0]).toBeInstanceOf(Enquanto);
        });

        it('enquanto com fechamento "fim enquanto"', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'enquanto x > 0 faz',
                'escrever x',
                'fim enquanto',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Enquanto);
        });
    });

    describe('Laço para', () => {
        it('para sem passo', async () => {
            const r = await analisar([
                'inicio',
                'inteiro i',
                'para i de 1 ate 10',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Para);
        });

        it('para com passo', async () => {
            const r = await analisar([
                'inicio',
                'inteiro i',
                'para i de 0 ate 20 passo 2',
                'escrever i',
                'proximo',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Para);
        });
    });

    describe('Laço repete...ate', () => {
        it('repete simples', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'repete',
                'escrever x',
                'ate x > 5',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Fazer);
        });
    });

    describe('Laço faz...enquanto', () => {
        it('faz enquanto simples', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'faz',
                'escrever x',
                'enquanto x > 0',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Fazer);
        });

        it('faz enquanto com while aninhado não confunde fechamento', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'inteiro y',
                'faz',
                'enquanto y > 0 faz',
                'escrever y',
                'fimenquanto',
                'enquanto x > 0',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const fazer = r.declaracoes[2] as Fazer;
            expect(fazer).toBeInstanceOf(Fazer);
            expect(fazer.caminhoFazer.declaracoes[0]).toBeInstanceOf(Enquanto);
        });
    });

    describe('Escolhe', () => {
        it('escolhe com caso e defeito', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
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
            expect(r.erros).toHaveLength(0);
            const escolha = r.declaracoes[1] as Escolha;
            expect(escolha).toBeInstanceOf(Escolha);
            expect(escolha.caminhos).toHaveLength(2);
            expect(escolha.caminhoPadrao).not.toBeNull();
        });

        it('escolhe sem defeito', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'fimescolhe',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const escolha = r.declaracoes[1] as Escolha;
            expect(escolha.caminhos).toHaveLength(1);
            expect(escolha.caminhoPadrao).toBeNull();
        });

        it('escolhe com múltiplos valores por caso', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'escolhe x',
                'caso 1, 2, 3:',
                'escrever "pequeno"',
                'fimescolhe',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            const escolha = r.declaracoes[1] as Escolha;
            expect(escolha.caminhos[0].condicoes).toHaveLength(3);
        });

        it('escolhe com fechamento "fim escolhe"', async () => {
            const r = await analisar([
                'inicio',
                'inteiro x',
                'escolhe x',
                'caso 1:',
                'escrever "um"',
                'fim escolhe',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
            expect(r.declaracoes[1]).toBeInstanceOf(Escolha);
        });
    });

    describe('Chamadas de funções embutidas', () => {
        it('função sem argumento: ALEATORIO()', async () => {
            const r = await analisar([
                'inicio',
                'real x',
                'x <- ALEATORIO()',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
        });

        it('função com um argumento: SEN(x)', async () => {
            const r = await analisar([
                'inicio',
                'real x',
                'real y',
                'y <- SEN(x)',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
        });

        it('função com dois argumentos: POTENCIA(b, e)', async () => {
            const r = await analisar([
                'inicio',
                'real x',
                'real y',
                'y <- POTENCIA(x, 2)',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
        });
    });

    describe('Acesso a array', () => {
        it('leitura de elemento', async () => {
            const r = await analisar([
                'inicio',
                'inteiro v[5]',
                'inteiro x',
                'x <- v[0]',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
        });

        it('escrita em elemento', async () => {
            const r = await analisar([
                'inicio',
                'inteiro v[5]',
                'v[0] <- 42',
                'fim',
            ]);
            expect(r.erros).toHaveLength(0);
        });
    });
});
