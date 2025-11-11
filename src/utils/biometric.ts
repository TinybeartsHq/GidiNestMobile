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
      // Handle specific error cases
      let errorMessage = result.error || 'Authentication failed';
      
      // iOS specific: missing_usage_description error
      if (result.error === 'missing_usage_description' || 
          (typeof result.error === 'string' && result.error.includes('usage_description'))) {
        errorMessage = 'Face ID permission not configured. Please rebuild the app after enabling Face ID in app.json.';
      }
      
      return {
        success: false,
        error: errorMessage,
        biometricType,
      };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    
    // Check for missing_usage_description in catch block too
    const errorMessage = error?.message || error?.toString() || 'An error occurred during authentication';
    
    if (errorMessage.includes('usage_description') || errorMessage.includes('missing_usage_description')) {
      return {
        success: false,
        error: 'Face ID permission not configured. Please rebuild the app after enabling Face ID in app.json.',
        biometricType: 'None',
      };
    }
    
    return {
      success: false,
      error: errorMessage,
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
