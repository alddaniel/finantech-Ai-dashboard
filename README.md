# FinanTech AI - Pacote de Execução Local

Este pacote permite que você execute a aplicação FinanTech AI em sua máquina local de forma simples e rápida, sem a necessidade de configurações complexas.

## Pré-requisitos

Antes de começar, você precisa ter o **Node.js** instalado em seu computador. O Node.js inclui o `npm` (Node Package Manager), que é necessário para executar a aplicação.

- **Para baixar e instalar o Node.js:** [https://nodejs.org/](https://nodejs.org/)
  *(Recomendamos a versão LTS, que é mais estável).*

Para verificar se você já tem o Node.js instalado, abra o terminal e digite `node -v`. Se um número de versão aparecer, você está pronto.

## Como "Instalar" e Executar

Siga os passos abaixo no diretório onde você extraiu este arquivo `.zip`.

### Passo 1: Instalar as dependências

Este passo só precisa ser executado **uma única vez**. Ele irá baixar e instalar um pequeno servidor web local necessário para rodar a aplicação.

Abra o seu terminal (Prompt de Comando no Windows, ou Terminal no macOS/Linux) na pasta do projeto e execute o seguinte comando:

```bash
npm install
```

Aguarde a finalização do processo. Você verá uma pasta chamada `node_modules` ser criada.

### Passo 2: Iniciar a Aplicação

Sempre que quiser usar o sistema, execute o comando abaixo no terminal, na mesma pasta do projeto:

```bash
npm start
```

Este comando irá iniciar o servidor local e, automaticamente, abrirá a aplicação FinanTech AI no seu navegador padrão. O endereço será algo como `http://127.0.0.1:8080`.

---

É isso! A aplicação estará rodando localmente na sua máquina. Quando terminar de usar, você pode simplesmente fechar a aba do navegador e fechar a janela do terminal (pressionando `Ctrl + C` no terminal e depois confirmando, se necessário).