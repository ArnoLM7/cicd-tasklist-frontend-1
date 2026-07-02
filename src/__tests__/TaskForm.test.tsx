import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create mode by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('shows a validation error when submitting without a title', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('submits trimmed title and description, then resets fields in create mode', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), '  Ma tâche  ');
		await user.type(screen.getByLabelText('Description'), '  Détails  ');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: 'Détails' });
		expect(screen.getByLabelText('Titre')).toHaveValue('');
		expect(screen.getByLabelText('Description')).toHaveValue('');
	});

	it('submits with undefined description when left blank', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Sans description');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Sans description', description: undefined });
	});

	it('clears validation error once the user starts typing again', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Titre'), 'a');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('renders edit mode with initial values and does not reset after submit', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(
			<TaskForm
				mode="edit"
				initialValues={{ title: 'Titre existant', description: 'Desc existante' }}
				onSubmit={onSubmit}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');

		await user.click(screen.getByRole('button', { name: 'Modifier' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Titre existant', description: 'Desc existante' });
		expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');
	});

	it('calls onCancel when the cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});

	it('does not render cancel button when onCancel is not provided', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
	});
});
