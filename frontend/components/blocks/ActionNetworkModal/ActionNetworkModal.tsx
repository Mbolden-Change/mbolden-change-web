'use client'

import React, { useState } from 'react';
import ButtonComponent from '../../atoms/ButtonComponent';

const ActionNetworkTest = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const testSubmit = async () => {
    try {
    const response = await fetch('/api/action-network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
            person: {
              given_name: "John",
              family_name: "Wintz",
              email_addresses: [{ address: email, status: "subscribed" }]
            },
            triggers: {
              autoresponse: { enabled: true }
            }
          })
        }
      );
      const result = await response.json();
    console.log('Result:', result);
    
    setResult(`Status: ${response.status} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error:', error);
    setResult(`Error: ${error}`);
  }
}

  return (
    <div>
      <h3>Action Network Test</h3>
      <input
        type="email"
        placeholder="johnwintz+test@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <ButtonComponent onClick={testSubmit} variant="primary">
        Test Submit
      </ButtonComponent>
    </div>
  );
};

export default ActionNetworkTest;
