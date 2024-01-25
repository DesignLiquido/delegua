import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { TradutorReversoVisuAlg } from '../../fontes/tradutores/tradutor-reverso-visualg';

describe('Tradutor VisuAlg -> Delégua', () => {
    const tradutor: TradutorReversoVisuAlg = new TradutorReversoVisuAlg();

     describe('Código', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
        });
        
        it('escreva -> escreva', () => {
            const retornoLexador = lexador.mapear(
                [
                    'algoritmo "escreva"',
                    'inicio',
                    'escreval("Olá")',
                    'escreva("Mundo")',
                    'fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá'\)/i);
            expect(resultado).toMatch(/escreva\('Mundo'\)/i);
        });

        it('declaração de variaveis', () => {
            const retornoLexador = lexador.mapear(
                [
                    'algoritmo "media-vetor"',
                    'var',
                    '   media:vetor[1..10] de real',
                    '   i:inteiro',
                    '   n1,n2:real',
                    'inicio',
                    '   escreval(1 + 1)',
                    '   escreva("2 - 1")',
                    'fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var media = \[\]/i);
            expect(resultado).toMatch(/var i = 0/i);
            expect(resultado).toMatch(/var n1 = 0/i);
            expect(resultado).toMatch(/var n2 = 0/i);
            expect(resultado).toMatch(/escreva\(1 \+ 1\)/i);
            expect(resultado).toMatch(/escreva\('2 \- 1'\)/i);
        })

        it('laço de repetição `para`', () => {
            const retornoLexador = lexador.mapear(
                [
                    'algoritmo "media-vetor"',
                    'var',
                    '   i:inteiro',
                    'inicio',
                    '   para i de 1 ate 10 faca',
                    '       escreval ("Digite a nota do",i,"º Aluno")',
                    '   fimpara',
                    'fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var i = 0/i);
            expect(resultado).toMatch(/para \(i = 1 ;i <= 10; i = i \+ 1\)/i);
        })

        it('cálculo imc com se/senão', () => {
            const retornoLexador = lexador.mapear(
                [
                    'Algoritmo "CalculaIMC"',
                    'Var',
                    '    M: Real',
                    '    A: Real',
                    '    IMC: Real',
                    'Inicio',
                    'Escreva("Massa(Kg): ")',
                    'Leia(M)',
                    'Escreva("Altura (m): ")',
                    'Leia(A)',
                    'IMC <- M / (A ^ 2)',
                    'Escreval("IMC: ", IMC:5:2)',
                    'Se (IMC >= 18.5) e (IMC < 25) entao',
                    '    Escreva("Parabens! Voce esta no seu peso ideal")',
                    'senao',
                    '    Escreva("Voce nao esta na faixa de peso ideal")',
                    'Fimse',
                    'Fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/se \(imc < 25 e imc >= 18.5\)/i);
            expect(resultado).toMatch(/senao {/i);
        })

        it('leia', () => {
            const retornoLexador = lexador.mapear(
                [
                    'algoritmo "semnome"',
                    'var',
                    '    n1,n2,n3:real',
                    'inicio',
                    '    escreval ("Digite dois valores para a soma,subtração,multiplicação e divisão: ")',
                    '    leia (n1,n2)',
                    '    n3<-n1+n2',
                    '    escreval ()',
                    '    escreval ("A soma de ",n1," mais ",n2," é igual a: ", n3)',
                    'fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var n1 = leia\(\)/i);
            expect(resultado).toMatch(/var n2 = leia\(\)/i);
            expect(resultado).toMatch(/n3 = n1 \+ n2 /i);
        });

        it('escolha', () => {
            const retornoLexador = lexador.mapear(
                [
                    'algoritmo "Times"',
                    'var time: caractere',
                    'inicio',
                    'escreva ("Entre com o nome de um time de futebol: ")',
                    'leia (time)',
                    '    escolha time',
                    '        caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                    '            escreval ("É um time carioca.")',
                    '        caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                    '            escreval ("É um time paulista.")',
                    '        outrocaso',
                    '            escreval ("É de outro estado.")',
                    '    fimescolha',
                    'fimalgoritmo'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escolha \(time\)/i);
            expect(resultado).toMatch(/caso \'Flamengo\':/i);
            expect(resultado).toMatch(/caso \'Vasco\':/i);
            expect(resultado).toMatch(/caso \'Botafogo\':/i);
            expect(resultado).toMatch(/escreva\('É um time carioca.'\)/i);
            expect(resultado).toMatch(/caso \'São Paulo\':/i);
            expect(resultado).toMatch(/caso \'Palmeiras\':/i);
            expect(resultado).toMatch(/caso \'Santos\':/i);
            expect(resultado).toMatch(/caso \'Corínthians\':/i);
            expect(resultado).toMatch(/escreva\('É um time paulista.'\)/i);
            expect(resultado).toMatch(/padrao:/i);
            expect(resultado).toMatch(/escreva\('É de outro estado.'\)/i);
        });
    });
});
