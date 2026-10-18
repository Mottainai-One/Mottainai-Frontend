import styles from "./style.module.css";

interface JargonTooltipProps {
  term: string;
  explanation: string;
}

function JargonTooltip({ term, explanation }: JargonTooltipProps) {
  return <span className={styles.term} tabIndex={0} aria-label={`${term}: ${explanation}`} data-tooltip={explanation}>{term}<span className={styles.indicator} aria-hidden="true"> i</span></span>;
}

export default JargonTooltip;
