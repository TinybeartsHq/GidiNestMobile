import apiClient from '../utils/apiClient';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

// Base URL for V2 auth endpoints
const V2_AUTH_BASE = '/v2/auth';

// ============================================
// Types & Interfaces
// ============================================

export interface SignUpRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone: string;
  referral_code?: string;
  device_id?: string;
  device_name?: string;
  device_type?: 'ios' | 'android' | 'web';
  location?: string;
}

export interface SignInRequest {
  email: string;
  password?: string;
  passcode?: string;
  device_id?: string;
  device_name?: string;
  device_type?: 'ios' | 'android' | 'web';
  location?: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface LogoutRequest {
  refresh_token?: string;
  device_id?: string;
}

export interface PasscodeSetupRequest {
  passcode: string;
  passcode_confirmation: string;
}

export interface PasscodeVerifyRequest {
  passcode: string;
}

export interface PasscodeChangeRequest {
  old_passcode: string;
  new_passcode: string;
  new_passcode_confirmation: string;
}

export interface PinSetupRequest {
  pin: string;
  pin_confirmation: string;
}

export interface PinVerifyRequest {
  pin: string;
}

export interface PinChangeRequest {
  old_pin: string;
  new_pin: string;
  new_pin_confirmation: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  has_passcode: boolean;
  has_pin: boolean;
  is_verified: boolean;
  biometric_enabled?: boolean;
  verification_status: string;
  verification_method?: string;
  is_restricted?: boolean;
  account_tier?: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: Tokens;
  };
}

export interface PasscodeResponse {
  success: boolean;
  message: string;
  data: {
    has_passcode: boolean;
  };
}

export interface PasscodeChangeResponse {
  success: boolean;
  message: string;
  data: {
    has_passcode: boolean;
    restriction_applied: boolean;
    restricted_until: string;
    restricted_limit: number;
  };
}

export interface PinResponse {
  success: boolean;
  message: string;
  data: {
    has_pin: boolean;
  };
}

export interface PinChangeResponse {
  success: boolean;
  message: string;
  data: {
    has_pin: boolean;
    restriction_applied: boolean;
    restricted_until: string;
    restricted_limit: number;
  };
}

export interface PinStatusResponse {
  success: boolean;
  data: {
    has_pin: boolean;
  };
}

export interface VerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get device information for tracking sessions
 */
export const getDeviceInfo = async () => {
  try {
    const deviceId = Device.osBuildId || Device.osInternalBuildId || 'unknown';
    const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    const deviceType = Device.osName?.toLowerCase() === 'ios' ? 'ios' :
                       Device.osName?.toLowerCase() === 'android' ? 'android' : 'web';

    return {
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType as 'ios' | 'android' | 'web',
    };
  } catch (error) {
    console.warn('Error getting device info:', error);
    return {
      device_id: 'unknown',
      device_name: 'Unknown Device',
      device_type: 'web' as const,
    };
  }
};

/**
 * Get user's location (requires permission)
 */
export const getUserLocation = async (): Promise<string | undefined> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return undefined;
    }

    const location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address && address.length > 0) {
      const addr = address[0];
      return `${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.trim();
    }
  } catch (error) {
    console.warn('Error getting location:', error);
  }
  return undefined;
};

// ============================================
// API Service Functions
// ============================================

/**
 * Sign Up - Single-step registration
 * POST /api/v2/auth/signup
 */
export const signUp = async (data: SignUpRequest): Promise<AuthResponse> => {
  const deviceInfo = await getDeviceInfo();
  const location = await getUserLocation();

  const response = await apiClient.post(`${V2_AUTH_BASE}/signup`, {
    ...data,
    ...deviceInfo,
    location,
  });

  return response.data;
};

/**
 * Sign In - Login with email/password or passcode
 * POST /api/v2/auth/signin
 */
export const signIn = async (data: SignInRequest): Promise<AuthResponse> => {
  const deviceInfo = await getDeviceInfo();
  const location = await getUserLocation();

  const response = await apiClient.post(`${V2_AUTH_BASE}/signin`, {
    ...data,
    ...deviceInfo,
    location,
  });

  return response.data;
};

/**
 * Refresh Token - Get new access token
 * POST /api/v2/auth/refresh
 */
export const refreshToken = async (data: RefreshTokenRequest) => {
  const response = await apiClient.post(`${V2_AUTH_BASE}/refresh`, data);
  return response.data;
};

/**
 * Logout - Invalidate session
 * POST /api/v2/auth/logout
 */
export const logout = async (data?: LogoutRequest): Promise<LogoutResponse> => {
  const deviceInfo = await getDeviceInfo();

  const response = await apiClient.post(`${V2_AUTH_BASE}/logout`, {
    ...data,
    device_id: data?.device_id || deviceInfo.device_id,
  });

  return response.data;
};

// ============================================
// Passcode Management
// ============================================

/**
 * Set up 6-digit passcode for quick login
 * POST /api/v2/auth/passcode/setup
 */
export const setupPasscode = async (data: PasscodeSetupRequest): Promise<PasscodeResponse> => {
  const response = await apiClient.post(`${V2_AUTH_BASE}/passcode/setup`, data);
  return response.data;
};

/**
 * Verify passcode
 * POST /api/v2/auth/passcode/verify
 */
export const verifyPasscode = async (data: PasscodeVerifyRequest): Promise<VerifyResponse> => {
  const response = await apiClient.post(`${V2_AUTH_BASE}/passcode/verify`, data);
  return response.data;
};

/**
 * Change passcode (applies 24-hour restriction)
 * PUT /api/v2/auth/passcode/change
 */
export const changePasscode = async (data: PasscodeChangeRequest): Promise<PasscodeChangeResponse> => {
  const response = await apiClient.put(`${V2_AUTH_BASE}/passcode/change`, data);
  return response.data;
};

// ============================================
// PIN Management
// ============================================

/**
 * Set up 4-digit transaction PIN
 * POST /api/v2/auth/pin/setup
 */
export const setupPin = async (data: PinSetupRequest): Promise<PinResponse> => {
  const response = await apiClient.post(`${V2_AUTH_BASE}/pin/setup`, data);
  return response.data;
};

/**
 * Verify transaction PIN
 * POST /api/v2/auth/pin/verify
 */
export const verifyPin = async (data: PinVerifyRequest): Promise<VerifyResponse> => {
  const response = await apiClient.post(`${V2_AUTH_BASE}/pin/verify`, data);
  return response.data;
};

/**
 * Change PIN (applies 24-hour restriction)
 * PUT /api/v2/auth/pin/change
 */
export const changePin = async (data: PinChangeRequest): Promise<PinChangeResponse> => {
  const response = await apiClient.put(`${V2_AUTH_BASE}/pin/change`, data);
  return response.data;
};

/**
 * Check if PIN is set
 * GET /api/v2/auth/pin/status
 */
export const getPinStatus = async (): Promise<PinStatusResponse> => {
  const response = await apiClient.get(`${V2_AUTH_BASE}/pin/status`);
  return response.data;
};

// Export all as default object for convenience
export default {
  signUp,
  signIn,
  refreshToken,
  logout,
  setupPasscode,
  verifyPasscode,
  changePasscode,
  setupPin,
  verifyPin,
  changePin,
  getPinStatus,
  getDeviceInfo,
  getUserLocation,
};
