# Interfaces

O módulo de interfaces é o ponto em comum no núcleo de Delégua para evitar dependências circulares, que podem ser bem problemáticas em tempo de execução. É referenciado por quase todos os outros módulos, que conhecem apenas o contrato de certos componentes, mas não sua implementação.