# Declarações

Declarações são instruções efetivas da linguagem. Normalmente são formadas por um ou mais construtos.

Toda declaração é uma classe em TypeScript que estende `Declaracao`, uma classe, e que obriga a implementação de dois métodos: um chamado `visitar()`, outro chamado `paraTexto()`. O método `visitar()` possui o argumento `visitante`, que pode ser um interpretador, um tradutor, um formatador, etc. Ele indica qual método do visitante deve ser chamado. O método `paraTexto()` devolve uma representação da declaração como um texto, usando uma notação semelhante à do XML. 

## Localizações (antigamente chamadas de Pragmas)

Toda declaração carrega a referência do código original de onde veio. Essa referência é chamada de localização. Em Delégua, localizações são representados por duas informações: o _hash_ do arquivo (gerado a partir do caminho completo do arquivo de código), e a primeira linha onde a declaração é mencionada. Essas informações são fundamentais para geração de relatórios de erros, depuração interna, e orientações para ferramentas automatizadas.