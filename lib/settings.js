// lib/settings.js
import prisma from '@/lib/prisma';

/**
 * Default system settings with their values
 */
const DEFAULT_SETTINGS = {
  MAX_COURSES_PER_LECTURER: '3', // Default maximum number of courses per lecturer
};

/**
 * Get a system setting by key
 * @param {string} key - The setting key to retrieve
 * @returns {Promise<string>} The setting value or the default value
 */
export async function getSetting(key) {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting ? setting.value : DEFAULT_SETTINGS[key];
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return DEFAULT_SETTINGS[key];
  }
}

/**
 * Update a system setting
 * @param {string} key - The setting key to update
 * @param {string} value - The new value for the setting
 * @returns {Promise<object>} The updated setting object or error
 */
export async function updateSetting(key, value) {
  try {
    const result = await prisma.systemSetting.upsert({
      where: { key },
      update: { 
        value: String(value),
        updatedAt: new Date()
      },
      create: {
        key,
        value: String(value)
      }
    });

    return { success: true, setting: result };
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all system settings
 * @returns {Promise<object>} Object with all settings or error
 */
export async function getAllSettings() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Merge with defaults for any missing settings
    const result = { ...DEFAULT_SETTINGS };
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });

    return { success: true, settings: result };
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return { success: false, error: error.message, settings: DEFAULT_SETTINGS };
  }
}

/**
 * Get the maximum number of courses allowed per lecturer
 * @returns {Promise<number>} The maximum number of courses per lecturer
 */
export async function getMaxCoursesPerLecturer() {
  const value = await getSetting('MAX_COURSES_PER_LECTURER');
  return parseInt(value, 10) || 3; // Default to 3 if parsing fails
}
