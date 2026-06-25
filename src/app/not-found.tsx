import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <p className="text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-3 text-xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-slate-500">A notícia pode ter sido removida ou o endereço está incorreto.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
