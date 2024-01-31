import * as sistemaOperacional from 'os';

import { FormatadorVisualG } from '../../fontes/formatadores';
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';

describe('Formatadores > VisualG', () => {
    const formatadorVisualG = new FormatadorVisualG(sistemaOperacional.EOL);
    const avaliadorSintaticoVisualG = new AvaliadorSintaticoVisuAlg();
    const lexadorVisuAlg = new LexadorVisuAlg();

    it('Olá mundo', () => {
        const retornoLexador = lexadorVisuAlg.mapear([
            'algoritmo "Teste lexador"',
            'var',
            'inicio',
            'escreva("Olá mundo")',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintaticoVisualG.analisar(retornoLexador, -1);
        const resultado = formatadorVisualG.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        console.log(resultado);

    })
});