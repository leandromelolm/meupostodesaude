/** alterar função para env() */
function _env() {
  return {
    ENV_SPREADSHEET_ID: '',
    SH_ENDERECO: '',
    SH_PROFISSIONAL: '',
    SH_EQUIPE: '',
    LISTA_EXCECOES: []
  }
}

function doGet(e) {
  let op = e.parameter.action;
  let sheetNumber = e.parameter.sheetnumber;
  let aba = e.parameter.aba;
  let ss = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID);

  if (op == "read")
    return getBySheetName(ss, sheetNumber, aba);

  if (op == "search") {
    let logradouro = e.parameter.logradouro;
    let numero = e.parameter.numero;
    return searchAddress(ss, logradouro, numero);
  }
}

function getBySheetName(ss, sheetNumber, aba) {
  if (sheetNumber == 1) {
    return getDataAddress(ss.getSheetByName(env().SH_ENDERECO))
  }

  if (sheetNumber == 2) {
    return getDataAll(ss.getSheetByName(env().SH_PROFISSIONAL))
  }

  if (sheetNumber == 3) {
    return getDataAll(ss.getSheetByName(env().SH_EQUIPE))
  }

  if (sheetNumber == 4) {
    if (verificarExcecoesDeAbas(aba)) return messageError('Não encontrado');
    if(!verificarNomeAba(aba)) return messageError('Não encontrado');
    return getDataAll(ss.getSheetByName(aba))
  }

}

function verificarExcecoesDeAbas(aba){
  const excecoes = env().LISTA_EXCECOES;
  return excecoes.includes(aba);
}

function verificarNomeAba(aba) {
  return pegarArrayNomeAbas().includes(aba);
}

function pegarArrayNomeAbas() {
  return SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheets().map(aba => aba.getName());
}

function getDataAll(sheetName) {
  let output = ContentService.createTextOutput(), response = {};
  response.data = readData(sheetName);
  response.success = 'true';
  response.meta = { total: response.data.length }
  output.setContent(JSON.stringify(response));
  return output.setMimeType(ContentService.MimeType.JSON);
}

function getDataAddress(sheetName) {
  let output = ContentService.createTextOutput(), response = {};
  response.data = readData(sheetName, ['numero']);
  response.success = 'true';
  response.meta = { total: response.data.length }
  output.setContent(JSON.stringify(response));
  return output.setMimeType(ContentService.MimeType.JSON);
}

function limparTexto(texto) {
  if (texto === undefined || texto === null) return "";
  return String(texto)
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function limparEPadronizarTexto(texto) {
  if (texto === undefined || texto === null) return "";
  
  return String(texto)
    .normalize("NFD")                // Separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/,/g, "")               // Remove as vírgulas
    .replace(/\s+/g, " ")            // Substitui múltiplos espaços por um único espaço
    .toLowerCase()                   // Transforma tudo em minúsculo
    .trim();                         // Remove espaços extras no início e no fim
}

function searchAddress(ss, logradouroBuscadoBruto, numeroBuscadoBruto) {
  let logradouroBuscado = limparEPadronizarTexto(logradouroBuscadoBruto);
  let numeroBuscado = limparEPadronizarTexto(numeroBuscadoBruto);

  let output = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
  let response = { success: false, data: [] };

  if (!logradouroBuscado || !numeroBuscado) {
    response.error = "Parametros 'logradouro' e 'numero' sao obrigatorios.";
    return output.setContent(JSON.stringify(response));
  }

  let sheetEndereco = ss.getSheetByName(env().SH_ENDERECO);
  let todosEnderecos = readData(sheetEndereco);

  if (todosEnderecos instanceof Error) {
    response.error = todosEnderecos.message;
    return output.setContent(JSON.stringify(response));
  }

  let encontrados = todosEnderecos.filter(function (item) {
    let logradouroPlanilha = limparEPadronizarTexto(item.logradouro);
    let numeroPlanilha = limparEPadronizarTexto(item.numero);

    return logradouroPlanilha.includes(logradouroBuscado) && numeroPlanilha === numeroBuscado;
  });

  if (encontrados.length > 0) {
    response.success = true;
    response.data = encontrados;
  } else {
    response.message = "Nenhum endereco correspondente foi encontrado.";
  }

  return output.setContent(JSON.stringify(response));
}

function readData(sheet, colunasIgnoradas = []) {
  try {
    const ignorarFormatado = colunasIgnoradas.map(p => p.trim());
    let originalHeaders = getHeaderRow(sheet);

    // Cria a lista modificada com underlines
    let properties = originalHeaders.map(function (p) {
      return String(p).replace(/\s+/g, '_');
    });

    let rows = getDataRows(sheet),
      data = [];

    for (let r = 0, l = rows.length; r < l; r++) {
      let row = rows[r],
        record = {};

      for (let p in properties) {
        let columnName = properties[p];
        let originalName = originalHeaders[p];
        let cellValue = row[p];

        // Ignora se cabeçalho está vazio ou se começa com '#'
        if (!originalName || String(originalName).trim() === "" || String(originalName).trim().startsWith("#")) {
          continue;
        }

        if (ignorarFormatado.includes(originalName)) {
          continue;
        }

        if (columnName === "observacao" && typeof cellValue === "string" && cellValue !== "") {
          record[columnName] = cellValue.split(';').map(function (item) {
            return item.trim();
          });
        } else {
          record[columnName] = cellValue;
        }
      }
      data.push(record);
    }
    return data;
  } catch (error) {
    return error;
  }
}

function getHeaderRow(sheet) {
  try {
    let lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) return [];
    return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  } catch (error) {
    return error;
  }
}

function getDataRows(sheet) {
  try {
    let lastRow = sheet.getLastRow();
    let lastColumn = sheet.getLastColumn();
    if (lastRow <= 1 || lastColumn === 0) return [];

    return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  } catch (error) {
    return error;
  }
}

function messageError(msg) {
  let output = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
  let response = { success: false, data: [] };
  response.message = msg;
  return output.setContent(JSON.stringify(response));
}

/** 
 * 
   
ROTAS
  ENDEREÇOS
  ?action=read&sheetnumber=1
  
  PROFISSIONAL
  ?action=read&sheetnumber=2 
  
  EQUIPE
  ?action=read&sheetnumber=3

  PESQUISAR LOGRADOURO
  ?action=search&logradouro=Rua das Flores&numero=150
  
CRIAR PLANILHA
  Crie uma planilha com 3 folhas(aba). 
  os nomes dado as planilhas devem ser atribuido as variaveis da função env.
  SH_ENDERECO : '{NOME_DA_FOLHA_1}',
  SH_PROFISSIONAL: '{NOME_DA_FOLHA_2}',
  SH_EQUIPE: '{NOME_DA_FOLHA_3}'


COLUNA DAS FOLHAS
  Obs: cabeçalho vazio ou se começa com '#' são ignorados na requisição
  
  ENDERECO
  id	logradouro	numero	cep	bairro	micro	cidade	complemento	observacao	acs	equipe_vinculada	aviso

  PROFISSIONAL
  id	nome	funcao	especialidade	registro	micro	equipe	unidade	url_foto contato

  EQUIPE
  id	nome	ine	apelido	registro	descricao	unidade

*/