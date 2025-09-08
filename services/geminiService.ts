import type { Transaction, CashFlowData, DebtorCustomer, BankTransaction, SystemTransaction } from '../types';

// A generic function to call our backend proxy
async function callGeminiApi<T>(endpoint: string, params: object): Promise<T> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, ...params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Proxy Error:", errorData);
    throw new Error(errorData.error || `Failed to fetch from API proxy endpoint: ${endpoint}`);
  }
  
  const result = await response.json();
  return result;
}


export const getFinancialAnalysis = async (
    cashFlow: CashFlowData[], 
    receivables: Transaction[], 
    payables: Transaction[]
): Promise<string> => {
    try {
        const result = await callGeminiApi<{ text: string }>('financialAnalysis', { cashFlow, receivables, payables });
        return result.text;
    } catch (error) {
        console.error("Error calling Gemini API for financial analysis:", error);
        return "Ocorreu um erro ao tentar analisar os dados. Por favor, tente novamente mais tarde.";
    }
};

export const getCostCuttingSuggestions = async (payables: Transaction[]): Promise<string> => {
     try {
        const result = await callGeminiApi<{ text: string }>('costCutting', { payables });
        return result.text;
    } catch (error) {
        console.error("Error calling Gemini API for cost cutting suggestions:", error);
        return "Ocorreu um erro ao buscar sugestões de corte de custos.";
    }
};

export const getTaxRegimeComparison = async (
    monthlyRevenue: number,
    businessActivity: string
): Promise<string> => {
    try {
        const result = await callGeminiApi<{ text: string }>('taxRegime', { monthlyRevenue, businessActivity });
        return result.text;
    } catch (error) {
        console.error("Error calling Gemini API for tax comparison:", error);
        return "Ocorreu um erro ao buscar a análise tributária com a IA.";
    }
};

export const getSmartCollectionStrategy = async (debtor: DebtorCustomer): Promise<string> => {
    try {
        const result = await callGeminiApi<{ text: string }>('collectionStrategy', { debtor });
        return result.text;
    } catch (error) {
        console.error("Error calling Gemini API for collection strategy:", error);
        return "Ocorreu um erro ao gerar a estratégia de cobrança.";
    }
};

export const reconcileTransactionsWithAI = async (
    bankTxs: BankTransaction[],
    systemTxs: SystemTransaction[]
): Promise<{ bankTxId: string; systemTxId: string; reason: string }[]> => {
     try {
        const result = await callGeminiApi<{ matches: { bankTxId: string; systemTxId: string; reason: string }[] }>('reconcile', { bankTxs, systemTxs });
        return result.matches || [];
    } catch (error) {
        console.error("Error in AI reconciliation:", error);
        throw new Error("A IA não conseguiu processar a conciliação.");
    }
};

export const getSchemaModification = async (
    currentSchema: string,
    userPrompt: string,
    dialect: 'postgres' | 'mysql'
): Promise<string> => {
     try {
        const result = await callGeminiApi<{ schema: string }>('schema', { currentSchema, userPrompt, dialect });
        return result.schema;
    } catch (error) {
        console.error("Error calling Gemini API for schema modification:", error);
        throw new Error("A IA não conseguiu processar a modificação do schema.");
    }
};

export const getDashboardInsight = async (
    payables: Transaction[],
    receivables: Transaction[]
): Promise<string> => {
    try {
        const result = await callGeminiApi<{ text: string }>('dashboardInsight', { payables, receivables });
        return result.text ? result.text.trim() : "💡 Não foi possível gerar um insight no momento.";
    } catch (error) {
        console.error("Error calling Gemini API for dashboard insight:", error);
        return "💡 Não foi possível gerar um insight no momento.";
    }
};