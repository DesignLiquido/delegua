import { Lexador } from '../fontes/lexador';
import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
    
            it('Sucesso - Vetor vazio', () => {
                const retornoLexador = lexador.mapear(['var vetorVazio = []'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
    
            it('Sucesso - Dicionário vazio', () => {
                const retornoLexador = lexador.mapear(['var dicionarioVazio = {}'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
    
            it('Sucesso - Undefined', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(undefined as any, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });
    
            it('Sucesso - Null', () => {
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(null as any, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Sucesso - Incremento e decremento após variável ou literal', () => {
                const retornoLexador = lexador.mapear([
                    'var a = 1',
                    'a++',
                    'a--',
                    '++5',
                    '--5'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
    
            it('Sucesso - leia sem parametro', () => {
                const retornoLexador = lexador.mapear(['var nome = leia()'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
    
            it('Sucesso - leia com parametro', () => {
                const retornoLexador = lexador.mapear(["var nome = leia('Digite seu nome:')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para cada', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para cada elemento em [1, 2, 3] {',
                        "   escreva('Valor: ', elemento)",
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Sucesso - para cada com ponto e vírgula no final', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para cada elemento em [1, 2, 3] {',
                        "   escreva('Valor: ', elemento)",
                        '};',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
    
            it('Sucesso - para/sustar', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (var i = 0; i < 10; i = i + 1) {',
                        '   se (i == 5) { sustar; }',
                        "   escreva('Valor: ', i)",
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
        });

        describe('Cenários de falha', () => {
            it('Falha - declaração de variáveis com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['var a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita."
                );
            });

            it('Falha - declaração de constantes com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['const a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita."
                );
            });

            it('Falha - sustar fora de laço de repetição', async () => {
                const retornoLexador = lexador.mapear(['sustar;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
                );
            });
    
            it('Falha - continua fora de laço de repetição', async () => {
                const retornoLexador = lexador.mapear(['continua;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "'continua' precisa estar em um laço de repetição."
                );
            });
    
            it('Falha - Não é permitido ter dois identificadores seguidos na mesma linha', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo') identificador1 identificador2"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            });
    
            describe('Funções Anônimas', () => {
                it('Função anônima com mais de 255 parâmetros', () => {
                    let acumulador = '';
                    for (let i = 1; i <= 256; i++) {
                        acumulador += 'a' + i + ', ';
                    }
    
                    acumulador = acumulador.substring(0, acumulador.length - 2);
    
                    const funcaoCom256Argumentos = 'var f = funcao(' + acumulador + ') {}';
                    const retornoLexador = lexador.mapear([funcaoCom256Argumentos], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe('Não pode haver mais de 255 parâmetros');
                });
            });
    
            it('Declaração `tente`', () => {
                const retornoLexador = lexador.mapear(['tente { i = i + 1 } pegue (erro) { escreva(erro) }'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
            });
        });
    });
});
