import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, CashFlowData, DebtorCustomer, BankTransaction, SystemTransaction } from '../src/types';

// This configuration tells Vercel to run this function on its Edge Network for faster responses.
export const config = {
  runtime: 'edge',
};

// This is the main handler for the serverless function.
// It will be accessible at the `/api/gemini` endpoint.
export default async function handler(request: Request) {
  // We only allow POST requests to this endpoint.
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Ensure the API key is available in the environment variables on the server.
  if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set on the server.");
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500 });
  }

  try {
    const { endpoint, ...params } = await request.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let geminiResponse: any;

    // A switch to handle different types of requests from the frontend.
    switch (endpoint) {
      
      case 'dashboardInsight': {
        const { payables, receivables } = params as { payables: Transaction[], receivables: Transaction[] };
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const overduePayables = payables.filter(p => p.status === 'Vencido');
        const dueSoonPayables = payables.filter(p => {
            if (p.status !== 'Pendente') return false;
            const dueDate = new Date(p.dueDate + 'T00:00:00');
            return dueDate > today && dueDate <= nextWeek;
        });
        const overdueReceivables = receivables.filter(r => r.status === 'Vencido');
        const summary = `
            - Contas a pagar vencidas: ${overduePayables.length} (Total: R$ ${overduePayables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
            - Contas a pagar vencendo nos próximos 7 dias: ${dueSoonPayables.length} (Total: R$ ${dueSoonPayables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
            - Contas a receber vencidas: ${overdueReceivables.length} (Total: R$ ${overdueReceivables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
        `;
        const prompt = `
            Você é um assistente financeiro proativo para uma pequena empresa.
            Com base no resumo de dados a seguir, forneça UM insight acionável, útil e muito conciso (máximo 2 frases).
            Comece a resposta com um emoji relevante (ex: 💡, ⚠️, ✅, 📈).
            O tom deve ser direto e prestativo. Foque no que é mais urgente ou importante.
            Dados:\n${summary}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.8, maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 50 } }
        });
        geminiResponse = { text: response.text };
        break;
      }

      case 'financialAnalysis': {
        const { cashFlow, receivables, payables } = params as { cashFlow: CashFlowData[], receivables: Transaction[], payables: Transaction[] };
        const totalReceitas = cashFlow.reduce((acc, item) => acc + item.receitas, 0);
        const totalDespesas = cashFlow.reduce((acc, item) => acc + item.despesas, 0);
        const saldoFinal = cashFlow[cashFlow.length - 1].saldo;
        const pendingReceivables = receivables.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
        const pendingPayables = payables.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
        const summary = `
          ## Resumo Financeiro da Empresa (últimos 6 meses)
          - Receita Total: R$ ${totalReceitas.toFixed(2)}
          - Despesa Total: R$ ${totalDespesas.toFixed(2)}
          - Saldo Atual: R$ ${saldoFinal.toFixed(2)}
          - Contas a Receber (Pendente): R$ ${pendingReceivables.toFixed(2)}
          - Contas a Pagar (Pendente): R$ ${pendingPayables.toFixed(2)}
        `;
        const prompt = `
            Você é um consultor financeiro especialista. Com base no resumo a seguir, forneça uma análise preditiva do fluxo de caixa para os próximos 3 meses, identificando tendências, riscos e oportunidades. Forneça recomendações práticas em bullet points.
            ${summary}`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { temperature: 0.5 } });
        geminiResponse = { text: response.text };
        break;
      }
      
      case 'costCutting': {
        const { payables } = params as { payables: Transaction[] };
        const expensesSummary = payables.map(p => `- ${p.category}: ${p.description} - R$ ${p.amount.toFixed(2)}`).join('\n');
        const prompt = `
            Você é um especialista em otimização de custos. Com base na lista de despesas a seguir, sugira áreas para cortar custos sem impactar a operação. Categorize as sugestões e estime o potencial de economia.
            Lista de Despesas:\n${expensesSummary}`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { temperature: 0.7 } });
        geminiResponse = { text: response.text };
        break;
      }
      
      case 'taxRegime': {
        const { monthlyRevenue, businessActivity } = params as { monthlyRevenue: number, businessActivity: string };
        const prompt = `
            Você é um contador e consultor tributário brasileiro qualificado.
            Com base nos dados a seguir, gere uma análise comparativa detalhada entre os regimes tributários: Simples Nacional, Lucro Presumido e Lucro Real.
            Dados da Empresa:
            - Faturamento Mensal Estimado: R$ ${monthlyRevenue.toFixed(2)}
            - Atividade Principal: ${businessActivity || 'Serviços em geral'}
            Sua análise deve ser estruturada e clara, usando markdown. Para cada regime, inclua:
            1.  **Estimativa de Impostos:** Calcule uma estimativa dos impostos mensais. Para o Simples Nacional, considere o Anexo III (serviços). Para o Lucro Presumido, use a presunção de 32% para serviços. Para o Lucro Real, apresente cenários para margens de lucro de 10%, 20% e 30%.
            2.  **Prós e Contras.**
            3.  **Alíquota Efetiva.**
            Ao final, forneça uma **Recomendação Final** bem fundamentada.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { temperature: 0.4 } });
        geminiResponse = { text: response.text };
        break;
      }

      case 'collectionStrategy': {
        const { debtor } = params as { debtor: DebtorCustomer };
        const history = debtor.communicationHistory.map(h => `- ${h.date}: ${h.type.toUpperCase()} - ${h.summary}`).join('\n');
        const prompt = `
            Você é um especialista em cobranças. Crie uma "Régua de Cobrança Inteligente" para o devedor a seguir.
            - Nome: ${debtor.name}
            - Dívida Total: R$ ${debtor.totalDebt.toFixed(2)}
            - Status Atual: ${debtor.status}
            - Histórico: ${history || 'Nenhum.'}
            Crie um plano de ação passo a passo para os próximos 30 dias, sugerindo canais e conteúdo/roteiro. Formate usando markdown.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { temperature: 0.7 } });
        geminiResponse = { text: response.text };
        break;
      }

      case 'reconcile': {
        const { bankTxs, systemTxs } = params as { bankTxs: BankTransaction[], systemTxs: SystemTransaction[] };
        const schema = {
            type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: { bankTxId: { type: Type.STRING }, systemTxId: { type: Type.STRING }, reason: { type: Type.STRING }, },
                required: ["bankTxId", "systemTxId", "reason"],
            },
        };
        const prompt = `
            Você é um assistente de conciliação bancária. Encontre correspondências entre transações de extrato e lançamentos do sistema com base em valor, data próxima e descrição similar.
            Retorne um array JSON com os pares de alta confiança.
            Extrato Bancário: ${JSON.stringify(bankTxs, null, 2)}
            Lançamentos do Sistema: ${JSON.stringify(systemTxs, null, 2)}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1, },
        });
        geminiResponse = { matches: JSON.parse(response.text.trim()) };
        break;
      }

      case 'schema': {
        const { currentSchema, userPrompt, dialect } = params as { currentSchema: string, userPrompt: string, dialect: 'postgres' | 'mysql' };
        const prompt = `
            Você é um arquiteto de banco de dados SQL. Modifique o schema SQL a seguir no dialeto '${dialect}' com base na solicitação do usuário.
            Retorne APENAS o script SQL completo e atualizado, sem explicações ou markdown.
            SCHEMA ATUAL:\n---\n${currentSchema}\n---\nSOLICITAÇÃO DO USUÁRIO:\n---\n${userPrompt}\n---`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { temperature: 0.1 } });
        const cleanResponse = response.text.replace(/```sql/g, '').replace(/```/g, '').trim();
        geminiResponse = { schema: cleanResponse };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), { status: 400 });
    }

    // Return the successful response from Gemini to the frontend.
    return new Response(JSON.stringify(geminiResponse), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Gemini API proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: (error as Error).message }), { status: 500 });
  }
}
