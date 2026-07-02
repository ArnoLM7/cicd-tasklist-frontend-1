import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
	{
		id: 1,
		title: 'Tâche existante',
		description: null,
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Tâche terminée',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('App', () => {
	it('does not show stats header when there are no tasks', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		render(<App />);

		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());
		expect(screen.queryByText('Total')).not.toBeInTheDocument();
	});

	it('shows task stats once tasks are loaded', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue(mockTasks);
		render(<App />);

		await waitFor(() => expect(screen.getByTestId('task-list')).toBeInTheDocument());

		expect(screen.getByText('Total')).toBeInTheDocument();
		const stats = screen.getAllByText('2');
		expect(stats.length).toBeGreaterThan(0);
		expect(screen.getByText('Terminées')).toBeInTheDocument();
		expect(screen.getByText('En cours')).toBeInTheDocument();
	});

	it('adds a task through the form and displays it in the list', async () => {
		const user = userEvent.setup();
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		const newTask: Task = {
			id: 3,
			title: 'Acheter du pain',
			description: null,
			completed: false,
			createdAt: '2026-01-17T10:00:00Z',
			updatedAt: '2026-01-17T10:00:00Z',
		};
		vi.spyOn(taskApi, 'createTask').mockResolvedValue(newTask);

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		await user.type(screen.getByLabelText('Titre'), 'Acheter du pain');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		await waitFor(() => expect(screen.getByRole('heading', { name: 'Acheter du pain', level: 3 })).toBeInTheDocument());
	});

	it('shows an error state when loading tasks fails', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Erreur serveur'));
		render(<App />);

		await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument());
		expect(screen.getByText('Erreur : Erreur serveur')).toBeInTheDocument();
	});
});
