import { Deceto, Dupla, Noneto, Octeto, Quarteto, Quinteto, SeletorTuplas, Septeto, Sexteto, Trio } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('SeletorTuplas', () => {
    it('deve instanciar cada tipo de tupla suportado', () => {
        const elementos = Array.from({ length: 10 }, (_, indice) => criarLiteral(indice + 1));

        expect(new SeletorTuplas(elementos[0], elementos[1])).toBeInstanceOf(Dupla);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2])).toBeInstanceOf(Trio);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3])).toBeInstanceOf(Quarteto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4])).toBeInstanceOf(Quinteto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4], elementos[5])).toBeInstanceOf(Sexteto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4], elementos[5], elementos[6])).toBeInstanceOf(Septeto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4], elementos[5], elementos[6], elementos[7])).toBeInstanceOf(Octeto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4], elementos[5], elementos[6], elementos[7], elementos[8])).toBeInstanceOf(Noneto);
        expect(new SeletorTuplas(elementos[0], elementos[1], elementos[2], elementos[3], elementos[4], elementos[5], elementos[6], elementos[7], elementos[8], elementos[9])).toBeInstanceOf(Deceto);
    });

    it('deve lançar erro para quantidades inválidas', () => {
        const elementos = Array.from({ length: 10 }, (_, indice) => criarLiteral(indice + 1));
        expect(() => new SeletorTuplas(elementos[0])).toThrow('Tuplas devem ter no mínimo 2 elementos.');
        expect(() => new SeletorTuplas(...elementos, criarLiteral(11))).toThrow('Tuplas com mais de 10 elementos não são suportadas.');
    });
});
