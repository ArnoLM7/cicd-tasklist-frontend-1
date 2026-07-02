import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets error when loading tasks fails', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Network down'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Network down');
		expect(result.current.tasks).toEqual([]);
	});

	it('sets a fallback error message when the rejection is not an Error', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue('unexpected failure');

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Une erreur est survenue');
		expect(result.current.tasks).toEqual([]);
	});

	it('adds a task and prepends it to the list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		vi.spyOn(taskApi, 'createTask').mockResolvedValue(mockTask);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Test' });
		});

		expect(result.current.tasks).toEqual([mockTask]);
	});

	it('edits a task and updates it in the list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updated = { ...mockTask, title: 'Updated' };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Updated' });
		});

		expect(result.current.tasks).toEqual([updated]);
	});

	it('removes a task from the list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		vi.spyOn(taskApi, 'deleteTask').mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggles task completion state', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updated = { ...mockTask, completed: true };
		const updateTaskSpy = vi.spyOn(taskApi, 'updateTask').mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(updateTaskSpy).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks).toEqual([updated]);
	});

	it('does nothing when toggling a non-existent task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updateTaskSpy = vi.spyOn(taskApi, 'updateTask');

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(updateTaskSpy).not.toHaveBeenCalled();
	});
});
