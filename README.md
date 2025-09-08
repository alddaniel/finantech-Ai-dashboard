# FinanTech AI - Pacote de Deploy para Vercel

Este pacote foi reestruturado para ser uma aplicação web moderna e pronta para produção, utilizando um sistema de build com Vite e um backend seguro para a chave de API, ideal para deploy na Vercel (incluindo o Plano Hobby).

## Pré-requisitos

- **Node.js:** Essencial para instalar as dependências e rodar o build. [Baixe aqui](https://nodejs.org/).
- **Conta na Vercel:** [Crie uma conta gratuita](https://vercel.com/signup).
- **Conta no GitHub (ou similar):** A forma mais fácil de fazer o deploy na Vercel é através de um repositório Git.

## Como Fazer o Deploy na Vercel

### Passo 1: Preparar o Ambiente

1.  **Instale as dependências:** Abra o terminal na pasta do projeto e execute:
    ```bash
    npm install
    ```
2.  **Suba para um Repositório Git:** Crie um novo repositório no GitHub (ou GitLab/Bitbucket) e envie o código do projeto para ele.

### Passo 2: Configurar o Projeto na Vercel

1.  **Novo Projeto:** No seu dashboard da Vercel, clique em "Add New..." -> "Project".
2.  **Importar Repositório:** Importe o repositório Git que você criou no passo anterior.
3.  **Configurar o Projeto:** A Vercel deve detectar automaticamente que é um projeto Vite e preencher as configurações de build corretamente.
    - **Framework Preset:** `Vite`
    - **Build Command:** `npm run build` ou `vite build`
    - **Output Directory:** `dist`
4.  **Adicionar a Chave da API (MUITO IMPORTANTE):**
    - Vá para a seção **Environment Variables**.
    - Crie uma nova variável de ambiente com o nome `API_KEY`.
    - No campo de valor (`value`), cole a sua chave da API do Google Gemini.
    - **Certifique-se de que a variável não está marcada como "Exposed to the browser"**. Ela deve ser acessível apenas no backend (Serverless Functions).
5.  **Deploy:** Clique no botão "Deploy".

A Vercel irá clonar seu repositório, instalar as dependências, executar o build e fazer o deploy da sua aplicação. Ao final, você receberá uma URL pública para acessar seu sistema.

### Rodando Localmente para Desenvolvimento

Para testar antes de enviar para o repositório, você pode rodar um servidor de desenvolvimento local. Ele recarrega automaticamente quando você faz alterações nos arquivos.

1.  **Instale a CLI da Vercel:**
    ```bash
    npm install -g vercel
    ```
2.  **Inicie o servidor de desenvolvimento da Vercel:**
    ```bash
    vercel dev
    ```
3.  **Vincule o projeto e adicione a chave:**
    - Na primeira vez, a CLI perguntará sobre vincular o projeto. Siga as instruções.
    - Para adicionar a chave de API localmente, execute:
      ```bash
      vercel env add API_KEY
      ```
    - Cole sua chave quando solicitado. Depois, para baixar as variáveis de ambiente para o seu ambiente local, execute:
      ```bash
      vercel env pull .env.development.local
      ```
4.  **Rode `vercel dev` novamente.** O servidor local (geralmente em `http://localhost:3000`) agora terá acesso à sua chave de API de forma segura, simulando o ambiente da Vercel.

