'use client'

import React, { useState } from 'react';
import ButtonComponent from '../../atoms/ButtonComponent';

const ActionNetworkModal = () => {
  const [email, setEmail] = useState('')

  const testSubmit = async () => {
    try {
      const response = await fetch('/api/action-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: {
            given_name: "demo",
            family_name: "test",
            email_addresses: [{ address: email, status: "subscribed" }]
          },
          triggers: {
            autoresponse: { enabled: true }
          }
        })
      });
      
      await response.json();
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h3>Action Network Form</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <ButtonComponent onClick={testSubmit} variant="primary">
        Submit
      </ButtonComponent>
    </div>
  );
};

export default ActionNetworkModal;
