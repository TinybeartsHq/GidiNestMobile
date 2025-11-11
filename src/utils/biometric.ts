import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None';
}

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Get the type of biometric authentication available
 */
export const getBiometricType = async (): Promise<'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None'> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'FaceID' : 'FaceID';
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
    }

    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }

    return 'None';
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return 'None';
  }
};

/**
 * Authenticate using biometric
 */
export const authenticateWithBiometric = async (
  promptMessage: string = 'Authenticate to continue'
): Promise<BiometricResult> => {
  try {
    const available = await isBiometricAvailable();

    if (!available) {
      return {
        success: false,
        error: 'Biometric authentication is not available',
        biometricType: 'None',
      };
    }

    const biometricType = await getBiometricType();

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });

    if (result.success) {
      return {
        success: true,
        biometricType,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Authentication failed',
        biometricType,
      };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: 'An error occurred during authentication',
      biometricType: 'None',
    };
  }
};

/**
 * Get a user-friendly label for the biometric type
 */
export const getBiometricLabel = async (): Promise<string> => {
  const type = await getBiometricType();

  switch (type) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Fingerprint';
    case 'Iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
};
