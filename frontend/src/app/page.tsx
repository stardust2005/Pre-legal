import Link from "next/link";
import { getTemplates } from "@/lib/templates";

// Texto genérico de presentación (PL-1): pendiente de revisar con la
// información real de la empresa (propuesta de valor, público y contacto).

const STEPS = [
  {
    title: "Elige una plantilla",
    text: "Parte de un acuerdo estándar: confidencialidad, servicios en la nube, tratamiento de datos, servicios profesionales y más.",
  },
  {
    title: "Complétala con tus datos",
    text: "Cada plantilla señala los campos que hay que rellenar, como las partes, las fechas o la ley aplicable. Muy pronto podrás completarlos directamente en Pre-Legal.",
  },
  {
    title: "Revísala y úsala",
    text: "Obtén un borrador claro y coherente para revisar con tu equipo o tu asesor legal antes de firmarlo.",
  },
];

const VALUES = [
  {
    title: "Estándares abiertos",
    text: "Trabajamos con los acuerdos de Common Paper, redactados por abogados y publicados bajo licencia CC BY 4.0.",
  },
  {
    title: "Lenguaje claro",
    text: "Documentos estructurados y fáciles de leer, sin cláusulas escondidas ni jerga innecesaria.",
  },
  {
    title: "Menos tiempo, menos coste",
    text: "Empieza desde una base sólida en lugar de una página en blanco y dedica tu tiempo a lo que importa.",
  },
];

export default async function Home() {
  const templates = await getTemplates();

  return (
    <>
      <section className="py-10 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-foreground/60">
          Pre-Legal
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Documentos legales comunes, sin complicaciones
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/70">
          Pre-Legal ayuda a empresas y profesionales a preparar los acuerdos
          que usan cada día a partir de plantillas estándar, abiertas y
          revisadas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/plantillas"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Ver las {templates.length} plantillas
          </Link>
        </div>
      </section>

      <section className="border-t border-black/10 py-12 dark:border-white/15">
        <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="text-sm font-medium text-foreground/50">
                Paso {index + 1}
              </span>
              <h3 className="mt-1 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-black/10 py-12 dark:border-white/15">
        <h2 className="text-2xl font-semibold tracking-tight">
          Por qué Pre-Legal
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <li
              key={value.title}
              className="rounded-lg border border-black/10 p-5 dark:border-white/15"
            >
              <h3 className="font-medium">{value.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{value.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-black/10 py-12 dark:border-white/15">
        <p className="max-w-3xl text-sm text-foreground/60">
          Pre-Legal no es un despacho de abogados y no presta asesoramiento
          jurídico. Las plantillas son un punto de partida: revisa cada
          documento con un profesional antes de firmarlo.
        </p>
      </section>
    </>
  );
}
