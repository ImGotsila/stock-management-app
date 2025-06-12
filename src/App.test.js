import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navbar brand text', () => {
  render(<App />);
  const brandElement = screen.getByText(/ระบบจัดการสต็อก/);
  expect(brandElement).toBeInTheDocument();
});
