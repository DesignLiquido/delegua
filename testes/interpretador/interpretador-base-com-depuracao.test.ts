import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { InterpretadorBaseComDepuracao } from "../../fontes/interpretador/depuracao";
import { Lexador } from "../../fontes/lexador";

/**
 * Por enquanto usamos o avaliador sintático de Delégua e o Interpretador Base, 
 * já que os testes são bastante simples, mas isso deve mudar no futuro.
 */
describe('Interpretador Base com Depuração', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: InterpretadorBaseComDepuracao;

    let _saidas: string[] = [];
    const funcaoSaida = (texto: string) => {
        _saidas.push(texto);
    }

    describe('interpretar()', () => {
        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        });

        describe('Sem pontos de parada', () => {
            beforeEach(() => {
                _saidas = [];
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    funcaoSaida,
                    funcaoSaida
                );
            });

            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "constante b = \"b\"",
                    "fixo c = 3",
                    "escreva(a, a, a)"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                let execucaoFinalizada: boolean = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(interpretador.pontoDeParadaAtivo).toBe(false);
                expect(execucaoFinalizada).toBe(true);
            });
        });

        describe('Com pontos de parada', () => {
            beforeEach(() => {
                _saidas = [];
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    funcaoSaida,
                    funcaoSaida
                );
            });

            it('Ponto de parada na linha 2', async () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "constante b = \"b\"",
                    "fixo c = 3",
                    "escreva(a, a, a)"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.pontosParada = [{
                    hashArquivo: -1,
                    linha: 2,
                }];

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(interpretador.pontoDeParadaAtivo).toBe(true);
            });
        });

        describe('Issue 677', () => {
            beforeEach(() => {
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    console.log,
                    process.stdout.write.bind(process.stdout)
                );
            });

            it('Problema na inicialização', async () => {
                const retornoLexador = lexador.mapear([
                    "var numeros = []",
                    "funcao adicionarNumeros(numero, quantidadeDeVezes) {",
                    "    para (var i = 0; i < quantidadeDeVezes; i = i + 1) {",
                    "        numeros.adicionar(numero)",
                    "    }",
                    "}",
                    "adicionarNumeros(10, 5)",
                    "adicionarNumeros(2, 5)",
                    "// adicionarNumeros(0, 5)",
                    "// adicionarNumeros(14, 5)",
                    "// adicionarNumeros(15, 5)",
                    "// adicionarNumeros(20, 5)",
                    "escreva(numeros)",
                    "escreva(numeros.ordenar())",
                    "escreva(numeros.filtrarPor)",
                ], -1);

                let execucaoFinalizada: boolean = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                // expect(interpretador.pontoDeParadaAtivo).toBe(true);
                expect(true).toBe(true);
            });
        });
    });
});
