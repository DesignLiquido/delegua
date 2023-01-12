import { DeleguaModulo, FuncaoPadrao } from "../../../estruturas";

const carregarModulo = function (nomeModulo: string, caminhoModulo: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let dadosDoModulo = require(caminhoModulo);
    let novoModulo = new DeleguaModulo(nomeModulo);

    let keys = Object.keys(dadosDoModulo);
    for (let i = 0; i < keys.length; i++) {
        let itemAtual = dadosDoModulo[keys[i]];

        if (typeof itemAtual === "function") {
            novoModulo[keys[i]] = new FuncaoPadrao(
                itemAtual.length,
                itemAtual
            );
        } else {
            novoModulo[keys[i]] = itemAtual;
        }
    }

    return novoModulo;
};

export const carregarModuloPorNome = function (nome: string) {
    switch (nome) {
        case "tempo":
            return carregarModulo("tempo", "./tempo.ts");
        case "matematica":
            return carregarModulo("matematica", "./matematica.ts");
        case "textos":
            return carregarModulo("textos", "./textos.ts");
    }

    return null;
};
