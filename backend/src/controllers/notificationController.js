const axios = require('axios');

/**
 * Send SMS via Fast2SMS API
 * @route POST /api/notifications/send-sms
 */
exports.sendSMS = async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message are required'
            });
        }

        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            console.error('Fast2SMS API Key missing in environment variables');
            return res.status(500).json({
                success: false,
                message: 'SMS service configuration error'
            });
        }

        // Fast2SMS API call
        // Using "authorization" header as per Fast2SMS documentation for individual SMS
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            message: message,
            language: 'english',
            route: 'q', // 'q' is for Quick SMS / Transactional style
            numbers: phone
        }, {
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.return) {
            return res.status(200).json({
                success: true,
                message: 'SMS sent successfully',
                data: response.data
            });
        } else {
            console.error('Fast2SMS Error Response:', response.data);
            return res.status(400).json({
                success: false,
                message: response.data.message || 'Failed to send SMS via provider',
                details: response.data
            });
        }

    } catch (error) {
        console.error('SMS Controller Error:', error.response ? error.response.data : error.message);
        
        // Return specific Fast2SMS error message if available
        if (error.response && error.response.data) {
            return res.status(500).json({
                success: false,
                message: error.response.data.message || 'SMS service error',
                error: error.response.data,
                hint: 'Check if Fast2SMS account has sufficient balance (min ₹100 required)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while sending SMS',
            error: error.message
        });
    }
};
