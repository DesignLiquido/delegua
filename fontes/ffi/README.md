# Interface de Funcionalidade Estrangeira (FFI)

Funcionalidade de Delégua para mapear bibliotecas de outras linguagens de programação para uso com Delégua. O foco inicial é a interoperabilidade com bibliotecas C, mas a arquitetura deve ser flexível o suficiente para suportar outros runtimes (Deno, browser, etc.) no futuro.

Parte da funcionalidade é implementada neste núcleo. O restante é responsabilidade de cada runtime específico (e.g., [`delegua-node`](https://github.com/delegua/delegua-node)). Há também uma parte da implementação em [`delegua-llvm`](https://github.com/delegua/delegua-llvm) para garantir que o compilador e o interpretador compartilhem a mesma convenção de tipos C.