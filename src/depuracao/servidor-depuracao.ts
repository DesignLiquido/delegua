import * as net from 'net';



function operarConexao(conexao: any) {
    const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
    console.log('Nova conexão de cliente de %s', enderecoRemoto);

    function aoReceberDados(dados: any) {
        console.log('Dados da conexão vindos de %s: %j', enderecoRemoto, dados);  
        conexao.write(dados);  
    }

    function aoFecharConexao() {
        console.log('Conexão de %s fechada', enderecoRemoto);  
    }

    function aoObterErro(erro: any) {
        console.log('Conexão %s com erro: %s', enderecoRemoto, erro.message);  
    }

    conexao.on('data', aoReceberDados);  
    conexao.once('close', aoFecharConexao);  
    conexao.on('error', aoObterErro);
}

const servidor = net.createServer();
servidor.on('connection', operarConexao);

servidor.listen(9000, function() {    
    console.log('Servidor esperando mensagens de %j', servidor.address());  
});
