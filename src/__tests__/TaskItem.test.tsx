import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders title, description and formatted date', () => {
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
		expect(screen.getByText('15 janvier 2026')).toBeInTheDocument();
	});

	it('does not render description paragraph when null', () => {
		render(
			<TaskItem
				task={{ ...baseTask, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.queryByText('Une description')).not.toBeInTheDocument();
	});

	it('calls onToggle with task id when checkbox is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('requires a second click to confirm delete', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

		const deleteButton = screen.getByRole('button', { name: 'Supprimer' });
		await user.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		await user.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('switches to edit mode and saves trimmed changes', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));

		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, '  Nouveau titre  ');

		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, { title: 'Nouveau titre', description: 'Une description' });
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});

	it('does not save when edited title is empty', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit and reverts to original values', async () => {
		const user = userEvent.setup();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Changement non sauvegardé');

		await user.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('applies completed styling when task is completed', () => {
		render(
			<TaskItem
				task={{ ...baseTask, completed: true }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
		expect(screen.getByRole('checkbox')).toBeChecked();
	});
});
