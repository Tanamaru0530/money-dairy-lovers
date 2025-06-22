import { User, Partnership, PartnershipStatus } from '@/types/user';

/**
 * Default user data for testing
 */
export const createMockUser = (overrides?: Partial<User>): User => {
  const now = new Date().toISOString();
  
  return {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    profileImageUrl: undefined,
    loveThemePreference: 'default',
    notificationSettings: {
      email: true,
      push: true,
    },
    hasPartner: false,
    partnership: undefined,
    createdAt: now,
    updatedAt: now,
    // Add snake_case properties for backward compatibility
    display_name: overrides?.displayName || 'Test User',
    profile_image_url: overrides?.profileImageUrl,
    is_active: true,
    email_verified: true,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
};

/**
 * Create a mock partner user
 */
export const createMockPartner = (overrides?: Partial<User>): User => {
  return createMockUser({
    id: '456',
    email: 'partner@example.com',
    displayName: 'Partner User',
    ...overrides,
  });
};

/**
 * Create a mock partnership
 */
export const createMockPartnership = (overrides?: Partial<Partnership>): Partnership => {
  const now = new Date().toISOString();
  
  return {
    id: '789',
    user1Id: '123',
    user2Id: '456',
    partner: {
      id: '456',
      displayName: 'Partner User',
      email: 'partner@example.com',
      profileImageUrl: undefined,
    },
    status: 'active',
    loveAnniversary: '2024-02-14',
    relationshipType: 'dating',
    createdAt: now,
    activatedAt: now,
    ...overrides,
  };
};

/**
 * Create a mock partnership status
 */
export const createMockPartnershipStatus = (
  overrides?: Partial<PartnershipStatus>
): PartnershipStatus => {
  return {
    hasPartner: true,
    partnership: createMockPartnership(),
    message: 'Partnership is active',
    ...overrides,
  };
};

/**
 * Create a user with partner
 */
export const createMockUserWithPartner = (
  userOverrides?: Partial<User>,
  partnershipOverrides?: Partial<Partnership>
): User => {
  const partnership = createMockPartnership(partnershipOverrides);
  
  return createMockUser({
    hasPartner: true,
    partnership,
    ...userOverrides,
  });
};

/**
 * Create login response mock
 */
export const createMockLoginResponse = (overrides?: {
  user?: Partial<User>;
  accessToken?: string;
  refreshToken?: string;
}) => {
  return {
    accessToken: overrides?.accessToken || 'mock-access-token',
    refreshToken: overrides?.refreshToken || 'mock-refresh-token',
    tokenType: 'bearer',
    user: createMockUser(overrides?.user),
  };
};