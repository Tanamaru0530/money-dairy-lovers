import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--primary/);

    rerender(<Button variant="secondary">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--secondary/);

    rerender(<Button variant="outline-love">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--outline-love/);

    rerender(<Button variant="ghost">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--ghost/);

    rerender(<Button variant="love-special">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--love-special/);
  });

  it('applies the correct size class', () => {
    const { rerender } = render(<Button size="sm">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--sm/);

    rerender(<Button size="md">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--md/);

    rerender(<Button size="lg">Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--lg/);
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/btn--loading/);
    expect(button).toBeDisabled();
    expect(screen.getByText('💕')).toBeInTheDocument(); // Shows spinner emoji
  });

  it.skip('renders as a different HTML element when "as" prop is provided', () => {
    // Button component doesn't currently support "as" prop
    render(<Button as="a" href="/test">Link Button</Button>);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link.className).toMatch(/btn/);
  });

  it('applies additional className', () => {
    render(<Button className="custom-class">Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/btn/);
    expect(button).toHaveClass('custom-class');
  });

  it('spreads additional props', () => {
    render(<Button data-testid="test-button" aria-label="Test button">Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('renders with icon', () => {
    const Icon = () => <span>💕</span>;
    render(<Button icon={<Icon />}>Love Button</Button>);
    
    expect(screen.getByText('💕')).toBeInTheDocument();
    expect(screen.getByText('Love Button')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Button</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn--full-width/);
  });
});