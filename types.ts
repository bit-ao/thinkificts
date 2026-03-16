/*
 *  Copyright © 2021 - 2050
 *  Bantu Internet Technologies, Lda. Todos os direitos reservados.
 *
 *  Este 'software' é protegido por direitos autorais e é propriedade exclusiva da Bantu Internet Technologies, Lda. Qualquer cópia, distribuição, modificação ou uso não autorizado deste 'software', no todo ou em parte, é estritamente proibido e sujeito às penalidades legais aplicáveis.
 *
 *   Bantu Internet Technologies, Lda.
 *   Rua 25 de Abril, Zona Comercial, Benguela, Angola
 *   geral@bit.ao
 *   www.bit.ao
 *
 *
 */

export interface ITProduct {
  id: number;
  created_at: string;
  productable_id: number;
  productable_type: "Bundle" | "Course" | string;
  price: string;
  position: number;
  status: "draft" | "published" | string;
  name: string;
  private: boolean;
  hidden: boolean;
  subscription: boolean;
  days_until_expiry: string | null;
  has_certificate: boolean;
  collection_ids: number[];
  seo_title: string;
  seo_description: string;
  keywords: string;
  related_product_ids: number[];
  slug: string;
  description: string;
  card_image_url: string;
  instructor_names: string;
  product_prices: any[];
}

export interface ITCourse {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  product_id: number;
  description: string | null;
  intro_video_youtube: string | null;
  contact_information: string;
  keywords: string | null;
  duration: string | null;
  banner_image_url: string;
  course_card_image_url: string;
  intro_video_wistia_identifier: string | null;
  administrator_user_ids: number[];
  user_id: number | null;
  reviews_enabled: boolean;
  instructor_id: number;
  chapter_ids: number[];
  course_card_text: string | null;
}
export interface ITBundle {
  id: number;
  name: string;
  description: string;
  banner_image_url: string;
  course_ids: number[];
  bundle_card_image_url: string;
  tagline: string | null;
  slug: string;
}