const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const requestStatusOptions = ['pending', 'approved', 'rejected', 'spam', 'fulfilled'];
const ngoStatusOptions = ['pending', 'approved', 'rejected'];

export const allowedCategories = [
  'Grains',
  'Books',
  'Clothes',
  'Electronics',
  'Stationery',
  'Blankets',
  'Medical',
];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export function isValidGmail(email) {
  return gmailRegex.test(String(email || '').trim());
}

export function validateRequestPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.ngoName)) {
    errors.push('NGO name is required.');
  }

  if (!isNonEmptyString(payload.ngoLocation)) {
    errors.push('NGO location is required.');
  }

  if (!isNonEmptyString(payload.itemName)) {
    errors.push('Item name is required.');
  }

  if (!allowedCategories.includes(payload.category)) {
    errors.push('Category is invalid.');
  }

  if (!isNonEmptyString(payload.quantity)) {
    errors.push('Quantity is required.');
  }

  if (!isNonEmptyString(payload.description)) {
    errors.push('Description is required.');
  }

  if (!isValidGmail(payload.contact)) {
    errors.push('Only valid Gmail addresses are allowed.');
  }

  if (payload.image) {
    try {
      const parsedUrl = new URL(payload.image);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        errors.push('Image URL must start with http or https.');
      }
    } catch {
      errors.push('Image URL is invalid.');
    }
  }

  if (payload.ngoMapLink) {
    try {
      const parsedUrl = new URL(payload.ngoMapLink);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        errors.push('Map link must start with http or https.');
      }
    } catch {
      errors.push('Map link is invalid.');
    }
  }

  return errors;
}

export function validateDonationPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.name)) {
    errors.push('Donor name is required.');
  }

  if (!phoneRegex.test(String(payload.phone || '').trim())) {
    errors.push('Phone number is invalid.');
  }

  if (!isValidGmail(payload.email)) {
    errors.push('Only valid Gmail addresses are allowed.');
  }

  if (!isNonEmptyString(payload.item)) {
    errors.push('Donation item is required.');
  }

  if (!isNonEmptyString(payload.quantity)) {
    errors.push('Donation quantity is required.');
  }

  if (!isNonEmptyString(payload.address)) {
    errors.push('Pickup address is required.');
  }

  return errors;
}

export function validateNgoRegistrationPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.ngoName)) {
    errors.push('NGO name is required.');
  }

  if (!isNonEmptyString(payload.ngoLocation)) {
    errors.push('NGO location is required.');
  }

  if (!isValidGmail(payload.email)) {
    errors.push('Only valid Gmail addresses are allowed.');
  }

  if (!isNonEmptyString(payload.password) || String(payload.password).trim().length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (payload.ngoMapLink) {
    try {
      const parsedUrl = new URL(payload.ngoMapLink);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        errors.push('Map link must start with http or https.');
      }
    } catch {
      errors.push('Map link is invalid.');
    }
  }

  return errors;
}

export function validateLoginPayload(payload) {
  const errors = [];

  if (!isValidGmail(payload.email)) {
    errors.push('Only valid Gmail addresses are allowed.');
  }

  if (!isNonEmptyString(payload.password)) {
    errors.push('Password is required.');
  }

  return errors;
}

export function validateStatusUpdate(status, allowedStatuses) {
  return allowedStatuses.includes(status);
}

export { ngoStatusOptions, requestStatusOptions };
