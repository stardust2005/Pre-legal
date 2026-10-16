"use client";

// Aviso de privacidad y botón para borrar el borrador guardado (PL-10).
export function DraftNotice({ saved, onClear }: { saved: boolean; onClear: () => void }) {
  function clear() {
    if (window.confirm("¿Borrar los datos guardados de este formulario? No se pueden recuperar.")) onClear();
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-black/[.03] px-4 py-3 text-xs text-foreground/70 dark:bg-white/[.05]">
      <p className="flex-1 basis-64">
        Los datos se guardan automáticamente solo en este navegador, para que no los pierdas al cerrar la página.
        No se envían a ningún servidor. Si usas un ordenador compartido, bórralos al terminar.
      </p>
      <button
        type="button"
        onClick={clear}
        disabled={!saved}
        className="rounded-md border border-black/15 px-3 py-1.5 font-medium hover:bg-black/[.04] disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/20 dark:hover:bg-white/[.06]"
      >
        Borrar datos guardados
      </button>
    </div>
  );
}
