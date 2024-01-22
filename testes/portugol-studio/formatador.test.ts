import * as sistemaOperacional from 'os';

import { FormatadorPortugolStudio } from '../../fontes/formatadores';
import { LexadorPortugolStudio } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPortugolStudio } from '../../fontes/avaliador-sintatico/dialetos';

describe('Formatadores > Portugol Studio', () => {
    const formatador = new FormatadorPortugolStudio(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
    const lexador = new LexadorPortugolStudio();

    it('Olá mundo', () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '   ',
            '    funcao inicio()',
            '    {',
            '        escreva("Olá Mundo")',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(8);
    });

});
