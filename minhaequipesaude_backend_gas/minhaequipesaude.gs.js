/**
 * Configurações de ambiente
 * Alterar a função para env()
 */
function _env() {
  return {
    ENV_SPREADSHEET_ID: '',
    SH_ENDERECO: '',
    SH_PROFISSIONAL: '',
    SH_EQUIPE: '',
    EXCEPTION_LIST: []
  };
}

/**
 * Endpoint HTTP GET
 */
function doGet(e) {
  let params = (e && e.parameter) ? e.parameter : {};
  let op = params.action;
  let sheetNumber = params.sheetnumber;
  let sheet = params.aba;

  if (op === "read") {
    return getBySheetName(sheetNumber, sheet);
  }

  if (op === "search") {
    let logradouro = params.logradouro;
    let numero = params.numero;
    return searchAddress(logradouro, numero);
  }

  if (op === "clear_cache") {
    return limparCache();
  }

  return messageError('Ação inválida.');
}

function getBySheetName(sheetNumber, sheet) {
  let envData = env();

  if (sheetNumber == 1) {
    return getDataAddress(envData.SH_ENDERECO);
  }

  if (sheetNumber == 2) {
    return getDataAll(envData.SH_PROFISSIONAL);
  }

  if (sheetNumber == 3) {
    return getDataAll(envData.SH_EQUIPE);
  }

  if (sheetNumber == 4) {
    if (checkSpreadsheetSheet(sheet)) {
      return messageError('Aba não encontrada ou de acesso restrito');
    }
    return getDataAll(sheet);
  }

  return messageError('Parâmetro sheetnumber inválido');
}

function checkSpreadsheetSheet(sheet) {
  if (!sheet) return true;
  return !startsWithUnderscore(sheet) || 
         isSheetException(sheet) || 
         !isValidSheetName(sheet);
}

function startsWithUnderscore(sheet) {
  return Boolean(sheet && sheet.startsWith('_'));
}

function isSheetException(sheet) {
  const exceptions = env().EXCEPTION_LIST || [];
  return exceptions.includes(sheet);
}

function isValidSheetName(sheet) {
  return getSheetNamesCached().includes(sheet);
}

function getSheetNamesCached() {
  let cache = CacheService.getScriptCache();
  let cachedNames = cache.get("sheet_names");

  if (cachedNames) {
    return JSON.parse(cachedNames);
  }

  let ss = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID);
  let names = ss.getSheets().map(function(sheet) { return sheet.getName(); });
  // cache com duração de 6 horas (21600 segundos)
  cache.put("sheet_names", JSON.stringify(names), 21600);
  return names;
}

function getDataAll(sheetName) {
  let response = {
    success: true,
    data: readDataCached(sheetName),
    meta: {}
  };
  
  if (Array.isArray(response.data)) {
    response.meta.total = response.data.length;
  }

  return buildJsonResponse(response);
}

function getDataAddress(sheetName) {
  let response = {
    success: true,
    data: readDataCached(sheetName, ['numero']),
    meta: {}
  };

  if (Array.isArray(response.data)) {
    response.meta.total = response.data.length;
  }

  return buildJsonResponse(response);
}

function searchAddress(logradouroBuscadoBruto, numeroBuscadoBruto) {
  let logradouroBuscado = limparEPadronizarTexto(logradouroBuscadoBruto);
  let numeroBuscado = limparEPadronizarTexto(numeroBuscadoBruto);

  if (!logradouroBuscado || !numeroBuscado) {
    return messageError("Parametros 'logradouro' e 'numero' sao obrigatorios.");
  }

  let todosEnderecos = readDataCached(env().SH_ENDERECO);

  if (!Array.isArray(todosEnderecos)) {
    return messageError("Erro ao recuperar lista de endereços.");
  }

  let encontrados = todosEnderecos.filter(function (item) {
    let logradouroPlanilha = limparEPadronizarTexto(item.logradouro);
    let numeroPlanilha = limparEPadronizarTexto(item.numero);

    return logradouroPlanilha.includes(logradouroBuscado) && numeroPlanilha === numeroBuscado;
  });

  let response = { success: false, data: [] };

  if (encontrados.length > 0) {
    response.success = true;
    response.data = encontrados;
  } else {
    response.message = "Nenhum endereco correspondente foi encontrado.";
  }

  return buildJsonResponse(response);
}

function limparEPadronizarTexto(texto) {
  if (texto === undefined || texto === null) return "";
  
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/**
 * Cache Fatiado (Chunking) para contornar o limite de 100KB por item
 */
function readDataCached(sheetName, colunasIgnoradas) {
  if (!colunasIgnoradas) colunasIgnoradas = [];
  let cacheKey = "data_" + sheetName + "_" + colunasIgnoradas.join("_");
  let cachedData = getChunkedCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  let ss = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return [];
  }

  let data = readData(sheet, colunasIgnoradas);

  if (Array.isArray(data)) {
    setChunkedCache(cacheKey, data, 3600);
  }

  return data;
}

function setChunkedCache(key, data, expirationInSeconds) {
  if (!expirationInSeconds) expirationInSeconds = 3600;
  let cache = CacheService.getScriptCache();
  let jsonString = JSON.stringify(data);
  let chunkSize = 80000; // ~78KB por fatia para margem de segurança
  
  let chunksCount = Math.ceil(jsonString.length / chunkSize);
  let payload = {};
  
  for (let i = 0; i < chunksCount; i++) {
    let chunkKey = key + "_chunk_" + i;
    payload[chunkKey] = jsonString.substring(i * chunkSize, (i + 1) * chunkSize);
  }
  
  payload[key + "_chunks"] = String(chunksCount);
  cache.putAll(payload, expirationInSeconds);
}

function getChunkedCache(key) {
  let cache = CacheService.getScriptCache();
  let chunksCountStr = cache.get(key + "_chunks");
  
  if (!chunksCountStr) return null;
  
  let chunksCount = parseInt(chunksCountStr, 10);
  let keys = [];
  
  for (let i = 0; i < chunksCount; i++) {
    keys.push(key + "_chunk_" + i);
  }
  
  let cachedChunks = cache.getAll(keys);
  let fullJsonString = "";
  
  for (let i = 0; i < chunksCount; i++) {
    let chunkKey = key + "_chunk_" + i;
    if (!cachedChunks[chunkKey]) return null;
    fullJsonString += cachedChunks[chunkKey];
  }
  
  try {
    return JSON.parse(fullJsonString);
  } catch (e) {
    return null;
  }
}

/**
 * Processamento das Planilhas
 */
function readData(sheet, colunasIgnoradas) {
  if (!colunasIgnoradas) colunasIgnoradas = [];
  try {
    const ignorarFormatado = colunasIgnoradas.map(function(p) { return p.trim(); });
    let originalHeaders = getHeaderRow(sheet);

    let properties = originalHeaders.map(function (p) {
      return String(p).replace(/\s+/g, '_');
    });

    let rows = getDataRows(sheet);
    let data = [];

    for (let r = 0, l = rows.length; r < l; r++) {
      let row = rows[r];
      let record = {};

      for (let p = 0; p < properties.length; p++) {
        let columnName = properties[p];
        let originalName = originalHeaders[p];
        let cellValue = row[p];

        if (!originalName || String(originalName).trim() === "" || String(originalName).trim().startsWith("#")) {
          continue;
        }

        if (ignorarFormatado.indexOf(originalName) !== -1) {
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
    return [];
  }
}

function getHeaderRow(sheet) {
  try {
    let lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) return [];
    return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  } catch (error) {
    return [];
  }
}

function getDataRows(sheet) {
  try {
    let lastRow = sheet.getLastRow();
    let lastColumn = sheet.getLastColumn();
    if (lastRow <= 1 || lastColumn === 0) return [];

    return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  } catch (error) {
    return [];
  }
}

/**
 * Respostas HTTP
 */
function buildJsonResponse(data) {
  let output = ContentService.createTextOutput();
  output.setContent(JSON.stringify(data));
  return output.setMimeType(ContentService.MimeType.JSON);
}

function messageError(msg) {
  return buildJsonResponse({
    success: false,
    data: [],
    message: msg
  });
}

/**
 * Limpeza de Cache Completa
 */
function limparCache() {
  let cache = CacheService.getScriptCache();
  let envData = env();

  // Limpa índice de abas
  cache.remove("sheet_names");

  // Lista de chaves base utilizadas no projeto
  let baseKeys = [
    "data_" + envData.SH_ENDERECO + "_",
    "data_" + envData.SH_ENDERECO + "_numero",
    "data_" + envData.SH_PROFISSIONAL + "_",
    "data_" + envData.SH_EQUIPE + "_"
  ];

  baseKeys.forEach(function(baseKey) {
    let chunksCountStr = cache.get(baseKey + "_chunks");
    if (chunksCountStr) {
      let count = parseInt(chunksCountStr, 10);
      for (let i = 0; i < count; i++) {
        cache.remove(baseKey + "_chunk_" + i);
      }
      cache.remove(baseKey + "_chunks");
    }
  });

  return buildJsonResponse({
    success: true,
    message: "Cache e fragmentos zerados com sucesso!"
  });
}