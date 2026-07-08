import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center bg-white">
      <div>
        <h1 className="text-6xl font-bold text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          404
        </h1>
        <p className="text-muted-foreground mb-6">Página não encontrada.</p>
        <Link href="/" className="text-primary font-semibold underline">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
