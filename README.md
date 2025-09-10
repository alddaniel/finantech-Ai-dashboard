# FinanTech AI - Pacote de Produção

Este pacote foi estruturado como uma aplicação de produção real usando Vite.js, a ferramenta de build moderna para desenvolvimento web.

## Pré-requisitos

Antes de começar, você precisa ter o **Node.js** instalado em seu computador. O Node.js inclui o `npm` (Node Package Manager), que é necessário para instalar as dependências e executar a aplicação.

- **Para baixar e instalar o Node.js:** [https://nodejs.org/](https://nodejs.org/)
  *(Recomendamos a versão LTS, que é mais estável).*

## Configuração da Chave de API

Para que as funcionalidades de Inteligência Artificial com Gemini funcionem, você precisa configurar sua chave de API.

1.  Crie um arquivo na raiz do projeto chamado `.env.local`.
2.  Dentro deste arquivo, adicione a seguinte linha, substituindo `SUA_CHAVE_API_AQUI` pela sua chave real:

```
VITE_GEMINI_API_KEY=SUA_CHAVE_API_AQUI
```
**Importante:** O arquivo `.env.local` já está incluído no `.gitignore`, então sua chave de API não será enviada para o controle de versão.

## Como Instalar e Executar

Siga os passos abaixo no terminal, dentro da pasta do projeto.

### Passo 1: Instalar as Dependências

Este passo só precisa ser executado **uma única vez**. Ele irá baixar e instalar todas as bibliotecas que a aplicação precisa para funcionar.

```bash
npm install
```

### Passo 2: Rodar em Modo de Desenvolvimento

Para rodar a aplicação na sua máquina local com atualizações automáticas enquanto você edita o código, use o comando:

```bash
npm run dev
```

Este comando iniciará um servidor de desenvolvimento e informará o endereço para acessá-lo no navegador (geralmente `http://localhost:5173`).

### Passo 3: Gerar a Versão de Produção (Build)

Quando você for implantar a aplicação (por exemplo, na Vercel), você precisará gerar uma versão otimizada. O comando para isso é:

```bash
npm run build
```

Isso criará uma pasta `dist` com todos os arquivos estáticos prontos para serem publicados. A Vercel executará este comando automaticamente.
