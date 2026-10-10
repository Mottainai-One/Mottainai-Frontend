import { type FormEvent, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { cashClosingDiscrepancies, stockStores } from '@/data/stock';
import DetailsModal from '@/components/DetailsModal';
import type { DetailsModalField, OpenDetailsDialog } from '@/types/details-modal.types';
import type {
  MonthlyFinancialReport,
  MonthlyFinancialReportPageState,
} from '@/types/monthly-financial-report.types';
import type { ManagementReportFormat } from '@/types/management-report.types';
import {
  getMonthlyFinancialReports,
  saveMonthlyFinancialReport,
} from '@/services/monthlyFinancialReportService';
import {
  getManagementReportPreferences,
  saveManagementReportPreference,
} from '@/services/managementReportPreferencesService';
import {
  buildMonthlyFinancialReportItems,
  createMonthlyFinancialReport,
  downloadMonthlyFinancialReport,
} from '@/utils/monthlyFinancialReports';
import styles from './style.module.css';

const initialState: MonthlyFinancialReportPageState = {
  month: '',
  store: '__all__',
  reports: [],
  selectedReport: null,
  isLoadingReports: true,
  isGenerating: false,
  feedback: '',
  error: '',
};

const availableMonths = Array.from(new Set(
  cashClosingDiscrepancies.map((record) => record.date.split('/')[1]),
)).filter((month): month is string => Boolean(month));

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function AccountingSped() {
  const monthId = useId();
  const storeId = useId();
  const formatId = useId();
  const [state, setState] = useState<MonthlyFinancialReportPageState>(initialState);
  const [detailsDialog, setDetailsDialog] =
    useState<OpenDetailsDialog<MonthlyFinancialReport> | null>(null);
  const handleCloseDetails = useCallback(() => setDetailsDialog(null), []);
  const [format, setFormat] = useState<ManagementReportFormat>('csv');
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const items = useMemo(
    () => state.month
      ? buildMonthlyFinancialReportItems(cashClosingDiscrepancies, {
          month: state.month,
          store: state.store,
        })
      : [],
    [state.month, state.store],
  );
  const valueTotalInCents = items.reduce((total, item) => total + item.differenceValueInCents, 0);
  const detailsFields: DetailsModalField[] = detailsDialog
    ? [
        { id: 'createdAt', label: 'Gerado em', value: dateFormatter.format(new Date(detailsDialog.record.createdAt)) },
        { id: 'month', label: 'Mês de referência', value: `${detailsDialog.record.monthLabel} — ano não informado` },
        { id: 'store', label: 'Loja', value: detailsDialog.record.filters.store === '__all__' ? 'Todas as lojas' : detailsDialog.record.filters.store },
        { id: 'count', label: 'Registros de divergência', value: detailsDialog.record.items.length.toLocaleString('pt-BR') },
        { id: 'total', label: 'Soma dos valores cadastrados', value: currencyFormatter.format(detailsDialog.record.items.reduce((total, item) => total + item.differenceValueInCents, 0) / 100) },
      ]
    : [];

  useEffect(() => {
    let isMounted = true;
    const loadPageData = async () => {
      const [reportsResult, preferenceResult] = await Promise.allSettled([
        getMonthlyFinancialReports(),
        getManagementReportPreferences(),
      ]);
      if (!isMounted) return;

      setState((current) => ({
        ...current,
        reports: reportsResult.status === 'fulfilled' ? reportsResult.value : current.reports,
        isLoadingReports: false,
        feedback: reportsResult.status === 'fulfilled' ? 'Relatórios financeiros salvos carregados.' : '',
        error: reportsResult.status === 'rejected'
          ? reportsResult.reason instanceof Error
            ? reportsResult.reason.message
            : 'Não foi possível carregar os relatórios financeiros.'
          : preferenceResult.status === 'rejected'
            ? preferenceResult.reason instanceof Error
              ? preferenceResult.reason.message
              : 'Não foi possível carregar a preferência de formato.'
            : '',
      }));
      if (preferenceResult.status === 'fulfilled') setFormat(preferenceResult.value.format);
    };

    void loadPageData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormatChange = async (nextFormat: ManagementReportFormat) => {
    setFormat(nextFormat);
    setIsSavingPreference(true);
    setState((current) => ({ ...current, feedback: 'Salvando preferência de formato…', error: '' }));
    try {
      await saveManagementReportPreference(nextFormat);
      setState((current) => ({ ...current, feedback: 'Formato salvo para as próximas visitas.', error: '' }));
    } catch (error) {
      setState((current) => ({
        ...current,
        feedback: '',
        error: error instanceof Error ? error.message : 'Não foi possível salvar a preferência de formato.',
      }));
    } finally {
      setIsSavingPreference(false);
    }
  };

  const exportReport = (report: MonthlyFinancialReport) => {
    if (format === 'csv') {
      downloadMonthlyFinancialReport(report);
      setState((current) => ({ ...current, feedback: 'Relatório exportado em CSV.', error: '' }));
      return;
    }
    setState((current) => ({ ...current, selectedReport: report, feedback: 'Na janela de impressão, escolha “Salvar como PDF”.', error: '' }));
    window.requestAnimationFrame(() => window.print());
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.month) {
      document.getElementById(monthId)?.focus();
      setState((current) => ({ ...current, feedback: '', error: 'Selecione o mês para gerar o relatório financeiro.' }));
      return;
    }
    if (items.length === 0) {
      setState((current) => ({ ...current, feedback: '', error: 'Não há divergências registradas para o mês e a loja selecionados.' }));
      return;
    }

    const report = createMonthlyFinancialReport({ month: state.month, store: state.store }, items);
    setState((current) => ({ ...current, isGenerating: true, feedback: 'Gerando e salvando relatório financeiro…', error: '' }));
    try {
      await saveMonthlyFinancialReport(report);
      setState((current) => ({
        ...current,
        reports: [report, ...current.reports.filter((savedReport) => savedReport.id !== report.id)],
        selectedReport: report,
        isGenerating: false,
        feedback: 'Relatório financeiro gerado e salvo neste navegador.',
        error: '',
      }));
      exportReport(report);
    } catch (error) {
      setState((current) => ({
        ...current,
        isGenerating: false,
        feedback: '',
        error: error instanceof Error ? error.message : 'Não foi possível salvar o relatório financeiro.',
      }));
    }
  };

  return (
    <section className={styles.page} aria-labelledby="accounting-sped-title">
      <header>
        <p className={styles.eyebrow}>Contabilidade/SPED</p>
        <h1 id="accounting-sped-title">Relatório financeiro mensal</h1>
        <p className={styles.intro}>Exporte as divergências de caixa registradas no mês selecionado.</p>
      </header>

      <section className={styles.card} aria-labelledby="monthly-report-form-title">
        <h2 id="monthly-report-form-title">Gerar relatório do mês</h2>
        <form onSubmit={handleGenerate}>
          <div className={styles.filters}>
            <div className={styles.field}>
              <label htmlFor={monthId}>Mês de referência</label>
              <select
                id={monthId}
                required
                value={state.month}
                onChange={(event) => setState((current) => ({
                  ...current,
                  month: event.target.value,
                  selectedReport: null,
                  feedback: '',
                  error: '',
                }))}
              >
                <option value="" disabled>Selecione um mês disponível</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {monthNames[Number(month) - 1] ?? `Mês ${month}`} — amostra; ano não informado
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor={storeId}>Loja</label>
              <select
                id={storeId}
                value={state.store}
                onChange={(event) => setState((current) => ({
                  ...current,
                  store: event.target.value,
                  selectedReport: null,
                  feedback: '',
                  error: '',
                }))}
              >
                <option value="__all__">Todas as lojas</option>
                {stockStores.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </div>
          </div>

          <fieldset className={styles.formatPicker} disabled={state.isLoadingReports || state.isGenerating || isSavingPreference}>
            <legend>Formato de exportação</legend>
            <div className={styles.formatOptions}>
              <label className={format === 'pdf' ? styles.formatSelected : styles.formatOption} htmlFor={`${formatId}-pdf`}>
                <input id={`${formatId}-pdf`} type="radio" name="monthly-financial-format" value="pdf" checked={format === 'pdf'} onChange={() => void handleFormatChange('pdf')} />
                PDF
              </label>
              <label className={format === 'csv' ? styles.formatSelected : styles.formatOption} htmlFor={`${formatId}-csv`}>
                <input id={`${formatId}-csv`} type="radio" name="monthly-financial-format" value="csv" checked={format === 'csv'} onChange={() => void handleFormatChange('csv')} />
                CSV
              </label>
            </div>
          </fieldset>
          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={state.isLoadingReports || state.isGenerating || isSavingPreference}>
              {state.isGenerating ? 'Gerando…' : `Gerar e exportar ${format.toUpperCase()}`}
            </button>
          </div>
        </form>

        <p className={styles.helper}>
          {items.length.toLocaleString('pt-BR')} divergências no recorte. A soma dos valores cadastrados é apresentada sem classificá-la como lucro ou prejuízo.
        </p>
        {state.feedback && <p className={styles.success} role="status">{state.feedback}</p>}
        {state.error && <p className={styles.error} role="alert">{state.error}</p>}

        {items.length > 0 && (
          <>
            <dl className={styles.summary}>
              <div><dt>Registros de divergência</dt><dd>{items.length.toLocaleString('pt-BR')}</dd></div>
              <div><dt>Soma dos valores cadastrados</dt><dd>{currencyFormatter.format(valueTotalInCents / 100)}</dd></div>
            </dl>
            <div className={styles.tableWrap}>
              <table>
                <caption className={styles.srOnly}>Divergências de caixa incluídas no relatório mensal</caption>
                <thead><tr><th scope="col">Data</th><th scope="col">Loja</th><th scope="col">Item</th><th scope="col">Diferença (un.)</th><th scope="col">Valor registrado</th><th scope="col">Status</th></tr></thead>
                <tbody>{items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td><td>{item.store}</td><th scope="row">{item.item}</th>
                    <td>{item.quantityDifference.toLocaleString('pt-BR')}</td><td>{currencyFormatter.format(item.differenceValueInCents / 100)}</td><td>{item.status}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className={styles.card} aria-labelledby="saved-financial-reports-title">
        <h2 id="saved-financial-reports-title">Relatórios financeiros salvos neste navegador</h2>
        <p>Os relatórios ficam armazenados por até um ano.</p>
        {state.isLoadingReports && <p role="status">Carregando relatórios salvos…</p>}
        {!state.isLoadingReports && state.reports.length > 0 && (
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Relatórios financeiros mensais salvos neste navegador</caption>
              <thead><tr><th scope="col">Gerado em</th><th scope="col">Mês</th><th scope="col">Loja</th><th scope="col">Registros</th><th scope="col">Ações</th></tr></thead>
              <tbody>{state.reports.map((report) => (
                <tr key={report.id}>
                  <td>{dateFormatter.format(new Date(report.createdAt))}</td>
                  <th scope="row">{report.monthLabel} — ano não informado</th>
                  <td>{report.filters.store === '__all__' ? 'Todas as lojas' : report.filters.store}</td>
                  <td>{report.items.length}</td>
                  <td>
                    <div className={styles.reportActions}>
                      <button
                        type="button"
                        className={styles.viewButton}
                        aria-label={`Ver relatório financeiro de ${report.monthLabel}`}
                        aria-haspopup="dialog"
                        onClick={(event) => setDetailsDialog({ record: report, trigger: event.currentTarget })}
                      >
                        Ver
                      </button>
                      <button type="button" className={styles.downloadButton} onClick={() => exportReport(report)}>
                        Exportar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {!state.isLoadingReports && state.reports.length === 0 && <p className={styles.emptyState}>Nenhum relatório financeiro foi salvo ainda.</p>}
      </section>

      <section className={styles.printArea} aria-label="Relatório financeiro para impressão">
        {state.selectedReport && (
          <>
            <h1>Relatório financeiro mensal — divergências de caixa</h1>
            <p>Gerado em {dateFormatter.format(new Date(state.selectedReport.createdAt))}</p>
            <p>Período: {state.selectedReport.monthLabel} — ano não informado</p>
            <p>Loja: {state.selectedReport.filters.store === '__all__' ? 'Todas as lojas' : state.selectedReport.filters.store}</p>
            <p className={styles.limitation}>Amostra demonstrativa com registros em 17/05, sem ano informado. Não há lançamentos de receitas ou despesas; esta lista não representa o fechamento financeiro completo do mês.</p>
            <p><strong>Registros:</strong> {state.selectedReport.items.length.toLocaleString('pt-BR')}</p>
            <p><strong>Soma dos valores cadastrados:</strong> {currencyFormatter.format(state.selectedReport.items.reduce((total, item) => total + item.differenceValueInCents, 0) / 100)}</p>
            <table>
              <caption className={styles.srOnly}>Detalhamento de divergências de caixa</caption>
              <thead><tr><th scope="col">Data</th><th scope="col">Loja</th><th scope="col">Categoria</th><th scope="col">Item</th><th scope="col">Diferença (un.)</th><th scope="col">Valor da divergência</th><th scope="col">Status</th></tr></thead>
              <tbody>{state.selectedReport.items.map((item) => (
                <tr key={item.id}><td>{item.date}</td><td>{item.store}</td><td>{item.category}</td><th scope="row">{item.item}</th><td>{item.quantityDifference}</td><td>{currencyFormatter.format(item.differenceValueInCents / 100)}</td><td>{item.status}</td></tr>
              ))}</tbody>
            </table>
          </>
        )}
      </section>
      {detailsDialog && (
        <DetailsModal
          title="Relatório financeiro mensal"
          description="Confira os registros que foram salvos neste relatório. O ano não é informado na amostra de dados."
          fields={detailsFields}
          triggerElement={detailsDialog.trigger}
          onClose={handleCloseDetails}
        >
          <h3>Divergências incluídas</h3>
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Divergências incluídas no relatório financeiro salvo</caption>
              <thead>
                <tr>
                  <th scope="col">Data</th><th scope="col">Loja</th><th scope="col">Categoria</th>
                  <th scope="col">Item</th><th scope="col">Diferença (un.)</th>
                  <th scope="col">Valor registrado</th><th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {detailsDialog.record.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td><td>{item.store}</td><td>{item.category}</td>
                    <th scope="row">{item.item}</th>
                    <td>{item.quantityDifference.toLocaleString('pt-BR')}</td>
                    <td>{currencyFormatter.format(item.differenceValueInCents / 100)}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailsModal>
      )}
    </section>
  );
}

export default AccountingSped;
