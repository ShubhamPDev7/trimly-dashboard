export type StaffRole = "OWNER" | "STAFF"

export interface ShopStaffResponse {
  userId: string
  name: string
  email: string
  roleInShop: StaffRole
}

export interface AddStaffRequest {
  email: string
  roleInShop: StaffRole
}