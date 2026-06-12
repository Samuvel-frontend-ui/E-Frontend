import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer Component', () => {
  test('renders brand name and navigation links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Check if the brand name Graceonix is present
    expect(screen.getByText('Graceonix')).toBeInTheDocument();

    // Check if legal and support sections exist
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();

    // Check if some links are rendered
    expect(screen.getByText('All Products')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});
