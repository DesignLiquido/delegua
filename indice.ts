const Delegua = require("./src/delegua").Delegua;

const dialetos = function(dialeto: string){
    switch(dialeto){
        case '--egua':
            return 'egua'
        case '--eguac':
            return 'eguac'
        case '--eguap':
            return 'eguap'
        default:
            return 'delegua';
    }
}

const principal = function() {
    let argumentos = process.argv;

    //apenas para testes
    argumentos.push(`--egua`);

    let dialeto = [];
    dialeto = argumentos.filter(argumento => argumento.includes('--'))
    if(dialeto){
        argumentos = argumentos.filter(argumento => !argumento.includes('--'))
    }

    const delegua = new Delegua();
    delegua.definirDialeto(dialetos(dialeto[0]));

    if (argumentos.length === 2) {
        delegua.iniciarDelegua();
    }else {
        delegua.carregarArquivo(argumentos[2]);
    }
};

principal();