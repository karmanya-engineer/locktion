import { useState, useEffect } from "react";

// Types
export interface ConsentRecord {
  phoneNumber: string;
  consentedAt: string;
  ipAddress: string; // Mocked
}

export interface LocationRecord {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

// In-memory storage
const consentDatabase = new Map<string, ConsentRecord>();
const locationDatabase = new Map<string, LocationRecord>();

// Delays to simulate network latency
const NETWORK_DELAY = 1500;

export const mockBackend = {
  // 1. Request OTP
  requestOtp: async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `OTP sent to ${phoneNumber}. (Use 123456)`
        });
      }, NETWORK_DELAY);
    });
  },

  // 2. Verify OTP & Grant Consent
  verifyOtp: async (phoneNumber: string, code: string): Promise<{ success: boolean; token?: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === "123456") {
          // Store consent
          consentDatabase.set(phoneNumber, {
            phoneNumber,
            consentedAt: new Date().toISOString(),
            ipAddress: "192.168.1.1" // Mock
          });
          resolve({ success: true, token: "mock-jwt-token-xyz" });
        } else {
          reject(new Error("Invalid OTP code"));
        }
      }, NETWORK_DELAY);
    });
  },

  // 3. Store Location (Simulating the device sending data to server)
  storeLocation: async (phoneNumber: string, lat: number, lng: number, accuracy: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        locationDatabase.set(phoneNumber, {
          latitude: lat,
          longitude: lng,
          accuracy,
          timestamp: new Date().toISOString()
        });
        resolve({ success: true });
      }, 800);
    });
  },

  // 4. Retrieve Location (for the map view)
  getLocation: (phoneNumber: string): LocationRecord | undefined => {
    return locationDatabase.get(phoneNumber);
  }
};
