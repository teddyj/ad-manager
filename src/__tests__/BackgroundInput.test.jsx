import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DesignControls from '../components/design/DesignControls';

// Mock the background service
jest.mock('../services/backgroundService', () => ({
  generateBackground: jest.fn().mockResolvedValue('mocked-background-url'),
  enhancePrompt: jest.fn().mockResolvedValue('enhanced prompt')
}));

describe('Background Input Field Tests', () => {
  const defaultProps = {
    canvasState: { elements: [], meta: {} },
    selectedElement: null,
    onElementUpdate: jest.fn(),
    onElementAdd: jest.fn(),
    onBackgroundChange: jest.fn(),
    onPublish: jest.fn(),
    campaignSettings: {},
    dbOperations: {},
    selectedElementId: null,
    selectedElementIds: [],
    onElementSelect: jest.fn(),
    onElementDelete: jest.fn(),
    onElementDuplicate: jest.fn(),
    onElementLock: jest.fn(),
    onElementGroup: jest.fn(),
    onElementUngroup: jest.fn(),
    onLayerReorder: jest.fn(),
    onMultiElementUpdate: jest.fn(),
    onAlignElements: jest.fn(),
    readonly: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should allow typing in background URL input field', async () => {
    const user = userEvent.setup();
    const mockOnBackgroundChange = jest.fn();
    
    render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    // Find the background URL input
    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    expect(backgroundInput).toBeInTheDocument();

    // Type in the input field
    const testUrl = 'https://example.com/test-image.jpg';
    await user.type(backgroundInput, testUrl);

    // Verify the input shows the typed text immediately
    expect(backgroundInput.value).toBe(testUrl);

    // Wait for debounced call
    await waitFor(() => {
      expect(mockOnBackgroundChange).toHaveBeenCalledWith(testUrl);
    }, { timeout: 400 });

    // Verify the text doesn't disappear
    expect(backgroundInput.value).toBe(testUrl);
  });

  test('should handle rapid typing without clearing', async () => {
    const user = userEvent.setup();
    const mockOnBackgroundChange = jest.fn();
    
    render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);

    // Type rapidly character by character
    const testUrl = 'https://example.com/image.jpg';
    for (let i = 0; i < testUrl.length; i++) {
      await user.type(backgroundInput, testUrl[i]);
      // Verify each character stays
      expect(backgroundInput.value).toBe(testUrl.substring(0, i + 1));
    }

    // Final check
    expect(backgroundInput.value).toBe(testUrl);
  });

  test('should handle paste operation correctly', async () => {
    const user = userEvent.setup();
    const mockOnBackgroundChange = jest.fn();
    
    render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    
    const testUrl = 'https://example.com/pasted-image.jpg';
    
    // Simulate paste
    await user.click(backgroundInput);
    await user.paste(testUrl);

    // Verify paste worked
    expect(backgroundInput.value).toBe(testUrl);

    // Wait for debounced call
    await waitFor(() => {
      expect(mockOnBackgroundChange).toHaveBeenCalledWith(testUrl);
    }, { timeout: 400 });

    // Verify text doesn't disappear after debounce
    expect(backgroundInput.value).toBe(testUrl);
  });

  test('should preserve input when canvas state changes', async () => {
    const user = userEvent.setup();
    const mockOnBackgroundChange = jest.fn();
    
    const { rerender } = render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab and type
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    const testUrl = 'https://example.com/test.jpg';
    await user.type(backgroundInput, testUrl);

    expect(backgroundInput.value).toBe(testUrl);

    // Simulate canvas state change (like adding an element)
    const newCanvasState = {
      elements: [{ id: 'test-element', type: 'text', content: 'Hello' }],
      meta: {}
    };

    rerender(
      <DesignControls 
        {...defaultProps}
        canvasState={newCanvasState}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Input should still have the same value
    const backgroundInputAfter = screen.getByPlaceholderText(/enter background image url/i);
    expect(backgroundInputAfter.value).toBe(testUrl);
  });

  test('should maintain tab state after input operations', async () => {
    const user = userEvent.setup();
    
    render(
      <DesignControls {...defaultProps} />
    );

    // Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    // Type in background input
    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    await user.type(backgroundInput, 'https://example.com/test.jpg');

    // Verify we're still on background tab
    expect(backgroundTab).toHaveClass('text-blue-600');
    
    // Wait for debounce
    await waitFor(() => {}, { timeout: 400 });
    
    // Still should be on background tab
    expect(backgroundTab).toHaveClass('text-blue-600');
  });
}); 