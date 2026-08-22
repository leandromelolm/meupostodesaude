# API Google Apps Script - Gestão de Endereços e Equipes

API desenvolvida em **Google Apps Script** para disponibilizar os dados de uma planilha do Google Sheets no formato **JSON**.

---

## 📌 Funcionalidades

- **Leitura por Abas Privilegiadas:** Acesso às guias de Endereços, Profissionais e Equipes pelo identificador `sheetnumber`.
- **Busca por Endereço:** Filtra por logradouro e número, ignorando acentuação, maiúsculas, minúsculas e vírgulas.
- **Leitura Dinâmica de Abas Extras:** Permite buscar dados em outras guias da planilha via parâmetro `aba`, desde que o nome comece com `_` e não esteja na lista de exceções.
- **Tratamento de Dados:**
  - Cabeçalhos em branco ou iniciados por `#` tem a colunas ignorada na leitura dos dados (removido na resposta da api).
  - Conversão automática de nomes de colunas com espaço para `snake_case`.
  - Desmembramento da coluna `observacao` em um _array_ quando houver itens separados por `;`.

---

## 🛠️ Configuração da Planilha

Crie uma planilha no Google Sheets contendo **3 abas** e configure seus respectivos nomes na função `_env()` do script:

- **SH_ENDERECO:** {Nome da aba de endereços}
- **SH_PROFISSIONAL:** {Nome da aba de profissionais}
- **SH_EQUIPE:** {Nome da aba de equipes}

### Estrutura das Colunas

- **ENDERECO:**  
  `id` | `logradouro` | `numero` | `cep` | `bairro` | `micro` | `cidade` | `complemento` | `observacao` | `acs` | `equipe_vinculada` | `aviso`

- **PROFISSIONAL:**  
  `id` | `nome` | `funcao` | `especialidade` | `registro` | `micro` | `equipe` | `unidade` | `url_foto` | `contato`

- **EQUIPE:**  
  `id` | `nome` | `ine` | `apelido` | `registro` | `descricao` | `unidade`

---

## 🚀 Rotas da API

Todas as requisições são feitas via método `GET`.

### 1. Ler Endereços (`sheetnumber=1`)

```http
GET {URL_DO_WEB_APP}?action=read&sheetnumber=1
```

### 2. Ler Profissionais (`sheetnumber=2`)

```http
GET {URL_DO_WEB_APP}?action=read&sheetnumber=2
```

### 3. Ler Equipes (`sheetnumber=3`)

```http
GET {URL_DO_WEB_APP}?action=read&sheetnumber=3
```

### 4. Ler Aba Personalizada (`sheetnumber=4&aba=NOME_ABA`)

Aba personalizada precisa iniciar obrigatoriamente com `_` (underline).

```http
GET {URL_DO_WEB_APP}?action=read&sheetnumber=4&aba=_NOME_DA_ABA
```

### 5. Pesquisar Endereço

```http
GET {URL_DO_WEB_APP}?action=search&logradouro=Rua das Flores&numero=150
```
