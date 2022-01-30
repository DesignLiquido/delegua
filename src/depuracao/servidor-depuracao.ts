import * as net from 'net';

function operarConexao(conexao: net.Socket) {
    const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
    console.log('Nova conexão de cliente de %s', enderecoRemoto);

    conexao.setEncoding('utf8');

    function aoReceberDados(dados: Buffer) {
        console.log('Dados da conexão vindos de %s: %j', enderecoRemoto, dados);  
        conexao.write(dados);  
    }

    function aoFecharConexao() {
        console.log('Conexão de %s fechada', enderecoRemoto);  
    }

    function aoObterErro(erro: Error) {
        console.log('Conexão %s com erro: %s', enderecoRemoto, erro.message);  
    }

    conexao.on('data', aoReceberDados);  
    conexao.once('close', aoFecharConexao);  
    conexao.on('error', aoObterErro);
}

const servidor: net.Server = net.createServer();
servidor.on('connection', operarConexao);

servidor.listen(9000, function() {
    const dadosEndereco: net.AddressInfo = servidor.address() as net.AddressInfo;
    console.log("Endereço IP: ", dadosEndereco.address);
    console.log("Protocolo de Transporte: ", dadosEndereco.family);
    console.log("Porta: ", dadosEndereco.port);
});
