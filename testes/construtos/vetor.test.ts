import { Literal, Separador, Vetor } from '../../fontes/construtos';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Vetor', () => {
    function criarSeparador(): Separador {
        return new Separador(new Simbolo(tiposDeSimbolos.VIRGULA, ',', null, 1, 1));
    }

    function criarLiteral(valor: number): Literal {
        const simbolo = new Simbolo(tiposDeSimbolos.NUMERO, String(valor), valor, 1, 1);
        return new Literal(1, 1, valor);
    }

    describe('elementos', () => {
        it('retorna apenas os nós de dados, excluindo Separadores', () => {
            const valores = [
                criarLiteral(1),
                criarSeparador(),
                criarLiteral(2),
                criarSeparador(),
                criarLiteral(3),
            ];
            const vetor = new Vetor(0, 1, valores);

            expect(vetor.valores.length).toBe(5);  // preserva Separadores
            expect(vetor.elementos.length).toBe(3); // apenas dados
        });

        it('retorna todos os valores quando não há Separadores', () => {
            const valores = [criarLiteral(10), criarLiteral(20)];
            const vetor = new Vetor(0, 1, valores);

            expect(vetor.elementos.length).toBe(2);
            expect(vetor.elementos).toEqual(valores);
        });

        it('retorna vetor vazio quando valores está vazio', () => {
            const vetor = new Vetor(0, 1, []);
            expect(vetor.elementos.length).toBe(0);
        });
    });

    describe('tamanho', () => {
        it('conta apenas os elementos de dados, excluindo Separadores', () => {
            const valores = [
                criarLiteral(10),
                criarSeparador(),
                criarLiteral(20),
            ];
            const vetor = new Vetor(0, 1, valores);

            expect(vetor.tamanho).toBe(2);
        });

        it('é zero para vetor vazio', () => {
            const vetor = new Vetor(0, 1, []);
            expect(vetor.tamanho).toBe(0);
        });
    });
});
