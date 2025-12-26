import {
    obterMapaLexemaParaParadigma,
    obterFormaAlternativa,
    pertenceAoParadigma,
    gruposPalavrasParadigma,
} from '../../fontes/lexador/mapeamento-paradigmas';

describe('Mapeamento de Paradigmas', () => {
    describe('obterMapaLexemaParaParadigma', () => {
        it('Deve criar um mapa com todas as palavras', () => {
            const mapa = obterMapaLexemaParaParadigma();

            expect(mapa.size).toBeGreaterThan(0);
        });

        it('Deve classificar palavras imperativas corretamente', () => {
            const mapa = obterMapaLexemaParaParadigma();

            expect(mapa.get('escreva')).toBe('imperativo');
            expect(mapa.get('leia')).toBe('imperativo');
            expect(mapa.get('tente')).toBe('imperativo');
            expect(mapa.get('pegue')).toBe('imperativo');
            expect(mapa.get('quebre')).toBe('imperativo');
        });

        it('Deve classificar palavras infinitivas corretamente', () => {
            const mapa = obterMapaLexemaParaParadigma();

            expect(mapa.get('escrever')).toBe('infinitivo');
            expect(mapa.get('ler')).toBe('infinitivo');
            expect(mapa.get('tentar')).toBe('infinitivo');
            expect(mapa.get('pegar')).toBe('infinitivo');
            expect(mapa.get('quebrar')).toBe('infinitivo');
        });

        it('Deve classificar palavras neutras corretamente', () => {
            const mapa = obterMapaLexemaParaParadigma();

            expect(mapa.get('se')).toBe('neutro');
            expect(mapa.get('senao')).toBe('neutro');
            expect(mapa.get('var')).toBe('neutro');
            expect(mapa.get('constante')).toBe('neutro');
            expect(mapa.get('enquanto')).toBe('neutro');
        });
    });

    describe('obterFormaAlternativa', () => {
        it('Deve converter do imperativo para infinitivo', () => {
            expect(obterFormaAlternativa('escreva', 'infinitivo')).toBe('escrever');
            expect(obterFormaAlternativa('leia', 'infinitivo')).toBe('ler');
            expect(obterFormaAlternativa('tente', 'infinitivo')).toBe('tentar');
            expect(obterFormaAlternativa('pegue', 'infinitivo')).toBe('pegar');
            expect(obterFormaAlternativa('quebre', 'infinitivo')).toBe('quebrar');
        });

        it('Deve converter do infinitivo para imperativo', () => {
            expect(obterFormaAlternativa('escrever', 'imperativo')).toBe('escreva');
            expect(obterFormaAlternativa('ler', 'imperativo')).toBe('leia');
            expect(obterFormaAlternativa('tentar', 'imperativo')).toBe('tente');
            expect(obterFormaAlternativa('pegar', 'imperativo')).toBe('pegue');
            expect(obterFormaAlternativa('quebrar', 'imperativo')).toBe('quebre');
        });

        it('Deve retornar a primeira forma quando há múltiplas opções', () => {
            // 'retorna' e 'retorne' são ambos imperativos
            const resultado = obterFormaAlternativa('retornar', 'imperativo');
            expect(resultado).toBe('retorna'); // Primeira forma imperativa
        });

        it('Deve retornar undefined para palavras sem forma alternativa', () => {
            expect(obterFormaAlternativa('se', 'imperativo')).toBeUndefined();
            expect(obterFormaAlternativa('var', 'infinitivo')).toBeUndefined();
        });

        it('Deve ser case-insensitive', () => {
            expect(obterFormaAlternativa('ESCREVA', 'infinitivo')).toBe('escrever');
            expect(obterFormaAlternativa('Leia', 'infinitivo')).toBe('ler');
        });
    });

    describe('pertenceAoParadigma', () => {
        it('Deve retornar true para palavras imperativas no modo imperativo', () => {
            expect(pertenceAoParadigma('escreva', 'imperativo')).toBe(true);
            expect(pertenceAoParadigma('leia', 'imperativo')).toBe(true);
            expect(pertenceAoParadigma('tente', 'imperativo')).toBe(true);
        });

        it('Deve retornar false para palavras infinitivas no modo imperativo', () => {
            expect(pertenceAoParadigma('escrever', 'imperativo')).toBe(false);
            expect(pertenceAoParadigma('ler', 'imperativo')).toBe(false);
            expect(pertenceAoParadigma('tentar', 'imperativo')).toBe(false);
        });

        it('Deve retornar true para palavras infinitivas no modo infinitivo', () => {
            expect(pertenceAoParadigma('escrever', 'infinitivo')).toBe(true);
            expect(pertenceAoParadigma('ler', 'infinitivo')).toBe(true);
            expect(pertenceAoParadigma('tentar', 'infinitivo')).toBe(true);
        });

        it('Deve retornar false para palavras imperativas no modo infinitivo', () => {
            expect(pertenceAoParadigma('escreva', 'infinitivo')).toBe(false);
            expect(pertenceAoParadigma('leia', 'infinitivo')).toBe(false);
            expect(pertenceAoParadigma('tente', 'infinitivo')).toBe(false);
        });

        it('Deve retornar true para palavras neutras em qualquer modo', () => {
            expect(pertenceAoParadigma('se', 'imperativo')).toBe(true);
            expect(pertenceAoParadigma('se', 'infinitivo')).toBe(true);
            expect(pertenceAoParadigma('var', 'imperativo')).toBe(true);
            expect(pertenceAoParadigma('var', 'infinitivo')).toBe(true);
        });

        it('Deve retornar true para todas as palavras no modo ambos', () => {
            expect(pertenceAoParadigma('escreva', 'ambos')).toBe(true);
            expect(pertenceAoParadigma('escrever', 'ambos')).toBe(true);
            expect(pertenceAoParadigma('se', 'ambos')).toBe(true);
        });
    });

    describe('gruposPalavrasParadigma', () => {
        it('Deve conter todos os grupos esperados', () => {
            const tipos = gruposPalavrasParadigma.map((g) => g.tipo);

            expect(tipos).toContain('ESCREVA');
            expect(tipos).toContain('LEIA');
            expect(tipos).toContain('CONTINUA');
            expect(tipos).toContain('RETORNA');
            expect(tipos).toContain('ESCOLHA');
            expect(tipos).toContain('TENTE');
            expect(tipos).toContain('PEGUE');
            expect(tipos).toContain('QUEBRAR');
            expect(tipos).toContain('IMPORTAR');
            expect(tipos).toContain('FAZER');
        });

        it('Deve ter pelo menos uma forma para cada grupo', () => {
            for (const grupo of gruposPalavrasParadigma) {
                const temImperativo = grupo.imperativo && grupo.imperativo.length > 0;
                const temInfinitivo = grupo.infinitivo && grupo.infinitivo.length > 0;

                expect(temImperativo || temInfinitivo).toBe(true);
            }
        });
    });
});
