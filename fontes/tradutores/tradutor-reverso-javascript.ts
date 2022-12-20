import { parseScript } from 'esprima';

/**
 * Esse tradutor traduz de JavaScript para Delégua
 */
export class TradutorReversoJavaScript {

    constructor() {}

    traduzirDeclaracaoDeVariavel(declaracao: any) {
        let informacoesDaVariavel = declaracao.declarations[0];
        let resultado = `var ${informacoesDaVariavel.id.name} = `;
        if (typeof informacoesDaVariavel.init.value === 'string'){
            resultado += `'${informacoesDaVariavel.init.value}'`;
        } else {
            resultado += `${informacoesDaVariavel.init.value}`;
        }
        return resultado;
    }

    traduzirDeclaracao(declaracao: any) {
        switch (declaracao.type) {
            case 'VariableDeclaration':
                return this.traduzirDeclaracaoDeVariavel(declaracao);
        }
    }

    traduzir() {
        let resultado = '';
        const programa = 'const a = 42\nconst b = \'a\'';
        const declaracoes = parseScript(programa);

        for (let declaracao of declaracoes.body) {
            resultado += `${this.traduzirDeclaracao(declaracao)} \n`;
        }
        console.log(resultado);
        return resultado;
    }
}

//cd ./fontes/tradutores
//ts-node -T tradutor-reverso-javascript.ts
var tjs = new TradutorReversoJavaScript();
tjs.traduzir();