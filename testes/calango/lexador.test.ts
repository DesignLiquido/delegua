import { LexadorCalango } from '../../fontes/lexador/dialetos/lexador-calango';

describe('Lexador (Calango)', () => {
    describe('mapear()', () => {
        let lexador: LexadorCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Vetor de código vazio', () => {
                const resultado = lexador.mapear([], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });
            
            it('Sucesso - Código vazio com símbolos algoritmo, principal e fimPrincipal', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'fimPrincipal'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Método "escreva"', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'escreva("Ola Mundo");',
                    'fimPrincipal'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(10);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Condicionais (se, senao)', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;'+ 
                    'principal'+
                    'inteiro idade;'+
                    'escreva("Informe sua idade: ");'+
                    'leia(idade);'+
                    'se (idade >= 18) entao'+
                        'escreval("maior de idade");'+
                    'senao'+
                        'se (idade <= 0) entao'+
                            'escreval("valor invalido");'+
                        'senao',
                            'escreval("menor de idade");'+
                        'fimSe'+
                    'fimSe'+
                    'fimPrincipal'
                ], -1);
    
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(45);
                expect(resultado.erros).toHaveLength(0);
            });
        });
    });
});