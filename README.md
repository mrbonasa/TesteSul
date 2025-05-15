## Pré-requisitos
- Node.js (v14 ou superior recomendado)
- npm (geralmente vem com o Node.js)

## Instalação

1.  Clone o repositório:
    ```bash
    git clone <url-do-seu-repositorio>
    cd golden-raspberry-api
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Certifique-se de que o arquivo `movielist.csv` está presente no diretório `data/`. O arquivo deve ter o separador `;` e as seguintes colunas: `year;title;studios;producers;winner`.

## Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento (com reinício automático usando `nodemon`):
```bash
npm run dev
