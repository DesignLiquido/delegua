import { parseScript } from 'esprima';

/**
 * Esse tradutor traduz de JavaScript para Delégua
 */
export class TradutorReversoJavaScript {

    constructor() {

    }

    traduzirDeclaracaoDeVariavel(declaracao: any) {
        let resultado = `${declaracao.kind} `;
        return resultado;
    }

    traduzirDeclaracao(declaracao: any) {
        switch (declaracao.type) {
            case 'VariableDeclaration':
                return this.traduzirDeclaracaoDeVariavel(declaracao);
        }
    }

    traduzir() {
        const programa = 'const answer = 42';
        const declaracoes = parseScript(programa);

        for (let declaracao of declaracoes.body) {
            this.traduzirDeclaracao(declaracao);
            // console.log(declaracao);
        }
        // return declaracoes;
    }
}