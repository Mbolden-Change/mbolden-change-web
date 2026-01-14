import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionNetworkModal from '../ActionNetworkModal';

jest.mock('../../../atoms/ButtonComponent', () => {
    return function MockButton({ children, onClick, type, disabled }: any) {
        return (
            <button onClick={onClick} type={type} disabled={disabled}>
                {children}
            </button>
        );
    };
});

jest.mock('../../../atoms/Headline', () => {
    return function MockHeadline( { text, tag }: any) {
        const Tag = tag;
        return <Tag>{text}</Tag>;
    };
});

describe('ActionNetworkModal', () => {

    const mockOnClose = jest.fn()
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        title: 'Test Modal Title',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <ActionNetworkModal {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
        render(<ActionNetworkModal {...defaultProps} />);
        expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
        render(<ActionNetworkModal {...defaultProps} />);

        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
        expect(screen.getByLabelText('City')).toBeInTheDocument();
        expect(screen.getByLabelText('Zip/Postal Code')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        render(<ActionNetworkModal {...defaultProps} />);
        const closeButton = screen.getByLabelText('Close Modal');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should update form fields when user types', async () => {
        const user = userEvent.setup();
        render(<ActionNetworkModal {...defaultProps}/>);
        const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
        await user.type(firstNameInput, 'Demo');
        expect(firstNameInput.value).toBe('Demo');
    })

    it('should toggle checkboxes when clicked', async () => {
        const user = userEvent.setup();
        render(<ActionNetworkModal {...defaultProps}/>);
        const checkbox = screen.getByLabelText(/E-Newsletter/) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        await user.click(checkbox);
        expect(checkbox.checked).toBe(true);
    })

    it('should submit form with correct data', async () => {
        const user = userEvent.setup();
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<ActionNetworkModal {...defaultProps}/>);
        const emailInput = screen.getByLabelText(/Email/);
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByText('Submit');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/action-network',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });
    });
});