import React, { useState } from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import './AddUserModal.css';
import { trackEvent, AmplitudeEvents } from '../services/analytics';


interface AddUserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUserCreated: () => void; // Callback to refresh the user list
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isVisible,
  onClose,
  onUserCreated,
}) => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    emailAddress: '',
    firstName: '',
    lastName: '',
    displayName: '',
    cellPhoneNumber: '',
    homePhoneNumber: '',
    address: '',
    streetName: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    birthday: '',
    workplace: '',
    propertySituation: '',
    activeUser: true,
    activeFamily: true,
    activeFamilyMember: true,
    language: 0,
    displayMode: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.accountId) {
      setError('Account ID not available');
      return;
    }

    // First name is always required
    if (!formData.firstName) {
      setError('First name is required');
      return;
    }

    // Email is required only if not a passive member
    if (formData.activeFamilyMember && !formData.emailAddress) {
      setError('Email address is required for active members');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build userData object, omitting empty fields
      const userData: any = {
        accountId: user.accountId,
        firstName: formData.firstName,
        activeUser: formData.activeUser,
        activeFamily: formData.activeFamily,
        activeFamilyMember: formData.activeFamilyMember,
        language: formData.language,
        displayMode: formData.displayMode,
      };

      // Only include email if provided (required for active members, optional for passive)
      if (formData.emailAddress) {
        userData.emailAddress = formData.emailAddress;
      }

      // Only include optional fields if they have values
      if (formData.lastName) userData.lastName = formData.lastName;
      if (formData.displayName) userData.displayName = formData.displayName;
      if (formData.cellPhoneNumber) userData.cellPhoneNumber = formData.cellPhoneNumber;
      if (formData.homePhoneNumber) userData.homePhoneNumber = formData.homePhoneNumber;
      if (formData.address) userData.address = formData.address;
      if (formData.streetName) userData.streetName = formData.streetName;
      if (formData.city) userData.city = formData.city;
      if (formData.state) userData.state = formData.state;
      if (formData.country) userData.country = formData.country;
      if (formData.zipCode) userData.zipCode = formData.zipCode;
      if (formData.workplace) userData.workplace = formData.workplace;
      if (formData.propertySituation) userData.propertySituation = formData.propertySituation;

      // Only include birthday if it's not empty
      if (formData.birthday) {
        userData.birthday = formData.birthday;
      }

      const createdUser = await userService.createUser(userData);

      if (createdUser) {
        // Track analytics
        try {
          const isPassive = !formData.activeFamilyMember;
          const memberProps = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            emailAddress: formData.emailAddress || undefined,
            passive: isPassive,
          };
          if (isPassive) {
            trackEvent(AmplitudeEvents.hiveMemberInvited, memberProps);
          } else {
            trackEvent(AmplitudeEvents.hiveMemberJoined, memberProps);
          }
        } catch {}

        // Reset form
        setFormData({
          emailAddress: '',
          firstName: '',
          lastName: '',
          displayName: '',
          cellPhoneNumber: '',
          homePhoneNumber: '',
          address: '',
          streetName: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          birthday: '',
          workplace: '',
          propertySituation: '',
          activeUser: true,
          activeFamily: true,
          activeFamilyMember: true,
          language: 0,
          displayMode: 0,
        });

        // Notify parent to refresh user list
        onUserCreated();
        onClose();
      } else {
        setError('Failed to create user. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError('An error occurred while creating the user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="add-user-modal-overlay" onClick={handleClose}>
      <div className="add-user-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-user-modal-header">
          <h2>{i18n.t('AddNewMember') || 'Add New Member'}</h2>
          <button
            className="add-user-modal-close-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          {error && (
            <div className="add-user-error">
              {error}
            </div>
          )}

          {/* Required Fields */}
          <div className="add-user-form-section">
            <h3>{i18n.t('RequiredInformation') || 'Required Information'}</h3>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label htmlFor="firstName">{i18n.t('FirstName') || 'First Name'} *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder={i18n.t('EnterTheirFirstName') || 'Enter their first name'}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="add-user-form-group">
                <label htmlFor="lastName">{i18n.t('LastName') || 'Last Name'}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="add-user-form-group">
              <label htmlFor="emailAddress">
                {i18n.t('EmailAddress') || 'Email Address'}
                {formData.activeFamilyMember && ' *'}
              </label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                placeholder={i18n.t('EnterEmailAddress') || 'Enter email address'}
                value={formData.emailAddress}
                onChange={handleInputChange}
                required={formData.activeFamilyMember}
                disabled={isLoading || !formData.activeFamilyMember}
              />
            </div>

            {/* Passive Member Toggle */}
            <div className="add-user-form-group">
              <div className="add-user-toggle-group">
                <div className="add-user-toggle-header">
                  <span className="add-user-toggle-label">
                    {i18n.t('PassiveMember') || 'Passive Member'}
                  </span>
                  <label className="add-user-toggle-switch" htmlFor="passiveMember">
                    <input
                      type="checkbox"
                      id="passiveMember"
                      name="passiveMember"
                      checked={!formData.activeFamilyMember}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          activeFamilyMember: !e.target.checked,
                          // Clear email when switching to passive member
                          emailAddress: e.target.checked ? '' : prev.emailAddress
                        }));
                      }}
                      disabled={isLoading}
                      className="add-user-toggle-input"
                    />
                    <span className="add-user-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="add-user-form-section">
            <h3>{i18n.t('AdditionalInformationOptional') || 'Additional Information (Optional)'}</h3>

            <div className="add-user-form-group">
              <label htmlFor="displayName">{i18n.t('DisplayName') || 'Display Name'}</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label htmlFor="cellPhoneNumber">{i18n.t('CellPhoneNumber') || 'Cell Phone Number'}</label>
                <input
                  type="tel"
                  id="cellPhoneNumber"
                  name="cellPhoneNumber"
                  placeholder={i18n.t('EnterPhoneNumber') || 'Enter phone number'}
                  value={formData.cellPhoneNumber}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="add-user-form-group">
                <label htmlFor="homePhoneNumber">{i18n.t('HomePhoneNumber') || 'Home Phone Number'}</label>
                <input
                  type="tel"
                  id="homePhoneNumber"
                  name="homePhoneNumber"
                  placeholder={i18n.t('EnterPhoneNumber') || 'Enter phone number'}
                  value={formData.homePhoneNumber}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="add-user-form-group">
              <label htmlFor="birthday">{i18n.t('Birthday') || 'Birthday'}</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                placeholder={i18n.t('EnterBirthdate') || 'Enter birthdate'}
                value={formData.birthday}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="add-user-form-group">
              <label htmlFor="workplace">{i18n.t('Workplace') || 'Workplace'}</label>
              <input
                type="text"
                id="workplace"
                name="workplace"
                value={formData.workplace}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="add-user-form-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="add-user-btn-secondary"
            >
              {i18n.t('Cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="add-user-btn-primary"
            >
              {isLoading ? (i18n.t('Creating...') || 'Creating...') : (i18n.t('CreateMember') || 'Create Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
