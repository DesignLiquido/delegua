import { FuncaoConstruto } from '../../fontes/construtos';
import { Ajuda, Bloco, Classe, Extensao, FuncaoDeclaracao, InterfaceDeclaracao, PropriedadeClasse } from '../../fontes/declaracoes';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

function criarSimbolo(lexema: string): Simbolo {
    return new Simbolo(tiposDeSimbolos.IDENTIFICADOR as any, lexema, lexema, 1, 1);
}

describe('Cobertura adicional de declaracoes', () => {
    it('deve cobrir Ajuda, Bloco, Classe, Extensao e InterfaceDeclaracao', async () => {
        const visitante: any = {
            visitarDeclaracaoAjuda: jest.fn().mockReturnValue('ok-ajuda'),
            visitarExpressaoBloco: jest.fn().mockReturnValue('ok-bloco'),
            visitarDeclaracaoDefinicaoFuncao: jest.fn().mockReturnValue('ok-funcao'),
            visitarDeclaracaoClasse: jest.fn().mockReturnValue('ok-classe'),
            visitarDeclaracaoExtensao: jest.fn().mockReturnValue('ok-extensao'),
            visitarDeclaracaoInterface: jest.fn().mockReturnValue('ok-interface'),
        };

        const declaracaoAjuda = new Ajuda(1, 1, undefined, false);
        expect(await declaracaoAjuda.aceitar(visitante)).toBe('ok-ajuda');
        expect(declaracaoAjuda.paraTexto()).toContain('funcao=Não');

        const bloco = new Bloco(1, 1, []);
        expect(await bloco.aceitar(visitante)).toBe('ok-bloco');

        const funcaoDeclaracao = new FuncaoDeclaracao(criarSimbolo('executar'), new FuncaoConstruto(1, 1, [], []), 'número');
        expect(await funcaoDeclaracao.aceitar(visitante)).toBe('ok-funcao');

        const propriedade = new PropriedadeClasse(criarSimbolo('nome'), 'texto');
        const classe = new Classe(
            criarSimbolo('Pessoa'),
            [{ simbolo: criarSimbolo('SerVivo') } as any],
            [funcaoDeclaracao],
            [propriedade],
            [],
            false,
            false,
            false,
            [],
            [{ simbolo: criarSimbolo('Auditavel') } as any]
        );
        expect(await classe.aceitar(visitante)).toBe('ok-classe');
        expect(classe.superClasse).toBeTruthy();
        expect(classe.paraTexto()).toContain('mescla=Auditavel');

        const extensao = new Extensao(criarSimbolo('Texto'), [funcaoDeclaracao], true, 1);
        expect(await extensao.aceitar(visitante)).toBe('ok-extensao');

        const interfaceDeclaracao = new InterfaceDeclaracao(criarSimbolo('Exibivel'), [], [propriedade]);
        expect(await interfaceDeclaracao.aceitar(visitante)).toBe('ok-interface');
    });
});
