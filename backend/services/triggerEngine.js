/**
 * Simulated Trigger Engine for DEVTrails 2026 Usecase
 * Connects to mock external APIs (Weather, Traffic, Platform)
 */

/**
 * Mocks an external API call for weather parameters.
 * @returns {Promise<{rainfallMM: number, tempCelsius: number, windSpeed: number}>}
 */
const mockWeatherAPI = async () => {
    return new Promise((resolve) => setTimeout(() => {
        resolve({
            rainfallMM: Math.floor(Math.random() * 40), // 0 to 40mm
            tempCelsius: 30 + Math.floor(Math.random() * 15), // 30 to 45C
            windSpeed: 10 + Math.floor(Math.random() * 30), // 10 to 40 kmh
        });
    }, 400));
};

/**
 * Mocks an external API call for traffic or curfews.
 * @returns {Promise<{trafficStatus: string, curfewActive: boolean}>}
 */
const mockTrafficAPI = async () => {
    const statuses = ['Clear', 'Moderate', 'Blocked'];
    return new Promise((resolve) => setTimeout(() => {
        resolve({
            trafficStatus: statuses[Math.floor(Math.random() * statuses.length)],
            curfewActive: Math.random() > 0.9 // 10% chance
        });
    }, 300));
};

/**
 * Validates a claim scenario against external real-world triggers
 * @param {string} claimedScenario The scenario string reported by the frontend demo
 * @returns {Promise<{isValid: boolean, details: any, failureReason?: string}>}
 */
const validateTriggers = async (claimedScenario) => {
    // Determine the type of trigger expected
    const lowerScenario = claimedScenario.toLowerCase();
    
    const weather = await mockWeatherAPI();
    const traffic = await mockTrafficAPI();

    let isTriggerValid = false;
    let failureReason = '';

    // Trigger 1: Heavy Rain
    if (lowerScenario.includes('rain')) {
        if (weather.rainfallMM > 10) {
            isTriggerValid = true;
        } else {
            failureReason = `Weather API reports only ${weather.rainfallMM}mm of rain (Requires >10mm)`;
        }
    } 
    // Trigger 2: Extreme Heat
    else if (lowerScenario.includes('heat')) {
        if (weather.tempCelsius > 40) {
            isTriggerValid = true;
        } else {
            failureReason = `Weather API reports ${weather.tempCelsius}°C (Requires >40°C)`;
        }
    } 
    // Trigger 3: Traffic / Curfew
    else if (lowerScenario.includes('traffic') || lowerScenario.includes('block')) {
        if (traffic.trafficStatus === 'Blocked' || traffic.curfewActive) {
            isTriggerValid = true;
        } else {
            failureReason = `Traffic API reports status is ${traffic.trafficStatus} and curfew is false.`;
        }
    } 
    // Default fallback
    else {
        // If it's some other generic event, we simulate a 60% approval correlation
        if (Math.random() > 0.4) {
            isTriggerValid = true;
        } else {
            failureReason = 'Hyperlocal API checks failed to corroborate the disruption event';
        }
    }

    return {
        isValid: isTriggerValid,
        details: { weather, traffic },
        failureReason
    };
};

module.exports = {
    validateTriggers
};
