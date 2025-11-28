import { AvaliadorSintaticoPitugues } from "../../fontes/avaliador-sintatico/dialetos";
import { Logico } from "../../fontes/construtos";
import { Escreva } from "../../fontes/declaracoes";
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Pituguês)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;

        beforeEach(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
        });

        describe('Casos de sucesso', () => {
            it('Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ["escreva('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Olá Mundo (Imprima)', () => {
                const retornoLexador = lexador.mapear(
                    ["imprima('Olá mundo')"],
                    -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Atribuição com soma', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'imprima(2 + 2)',
                        'var a = 2',
                        'imprima(a += 2)',
                        'imprima(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            describe('Operações lógicas', () => {
                it('Diferente', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(1 != 1)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                });

                it('Não contém', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a não contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                    const contem = escreva.argumentos[0] as Logico;
                    expect(contem.negado).toBe(true);
                });
            });

            describe('Para cada', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var vetor = [1, 2, 3]',
                            'para cada elemento de vetor:',
                            '    escreva(elemento)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Iterando texto', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var texto1 = "Texto"',
                            'para cada item em texto1:',
                            '    imprima(item)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Lista de Compreensão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var lista = [1, 2, 3, 4, 5]',
                        'var minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Lista de compreensão para números pares'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            describe('Se ternário', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var idade = 20',
                            'var categoria = "Adulto" se idade >= 18 senão "Menor de idade"'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            it('Comentário antes de se', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var a = 1',
                        '# Comentário',
                        'se a > 0:',
                        '    escreva("Teste")',
                        '    a = 10',
                        'escreva(a)'
                    ], -1
                );
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });
        });

        describe('Casos de falha', () => {
            it('Falha - Indentação', () => {
                const codigo = ['classe Cachorro:', 'funcao latir():', "escreva('Erro')"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});
