"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Language } from "@/lib/document-language";

// Borradores de los formularios (PL-10): se guardan solo en el navegador del
// usuario (localStorage), uno por plantilla e idioma del documento.
const PREFIX = "prelegal:borrador:v1";

export function draftKey(slug: string, language: Language): string {
  return `${PREFIX}:${slug}:${language}`;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Combina un borrador guardado con los valores iniciales del formulario: solo
// se aceptan las claves que el formulario conoce y con el mismo tipo, para que
// un borrador antiguo no rompa el formulario si cambia la plantilla.
export function restoreDraft<T>(initial: T, saved: unknown): T {
  if (isObject(initial)) {
    if (!isObject(saved)) return initial;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(initial)) result[k] = k in saved ? restoreDraft(v, saved[k]) : v;
    return result as T;
  }
  return typeof saved === typeof initial ? (saved as T) : initial;
}

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown | undefined) {
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento (navegación privada, cuota llena…): el formulario sigue funcionando sin guardar.
  }
}

export type Draft<T> = {
  values: T;
  setValues: Dispatch<SetStateAction<T>>;
  // Hay datos del usuario guardados en el navegador.
  saved: boolean;
  // Borra el borrador guardado y devuelve el formulario a sus valores iniciales.
  clear: () => void;
};

export function useDraft<T>(key: string, initial: () => T): Draft<T> {
  const [values, setValues] = useState<T>(initial);
  const initialRef = useRef<T>(values);
  // El borrador se lee tras montar el componente para que el HTML generado en
  // el servidor coincida con el primer render del cliente.
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = read(key);
    if (stored !== undefined) setValues(restoreDraft(initialRef.current, stored));
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    // Mientras el formulario conserve sus valores iniciales no se guarda nada.
    const pristine = JSON.stringify(values) === JSON.stringify(initialRef.current);
    write(key, pristine ? undefined : values);
    setSaved(!pristine);
  }, [key, values, loaded]);

  const clear = useCallback(() => {
    write(key, undefined);
    setValues(initialRef.current);
  }, [key]);

  return { values, setValues, saved, clear };
}
