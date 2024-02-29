import primitivasVetor from '../../fontes/bibliotecas/primitivas-vetor';
import { Binario, FuncaoConstruto, Literal, Logico, Variavel } from '../../fontes/construtos';
import { Retorna } from '../../fontes/declaracoes';
import { DeleguaFuncao } from '../../fontes/estruturas';
import { InterpretadorBase } from '../../fontes/interpretador';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Primitivas de vetor', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(), 
            false
        )
    });

    describe('adicionar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.adicionar(interpretador, [1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('empilhar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.empilhar(interpretador, [1, 2, 3], 4);
            expect(resultado).toStrictEqual([1, 2, 3, 4]);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.fatiar(interpretador, [1, 2, 3, 4, 5], 1, 3);
            expect(resultado).toStrictEqual([2, 3]);
        });
    });

    describe('filtrarPor()', () => {
        it('Trivial', async () => {
            const deleguaFuncao = new DeleguaFuncao(
                'qualquernome', 
                new FuncaoConstruto(
                    -1,
                    -1,
                    [{
                        abrangencia: 'padrao', 
                        nome: new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'valor', null, -1, -1)
                    }],
                    [
                        new Retorna(
                            new Simbolo(tiposDeSimbolos.RETORNA, 'retorna', null, -1, -1),
                            new Logico(-1, 
                                new Binario(
                                    -1,
                                    new Variavel(-1, 
                                        new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'valor', null, -1, -1)    
                                    ),
                                    new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, '==', null, -1, -1),
                                    new Literal(-1, -1, 'verdadeiro'),
                                ),
                                new Simbolo(tiposDeSimbolos.OU, 'ou', null, -1, -1),
                                new Binario(
                                    -1,
                                    new Variavel(-1, 
                                        new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'valor', null, -1, -1)    
                                    ),
                                    new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, '==', null, -1, -1),
                                    new Literal(-1, -1, true),
                                )
                            )
                        )
                    ]
                )
            );
            const resultado = await primitivasVetor.filtrarPor(
                interpretador, 
                ['verdadeiro', 'falso', 'falso', 'verdadeiro', 'falso', 'verdadeiro'], 
                deleguaFuncao
            );
            expect(resultado).toStrictEqual(['verdadeiro', 'verdadeiro', 'verdadeiro']);
        });
    });

    describe('inclui()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.inclui(interpretador, [1, 2, 3], 3);
            expect(resultado).toBe(true);
        });
    });

    describe('inverter()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.inverter(interpretador, [1, 2, 3]);
            expect(resultado).toStrictEqual([3, 2, 1]);
        });
    });

    describe('juntar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.juntar(interpretador, [1, 2, 3], '|');
            expect(resultado).toBe('1|2|3');
        });
    });

    describe('concatenar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.concatenar(interpretador, [1, 2, 3], [4, 5, 6]);
            expect(resultado).toStrictEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('ordenar()', () => {
        it('Números', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, [2, 3, 5, 1, 10, 9], undefined as any);
            expect(resultado).toStrictEqual([1, 2, 3, 5, 9, 10]);
        });

        it('Textos', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, ["Erika", "Ana", "Carlos", "Daniel", "Bianca"], undefined as any);
            expect(resultado).toStrictEqual(["Ana", "Bianca", "Carlos", "Daniel", "Erika"]);
        });

        it('Números e Textos', async () => {
            const resultado = await primitivasVetor.ordenar(interpretador, ["Ana", "Carlos", "Bianca", 5, 3, 6], undefined as any);
            expect(resultado).toStrictEqual([3, 5, 6, "Ana", "Bianca", "Carlos"]);
        });
    });

    describe('remover()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.remover(interpretador, [1, 2, 3], 2);
            expect(resultado).toStrictEqual([1, 3]);
        });
    });

    describe('removerPrimeiro()', () => {
        it('Trivial', async () => {
            let vetor = [1, 2, 3];
            const resultado = await primitivasVetor.removerPrimeiro(interpretador, vetor);
            expect(resultado).toBe(1);
            expect(vetor).toStrictEqual([2, 3]);
        });
    });

    describe('removerUltimo()', () => {
        it('Trivial', async () => {
            let vetor = [1, 2, 3];
            const resultado = await primitivasVetor.removerUltimo(interpretador, vetor);
            expect(resultado).toBe(3);
            expect(vetor).toStrictEqual([1, 2]);
        });
    });

    describe('encaixar()', () => {
        it('Inserindo novo elemento', async () => {
            let vetor = [1, 2, 3]
            await primitivasVetor.encaixar(interpretador, vetor, 2, 0, 10);
            expect(vetor).toStrictEqual([1, 2, 10, 3]);
        });

        it('Removendo elemento na posição 2', async () => {
            let vetor = [1, 2, 3]
            const resultado = await primitivasVetor.encaixar(interpretador, vetor, 2, 1, 10);
            expect(vetor).toStrictEqual([1, 2, 10]);
            expect(resultado).toStrictEqual([3]);
        });

        it('Um elemento', async () => {
            let vetor = [1, 2, 3, 4, 5]
            const resultado = await primitivasVetor.encaixar(interpretador, vetor, 1, 3, "texto");
            expect(vetor).toStrictEqual([1, 'texto', 5]);
            expect(resultado).toStrictEqual([2, 3, 4]);
        });

        it('Mais de um elemento', async () => {
            let vetor = [1, 2, 3, 4, 5]
            const resultado = await primitivasVetor.encaixar(interpretador, vetor, 1, 3, "texto1", "texto2");
            expect(vetor).toStrictEqual([1, 'texto1', 'texto2', 5]);
            expect(resultado).toStrictEqual([2, 3, 4]);
        });

        it('Apenas um parâmetro', async () => {
            let vetor = ['Oscilador', 'Circuito', 'Modulador', 'Refrigerador']
            const resultado = await primitivasVetor.encaixar(interpretador, vetor, 1);
            
            expect(vetor).toStrictEqual(['Oscilador']);
            expect(resultado).toStrictEqual([ 'Circuito', 'Modulador', 'Refrigerador' ]);
        });
    });

    describe('somar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.somar(interpretador, [1, 2, 3]);
            expect(resultado).toBe(6);
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasVetor.tamanho(interpretador, [1, 2, 3]);
            expect(resultado).toBe(3);
        });
    });
});