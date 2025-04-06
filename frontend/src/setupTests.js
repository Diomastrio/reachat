import "@testing-library/jest-dom";

// Mock for reCAPTCHA
window.grecaptcha = {
  ready: (callback) => callback(),
  execute: () => Promise.resolve("test-token"),
};
