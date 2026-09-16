import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { HistoricalMetric } from '@/types/historical-metric.types';
import styles from './style.module.css';

Chart.register(...registerables);

interface HistoricalChartProps {
    data: HistoricalMetric[];
}

function HistoricalChart({ data }: HistoricalChartProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'line', number[], string> | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return undefined;
        }

        chartRef.current?.destroy();
        chartRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: {
                labels: data.map((item) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${item.date}T12:00:00`))),
                datasets: [{
                    label: 'Índice histórico',
                    data: data.map((item) => item.value),
                    borderColor: '#c64c49',
                    backgroundColor: 'rgba(198, 76, 73, 0.12)',
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.25,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#14321c',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4b9b62',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: false,
                    },
                },
                scales: {
                    y: { beginAtZero: false, ticks: { color: '#14321c' }, grid: { color: 'rgba(20, 50, 28, 0.12)' } },
                    x: { ticks: { color: '#14321c', maxRotation: 45, minRotation: 0 }, grid: { display: false } },
                },
            },
        });

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [data]);

    return (
        <section className={styles.card} aria-labelledby="historical-chart-title">
            <div className={styles.heading}>
                <div>
                    <h2 id="historical-chart-title">Histórico do último mês</h2>
                    <p>Variação diária do índice de reaproveitamento</p>
                </div>
                <span className={styles.period}>31 dias</span>
            </div>
            <div className={styles.chartArea}>
                <canvas ref={canvasRef} role="img" aria-label="Gráfico de linha com o histórico diário do índice de reaproveitamento no último mês" />
            </div>
        </section>
    );
}

export default HistoricalChart;
