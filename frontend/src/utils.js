import { BOX_COLORS } from './constants'

/**
 * Generate a unique summary ID
 * @returns {string} A unique ID combining timestamp and random string
 */
export const generateSummaryId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Get the color class for a box based on its ID
 * @param {number} boxId - The ID of the box (1-indexed)
 * @returns {string} The Tailwind color class for the box
 */
export const getBoxColorClass = (boxId) => {
  return BOX_COLORS[(boxId - 1) % BOX_COLORS.length]
}
