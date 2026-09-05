import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <div className="page">
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <Link to="/home">Voltar para o início</Link>
    </div>
  );
}

export default ErrorPage;