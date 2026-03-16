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
            let execucaoFinalizada: boolean = false;

            beforeEach(() => {
                _saidas = [];
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    funcaoSaida,
                    funcaoSaida
                );

                execucaoFinalizada = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }
            });

            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "constante b = \"b\"",
                    "fixo c = 3",
                    "escreva(a, a, a)"
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(interpretador.pontoDeParadaAtivo).toBe(false);
                expect(execucaoFinalizada).toBe(true);
            });
        });

        describe('Com pontos de parada', () => {
            let execucaoFinalizada: boolean = false;

            beforeEach(() => {
                _saidas = [];
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    funcaoSaida,
                    funcaoSaida
                );

                execucaoFinalizada = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }
            });

            it('Ponto de parada na linha 2', async () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "constante b = \"b\"",
                    "fixo c = 3",
                    "escreva(a, a, a)"
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.pontosParada = [{
                    hashArquivo: -1,
                    linha: 2,
                }];

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(interpretador.pontoDeParadaAtivo).toBe(true);
                expect(execucaoFinalizada).toBe(false);
            });
        });

        describe('Issue 677', () => {
            let execucaoFinalizada: boolean = false;

            beforeEach(() => {
                interpretador = new InterpretadorBaseComDepuracao(
                    process.cwd(),
                    console.log,
                    process.stdout.write.bind(process.stdout)
                );

                execucaoFinalizada = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(execucaoFinalizada).toBe(true);
            });
        });
    });

    describe('Passo com pontos de parada', () => {
        let execucaoFinalizada: boolean = false;
        let pontoParadaAtivado: boolean = false;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            _saidas = [];
            interpretador = new InterpretadorBaseComDepuracao(
                process.cwd(),
                funcaoSaida,
                funcaoSaida
            );

            execucaoFinalizada = false;
            pontoParadaAtivado = false;

            interpretador.finalizacaoDaExecucao = () => {
                execucaoFinalizada = true;
            };

            interpretador.avisoPontoParadaAtivado = () => {
                pontoParadaAtivado = true;
            };
        });

        it('Deve executar linha com breakpoint ao pressionar F10', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "var b = 2",
                "var c = 3",
                "escreva(a, b, c)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            // Ponto de parada na linha 2
            interpretador.pontosParada = [{
                hashArquivo: -1,
                linha: 2,
            }];

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Executa até o ponto de parada
            await interpretador.instrucaoContinuarInterpretacao();

            // Deve estar parado na linha 2
            expect(interpretador.pontoDeParadaAtivo).toBe(true);
            expect(interpretador.linhaDeclaracaoAtual).toBe(2);

            // Pressiona F10 (comando de passo)
            pontoParadaAtivado = false;
            await interpretador.instrucaoPasso();

            // A linha 2 deve ter sido executada (var b = 2)
            const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            const valorB = escopoAtual.espacoMemoria.valores['b'];
            expect(valorB.valor).toBe(2);

            // Deve ter avançado para a linha 3
            expect(escopoAtual.declaracaoAtual).toBe(2); // índice 2 = linha 3
        });

        it('Deve parar no próximo breakpoint após comando de passo', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "var b = 2",
                "var c = 3",
                "escreva(a, b, c)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            // Pontos de parada nas linhas 2 e 3
            interpretador.pontosParada = [
                { hashArquivo: -1, linha: 2 },
                { hashArquivo: -1, linha: 3 }
            ];

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Executa até o primeiro ponto de parada (linha 2)
            await interpretador.instrucaoContinuarInterpretacao();
            expect(interpretador.pontoDeParadaAtivo).toBe(true);
            expect(interpretador.linhaDeclaracaoAtual).toBe(2);

            // Pressiona F10 (comando de passo)
            pontoParadaAtivado = false;
            await interpretador.instrucaoPasso();

            // A linha 2 deve ter sido executada
            const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            const valorB = escopoAtual.espacoMemoria.valores['b'];
            expect(valorB.valor).toBe(2);

            // Deve ter parado no próximo breakpoint (linha 3)
            expect(interpretador.pontoDeParadaAtivo).toBe(true);
            expect(pontoParadaAtivado).toBe(true);
            expect(interpretador.linhaDeclaracaoAtual).toBe(3);

            // A linha 3 ainda NÃO deve ter sido executada
            expect(escopoAtual.espacoMemoria.valores['c']).toBeUndefined();
        });

        it('Deve continuar normalmente se não houver breakpoint na próxima linha', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "var b = 2",
                "var c = 3",
                "escreva(a, b, c)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            // Ponto de parada apenas na linha 2
            interpretador.pontosParada = [{
                hashArquivo: -1,
                linha: 2,
            }];

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Executa até o ponto de parada
            await interpretador.instrucaoContinuarInterpretacao();
            expect(interpretador.pontoDeParadaAtivo).toBe(true);

            // Pressiona F10 (comando de passo)
            pontoParadaAtivado = false;
            await interpretador.instrucaoPasso();

            // Deve ter executado a linha 2 e avançado para linha 3
            const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoAtual.espacoMemoria.valores['b'].valor).toBe(2);
            expect(escopoAtual.declaracaoAtual).toBe(2);

            // NÃO deve ter ativado ponto de parada (linha 3 não tem breakpoint)
            expect(interpretador.pontoDeParadaAtivo).toBe(false);
            expect(pontoParadaAtivado).toBe(false);
        });
    });

    describe('Comando de Pausa', () => {
        let execucaoFinalizada: boolean = false;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            _saidas = [];
            interpretador = new InterpretadorBaseComDepuracao(
                process.cwd(),
                funcaoSaida,
                funcaoSaida
            );

            execucaoFinalizada = false;
            interpretador.finalizacaoDaExecucao = () => {
                execucaoFinalizada = true;
            };
        });

        it('Deve interromper laço enquanto com o comando de pausar', async () => {
            const retornoLexador = lexador.mapear([
                "escreva('iniciando')",
                "enquanto (verdadeiro) {",
                "    var i = 1",
                "}"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Inicia a execução sem aguardar
            const promessaExecucao = interpretador.instrucaoContinuarInterpretacao();

            // Aguarda tempo suficiente para o laço rodar ao menos 1000 iterações (um cederControle)
            await new Promise<void>(resolve => setTimeout(resolve, 100));

            // Simula o botão de pausa do depurador
            interpretador.comando = 'pausar';

            // A execução deve terminar com o laço interrompido
            await promessaExecucao;

            // Verifica que o código antes do laço foi executado
            expect(_saidas).toContain('iniciando');
            // Verifica que o comando de pausa foi o responsável pela interrupção
            expect(interpretador.comando).toBe('pausar');
        }, 10000);

        it('Deve interromper laço para com o comando de pausar', async () => {
            const retornoLexador = lexador.mapear([
                "escreva('iniciando')",
                "para (var j = 0; j < 10000000; j = j + 1) {",
                "    var i = 1",
                "}"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            const promessaExecucao = interpretador.instrucaoContinuarInterpretacao();

            await new Promise<void>(resolve => setTimeout(resolve, 100));

            interpretador.comando = 'pausar';

            await promessaExecucao;

            // O laço foi interrompido antes das 10 milhões de iterações
            expect(_saidas).toContain('iniciando');
            expect(interpretador.comando).toBe('pausar');
        }, 10000);

        it('Deve interromper laço fazer...enquanto com o comando de pausar', async () => {
            const retornoLexador = lexador.mapear([
                "escreva('iniciando')",
                "fazer {",
                "    var i = 1",
                "} enquanto (verdadeiro)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            const promessaExecucao = interpretador.instrucaoContinuarInterpretacao();

            await new Promise<void>(resolve => setTimeout(resolve, 100));

            interpretador.comando = 'pausar';

            await promessaExecucao;

            expect(_saidas).toContain('iniciando');
            expect(interpretador.comando).toBe('pausar');
        }, 10000);
    });

    describe('adentrarEscopo()', () => {
        let execucaoFinalizada: boolean = false;
        let pontoParadaAtivado: boolean = false;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            _saidas = [];
            interpretador = new InterpretadorBaseComDepuracao(
                process.cwd(),
                funcaoSaida,
                funcaoSaida
            );

            execucaoFinalizada = false;
            pontoParadaAtivado = false;

            interpretador.finalizacaoDaExecucao = () => {
                execucaoFinalizada = true;
            };

            interpretador.avisoPontoParadaAtivado = () => {
                pontoParadaAtivado = true;
            };
        });

        it('Deve entrar em uma função quando há chamada', async () => {
            const retornoLexador = lexador.mapear([
                "funcao somar(a, b) {",
                "    retorna a + b",
                "}",
                "var resultado = somar(5, 3)",
                "escreva(resultado)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Captura o número de escopos inicial
            const escoposInicial = interpretador.pilhaEscoposExecucao.elementos();

            // Primeiro passo: pula a declaração da função
            await interpretador.instrucaoPasso();

            // Segundo passo: adentrar na chamada de função somar()
            await interpretador.adentrarEscopo();

            // Deve ter entrado no escopo da função (um escopo a mais que o inicial)
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposInicial + 1);
            expect(interpretador.pontoDeParadaAtivo).toBe(true);
            expect(pontoParadaAtivado).toBe(true);

            // O escopo da função deve estar no topo da pilha
            const escopoFuncao = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoFuncao.tipo).toBe('funcao');
            expect(escopoFuncao.declaracaoAtual).toBe(0); // Primeira linha da função
        });

        it('Deve comportar-se como Passo quando não há chamada de função', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "var b = 2",
                "var c = a + b",
                "escreva(c)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Captura o número de escopos inicial
            const escoposInicial = interpretador.pilhaEscoposExecucao.elementos();

            // Adentrar escopo na primeira linha (sem função)
            await interpretador.adentrarEscopo();

            // Não deve ter criado novo escopo
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposInicial);
            expect(interpretador.pontoDeParadaAtivo).toBe(true);

            // Deve ter avançado para a próxima instrução
            const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoAtual.declaracaoAtual).toBe(1);
        });

        it('Deve entrar na primeira função em expressões complexas', async () => {
            const retornoLexador = lexador.mapear([
                "funcao dobrar(x) {",
                "    retorna x * 2",
                "}",
                "funcao triplicar(x) {",
                "    retorna x * 3",
                "}",
                "var resultado = dobrar(5) + triplicar(10)",
                "escreva(resultado)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Pula as declarações das funções
            await interpretador.instrucaoPasso(); // funcao dobrar
            await interpretador.instrucaoPasso(); // funcao triplicar

            // Captura o número de escopos antes de adentrar
            const escoposAntes = interpretador.pilhaEscoposExecucao.elementos();

            // Adentrar na linha com dobrar(5) + triplicar(10)
            await interpretador.adentrarEscopo();

            // Deve ter entrado na primeira função (dobrar)
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposAntes + 1);
            const escopoFuncao = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoFuncao.tipo).toBe('funcao');
        });

        it('Deve respeitar pontos de parada dentro da função', async () => {
            const retornoLexador = lexador.mapear([
                "funcao calcular(x) {",
                "    var resultado = x * 2",
                "    escreva('Alguma coisa')",
                "    retorna resultado",
                "}",
                "var valor = calcular(10)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            // Ponto de parada na linha 3 (dentro da função)
            interpretador.pontosParada = [{
                hashArquivo: -1,
                linha: 3,
            }];

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Captura o número de escopos inicial
            const escoposInicial = interpretador.pilhaEscoposExecucao.elementos();

            // Pula a declaração da função
            await interpretador.instrucaoPasso();

            // Adentrar na chamada de função
            await interpretador.adentrarEscopo();

            // Deve ter entrado na função
            const escoposAposAdentrar = interpretador.pilhaEscoposExecucao.elementos();
            expect(escoposAposAdentrar).toBe(escoposInicial + 1);

            // Continua a execução até encontrar o ponto de parada
            await interpretador.instrucaoContinuarInterpretacao();

            // Deve ter parado no ponto de parada
            expect(interpretador.pontoDeParadaAtivo).toBe(true);
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposAposAdentrar);
        });

        it('Deve funcionar com funções aninhadas', async () => {
            const retornoLexador = lexador.mapear([
                "funcao externa(x) {",
                "    funcao interna(y) {",
                "        retorna y + 1",
                "    }",
                "    retorna interna(x) * 2",
                "}",
                "var resultado = externa(5)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Pula a declaração da função externa
            await interpretador.instrucaoPasso();

            // Captura escopos antes de adentrar externa
            const escoposAntesExterna = interpretador.pilhaEscoposExecucao.elementos();

            // Adentrar na chamada de externa()
            await interpretador.adentrarEscopo();

            // Deve ter entrado na função externa
            const escoposDentroExterna = interpretador.pilhaEscoposExecucao.elementos();
            expect(escoposDentroExterna).toBe(escoposAntesExterna + 1);
            let escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoAtual.tipo).toBe('funcao');

            // Pula a declaração da função interna
            await interpretador.instrucaoPasso();

            // Adentrar na chamada de interna()
            await interpretador.adentrarEscopo();

            // Deve ter entrado na função interna (mais um escopo)
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposDentroExterna + 1);
            escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(escopoAtual.tipo).toBe('funcao');
        });

        it('Deve manter cache de resoluções ao retornar da função', async () => {
            const retornoLexador = lexador.mapear([
                "funcao obterNumero() {",
                "    retorna 42",
                "}",
                "var x = obterNumero()",
                "escreva(x)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Captura escopos inicial
            const escoposInicial = interpretador.pilhaEscoposExecucao.elementos();

            // Pula a declaração da função
            await interpretador.instrucaoPasso();

            // Adentrar na chamada de função
            await interpretador.adentrarEscopo();

            // Executar o retorno da função
            await interpretador.instrucaoPasso();

            // Verifica que o escopo da função foi removido (voltou ao inicial)
            expect(interpretador.pilhaEscoposExecucao.elementos()).toBe(escoposInicial);

            // O cache deve conter a resolução da chamada
            const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
            expect(Object.keys(escopoAtual.espacoMemoria.resolucoesChamadas).length).toBeGreaterThan(0);
        });

        it('Deve finalizar execução quando não há mais instruções', async () => {
            const retornoLexador = lexador.mapear([
                "funcao simples() {",
                "    retorna 1",
                "}",
                "simples()"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);

            // Pula declaração da função
            await interpretador.instrucaoPasso();

            // Adentrar na chamada
            await interpretador.adentrarEscopo();

            // Executar o retorno e finalizar (2 passos)
            await interpretador.instrucaoPasso();
            await interpretador.instrucaoPasso();

            // Não há mais instruções, deve finalizar
            expect(execucaoFinalizada).toBe(true);
        });
    });
});
