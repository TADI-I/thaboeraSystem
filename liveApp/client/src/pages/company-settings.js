    document.addEventListener('DOMContentLoaded', function() {
      // Tab switching functionality
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');
      
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons and contents
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Add active class to clicked button
          button.classList.add('active');
          
          // Show corresponding content
          const tabId = button.dataset.tab;
          document.getElementById(`${tabId}-tab`).classList.add('active');
        });
      });
      
      // Logo upload preview
      const logoUpload = document.getElementById('logoUpload');
      const logoPreview = document.getElementById('logoPreview');
      const logoFileName = document.getElementById('logoFileName');
      
      logoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(event) {
              logoPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
            logoFileName.textContent = file.name;
          } else {
            alert('Please select an image file');
            logoUpload.value = '';
          }
        }
      });
      
      // Favicon upload
      const faviconUpload = document.getElementById('faviconUpload');
      const faviconFileName = document.getElementById('faviconFileName');
      
      faviconUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          if (file.name.endsWith('.ico') || file.type === 'image/x-icon') {
            faviconFileName.textContent = file.name;
          } else {
            alert('Please select a .ico file');
            faviconUpload.value = '';
          }
        }
      });
      
      // Form submissions
      document.getElementById('companyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('General settings saved successfully!');
        // In a real app, you would send data to server here
      });
      
      document.getElementById('brandingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Branding settings saved successfully!');
        // In a real app, you would send data to server here
      });
      
      document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Invoice settings saved successfully!');
        // In a real app, you would send data to server here
      });
      
      document.getElementById('taxForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Tax settings saved successfully!');
        // In a real app, you would send data to server here
      });
    });
