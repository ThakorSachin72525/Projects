function loadAppropriatePage() {
    // Get the current screen width
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // Decide which HTML file to load based on screen width
    if (screenWidth >= 768) { // Change the breakpoint to your desired value
      window.location.href = 'index.html'; // Load desktop version
    } else {
      window.location.href = 'mobile.html'; // Load mobile version
    }
  }

  // Load appropriate page on initial load
  window.addEventListener('load', loadAppropriatePage);

  // Load appropriate page on window resize
  window.addEventListener('resize', loadAppropriatePage);