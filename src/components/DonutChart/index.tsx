import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { Chart, registerables } from 'chart.js';
import type { DonutChartProps } from '@/types/donut-chart.types';
import styles from './style.module.css';

Chart.register(...registerables);

function DonutChart({ title, description, segments, centerLabel = 'Total', valueLabel = 'itens', note }: DonutChartProps) {
  const titleId = useId();
  const descriptionId = useId();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'doughnut', number[], string> | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const activeSegment = activeIndex === null ? null : segments[activeIndex];

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: segments.map((segment) => segment.label),
        datasets: [{
          data: segments.map((segment) => segment.value),
          backgroundColor: segments.map((segment) => segment.color),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
          hoverBorderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        onHover: (_event, activeElements, hoveredChart) => {
          const index = activeElements[0]?.index ?? null;
          hoveredChart.canvas.style.cursor = index === null ? 'default' : 'pointer';
          setActiveIndex(index);
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#102a43',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#2d5778',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => `${context.label}: ${context.formattedValue} ${valueLabel}`,
            },
          },
        },
      },
    });

    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [segments, valueLabel]);

  const activateSegment = (index: number) => {
    setActiveIndex(index);
    const chart = chartRef.current;
    const arc = chart?.getDatasetMeta(0).data[index];
    if (!chart || !arc) {
      return;
    }

    const activeElement = { datasetIndex: 0, index };
    chart.setActiveElements([activeElement]);
    chart.tooltip?.setActiveElements([activeElement], { x: arc.x, y: arc.y });
    chart.update('none');
  };

  const clearActiveSegment = () => {
    setActiveIndex(null);
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.setActiveElements([]);
    chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
    chart.canvas.style.cursor = 'default';
    chart.update('none');
  };

  const handleSegmentMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
    if (document.activeElement !== event.currentTarget) {
      clearActiveSegment();
    }
  };

  return (
    <section className={styles.card} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header className={styles.heading}>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
      </header>
      <div className={styles.chartArea}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`${title}. ${segments.map((segment) => `${segment.label}: ${segment.value} ${valueLabel}`).join('; ')}`}
        />
        <div className={styles.centerValue} aria-hidden="true">
          <strong>{activeSegment ? activeSegment.value : total}</strong>
          <span>{activeSegment ? activeSegment.label : centerLabel}</span>
        </div>
      </div>
      <ul className={styles.legend} aria-label={`Dados de ${title}`}>
        {segments.map((segment, index) => (
          <li key={segment.id}>
            <button
              className={styles.segmentButton}
              type="button"
              aria-label={`${segment.label}: ${segment.value} ${valueLabel}. Focar para destacar esta categoria no gráfico.`}
              onFocus={() => activateSegment(index)}
              onBlur={clearActiveSegment}
              onClick={() => activateSegment(index)}
              onMouseEnter={() => activateSegment(index)}
              onMouseLeave={handleSegmentMouseLeave}
            >
              <span className={styles.segmentName}>
                <span className={styles.swatch} style={{ backgroundColor: segment.color }} aria-hidden="true" />
                {segment.label}
              </span>
              <strong>{segment.value}</strong>
            </button>
          </li>
        ))}
      </ul>
      {note && <p className={styles.note}>{note}</p>}
    </section>
  );
}

export default DonutChart;
