import { ClassePadrao } from '../../../fontes/interpretador/estruturas';

class ClasseExemplo {
    args: any[];
    constructor(args: any[]) {
        this.args = args;
    }
}

describe('ClassePadrao', () => {
    it('construtor define nome e funcaoDeClasse', () => {
        const classe = new ClassePadrao('MinhaClasse', ClasseExemplo);
        expect(classe.nome).toBe('MinhaClasse');
        expect(classe.funcaoDeClasse).toBe(ClasseExemplo);
    });

    it('toString() inclui o nome da classe', () => {
        const classe = new ClassePadrao('MinhaClasse', ClasseExemplo);
        expect(classe.toString()).toContain('MinhaClasse');
    });

    it('paraTexto() inclui o nome da classe', () => {
        const classe = new ClassePadrao('MinhaClasse', ClasseExemplo);
        expect(classe.paraTexto()).toContain('MinhaClasse');
    });

    it('chamar() instancia funcaoDeClasse com os argumentos', () => {
        const classe = new ClassePadrao('MinhaClasse', ClasseExemplo);
        const resultado = classe.chamar(null as any, [1, 2, 3], null as any);
        expect(resultado).toBeInstanceOf(ClasseExemplo);
    });
});
