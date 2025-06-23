import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DesignControls from '../components/design/DesignControls';

// Mock the background service
jest.mock('../services/backgroundService', () => ({
  generateBackground: jest.fn().mockResolvedValue('mocked-background-url'),
  enhancePrompt: jest.fn().mockResolvedValue('enhanced prompt')
}));

describe('Background Input Integration Tests', () => {
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
    localStorage.clear();
  });

  test('background input should work with canvas state changes (real-world scenario)', async () => {
    const user = userEvent.setup();
    let canvasState = { elements: [], meta: {} };
    const mockOnBackgroundChange = jest.fn().mockImplementation((backgroundUrl) => {
      // Simulate how canvas state would update when background changes
      canvasState = {
        ...canvasState,
        meta: { ...canvasState.meta, backgroundImage: backgroundUrl }
      };
    });
    
    const { rerender } = render(
      <DesignControls 
        {...defaultProps}
        canvasState={canvasState}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // 1. Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    // 2. Type in background URL
    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    const testUrl = 'https://example.com/typing-test.jpg';
    
    // Type each character individually to mimic real typing
    for (let i = 0; i < testUrl.length; i++) {
      const char = testUrl[i];
      await user.type(backgroundInput, char);
      
      // Verify the input value is correct after each character
      expect(backgroundInput.value).toBe(testUrl.substring(0, i + 1));
      
      // Re-render component to simulate how React would re-render on state changes
      rerender(
        <DesignControls 
          {...defaultProps}
          canvasState={canvasState}
          onBackgroundChange={mockOnBackgroundChange}
        />
      );
      
      // Verify input still has the correct value after re-render
      const inputAfterRerender = screen.getByPlaceholderText(/enter background image url/i);
      expect(inputAfterRerender.value).toBe(testUrl.substring(0, i + 1));
    }

    // 3. Wait for debounced call and simulate canvas update
    await waitFor(() => {
      expect(mockOnBackgroundChange).toHaveBeenCalledWith(testUrl);
    }, { timeout: 400 });

    // 4. Re-render with updated canvas state (simulating real app behavior)
    await act(async () => {
      rerender(
        <DesignControls 
          {...defaultProps}
          canvasState={canvasState}
          onBackgroundChange={mockOnBackgroundChange}
        />
      );
    });

    // 5. Verify input still shows typed URL and hasn't been cleared
    const finalInput = screen.getByPlaceholderText(/enter background image url/i);
    expect(finalInput.value).toBe(testUrl);

    // 6. Verify we're still on background tab
    expect(backgroundTab).toHaveClass('text-blue-600');
  });

  test('should handle rapid typing with frequent re-renders', async () => {
    const user = userEvent.setup();
    let canvasState = { elements: [], meta: {} };
    const mockOnBackgroundChange = jest.fn();
    
    const { rerender } = render(
      <DesignControls 
        {...defaultProps}
        canvasState={canvasState}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    
    // Simulate rapid typing with re-renders between keystrokes
    const testUrl = 'https://rapid-typing.com/test.jpg';
    
    for (let i = 0; i < testUrl.length; i++) {
      // Type character
      await user.type(backgroundInput, testUrl[i]);
      
      // Force multiple re-renders to simulate real-world stress
      for (let j = 0; j < 3; j++) {
        rerender(
          <DesignControls 
            {...defaultProps}
            canvasState={{...canvasState, timestamp: Date.now() + j}} // Slight change to trigger re-render
            onBackgroundChange={mockOnBackgroundChange}
          />
        );
        
        // Check input value is still correct
        const currentInput = screen.getByPlaceholderText(/enter background image url/i);
        expect(currentInput.value).toBe(testUrl.substring(0, i + 1));
      }
    }

    // Final verification
    const finalInput = screen.getByPlaceholderText(/enter background image url/i);
    expect(finalInput.value).toBe(testUrl);
  });

  test('should handle component remounting (like the original issue)', async () => {
    const user = userEvent.setup();
    const mockOnBackgroundChange = jest.fn();
    
    let component = render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // Switch to background tab and type
    const backgroundTab = screen.getByText('Background');
    await user.click(backgroundTab);

    const backgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    await user.type(backgroundInput, 'https://test.com/image.jpg');

    expect(backgroundInput.value).toBe('https://test.com/image.jpg');

    // Simulate complete remounting (unmount and mount again)
    component.unmount();
    
    component = render(
      <DesignControls 
        {...defaultProps}
        onBackgroundChange={mockOnBackgroundChange}
      />
    );

    // After remount, should start with empty input (this is expected)
    const newBackgroundTab = screen.getByText('Background');
    await user.click(newBackgroundTab);
    
    const newBackgroundInput = screen.getByPlaceholderText(/enter background image url/i);
    expect(newBackgroundInput.value).toBe('');

    // But typing should work correctly
    await user.type(newBackgroundInput, 'https://new-test.com/image.jpg');
    expect(newBackgroundInput.value).toBe('https://new-test.com/image.jpg');
  });
}); 