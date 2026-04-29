// Stripe Payment Integration
// Initialize Stripe (you'll need to replace with your actual publishable key)
// const stripe = Stripe('pk_test_your_publishable_key_here');

// Business configurations
const businessConfig = {
  crentoon: {
    name: 'Crentoon Studios',
    logo: '../images/crentoon-logo.webp',
    description: 'Professional videography and creative video production',
    theme: 'crentoon',
    services: [
      {
        id: 'music_video',
        name: 'Music Video Package',
        price: 750,
        description: 'Concept development, 4K filming, basic editing, 1-location shoot'
      },
      {
        id: 'documentary',
        name: 'Documentary Short',
        price: 1200,
        description: 'Storyboarding, multi-day shoot, voiceover, editing, motion graphics'
      },
      {
        id: 'event_coverage',
        name: 'Event Coverage',
        price: 500,
        description: 'Up to 4 hours on-site, dynamic editing, highlight reel with music overlay'
      },
      {
        id: 'promotional',
        name: 'Promotional Video',
        price: 900,
        description: 'Business promotional content, interviews, B-roll, professional editing'
      }
    ]
  },
  plumber: {
    name: 'The House Surgeon',
    logo: '../images/house-surgeon-logo.webp',
    description: 'Professional plumbing services for residential and commercial properties',
    theme: 'plumber',
    services: [
      {
        id: 'service_fee',
        name: 'Service Call Fee',
        price: 96,
        description: 'Diagnostic fee that goes toward any work performed'
      },
      {
        id: 'emergency_service',
        name: 'Emergency Service',
        price: 200,
        description: '24/7 emergency plumbing service call'
      },
      {
        id: 'water_softener',
        name: 'Water Softener Installation',
        price: '',
        description: 'Complete water softener system installation'
      },
      {
        id: 'water_heater',
        name: 'Water Heater Installation',
        price: '',
        description: 'New water heater installation and setup'
      }
    ]
  }
};

// Global variables
let selectedService = null;
let currentBusiness = null;
let currentAmount = 0;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
  setupEventListeners();
});

function initializePage() {
  // Get business parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const business = urlParams.get('business') || 'crentoon';
  
  currentBusiness = business;
  const config = businessConfig[business];
  
  if (!config) {
    console.error('Invalid business parameter');
    return;
  }
  
  // Update page branding
  updatePageBranding(config);
  
  // Load services
  loadServices(config.services);
  
  // Apply business theme
  document.body.classList.add(`business-${config.theme}`);
}

function updatePageBranding(config) {
  document.getElementById('businessTitle').textContent = config.name;
  document.getElementById('businessDescription').textContent = config.description;
  document.getElementById('businessLogo').src = config.logo;
  document.getElementById('businessLogo').alt = `${config.name} Logo`;
}

function loadServices(services) {
  const serviceOptions = document.getElementById('serviceOptions');
  serviceOptions.innerHTML = '';
  
  services.forEach(service => {
    const serviceElement = createServiceElement(service);
    serviceOptions.appendChild(serviceElement);
  });
}

function createServiceElement(service) {
  const serviceDiv = document.createElement('div');
  serviceDiv.className = 'service-option animate-slide-up';
  serviceDiv.dataset.serviceId = service.id;
  serviceDiv.dataset.price = service.price;
  
  serviceDiv.innerHTML = `
    <div class="service-title">${service.name}</div>
    <div class="service-price">${service.price ? '$' : ''}${service.price.toLocaleString()}</div>
    <div class="service-description">${service.description}</div>
  `;
  
  serviceDiv.addEventListener('click', () => selectService(service));
  
  return serviceDiv;
}

function selectService(service) {
  selectedService = service;
  currentAmount = service.price;
  
  // Update UI
  document.querySelectorAll('.service-option').forEach(el => {
    el.classList.remove('selected');
  });
  
  document.querySelector(`[data-service-id="${service.id}"]`).classList.add('selected');
  
  // Update summary
  document.getElementById('selectedService').textContent = service.name;
  
  // Clear custom amount input since we're using service price
  document.getElementById('customAmount').value = '';
  
  updateTotals();
  
  // Enable checkout button
  enableCheckoutButton();
}

function setupEventListeners() {
  // Custom amount input
  document.getElementById('customAmount').addEventListener('input', function() {
    let customAmount = parseInt(this.value) || 0;
    
    // Ensure whole dollar amounts with .00
    if (customAmount > 0) {
      this.value = customAmount;
      currentAmount = customAmount;
      
      // If no service is selected, create a custom service
      if (!selectedService) {
        selectedService = {
          id: 'custom',
          name: 'Custom Amount',
          price: customAmount
        };
        document.getElementById('selectedService').textContent = 'Custom Amount';
      }
      // If a service is selected, keep the service name but use custom amount
      // The service name stays the same, just the amount changes
    } else if (customAmount === 0) {
      // If custom amount is cleared and we have a selected service, revert to service price
      if (selectedService && selectedService.id !== 'custom') {
        currentAmount = selectedService.price;
      } else {
        // No service selected and no custom amount
        currentAmount = 0;
        selectedService = null;
        document.getElementById('selectedService').textContent = 'None selected';
      }
    }
    
    updateTotals();
    toggleCheckoutButton();
  });
  
  // Format custom amount input on blur to always show .00
  document.getElementById('customAmount').addEventListener('blur', function() {
    if (this.value && !isNaN(this.value)) {
      const wholeAmount = parseInt(this.value);
      this.value = wholeAmount;
    }
  });
  
  // Required fields validation
  const requiredFields = ['customerName', 'customerEmail'];
  requiredFields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', toggleCheckoutButton);
  });
  
  // Back button
  document.getElementById('backButton').addEventListener('click', function() {
    const business = currentBusiness === 'crentoon' ? 'crentoon_studios' : 'the_house_surgeon';
    window.location.href = `../${business}/`;
  });
  
  // Checkout button
  document.getElementById('checkoutButton').addEventListener('click', handleCheckout);
}

function updateTotals() {
  const formattedAmount = `$${currentAmount.toLocaleString()}.00`;
  document.getElementById('totalAmount').textContent = formattedAmount;
  document.getElementById('finalTotal').textContent = formattedAmount;
}

function toggleCheckoutButton() {
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const hasAmount = currentAmount > 0;
  
  const button = document.getElementById('checkoutButton');
  const buttonText = document.getElementById('buttonText');
  
  if (hasAmount && name && email) {
    enableCheckoutButton();
  } else {
    button.disabled = true;
    button.classList.add('opacity-50', 'cursor-not-allowed');
    
    if (!hasAmount) {
      buttonText.textContent = 'Select a service to continue';
    } else if (!name || !email) {
      buttonText.textContent = 'Complete required fields';
    }
  }
}

function enableCheckoutButton() {
  const button = document.getElementById('checkoutButton');
  const buttonText = document.getElementById('buttonText');
  
  button.disabled = false;
  button.classList.remove('opacity-50', 'cursor-not-allowed');
  buttonText.textContent = `Pay $${currentAmount.toLocaleString()}.00`;
}

async function handleCheckout() {
  if (!selectedService || currentAmount <= 0) {
    alert('Please select a service or enter a custom amount.');
    return;
  }
  
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  
  if (!name || !email) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Show loading state
  const button = document.getElementById('checkoutButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('loadingSpinner');
  
  button.disabled = true;
  buttonText.textContent = 'Processing...';
  spinner.classList.remove('hidden');
  
  try {
    // Here you would normally call your backend to create a Stripe checkout session
    // For now, we'll simulate the process and show an alert
    await simulateStripeCheckout();
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Payment processing failed. Please try again.');
    
    // Reset button state
    button.disabled = false;
    buttonText.textContent = `Pay $${currentAmount.toLocaleString()}.00`;
    spinner.classList.add('hidden');
  }
}

// Simulated Stripe checkout - replace with actual Stripe integration
async function simulateStripeCheckout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is where you'd redirect to Stripe Checkout
      alert(`This is a demo. In production, you would be redirected to Stripe Checkout for a $${currentAmount.toLocaleString()}.00 payment for ${selectedService.name}.`);
      resolve();
    }, 2000);
  });
}

// Actual Stripe checkout implementation (commented out - needs backend)
/*
async function createCheckoutSession() {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business: currentBusiness,
      service: selectedService,
      amount: currentAmount * 100, // Stripe uses cents
      customer: {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
      },
      description: document.getElementById('paymentDescription').value,
    }),
  });
  
  const session = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });
  
  if (result.error) {
    throw new Error(result.error.message);
  }
}
*/