const Delegua = require("./src/delegua.js").Delegua;

const main = function() {
    const argumentos = process.argv;

    const delegua = new Delegua();
    if (argumentos.length === 2) {
        delegua.runPrompt();
    } else {
        delegua.runfile(argumentos[2]);
    }
};

main();