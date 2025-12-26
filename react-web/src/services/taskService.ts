import axios from 'axios';
import { ITTask } from './types';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  mapApiTaskToITTask,
  TASK_DEFAULTS
} from './types/task';

import { trackEvent, AmplitudeEvents } from './analytics';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Task service
const taskService = {
  /**
   * Get all tasks for a user
   * @param userId - The user ID to get tasks for
   * @param accountId - The account ID to get tasks for
   * @param includeDeleted - Whether to include deleted tasks (default: false)
   * @param includeCompleted - Whether to include completed tasks (optional)
   * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
   * @returns Promise resolving to an array of tasks
   */
  getTasksByUser: async (userId: string, accountId: string, includeDeleted: boolean = false, includeCompleted?: boolean, includeOnlyThisWeeksItems?: boolean): Promise<ITTask[]> => {
    // Default tasks to use when API fails
    const defaultTasks = [
      {
        UniqueId: '1',
        Text: 'Complete React Web Conversion',
        Title: 'High priority task for the web application',
        type: 'Task',
        Priority: 1,
        CreationTimestamp: new Date().toISOString(),
        state: 0, // TASK_STATE.TO_DO
        User_uniqueId: userId,
        Account_uniqueId: accountId,
        Scheduled_Time: '',
        Scheduled_Time_End: '',
        RecurringFreq: 0
      },
      {
        UniqueId: '2',
        Text: 'Gym Session',
        Title: 'Fitness goal for personal health',
        type: 'Task',
        Priority: 2,
        CreationTimestamp: new Date(Date.now() + 86400000).toISOString(),
        state: 1, // TASK_STATE.COMPLETED
        User_uniqueId: userId,
        Account_uniqueId: accountId,
        Scheduled_Time: '',
        Scheduled_Time_End: '',
        RecurringFreq: 0
      }
    ];

    try {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /tasks/user/' + userId);
      }
      // Try to fetch tasks from the API
      const params: any = {
        accountId,
        includeDeleted
      };

      if (includeCompleted !== undefined) {
        params.includeCompleted = includeCompleted;
      }

      if (includeOnlyThisWeeksItems !== undefined) {
        params.includeOnlyThisWeeksItems = includeOnlyThisWeeksItems;
      }

      const response = await axios.get(`${API_BASE_URL}/tasks/user/${userId}`, {
        params,
        headers: getHeaders()
      });
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] ✅ API RESPONSE: GET /tasks/user/' + userId + ' - Success');
      }

      // Check if the response contains tasks in the expected format
      if (response.data && Array.isArray(response.data.tasks)) {
        // Map API tasks to ITTask format
        const mappedTasks = response.data.tasks.map((task: Task) => mapApiTaskToITTask(task));
        return mappedTasks;
      }
      // Check if the response is a direct array (backward compatibility)
      else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      else {
        return defaultTasks;
      }
    } catch (error: any) {
      // Log the error but don't throw it
      console.log('Error fetching tasks, using default tasks:', error.message);

      // Always return default tasks on error
      return defaultTasks;
    }
  },

  /**
   * Get a task by ID
   * @param taskId - The task ID to get
   * @param accountId - The account ID the task belongs to
   * @returns Promise resolving to a task
   */
  getTaskById: async (taskId: string, accountId: string): Promise<ITTask | null> => {
    try {
      console.log('Calling getTaskById for task:', taskId, 'account:', accountId);
      const response = await axios.get(`/api/tasks/${taskId}`, {
        params: { accountId },
        headers: getHeaders()
      });

      console.log('Service received response:', response.data);

      if (response.data) {
        console.log('Raw API response for single task:', response.data);
        // Extract the task from the wrapper if it exists
        const taskData = response.data.task || response.data;
        console.log('Task data to map:', taskData);
          // Track task viewed
          try { trackEvent(AmplitudeEvents.taskViewed, { taskId, accountId }); } catch {}

        try {
          // Map the API response to ITTask format
          const mappedTask = mapApiTaskToITTask(taskData);
          console.log('Mapped task:', mappedTask);
          return mappedTask;
        } catch (mappingError) {
          console.error('Error mapping task:', mappingError);
          return null;
        }
      }

      console.log('No data in response');
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Task not found (404):', taskId);
      } else {
        console.error('Error fetching task:', error.message);
      }
      return null;
    }
  },

  /**
   * Create a new task using the API reference compliant structure
   *
   * API Reference: POST /tasks (June 2025)
   * Endpoint: https://node-backend-eeva.vercel.app/api/tasks
   *
   * Required Fields (API Reference):
   * - userId: The ID of the user creating the task
   * - accountId: The ID of the account the task belongs to
   * - title: The title of the task (1-256 characters)
   *
   * Validation:
   * - Validates required fields before API call
   * - Enforces title length limits (1-256 characters)
   * - Applies default values for optional fields
   *
   * Default Values (API Reference):
   * - priority: 1
   * - color: '#3B82F6'
   * - reminderType: 6 (1 hour before)
   * - isRecurring: false
   * - useJustInTime: true
   * - active: true
   * - deleted: false
   *
   * @param taskRequest - The task creation request matching API schema
   * @returns Promise resolving to the created task
   */
  createTask: async (taskRequest: CreateTaskRequest): Promise<Task | null> => {
    try {
      // Validate required fields
      if (!taskRequest.userId || !taskRequest.accountId || !taskRequest.title) {
        throw new Error('Missing required fields: userId, accountId, and title are required');
      }

      // Ensure title is within length limits (1-256 characters as per API reference)
      if (taskRequest.title.length < 1 || taskRequest.title.length > 256) {
        throw new Error('Title must be between 1 and 256 characters');
      }

      // Apply defaults for optional fields
      const taskData: CreateTaskRequest = {
        ...taskRequest,
        priority: taskRequest.priority ?? TASK_DEFAULTS.PRIORITY,
        color: taskRequest.color ?? TASK_DEFAULTS.COLOR,
        reminderType: taskRequest.reminderType ?? TASK_DEFAULTS.REMINDER_TYPE,
        isRecurring: taskRequest.isRecurring ?? TASK_DEFAULTS.IS_RECURRING,
        useJustInTime: taskRequest.useJustInTime ?? TASK_DEFAULTS.USE_JUST_IN_TIME,
        active: taskRequest.active ?? TASK_DEFAULTS.ACTIVE,
        deleted: taskRequest.deleted ?? TASK_DEFAULTS.DELETED
      };

      console.log('Creating task with API-compliant payload:', taskData);

      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: getHeaders(),
        params: {
          accountId: taskData.accountId
        }
      });

      // Track task created (and assigned if applicable)
      try {
        const t = response.data as Task;
        trackEvent(AmplitudeEvents.taskCreated, { taskId: t.id, title: t.title, accountId: t.accountId });
        if (t.delegateUserId && t.delegateUserId !== t.userId) {
          trackEvent(AmplitudeEvents.taskAssigned, { taskId: t.id, delegateUserId: t.delegateUserId });
        }
      } catch {}

      if (response.data) {
        console.log('Task created successfully:', response.data);
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Error creating task:', error.response?.data || error.message);
      throw error; // Re-throw to allow caller to handle
    }
  },

  /**
   * Legacy createTask method for backward compatibility
   * @deprecated Use createTask with CreateTaskRequest instead
   */
  createTaskLegacy: async (task: Partial<ITTask>): Promise<ITTask | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, task, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating task (legacy):', error.message);
      return null;
    }
  },

  /**
   * Update an existing task using the API reference compliant structure
   * @param taskRequest - The task update request matching API schema
   * @returns Promise resolving to the updated task
   */
  updateTask: async (taskRequest: UpdateTaskRequest): Promise<Task | null> => {
    try {
      // Validate required fields for updates
      if (!taskRequest.id || !taskRequest.accountId || !taskRequest.userId) {
        throw new Error('Missing required fields: id, accountId, and userId are required for updates');
      }

      // Validate title length if provided
      if (taskRequest.title && (taskRequest.title.length < 1 || taskRequest.title.length > 256)) {
        throw new Error('Title must be between 1 and 256 characters');
      }

      console.log('Updating task with API-compliant payload:', taskRequest);

      const response = await axios.put(`${API_BASE_URL}/tasks`, taskRequest, {
        headers: getHeaders(),
        params: {
          accountId: taskRequest.accountId
        }
      });

      if (response.data) {
        console.log('Task updated successfully:', response.data);
        // Track task edited and possible assignment
        try {
          const t = response.data as Task;
          trackEvent(AmplitudeEvents.taskEdited, { taskId: t.id });
          if (t.delegateUserId && t.delegateUserId !== t.userId) {
            trackEvent(AmplitudeEvents.taskAssigned, { taskId: t.id, delegateUserId: t.delegateUserId });
          }
        } catch {}
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Error updating task:', error.response?.data || error.message);
      throw error; // Re-throw to allow caller to handle
    }
  },

  /**
   * Legacy updateTask method for backward compatibility
   * @deprecated Use updateTask with UpdateTaskRequest instead
   */
  updateTaskLegacy: async (task: ITTask): Promise<ITTask | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks`, task, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating task (legacy):', error.message);
      return null;
    }
  },

  /**
   * Update task completion status
   * @param taskId - The ID of the task to update
   * @param userId - The user ID the task belongs to
   * @param accountId - The account ID the task belongs to
   * @param completed - The new completion status
   * @returns Promise resolving to the updated task
   */
  updateTaskCompletionStatus: async (
    taskId: string,
    userId: string,
    accountId: string,
    completed: boolean
  ): Promise<ITTask | null> => {

    try {
      if (completed) {
        // Use the specific completion endpoint for marking tasks as complete
        const response = await axios.put(
          `/api/tasks/${taskId}/complete?accountId=${accountId}&userId=${userId}`,
          {},
          {
            headers: getHeaders()
          }
        );
        // Track task completed
        try { trackEvent(AmplitudeEvents.taskCompleted, { taskId, userId, accountId }); } catch {}
        return response.data;
      } else {
        // For marking as incomplete, we need to update the task directly
        // First get the current task data
        const task = await taskService.getTaskById(taskId, accountId);

        if (!task) {
          return null;
        }

        // Check if the task is already incomplete
        if (!task.completed) {
          return task;
        }

        // Update the task with the new completion status
        // Include all required fields for the API
        // Track task edited (marked incomplete)
        try { trackEvent(AmplitudeEvents.taskEdited, { taskId, userId, accountId, completed: false }); } catch {}


        // For marking as incomplete, we need to update the task directly
        // Include all the fields from the original task to ensure compatibility
        const updatedTask = {
          ...task, // Include all original fields
          completed: false,
          active: true
        };



        // Send the update to the API using the local proxy
        const response = await axios.put(
          `/api/tasks`,
          updatedTask,
          {
            headers: getHeaders()
          }
        );

        return response.data;
      }
    } catch (error: any) {
      console.error('Error updating task completion status:', error.message);
      return null;
    }
  },

  /**
   * Delete a task using the API reference compliant structure
   * @param deleteRequest - The task deletion request
      if (success) {
        try { trackEvent(AmplitudeEvents.taskDeleted, { taskId: deleteRequest.id, userId: deleteRequest.userId, accountId: deleteRequest.accountId }); } catch {}
      }

   * @returns Promise resolving to success status
   */
  deleteTask: async (deleteRequest: DeleteTaskRequest): Promise<boolean> => {
    try {
      // Validate required fields
      if (!deleteRequest.id || !deleteRequest.accountId || !deleteRequest.userId) {
        throw new Error('Missing required fields: id, accountId, and userId are required for deletion');
      }

      console.log('Deleting task with RESTful request:', deleteRequest);

      // Use RESTful URL pattern: DELETE /api/tasks/{taskId}?accountId={accountId}&userId={userId}
      const response = await axios.delete(
        `${API_BASE_URL}/tasks/${deleteRequest.id}?accountId=${deleteRequest.accountId}&userId=${deleteRequest.userId}`,
        {
          headers: getHeaders()
        }
      );

      const success = response.status === 200 || response.status === 204;
      if (success) {
        console.log('Task deleted successfully');
        try { trackEvent(AmplitudeEvents.taskDeleted, { taskId: deleteRequest.id, userId: deleteRequest.userId, accountId: deleteRequest.accountId }); } catch {}
      }


      return success;
    } catch (error: any) {
      console.error('Error deleting task:', error.response?.data || error.message);
      throw error; // Re-throw to allow caller to handle
    }
  },

  /**
   * Legacy deleteTask method for backward compatibility
   * @deprecated Use deleteTask with DeleteTaskRequest instead
   */
  deleteTaskLegacy: async (taskId: string, accountId: string, userId: string): Promise<{ success: boolean }> => {
    try {
      // Use RESTful URL pattern: DELETE /api/tasks/{taskId}?accountId={accountId}&userId={userId}
      await axios.delete(
        `${API_BASE_URL}/tasks/${taskId}?accountId=${accountId}&userId=${userId}`,
        {
          headers: getHeaders()
        }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting task (legacy):', error.message);
      return { success: false };
    }
  },

  /**
   * Convert task to use RRule (as mentioned in API reference)
   * @param taskId - The ID of the task to convert
   * @param accountId - The account ID
   * @returns Promise resolving to success status
   */
  convertTaskToRRule: async (taskId: string, accountId: string): Promise<boolean> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/convert-to-rrule`, {}, {
        params: { accountId },
        headers: getHeaders()
      });

      const success = response.status === 200;
      if (success) {
        console.log('Task converted to RRule successfully');
      }

      return success;
    } catch (error: any) {
      console.error('Error converting task to RRule:', error.response?.data || error.message);
      return false;
    }
  }
};

export default taskService;
