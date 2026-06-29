/**
 * Las 24 jurisdicciones de Argentina (provincias + CABA), con su ID oficial INDEC.
 * El ID se usa para filtrar localidades por provincia en la API de Georef.
 */
export type Province = {
  id: string; // ID INDEC (provincia.id en Georef)
  name: string; // nombre canónico (igual al que devuelve Georef)
  label: string; // nombre corto para mostrar
};

export const provinces: Province[] = [
  { id: "06", name: "Buenos Aires", label: "Buenos Aires" },
  { id: "02", name: "Ciudad Autónoma de Buenos Aires", label: "CABA" },
  { id: "14", name: "Córdoba", label: "Córdoba" },
  { id: "82", name: "Santa Fe", label: "Santa Fe" },
  { id: "50", name: "Mendoza", label: "Mendoza" },
  { id: "90", name: "Tucumán", label: "Tucumán" },
  { id: "66", name: "Salta", label: "Salta" },
  { id: "30", name: "Entre Ríos", label: "Entre Ríos" },
  { id: "58", name: "Neuquén", label: "Neuquén" },
  { id: "62", name: "Río Negro", label: "Río Negro" },
  { id: "22", name: "Chaco", label: "Chaco" },
  { id: "54", name: "Misiones", label: "Misiones" },
  { id: "18", name: "Corrientes", label: "Corrientes" },
  { id: "86", name: "Santiago del Estero", label: "Santiago del Estero" },
  { id: "70", name: "San Juan", label: "San Juan" },
  { id: "38", name: "Jujuy", label: "Jujuy" },
  { id: "74", name: "San Luis", label: "San Luis" },
  { id: "10", name: "Catamarca", label: "Catamarca" },
  { id: "46", name: "La Rioja", label: "La Rioja" },
  { id: "42", name: "La Pampa", label: "La Pampa" },
  { id: "26", name: "Chubut", label: "Chubut" },
  { id: "34", name: "Formosa", label: "Formosa" },
  { id: "78", name: "Santa Cruz", label: "Santa Cruz" },
  {
    id: "94",
    name: "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
    label: "Tierra del Fuego",
  },
];

export const provinceById = (id: string) => provinces.find((p) => p.id === id);
export const provinceByName = (name: string) =>
  provinces.find((p) => p.name.toLowerCase() === name.toLowerCase());
