// Add any global setup for Jest tests here
import "@testing-library/jest-dom";

// Mock console.log to avoid cluttering test output
global.console = {
  ...console,
  // Uncomment below to silence specific console methods during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};
