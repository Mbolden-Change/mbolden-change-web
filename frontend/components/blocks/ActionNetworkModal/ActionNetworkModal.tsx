'use client'

import React, { useState } from 'react';
import ButtonComponent from '../../atoms/ButtonComponent';
import Headline from '../../atoms/Headline'
import { IoMdClose } from 'react-icons/io';
import styles from "./ActionNetworkModal.module.css"


interface ActionNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const ActionNetworkModal = ({ isOpen, onClose, title = "Sign Up for Updates" }: ActionNetworkModalProps) => {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('actionNetworkFormData');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    street: '',
    city: '',
    zip: '',
    eNewsletter: false,
    advocacyAlerts: false,
    positionStatements: false,
    textAlerts: false,
    printMailings: false,
    signUpForEverything: false
    }
  });

const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState<'neutral' | 'success' | 'error'>('neutral');


const handleInputChange = (field: string, value: string | boolean) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
  setFormData(newFormData);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('actionNetworkFormData', JSON.stringify(newFormData));
  }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitStatus('neutral');

    try {
      const formDataStructure = {
            person: {
              given_name: formData.firstName,
              family_name: formData.lastName,
              email_addresses: [{
                address: formData.email,
                status: "subscribed"
            }],
             ...(formData.mobile ? {
            phone_numbers: [{
              number: formData.mobile,
              number_type: "Mobile",
              status: "subscribed"
            }]
            } : {}),
            ...(formData.street ? {
            postal_addresses: [{
              address_lines: [formData.street],
              locality: formData.city,
              postal_code: formData.zip,
              }]
            } : {}),
            custom_fields: {
            "Sign-Up_E-Newsletter": formData.eNewsletter ? "1" : "0",
            "Sign-Up_Advocacy Alerts (email)": formData.advocacyAlerts ? "1" : "0",
            "Sign-Up_New Position Statements / Perspectives (email)": formData.positionStatements ? "1" : "0",
            "Sign-Up_Text Alerts": formData.textAlerts ? "1" : "0",
            "Sign-Up_Print Mailings": formData.printMailings ? "1" : "0",
            "Sign-Up_Sign Me Up For Everything": formData.signUpForEverything ? "1" : "0"
          } 
        },
        triggers: {
          autoresponse: { enabled: true }
        }
      };

      const response = await fetch('/api/action-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataStructure)
        });
      const result = await response.json();

      if(response.ok && result.success) {
        setSubmitStatus('success');
          const emptyFormData ={
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            street: '',
            city: '',
            zip: '',
            eNewsletter: false,
            advocacyAlerts: false,
            positionStatements: false,
            textAlerts: false,
            printMailings: false,
            signUpForEverything: false
          };

        setFormData(emptyFormData);

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('actionNetworkFormData');
        }
      } else {
        setSubmitStatus('error');
      }
      
    }catch (error) {
        console.error('Error:', error);
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    };

  if(!isOpen) return null;
  

   return (
    <div>
      
      <div className={styles.modalWrapper} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <Headline tag='h3' text={title} className={styles.headline} />
          <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
            className={styles.closeButton}
            aria-label="Close Modal"
            type="button"
          >
            <IoMdClose />
          </button>
        </div>
        {submitStatus === 'success' ? (
          <div className={styles.successMessage}>
            <h3>Thank you!</h3>
            <p>Your subscription has been successfully submitted. You'll receive updates soon!</p>
            <ButtonComponent 
               onClick={() => {
                setSubmitStatus('neutral');
                onClose();
                }}
                variant='primary'
            >
              Close
            </ButtonComponent>
          </div>
        ) : submitStatus === 'error' ? (
          <div className={styles.successMessage}>
            <h3>Oops! Something went wrong</h3>
            <p>Sorry, the Action Network servers are currently unavailable. Please try again later.</p>
            <ButtonComponent 
               onClick={() => {
                setSubmitStatus('neutral');
                onClose();
                }}
                variant='primary'
            >
              Close
            </ButtonComponent>
          </div>
        ) : (
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className={styles.formSection}>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="firstName"
                placeholder=" "
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={styles.input}
                maxLength={50}
              />
              <label htmlFor='firstName' className={styles.inputLabel}>
                First Name
              </label>
            </div>
            <div>
              <div className={styles.inputWrapper}>
              <input
                type="text"
                id="lastName"
                placeholder=" "
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={styles.input}
                maxLength={50}
              />
              <label htmlFor="lastName" className={styles.inputLabel}>
                Last Name
              </label>
              </div>
            </div>
          </div>
          
          <div>
            <div className={styles.inputWrapper}>
            <input
              type="email"
              id="email"
              placeholder=" "
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={styles.input}
              required
            />
            <label htmlFor="email" className={styles.inputLabel}>
              Email  <span className={styles.required}>(Required)*</span>
            </label>
            </div>
          </div>
          
          <div>
          <div className={styles.inputWrapper}>
            <input
              type="tel"
              id="tel"
              placeholder=" "
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className={styles.input}
              maxLength={20}
            />
            <label htmlFor="tel" className={styles.inputLabel}>
              Phone Number
            </label>
            </div>
          </div>
          
          <div>
            <div className={styles.inputWrapper}>
            <input
              type="text"
              id="street-address"
              placeholder=" "
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={styles.input}
              maxLength={100}
            />
            <label htmlFor="street-address" className={styles.inputLabel}>
              Street Address
            </label>
            </div>
          </div>
          
          <div>
            <div className={styles.inputWrapper}>
            <input
              type="text"
              id="city"
              placeholder=" "
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={styles.input}
              maxLength={50}
            />
            <label htmlFor="city" className={styles.inputLabel}>
              City
            </label>
            </div>
          </div>
          
          <div>
            <div className={styles.inputWrapper}>
            <input
              type="text"
              id="zip-code"
              placeholder=" "
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              className={styles.input}
              maxLength={10}
            />
            <label htmlFor="zip-code" className={styles.inputLabel}>
              Zip/Postal Code
            </label>
            </div>
          </div>
        </div>

      {/* CheckBoxes */}
      <div className={styles.formSection}>
        <h4>Sign-Up</h4>
          <div className={styles.inputRowBoxes}>
        <label>
          <input
            type="checkbox"
            checked={formData.eNewsletter}
            onChange={(e) => handleInputChange('eNewsletter', e.target.checked)}
          />
          E-Newsletter
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.advocacyAlerts}
            onChange={(e) => handleInputChange('advocacyAlerts', e.target.checked)}
          />
          Advocacy Alerts (email)
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.positionStatements}
            onChange={(e) => handleInputChange('positionStatements', e.target.checked)}
          />
          New Position Statements / Perspectives (email)
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.textAlerts}
            onChange={(e) => handleInputChange('textAlerts', e.target.checked)}
          />
          Text Alerts
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.printMailings}
            onChange={(e) => handleInputChange('printMailings', e.target.checked)}
          />
          Print Mailings
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.signUpForEverything}
            onChange={(e) => handleInputChange('signUpForEverything', e.target.checked)}
          />
          Sign Me Up For Everything
        </label>
        </div>
      </div>

      <ButtonComponent 
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </ButtonComponent>
          </form>
        )}
    </div>
    </div>
    </div>
   );
};

export default ActionNetworkModal;
