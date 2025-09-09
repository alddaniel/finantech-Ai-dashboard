/**
 * A comprehensive XML parser for NFe to generate detailed DANFE data.
 * It uses regular expressions to find specific values and blocks in the XML string.
 * This is a frontend-only approach; a real application would benefit from a robust
 * server-side XML parsing library.
 */
import type { DanfeData, DanfeItem, DanfeFatura, ParsedNFeData, Address, Contact, ParsedNFeInstallment } from '../types';

/**
 * Extracts a value from an XML string using a regular expression.
 * @param xmlContent The full XML string or a block.
 * @param regex The regular expression to use for extraction.
 * @returns The extracted value or an empty string if not found.
 */
const extractValue = (xmlContent: string, regex: RegExp): string => {
    const match = xmlContent.match(regex);
    return match ? match[1]?.trim() ?? '' : '';
};

/**
 * Extracts a block of XML content based on a tag name.
 * @param xmlContent The full XML string.
 * @param tagName The name of the tag to extract.
 * @returns The content within the tag or an empty string.
 */
const extractBlock = (xmlContent: string, tagName: string): string => {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xmlContent.match(regex);
    return match ? match[1] : '';
};

/**
 * Extracts an attribute from an XML tag.
 * @param xmlBlock The full XML block containing the tag.
 * @param tagName The tag name.
 * @param attributeName The attribute name.
 * @returns The attribute's value or an empty string.
 */
const extractAttribute = (xmlBlock: string, tagName: string, attributeName: string): string => {
    const regex = new RegExp(`<${tagName}[^>]*${attributeName}=["'](.*?)["']`, 'i');
    const match = xmlBlock.match(regex);
    return match ? match[1] : '';
};


/**
 * Parses an NFe XML string to extract detailed information for a DANFE preview.
 * @param xmlContent The XML content as a string.
 * @returns A promise that resolves with the parsed DANFE data.
 */
export const parseXmlToDanfeData = (xmlContent: string): Promise<DanfeData> => {
    return new Promise((resolve, reject) => {
        try {
            const infNFeBlock = extractBlock(xmlContent, 'infNFe');
            if (!infNFeBlock) throw new Error("Bloco <infNFe> não encontrado no XML.");
            
            const ideBlock = extractBlock(infNFeBlock, 'ide');
            const emitBlock = extractBlock(infNFeBlock, 'emit');
            const destBlock = extractBlock(infNFeBlock, 'dest');
            const totalBlock = extractBlock(infNFeBlock, 'total');
            const icmsTotBlock = extractBlock(totalBlock, 'ICMSTot');
            const transpBlock = extractBlock(infNFeBlock, 'transp');
            const transportaBlock = extractBlock(transpBlock, 'transporta');
            const veicTranspBlock = extractBlock(transpBlock, 'veicTransp');
            const volBlock = extractBlock(transpBlock, 'vol');
            const cobrBlock = extractBlock(infNFeBlock, 'cobr');
            const infAdicBlock = extractBlock(infNFeBlock, 'infAdic');

            const itemBlocks = infNFeBlock.match(/<det nItem="\d+">[\s\S]*?<\/det>/g) || [];
            const faturaBlocks = cobrBlock.match(/<dup>[\s\S]*?<\/dup>/g) || [];

            const parsedData: DanfeData = {
                chaveAcesso: extractAttribute(infNFeBlock, 'infNFe', 'Id').replace('NFe', ''),
                tipoOperacao: extractValue(ideBlock, /<tpNF>(.*?)<\/tpNF>/) as '0' | '1',
                numeroNota: extractValue(ideBlock, /<nNF>(.*?)<\/nNF>/),
                serie: extractValue(ideBlock, /<serie>(.*?)<\/serie>/),
                naturezaOperacao: extractValue(ideBlock, /<natOp>(.*?)<\/natOp>/),
                dataEmissao: extractValue(ideBlock, /<dhEmi>(.*?)<\/dhEmi>/),
                dataSaidaEntrada: extractValue(ideBlock, /<dhSaiEnt>(.*?)<\/dhSaiEnt>/),
                horaSaidaEntrada: extractValue(ideBlock, /<hSaiEnt>(.*?)<\/hSaiEnt>/),
                
                emitente: {
                    nome: extractValue(emitBlock, /<xNome>(.*?)<\/xNome>/),
                    cnpjCpf: extractValue(emitBlock, /<CNPJ>(.*?)<\/CNPJ>/) || extractValue(emitBlock, /<CPF>(.*?)<\/CPF>/),
                    endereco: `${extractValue(emitBlock, /<xLgr>(.*?)<\/xLgr>/)}, ${extractValue(emitBlock, /<nro>(.*?)<\/nro>/)}`,
                    bairro: extractValue(emitBlock, /<xBairro>(.*?)<\/xBairro>/),
                    cep: extractValue(emitBlock, /<CEP>(.*?)<\/CEP>/),
                    municipio: extractValue(emitBlock, /<xMun>(.*?)<\/xMun>/),
                    uf: extractValue(emitBlock, /<UF>(.*?)<\/UF>/),
                    telefone: extractValue(emitBlock, /<fone>(.*?)<\/fone>/),
                    ie: extractValue(emitBlock, /<IE>(.*?)<\/IE>/),
                },

                destinatario: {
                    nome: extractValue(destBlock, /<xNome>(.*?)<\/xNome>/),
                    cnpjCpf: extractValue(destBlock, /<CNPJ>(.*?)<\/CNPJ>/) || extractValue(destBlock, /<CPF>(.*?)<\/CPF>/),
                    endereco: `${extractValue(destBlock, /<xLgr>(.*?)<\/xLgr>/)}, ${extractValue(destBlock, /<nro>(.*?)<\/nro>/)}`,
                    bairro: extractValue(destBlock, /<xBairro>(.*?)<\/xBairro>/),
                    cep: extractValue(destBlock, /<CEP>(.*?)<\/CEP>/),
                    municipio: extractValue(destBlock, /<xMun>(.*?)<\/xMun>/),
                    uf: extractValue(destBlock, /<UF>(.*?)<\/UF>/),
                    telefone: extractValue(destBlock, /<fone>(.*?)<\/fone>/),
                    ie: extractValue(destBlock, /<IE>(.*?)<\/IE>/),
                },
                
                totais: {
                    baseCalculoIcms: extractValue(icmsTotBlock, /<vBC>(.*?)<\/vBC>/),
                    valorIcms: extractValue(icmsTotBlock, /<vICMS>(.*?)<\/vICMS>/),
                    baseCalculoIcmsSt: extractValue(icmsTotBlock, /<vBCST>(.*?)<\/vBCST>/),
                    valorIcmsSt: extractValue(icmsTotBlock, /<vST>(.*?)<\/vST>/),
                    valorTotalProdutos: extractValue(icmsTotBlock, /<vProd>(.*?)<\/vProd>/),
                    valorFrete: extractValue(icmsTotBlock, /<vFrete>(.*?)<\/vFrete>/),
                    valorSeguro: extractValue(icmsTotBlock, /<vSeg>(.*?)<\/vSeg>/),
                    desconto: extractValue(icmsTotBlock, /<vDesc>(.*?)<\/vDesc>/),
                    outrasDespesas: extractValue(icmsTotBlock, /<vOutro>(.*?)<\/vOutro>/),
                    valorTotalIpi: extractValue(icmsTotBlock, /<vIPI>(.*?)<\/vIPI>/),
                    valorTotalNota: extractValue(icmsTotBlock, /<vNF>(.*?)<\/vNF>/),
                },
                
                transportador: {
                    nome: extractValue(transportaBlock, /<xNome>(.*?)<\/xNome>/),
                    fretePorConta: extractValue(transpBlock, /<modFrete>(.*?)<\/modFrete>/),
                    codigoAntt: extractValue(veicTranspBlock, /<RNTRC>(.*?)<\/RNTRC>/),
                    placaVeiculo: extractValue(veicTranspBlock, /<placa>(.*?)<\/placa>/),
                    ufVeiculo: extractValue(veicTranspBlock, /<UF>(.*?)<\/UF>/),
                    cnpjCpf: extractValue(transportaBlock, /<CNPJ>(.*?)<\/CNPJ>/) || extractValue(transportaBlock, /<CPF>(.*?)<\/CPF>/),
                    endereco: extractValue(transportaBlock, /<xEnder>(.*?)<\/xEnder>/),
                    municipio: extractValue(transportaBlock, /<xMun>(.*?)<\/xMun>/),
                    uf: extractValue(transportaBlock, /<UF>(.*?)<\/UF>/),
                    ie: extractValue(transportaBlock, /<IE>(.*?)<\/IE>/),
                    qntVolumes: extractValue(volBlock, /<qVol>(.*?)<\/qVol>/),
                    especieVolumes: extractValue(volBlock, /<esp>(.*?)<\/esp>/),
                    marcaVolumes: extractValue(volBlock, /<marca>(.*?)<\/marca>/),
                    numeracaoVolumes: extractValue(volBlock, /<nVol>(.*?)<\/nVol>/),
                    pesoBruto: extractValue(volBlock, /<pesoB>(.*?)<\/pesoB>/),
                    pesoLiquido: extractValue(volBlock, /<pesoL>(.*?)<\/pesoL>/),
                },
                
                items: itemBlocks.map((block): DanfeItem => ({
                    codigo: extractValue(block, /<cProd>(.*?)<\/cProd>/),
                    descricao: extractValue(block, /<xProd>(.*?)<\/xProd>/),
                    ncm: extractValue(block, /<NCM>(.*?)<\/NCM>/),
                    cfop: extractValue(block, /<CFOP>(.*?)<\/CFOP>/),
                    unidade: extractValue(block, /<uCom>(.*?)<\/uCom>/),
                    quantidade: extractValue(block, /<qCom>(.*?)<\/qCom>/),
                    valorUnitario: extractValue(block, /<vUnCom>(.*?)<\/vUnCom>/),
                    valorTotal: extractValue(block, /<vProd>(.*?)<\/vProd>/),
                    baseCalculoIcms: extractValue(block, /<vBC>(.*?)<\/vBC>/),
                    valorIcms: extractValue(block, /<vICMS>(.*?)<\/vICMS>/),
                    valorIpi: extractValue(block, /<vIPI>(.*?)<\/vIPI>/),
                    aliqIcms: extractValue(block, /<pICMS>(.*?)<\/pICMS>/),
                    aliqIpi: extractValue(block, /<pIPI>(.*?)<\/pIPI>/),
                })),

                faturas: faturaBlocks.map((block): DanfeFatura => ({
                    numero: extractValue(block, /<nDup>(.*?)<\/nDup>/),
                    vencimento: extractValue(block, /<dVenc>(.*?)<\/dVenc>/),
                    valor: extractValue(block, /<vDup>(.*?)<\/vDup>/),
                })),

                infoAdicionais: extractValue(infAdicBlock, /<infCpl>(.*?)<\/infCpl>/),
            };
            
            resolve(parsedData);

        } catch (error) {
            reject(error);
        }
    });
};

const mapCrtToTaxRegime = (crt: string): Contact['taxRegime'] => {
    switch (crt) {
        case '1':
            return 'Simples Nacional';
        case '2': // Simples Nacional, excesso de sublimite de receita bruta
            return 'Simples Nacional';
        case '3': // Regime Normal
            return 'Lucro Presumido'; // Defaulting 'Regime Normal' to this, as it's more common for PMEs than Lucro Real.
        default:
            return 'Simples Nacional'; // Safe default for missing or other values
    }
};

const mapTPagToPaymentMethod = (tPag: string): string | null => {
    switch (tPag) {
        case '01': return 'Dinheiro';
        case '02': return 'Cheque';
        case '03': return 'Cartão de Crédito';
        case '04': return 'Cartão de Débito';
        case '05': return 'Crédito Loja';
        case '10': return 'Vale Alimentação';
        case '11': return 'Vale Refeição';
        case '12': return 'Vale Presente';
        case '13': return 'Vale Combustível';
        case '15': return 'Boleto';
        case '16': return 'Depósito Bancário';
        case '17': return 'Pix';
        case '18': return 'Transferência (TED/DOC)';
        case '19': return 'Débito Automático';
        case '90': return 'Sem pagamento';
        case '99': return 'Outros';
        default: return null;
    }
};


/**
 * Parses an NFe XML string to extract key information for creating an expense.
 * @param xmlContent The XML content as a string.
 * @returns A promise that resolves with the parsed expense data.
 */
export const parseNFeXmlForExpense = (xmlContent: string): Promise<ParsedNFeData> => {
    return new Promise((resolve, reject) => {
        try {
            const infNFeBlock = extractBlock(xmlContent, 'infNFe');
            if (!infNFeBlock) throw new Error("Bloco <infNFe> não encontrado no XML.");
            
            const emitBlock = extractBlock(infNFeBlock, 'emit');
            const totalBlock = extractBlock(infNFeBlock, 'total');
            const icmsTotBlock = extractBlock(totalBlock, 'ICMSTot');
            const cobrBlock = extractBlock(infNFeBlock, 'cobr');
            const fatBlock = extractBlock(cobrBlock, 'fat');
            const pagBlock = extractBlock(infNFeBlock, 'pag');
            const detPagBlock = extractBlock(pagBlock, 'detPag');

            const itemBlocks = infNFeBlock.match(/<det nItem="\d+">[\s\S]*?<\/det>/g) || [];
            const dupBlocks = cobrBlock.match(/<dup>[\s\S]*?<\/dup>/g) || [];

            const supplier: ParsedNFeData['supplier'] = {
                name: extractValue(emitBlock, /<xNome>(.*?)<\/xNome>/),
                cnpj: extractValue(emitBlock, /<CNPJ>(.*?)<\/CNPJ>/),
                ie: extractValue(emitBlock, /<IE>(.*?)<\/IE>/),
                taxRegime: mapCrtToTaxRegime(extractValue(emitBlock, /<CRT>(.*?)<\/CRT>/)),
                address: {
                    street: extractValue(emitBlock, /<xLgr>(.*?)<\/xLgr>/),
                    number: extractValue(emitBlock, /<nro>(.*?)<\/nro>/),
                    neighborhood: extractValue(emitBlock, /<xBairro>(.*?)<\/xBairro>/),
                    city: extractValue(emitBlock, /<xMun>(.*?)<\/xMun>/),
                    state: extractValue(emitBlock, /<UF>(.*?)<\/UF>/),
                    zip: extractValue(emitBlock, /<CEP>(.*?)<\/CEP>/),
                }
            };

            const items: ParsedNFeData['items'] = itemBlocks.map(block => {
                return {
                    description: extractValue(block, /<xProd>(.*?)<\/xProd>/),
                    quantity: parseFloat(extractValue(block, /<qCom>(.*?)<\/qCom>/)) || 1,
                    unitPrice: parseFloat(extractValue(block, /<vUnCom>(.*?)<\/vUnCom>/)) || 0,
                    totalPrice: parseFloat(extractValue(block, /<vProd>(.*?)<\/vProd>/)) || 0,
                };
            });

            const totalAmount = parseFloat(extractValue(icmsTotBlock, /<vNF>(.*?)<\/vNF>/)) || 0;
            
            const installments: ParsedNFeInstallment[] = [];
            if (dupBlocks.length > 0) {
                dupBlocks.forEach(block => {
                    installments.push({
                        dueDate: extractValue(block, /<dVenc>(.*?)<\/dVenc>/),
                        amount: parseFloat(extractValue(block, /<vDup>(.*?)<\/vDup>/)) || 0,
                    });
                });
            } else {
                const singleDueDate = extractValue(fatBlock, /<dVenc>(.*?)<\/dVenc>/);
                if (singleDueDate) {
                    installments.push({
                        dueDate: singleDueDate,
                        amount: totalAmount,
                    });
                }
            }

            if (installments.length === 0 && totalAmount > 0) {
                const emissionDate = extractValue(infNFeBlock, /<dhEmi>([\s\S]*?)T/i) || null;
                installments.push({
                    dueDate: emissionDate,
                    amount: totalAmount,
                });
            }
            
            const paymentTypeCode = extractValue(detPagBlock, /<tPag>(.*?)<\/tPag>/);
            const paymentMethod = mapTPagToPaymentMethod(paymentTypeCode);

            const paymentIndicator = extractValue(pagBlock, /<indPag>(.*?)<\/indPag>/); // 0=A prazo, 1=A vista
            const status: 'Pendente' | 'Pago' = paymentIndicator === '1' ? 'Pago' : 'Pendente';
            const paymentDate = status === 'Pago' ? extractValue(detPagBlock, /<dPag>(.*?)<\/dPag>/) || extractValue(infNFeBlock, /<dhEmi>([\s\S]*?)T/i) : null;

            if (!supplier.cnpj) {
                throw new Error("CNPJ do fornecedor (emitente) não encontrado no XML.");
            }
            if (totalAmount === 0) {
                 throw new Error("Valor total da nota (vNF) não encontrado no XML.");
            }

            resolve({
                supplier,
                items,
                totalAmount,
                installments,
                paymentMethod,
                status,
                paymentDate,
            });

        } catch (error) {
            reject(error);
        }
    });
};
