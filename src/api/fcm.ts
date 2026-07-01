import { apiClient } from "./client"

export const registerFcmToken = async (token: string, deviceType = "WEB"): Promise<void> => {
  await apiClient.post("/fcm/token", { token, deviceType })
}

export const removeFcmToken = async (token: string): Promise<void> => {
  await apiClient.delete("/fcm/token", { params: { token } })
}