import { useEffect, useId, useRef } from "react";
import { Chart, registerables } from "chart.js";
import type { HistoricalChartProps } from "@/types/historical-chart.types";
import styles from "./style.module.css";

Chart.register(...registerables);

function HistoricalChart({
  data,
  title = "Histórico do último mês",
  description = "Variação diária do índice de reaproveitamento",
  period = "31 dias",
  datasetLabel = "Índice histórico",
  ariaLabel = "Gráfico de linha com o histórico diário",
  compact = false,
}: HistoricalChartProps) {
  const titleId = useId();
  const canvasId = useId();
  const descriptionId = useId();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"line", number[], string> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: data.map((item) =>
          new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
          }).format(new Date(`${item.date}T12:00:00`)),
        ),
        datasets: [
          {
            label: datasetLabel,
            data: data.map((item) => item.value),
            borderColor: "#c64c49",
            backgroundColor: "rgba(198, 76, 73, 0.12)",
            borderWidth: 3,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#14321c",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#4b9b62",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { color: "#14321c" },
            grid: { color: "rgba(20, 50, 28, 0.12)" },
          },
          x: {
            ticks: { color: "#14321c", maxRotation: 45, minRotation: 0 },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, datasetLabel]);

  return (
    <section
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      aria-labelledby={titleId}
    >
      <div className={styles.heading}>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>{description}</p>
        </div>
        <span className={styles.period}>{period}</span>
      </div>
      <div className={styles.chartArea}>
        <canvas
          id={canvasId}
          ref={canvasRef}
          role="img"
          aria-label={ariaLabel}
          aria-describedby={descriptionId}
        />
      </div>
      <p className={styles["sr-only"]} id={descriptionId}>
        {description}. {data.length} pontos disponíveis.
      </p>
      <details className={styles.dataDetails}>
        <summary>Ver dados do gráfico</summary>
        <ul>
          {data.map((item) => (
            <li key={item.date}>
              <time dateTime={item.date}>{item.date}</time>
              <span>
                {item.value} — {datasetLabel}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export default HistoricalChart;
