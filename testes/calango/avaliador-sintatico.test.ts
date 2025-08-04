import { AvaliadorSintaticoCalango } from "../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Calango)', () => {
    describe('analisar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
        });

        it('Sucesso - escreva()', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'escreva("Ola Mundo");',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });


        /*
            Obs.: sobre o teste abaixo, fiquei pensando sobre o comportalmento do algoritmo, no sentido de que
            'escreval' seria o ESCREVA+QUEBRA_LINHA. No método "declaracaoEscreva", do avaliador sintático, inclui
            a verificação de símbolo do ponto e vírgula e da quebra da linha.

            O teste abaixo está passando, o que era um comportamento que eu não esperava, porque imaginei que os 
            testes teriam que incluir a quebra de linha, por exemplo 'escreval("Ola Mundo");\n', mas não foi 
            preciso. Então minha dúvida é: uma vez que eu declarei no método de declaração que o método 'escreval'
            terá uma quebra de linha, quando o teste encontra a declaração do método, ele já entende/presume que 
            ali terá a quebra?
        */
        it('Sucesso - escreval()', () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                // Essa forma de escrita eu testei em Calango e funciona tranquilamento (linha 44)
                'escreval("Ola Mundo"); escreva("nova linha");', 
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });
    });
});
