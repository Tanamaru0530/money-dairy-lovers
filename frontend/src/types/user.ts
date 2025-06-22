export interface User {
  id: string
  email: string
  displayName: string
  profileImageUrl?: string
  loveThemePreference: 'default' | 'pink' | 'blue' | 'custom'
  notificationSettings: {
    email: boolean
    push: boolean
  }
  hasPartner: boolean
  partnership?: Partnership
  createdAt: string
  updatedAt: string
  // Backward compatibility with API responses
  display_name?: string
  profile_image_url?: string
  is_active?: boolean
  email_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface Partnership {
  id: string
  user1Id: string
  user2Id: string
  partner?: {
    id: string
    displayName: string
    email: string
    profileImageUrl?: string
  }
  status: 'pending' | 'active' | 'inactive'
  loveAnniversary?: string
  relationshipType?: 'dating' | 'engaged' | 'married'
  createdAt: string
  activatedAt?: string
}

export interface PartnershipStatus {
  hasPartner: boolean
  partnership: Partnership | null
  message: string
}

export interface PartnershipInviteResponse {
  invitationCode: string
  expiresAt: string
  message: string
}

export interface UserUpdateData {
  displayName?: string
  profileImageUrl?: string
  loveThemePreference?: 'default' | 'pink' | 'blue' | 'custom'
  notificationSettings?: {
    email: boolean
    push: boolean
  }
}

export interface PartnershipInvite {
  invitationCode: string
  email?: string
}