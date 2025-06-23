import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesignControls from '../components/design/DesignControls.jsx';

// Mock the BackgroundCustomizer component to isolate the tab switching issue
jest.mock('../components/BackgroundCustomizer.jsx', () => {
  return function MockBackgroundCustomizer({ onBackgroundChange, dbOperations }) {
    return (
      <div data-testid="background-customizer">
        <input
          data-testid="background-input"
          type="text"
          placeholder="Enter background prompt"
          onChange={(e) => console.log('Background input changed:', e.target.value)}
        />
        <button
          data-testid="add-product-button"
          onClick={() => {
            console.log('Add product button clicked');
            // We'll check this behavior works by verifying the tab doesn't switch
            if (onBackgroundChange) {
              onBackgroundChange('test-background-url');
            }
          }}
        >
          Select Product Image
        </button>
      </div>
    );
  };
});

// Mock other dependencies
jest.mock('../components/TemplateSelector.jsx', () => {
  return function MockTemplateSelector() {
    return <div data-testid="template-selector">Template Selector</div>;
  };
});

jest.mock('../components/canvas/TypographyPanel.jsx', () => {
  return function MockTypographyPanel() {
    return <div data-testid="typography-panel">Typography Panel</div>;
  };
});

jest.mock('../components/canvas/ButtonEditor.jsx', () => {
  return function MockButtonEditor() {
    return <div data-testid="button-editor">Button Editor</div>;
  };
});

jest.mock('../components/canvas/CTAEnhancer.jsx', () => {
  return function MockCTAEnhancer() {
    return <div data-testid="cta-enhancer">CTA Enhancer</div>;
  };
});

jest.mock('../components/AssetLibrary.jsx', () => {
  return function MockAssetLibrary() {
    return <div data-testid="asset-library">Asset Library</div>;
  };
});

jest.mock('../components/ProductAssetManager.jsx', () => {
  return function MockProductAssetManager() {
    return <div data-testid="product-asset-manager">Product Asset Manager</div>;
  };
});

jest.mock('../components/canvas/LayerManager.jsx', () => {
  return function MockLayerManager() {
    return <div data-testid="layer-manager">Layer Manager</div>;
  };
});

// Mock canvas state with a product element
const mockCanvasState = {
  meta: {
    adSize: '300x250',
    backgroundImage: null,
    width: 300,
    height: 250
  },
  elements: [
    {
      id: 'product-1',
      type: 'product',
      content: 'https://example.com/product.jpg',
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      zIndex: 1,
      styles: {}
    }
  ],
  history: { past: [], future: [] }
};

// Mock props
const defaultProps = {
  canvasState: mockCanvasState,
  selectedElement: null,
  onElementUpdate: jest.fn(),
  onElementAdd: jest.fn(),
  onBackgroundChange: jest.fn(),
  onPublish: jest.fn(),
  campaignSettings: {},
  dbOperations: {
    // Mock db operations
    storeBackground: jest.fn(),
    getBackgrounds: jest.fn()
  },
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
  readonly: false
};

describe('DesignControls Background Tab Persistence', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage to ensure predictable initial state
    localStorage.clear();
  });

  test('should maintain background tab when typing in background input field', async () => {
    render(<DesignControls {...defaultProps} />);
    
    // Switch to background tab
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    fireEvent.click(backgroundTab);
    
    // Verify background tab is active
    expect(backgroundTab).toHaveClass('text-blue-600');
    expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
    
    // Type in the background input field
    const backgroundInput = screen.getByTestId('background-input');
    fireEvent.change(backgroundInput, { target: { value: 'mountain landscape' } });
    
    // Wait for any potential re-renders
    await waitFor(() => {
      // Verify background tab is still active (should not switch to element tab)
      expect(backgroundTab).toHaveClass('text-blue-600');
      expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
    });
  });

  test('should maintain background tab when clicking Select Product Image button', async () => {
    render(<DesignControls {...defaultProps} />);
    
    // Switch to background tab
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    fireEvent.click(backgroundTab);
    
    // Verify background tab is active
    expect(backgroundTab).toHaveClass('text-blue-600');
    expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
    
    // Click the Select Product Image button
    const addProductButton = screen.getByTestId('add-product-button');
    fireEvent.click(addProductButton);
    
    // Wait for any potential re-renders
    await waitFor(() => {
      // Verify background tab is still active (should not switch to element tab)
      expect(backgroundTab).toHaveClass('text-blue-600');
      expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
    });
    
    // Verify that the mock function was called (this tests our mock works)
    expect(defaultProps.onBackgroundChange).toHaveBeenCalledWith('test-background-url');
  });

  test('should maintain background tab during multiple form interactions', async () => {
    render(<DesignControls {...defaultProps} />);
    
    // Switch to background tab
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    fireEvent.click(backgroundTab);
    
    // Verify background tab is active
    expect(backgroundTab).toHaveClass('text-blue-600');
    
    // Perform multiple interactions
    const backgroundInput = screen.getByTestId('background-input');
    const addProductButton = screen.getByTestId('add-product-button');
    
    // Type in input
    fireEvent.change(backgroundInput, { target: { value: 'forest scene' } });
    
    // Wait a bit
    await waitFor(() => {
      expect(backgroundTab).toHaveClass('text-blue-600');
    });
    
    // Click button
    fireEvent.click(addProductButton);
    
    // Wait again
    await waitFor(() => {
      expect(backgroundTab).toHaveClass('text-blue-600');
    });
    
    // Type more
    fireEvent.change(backgroundInput, { target: { value: 'ocean sunset' } });
    
    // Final verification - background tab should still be active
    await waitFor(() => {
      expect(backgroundTab).toHaveClass('text-blue-600');
      expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
      
      // Element tab should NOT be active
      const elementTab = screen.getByRole('button', { name: /🎨 Element/ });
      expect(elementTab).not.toHaveClass('text-blue-600');
    });
  });

  test('should allow manual switching between tabs but maintain state during interactions', async () => {
    render(<DesignControls {...defaultProps} />);
    
    // Start on element tab (default)
    const elementTab = screen.getByRole('button', { name: /🎨 Element/ });
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    
    expect(elementTab).toHaveClass('text-blue-600');
    
    // Switch to background tab
    fireEvent.click(backgroundTab);
    expect(backgroundTab).toHaveClass('text-blue-600');
    expect(elementTab).not.toHaveClass('text-blue-600');
    
    // Interact with background controls
    const backgroundInput = screen.getByTestId('background-input');
    fireEvent.change(backgroundInput, { target: { value: 'test background' } });
    
    // Should still be on background tab
    await waitFor(() => {
      expect(backgroundTab).toHaveClass('text-blue-600');
      expect(elementTab).not.toHaveClass('text-blue-600');
    });
    
    // Manually switch to element tab
    fireEvent.click(elementTab);
    expect(elementTab).toHaveClass('text-blue-600');
    expect(backgroundTab).not.toHaveClass('text-blue-600');
    
    // Switch back to background and interact again
    fireEvent.click(backgroundTab);
    fireEvent.click(screen.getByTestId('add-product-button'));
    
    // Should remain on background tab
    await waitFor(() => {
      expect(backgroundTab).toHaveClass('text-blue-600');
      expect(elementTab).not.toHaveClass('text-blue-600');
    });
  });

  test('should render background tab content when product element exists', () => {
    render(<DesignControls {...defaultProps} />);
    
    // Switch to background tab
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    fireEvent.click(backgroundTab);
    
    // Should show background customizer since we have a product element
    expect(screen.getByTestId('background-customizer')).toBeInTheDocument();
    
    // Should show the input and button
    expect(screen.getByTestId('background-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-product-button')).toBeInTheDocument();
  });

  test('should show product required message when no product element exists', () => {
    const propsWithoutProduct = {
      ...defaultProps,
      canvasState: {
        ...mockCanvasState,
        elements: [] // No product element
      }
    };
    
    render(<DesignControls {...propsWithoutProduct} />);
    
    // Switch to background tab
    const backgroundTab = screen.getByRole('button', { name: /🖼️ Background/ });
    fireEvent.click(backgroundTab);
    
    // Should show product required message
    expect(screen.getByText(/Product Image Required/)).toBeInTheDocument();
    expect(screen.getByText(/Add a product element to the canvas first/)).toBeInTheDocument();
  });
}); 