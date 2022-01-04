const Egua = require("./src/egua.js").Egua;

const main = function() {
    const argumentos = process.argv;

    const egua = new Egua();
    if (argumentos.length === 2) {
        egua.runPrompt();
    } else {
        egua.runfile(argumentos[2]);
    }
};

main();