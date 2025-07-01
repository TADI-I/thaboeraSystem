import React, { useState, useEffect } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpEncryption: 'tls',
    smtpTimeout: '30',
    fromEmail: '',
    fromName: '',
    testEmailAddress: ''
  });
  const [smsSettings, setSmsSettings] = useState({
    smsProvider: 'twilio',
    smsApiKey: '',
    smsApiSecret: '',
    smsSender: '+1234567890',
    testPhoneNumber: ''
  });
  const [emailTestStatus, setEmailTestStatus] = useState({ show: false, success: false, message: '' });
  const [smsTestStatus, setSmsTestStatus] = useState({ show: false, success: false, message: '' });
  const [showPassword, setShowPassword] = useState({
    smtpPass: false,
    smsApiSecret: false
  });

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem('authToken')) {
      window.location.href = '/login';
      return;
    }

    // Load saved settings
    loadSettings();
  }, []);

  const loadSettings = () => {
    // In a real app, this would load from your API
    const loadedEmailSettings = {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUser: 'noreply@example.com',
      smtpPass: '',
      smtpEncryption: 'tls',
      fromEmail: 'noreply@example.com',
      fromName: 'My IT Solutions',
      smtpTimeout: '30'
    };

    const loadedSmsSettings = {
      smsProvider: 'twilio',
      smsApiKey: '',
      smsApiSecret: '',
      smsSender: '+1234567890'
    };

    setEmailSettings(loadedEmailSettings);
    setSmsSettings(loadedSmsSettings);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleEmailChange = (e) => {
    const { id, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSmsChange = (e) => {
    const { id, value } = e.target;
    setSmsSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveEmailSettings = (e) => {
    e.preventDefault();
    simulateAPICall('/api/email-settings', emailSettings, 'POST')
      .then(response => {
        if (response.success) {
          showAlert('Email settings saved successfully!', 'success');
        } else {
          showAlert(response.message || 'Failed to save email settings', 'error');
        }
      });
  };

  const saveSmsSettings = (e) => {
    e.preventDefault();
    simulateAPICall('/api/sms-settings', smsSettings, 'POST')
      .then(response => {
        if (response.success) {
          showAlert('SMS settings saved successfully!', 'success');
        } else {
          showAlert(response.message || 'Failed to save SMS settings', 'error');
        }
      });
  };

  const testEmailConnection = () => {
    if (!emailSettings.testEmailAddress) {
      showAlert('Please enter a test email address', 'error');
      return;
    }

    simulateAPICall('/api/test-email', { email: emailSettings.testEmailAddress }, 'POST')
      .then(response => {
        if (response.success) {
          setEmailTestStatus({
            show: true,
            success: true,
            message: 'Test email sent successfully!'
          });
        } else {
          setEmailTestStatus({
            show: true,
            success: false,
            message: response.message || 'Failed to send test email'
          });
        }
      });
  };

  const testSmsConnection = () => {
    if (!smsSettings.testPhoneNumber) {
      showAlert('Please enter a test phone number', 'error');
      return;
    }

    simulateAPICall('/api/test-sms', { phone: smsSettings.testPhoneNumber }, 'POST')
      .then(response => {
        if (response.success) {
          setSmsTestStatus({
            show: true,
            success: true,
            message: 'Test SMS sent successfully!'
          });
        } else {
          setSmsTestStatus({
            show: true,
            success: false,
            message: response.message || 'Failed to send test SMS'
          });
        }
      });
  };

  const showAlert = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const simulateAPICall = (url, data = {}, method = 'GET') => {
    console.log(`API Call: ${method} ${url}`, data);
    return new Promise(resolve => {
      setTimeout(() => {
        if (url === '/api/email-settings' && method === 'POST') {
          resolve({ success: true });
        } else if (url === '/api/sms-settings' && method === 'POST') {
          resolve({ success: true });
        } else if (url === '/api/test-email' && method === 'POST') {
          resolve({ success: Math.random() > 0.2 }); // 80% success rate for demo
        } else if (url === '/api/test-sms' && method === 'POST') {
          resolve({ success: Math.random() > 0.2 }); // 80% success rate for demo
        } else {
          resolve({ success: false, message: 'API error' });
        }
      }, 800);
    });
  };

  return (
    <div className="settings-container">
      <h1>
        <i className="fas fa-envelope"></i> Email & SMS Configuration
      </h1>
      
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`} 
          onClick={() => handleTabChange('email')}
        >
          <i className="fas fa-envelope"></i> Email
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sms' ? 'active' : ''}`} 
          onClick={() => handleTabChange('sms')}
        >
          <i className="fas fa-sms"></i> SMS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} 
          onClick={() => handleTabChange('templates')}
        >
          <i className="fas fa-file-alt"></i> Templates
        </button>
      </div>
      
      <div className="settings-content">
        {/* Email Tab */}
        <div id="email-tab" className={`tab-content ${activeTab === 'email' ? 'active' : ''}`}>
          <form onSubmit={saveEmailSettings}>
            <div className="form-row">
              <div className="form-group">
                <label>SMTP Host</label>
                <input 
                  type="text" 
                  id="smtpHost" 
                  value={emailSettings.smtpHost}
                  onChange={handleEmailChange}
                  placeholder="smtp.example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>SMTP Port</label>
                <input 
                  type="number" 
                  id="smtpPort" 
                  value={emailSettings.smtpPort}
                  onChange={handleEmailChange}
                  placeholder="587" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>SMTP Username</label>
                <input 
                  type="text" 
                  id="smtpUser" 
                  value={emailSettings.smtpUser}
                  onChange={handleEmailChange}
                  placeholder="noreply@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>SMTP Password</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword.smtpPass ? "text" : "password"} 
                    id="smtpPass" 
                    value={emailSettings.smtpPass}
                    onChange={handleEmailChange}
                    required 
                  />
                  <i 
                    className={`fas ${showPassword.smtpPass ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                    onClick={() => togglePasswordVisibility('smtpPass')}
                  ></i>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Encryption</label>
                <select 
                  id="smtpEncryption" 
                  value={emailSettings.smtpEncryption}
                  onChange={handleEmailChange}
                >
                  <option value="tls">TLS (Recommended)</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None (Not recommended)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timeout (seconds)</label>
                <input 
                  type="number" 
                  id="smtpTimeout" 
                  value={emailSettings.smtpTimeout}
                  onChange={handleEmailChange}
                  min="10" 
                  max="120" 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>From Email</label>
                <input 
                  type="email" 
                  id="fromEmail" 
                  value={emailSettings.fromEmail}
                  onChange={handleEmailChange}
                  placeholder="noreply@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>From Name</label>
                <input 
                  type="text" 
                  id="fromName" 
                  value={emailSettings.fromName}
                  onChange={handleEmailChange}
                  placeholder="My IT Solutions" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Test Email Address</label>
              <input 
                type="email" 
                id="testEmailAddress" 
                value={emailSettings.testEmailAddress}
                onChange={handleEmailChange}
                placeholder="test@example.com" 
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <i className="fas fa-save"></i> Save Email Settings
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={testEmailConnection}
              >
                <i className="fas fa-paper-plane"></i> Send Test Email
              </button>
            </div>
            
            {emailTestStatus.show && (
              <div className={`test-status ${emailTestStatus.success ? 'success' : 'error'}`}>
                <i className={`fas ${emailTestStatus.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                <span>{emailTestStatus.message}</span>
              </div>
            )}
          </form>
        </div>
        
        {/* SMS Tab */}
        <div id="sms-tab" className={`tab-content ${activeTab === 'sms' ? 'active' : ''}`}>
          <form onSubmit={saveSmsSettings}>
            <div className="form-group">
              <label>SMS Gateway Provider</label>
              <select 
                id="smsProvider" 
                value={smsSettings.smsProvider}
                onChange={handleSmsChange}
              >
                <option value="twilio">Twilio</option>
                <option value="nexmo">Nexmo/Vonage</option>
                <option value="plivo">Plivo</option>
                <option value="aws">Amazon SNS</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>API Key/Account SID</label>
                <input 
                  type="text" 
                  id="smsApiKey" 
                  value={smsSettings.smsApiKey}
                  onChange={handleSmsChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>API Secret/Auth Token</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword.smsApiSecret ? "text" : "password"} 
                    id="smsApiSecret" 
                    value={smsSettings.smsApiSecret}
                    onChange={handleSmsChange}
                    required 
                  />
                  <i 
                    className={`fas ${showPassword.smsApiSecret ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                    onClick={() => togglePasswordVisibility('smsApiSecret')}
                  ></i>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Sender ID/Number</label>
                <input 
                  type="text" 
                  id="smsSender" 
                  value={smsSettings.smsSender}
                  onChange={handleSmsChange}
                  placeholder="+1234567890" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Test Phone Number</label>
                <input 
                  type="text" 
                  id="testPhoneNumber" 
                  value={smsSettings.testPhoneNumber}
                  onChange={handleSmsChange}
                  placeholder="+1234567890" 
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <i className="fas fa-save"></i> Save SMS Settings
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={testSmsConnection}
              >
                <i className="fas fa-sms"></i> Send Test SMS
              </button>
            </div>
            
            {smsTestStatus.show && (
              <div className={`test-status ${smsTestStatus.success ? 'success' : 'error'}`}>
                <i className={`fas ${smsTestStatus.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                <span>{smsTestStatus.message}</span>
              </div>
            )}
          </form>
        </div>
        
        {/* Templates Tab */}
        <div id="templates-tab" className={`tab-content ${activeTab === 'templates' ? 'active' : ''}`}>
          <div className="template-header">
            <h3><i className="fas fa-file-alt"></i> Email & SMS Templates</h3>
            <button className="btn-primary">
              <i className="fas fa-plus"></i> New Template
            </button>
          </div>
          
          <div className="template-list">
            <p>Template management would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;