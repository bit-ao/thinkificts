/*
 *  Copyright © 2021 - 2050
 *  Bantu Internet Technologies, Lda. Todos os direitos reservados.
 *
 *  Este 'software' é protegido por direitos autorais e é propriedade exclusiva da Bantu Internet Technologies, Lda.
 *  Qualquer cópia, distribuição, modificação ou uso não autorizado deste 'software', no todo ou em parte,
 *  é estritamente proibido e sujeito às penalidades legais aplicáveis.
 *
 *   Bantu Internet Technologies, Lda.
 *   Rua 25 de Abril, Zona Comercial, Benguela, Angola
 *   geral@bit.ao
 *   www.bit.ao
 */

import axios, {AxiosInstance} from "axios"

// ==================== TIPOS ====================
export interface CustomProfileField {
  value: string
  custom_profile_field_definition_id: number
}

export interface CreateUserPayload {
  first_name: string
  last_name: string
  email: string
  password?: string
  roles?: string[]
  bio?: string
  company?: string
  headline?: string
  affiliate_code?: string
  affiliate_commission?: number
  affiliate_commission_type?: "%" | "$"
  affiliate_payout_email?: string
  custom_profile_fields?: CustomProfileField[]
  skip_custom_fields_validation?: boolean
  send_welcome_email?: boolean
  external_id?: string
  provider?: string
}

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  roles?: string[]
  external_id?: string
}

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
}

export interface EnrollmentCoursePayload {
  user_id: number
  course_id: number
  activated_at?: string
  expiry_date?: string
}
export interface EnrollmentBundlePayload {
  user_id: number
  bundle_id: number
  activated_at?: string
  expiry_date?: string
}
// ==================== CLASSE PRINCIPAL ====================
export class Thinkific {
  private static client: AxiosInstance = axios.create({
    baseURL: "https://api.thinkific.com/api/public/v1",
    headers: {
      "X-Auth-API-Key": process.env.THINKIFIC_API_KEY!,
      "X-Auth-Subdomain": process.env.THINKIFIC_SUBDOMAIN!,
      "Content-Type": "application/json",
    },
  })

  // --- USUÁRIOS ---
  static async createUser(userData: CreateUserPayload): Promise<User> {
    const resp = await this.client.post<User>("/users", userData)
    return resp.data
  }

  static async getEnrolls(page: number = 1, limit: number = 20): Promise<any> {
    const email = "297823"
    const resp = await this.client.get(`/enrollments`, {
      params: { page, limit },
    })
    return resp.data
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const resp = await this.client.get<{ items: User[] }>(
        `/users?query[email]=${encodeURIComponent(email)}`
    )
    return resp.data.items.length > 0 ? resp.data.items[0] : null
  }

  static async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/users/${userId}`)
  }
  // Bundles
  static async getBundle(id: number ): Promise<any> {
    const resp = await this.client.get("/bundles/" + id)
    return resp.data
  }
  static async getTest(id: number ): Promise<any> {
    const resp = await this.client.get(`/bundles/${id}/enrollments`)
    return resp.data
  }
  // --- CURSOS E PRODUTOS ---
  static async getCourses(page: number = 1, limit: number = 20): Promise<any> {
    const resp = await this.client.get("/courses", {
      params: { page, limit },
    })
    return resp.data
  }

  static async getCourse(id: number): Promise<any> {
    const resp = await this.client.get(`/courses/${id}`)
    return resp.data
  }

  static async getProduct(id: number): Promise<any> {
    const resp = await this.client.get(`/products/${id}`)
    return resp.data
  }
  static async getProducts(page: number = 1, limit: number = 20): Promise<any> {
    const resp = await this.client.get("/products", {
      params: { page, limit },
    })
    return resp.data
  }
  // --- MATRÍCULAS ---

  static async enrollCourse(enrollData: EnrollmentCoursePayload): Promise<Enrollment> {
    const resp = await this.client.post<Enrollment>("/enrollments", enrollData)
    return resp.data
  }

  static async enrollBundle(enrollData: EnrollmentBundlePayload): Promise<number> {
    const bundleId = enrollData.bundle_id;

    const resp = await this.client.post<>('/bundles/'+bundleId+'/enrollments',
        {
          user_id: enrollData.user_id,
          activated_at: enrollData.activated_at,
          expiry_date: enrollData.expiry_date
        }
    )
    return resp.status
  }

  // --- HELPERS ---
  static async safeCreateUser(userData: CreateUserPayload): Promise<User> {
    try {
      const user = await this.createUser(userData)
      return user
    } catch (err: any) {
      if (err.response?.data?.errors?.email?.includes("has already been taken")) {

        const existing = await this.getUserByEmail(userData.email)
        if (!existing)
          throw new Error("Usuário existe mas não foi encontrado via GET /users")
        return existing
      }
      throw err
    }
  }

  static async safeEnrollCourse(
      enrollData: EnrollmentCoursePayload
  ): Promise<Enrollment | null> {
    try {
      return await this.enrollCourse(enrollData)
    } catch (err: any) {
      if (err.response?.data?.errors?.base?.includes("already enrolled")) {

        return null
      }
      throw err
    }
  }
  static async safeEnrollBundle(
      enrollData: EnrollmentBundlePayload
  ): Promise<Enrollment | null> {
    try {
      return await this.enrollBundle(enrollData)
    } catch (err: any) {
      if (err.response?.data?.errors?.base?.includes("already enrolled")) {
        return null
      }
      throw err
    }
  }

  static async enrollCourseWithExpiry(
      user_id: number,
      course_id: number,
      durationDays: number
  ): Promise<Enrollment | null> {
    if (!durationDays || isNaN(durationDays)) {
      throw new Error("❌ durationDays deve ser um número válido")
    }

    const now = new Date()
    const activated_at = now.toISOString()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + Number(durationDays))
    const expiry_date = expiry.toISOString()



    return this.safeEnrollCourse({
      user_id,
      course_id,
      activated_at,
      expiry_date,
    })
  }

  static async enrollBundleWithExpiry(
      user_id: number,
      bundle_id: number,
      durationDays: number
  ): Promise<Enrollment | null> {
    if (!durationDays || isNaN(durationDays)) {
      throw new Error("❌ durationDays deve ser um número válido")
    }

    const now = new Date()
    const activated_at = now.toISOString()
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + Number(durationDays))
    const expiry_date = expiry.toISOString()



    return this.safeEnrollBundle({
      user_id,
      bundle_id,
      activated_at,
      expiry_date,
    })
  }
}
