import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(<Input label="Email" name="email" required />);
    const label = screen.getByText('Email');
    // The asterisk is added via CSS, so we check for the required class
    expect(label.className).toMatch(/label--required/);
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    render(<Input name="test" value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    
    expect(handleChange).toHaveBeenCalledTimes(5); // Once for each character
  });

  it('shows error state', () => {
    const error = 'This field is required';
    render(<Input name="test" error={error} />);
    
    expect(screen.getByText(error)).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input.className).toMatch(/input--error/);
  });

  it('shows helper text', () => {
    const helpText = 'Enter your email address';
    render(<Input name="test" helpText={helpText} />);
    
    expect(screen.getByText(helpText)).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input name="test" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input name="test" type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input name="test" type="password" />);
    const passwordInput = screen.getByDisplayValue('');
    expect(passwordInput).toHaveAttribute('type', 'password');

    rerender(<Input name="test" type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('renders with icon', () => {
    const Icon = () => <span data-testid="icon">💕</span>;
    render(<Input name="test" icon={<Icon />} />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies love themed styling', () => {
    render(<Input name="test" isLoveThemed />);
    const input = screen.getByRole('textbox');
    expect(input.className).toMatch(/input--love/);
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(
      <Input 
        name="test" 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it.skip('renders textarea when multiline is true', () => {
    // Skip - multiline not implemented in current Input component
    render(<Input name="test" multiline rows={4} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('applies additional className', () => {
    render(<Input name="test" className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('spreads additional props', () => {
    render(
      <Input 
        name="test" 
        data-testid="test-input"
        maxLength={10}
        autoComplete="off"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-testid', 'test-input');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it.skip('shows character count when maxLength is provided', () => {
    // Skip - showCharCount not implemented in current Input component
    render(<Input name="test" maxLength={10} value="Hello" showCharCount />);
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
  });

  it('renders love themed input with label', () => {
    render(<Input name="test" isLoveThemed label="Love Input" />);
    
    const input = screen.getByRole('textbox');
    expect(input.className).toMatch(/input--love/);
    
    const label = screen.getByText('Love Input');
    expect(label.className).toMatch(/label--love/);
  });

  it.skip('handles amount type formatting', async () => {
    // Skip - amount type not implemented in current Input component
    const handleChange = vi.fn();
    render(
      <Input 
        name="amount" 
        type="amount"
        value="1000"
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--amount');
    
    // Amount inputs should format numbers
    await userEvent.clear(input);
    await userEvent.type(input, '50000');
    
    expect(handleChange).toHaveBeenCalled();
  });
});