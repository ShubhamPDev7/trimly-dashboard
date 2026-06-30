export interface BarberProfileResponse {
  id: string
  shopId: string
  userId: string
  staffName: string
  bio: string | null
  specialties: string | null
  experienceYears: number | null
  instagramHandle: string | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface BarberProfileRequest {
  bio?: string | null
  specialties?: string | null
  experienceYears?: number | null
  instagramHandle?: string | null
  photoUrl?: string | null
}