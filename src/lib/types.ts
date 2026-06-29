export type Category = {
  slug: string;
  name: string;
  /** Singular para "Contratá un ___" */
  singular: string;
  icon: string; // emoji por ahora; se reemplaza por íconos/ilustraciones luego
  description: string;
  /** Ejemplos de tareas frecuentes del rubro */
  tasks: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number; // 1..5
  date: string; // ISO
  comment: string;
};

export type Professional = {
  id: string;
  slug: string;
  name: string;
  headline: string; // "Plomero matriculado" etc.
  categorySlugs: string[];
  province: string;
  city: string;
  /** Zonas donde trabaja */
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  jobsDone: number;
  yearsExperience: number;
  verified: boolean;
  /** Precio orientativo de la visita / hora, en ARS */
  priceFrom?: number;
  priceUnit?: "hora" | "visita" | "presupuesto";
  about: string;
  skills: string[];
  /** Color de avatar (hsl hue) */
  avatarHue: number;
  phone: string; // formato AR
  respondsIn: string; // "Suele responder en 1 h"
  available: boolean;
  reviews: Review[];
};
