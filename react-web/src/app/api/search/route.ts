/**
 * Search API Route
 *
 * This route handles searching across tasks, events, notes, and files.
 * It aggregates data from multiple backend endpoints and applies search filtering.
 *
 * Supported Operations:
 * - GET: Search across all data types (requires accountId, userId, and optional query parameter)
 *
 * Query Parameters:
 * - accountId: Required - Account ID for data filtering
 * - userId: Required - User ID for data filtering  
 * - query: Optional - Search term to filter results
 * - types: Optional - Comma-separated list of types to search (tasks,events,notes,files)
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'event' | 'note' | 'file';
  date?: string;
  data: any; // Original data object
}

interface SearchResponse {
  results: SearchResult[];
  count: number;
  query?: string;
  types: string[];
}

export async function GET(request: NextRequest) {
  console.log('Performing search across all data types');

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');
    const query = searchParams.get('query') || '';
    const typesParam = searchParams.get('types') || 'tasks,events,notes,files';
    
    // Validate required parameters
    if (!accountId || !userId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          details: 'accountId and userId are required',
          received: {
            accountId: !!accountId,
            userId: !!userId
          }
        },
        { status: 400 }
      );
    }

    const searchTypes = typesParam.split(',').map(t => t.trim());
    console.log(`Searching for "${query}" in types: ${searchTypes.join(', ')}`);

    // Prepare headers for backend requests
    const headers = {
      'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      ...(request.headers.get('Authorization')
        ? { 'Authorization': request.headers.get('Authorization') as string }
        : {})
    };

    // Fetch data from all endpoints in parallel
    const promises: Promise<any>[] = [];
    const dataTypes: string[] = [];

    if (searchTypes.includes('tasks')) {
      promises.push(
        fetch(`${API_BASE_URL}/tasks/user/${userId}?accountId=${accountId}`, { headers })
          .then(res => res.ok ? res.json() : { tasks: [] })
          .catch(() => ({ tasks: [] }))
      );
      dataTypes.push('tasks');
    }

    if (searchTypes.includes('events')) {
      promises.push(
        fetch(`${API_BASE_URL}/events/user/${userId}?accountId=${accountId}`, { headers })
          .then(res => res.ok ? res.json() : { events: [] })
          .catch(() => ({ events: [] }))
      );
      dataTypes.push('events');
    }

    if (searchTypes.includes('notes')) {
      promises.push(
        fetch(`${API_BASE_URL}/notes/user/${userId}?accountId=${accountId}`, { headers })
          .then(res => res.ok ? res.json() : { notes: [] })
          .catch(() => ({ notes: [] }))
      );
      dataTypes.push('notes');
    }

    if (searchTypes.includes('files')) {
      promises.push(
        fetch(`${API_BASE_URL}/files?accountId=${accountId}&userId=${userId}`, { headers })
          .then(res => res.ok ? res.json() : { files: [] })
          .catch(() => ({ files: [] }))
      );
      dataTypes.push('files');
    }

    // Wait for all requests to complete
    const responses = await Promise.all(promises);
    
    // Process and filter results
    const allResults: SearchResult[] = [];
    
    responses.forEach((response, index) => {
      const dataType = dataTypes[index];
      
      switch (dataType) {
        case 'tasks':
          const tasks = response.tasks || [];
          tasks.forEach((task: any) => {
            if (!query || 
                task.title?.toLowerCase().includes(query.toLowerCase()) ||
                task.text?.toLowerCase().includes(query.toLowerCase())) {
              allResults.push({
                id: task.id || task.uniqueId,
                title: task.title || 'Untitled Task',
                description: task.text,
                type: 'task',
                date: task.deadlineDateTime || task.createdAt,
                data: task
              });
            }
          });
          break;

        case 'events':
          const events = response.events || [];
          events.forEach((event: any) => {
            if (!query || 
                event.title?.toLowerCase().includes(query.toLowerCase()) ||
                event.text?.toLowerCase().includes(query.toLowerCase())) {
              allResults.push({
                id: event.id || event.uniqueId,
                title: event.title || 'Untitled Event',
                description: event.text,
                type: 'event',
                date: event.deadlineDateTime || event.createdAt,
                data: event
              });
            }
          });
          break;

        case 'notes':
          const notes = response.notes || [];
          notes.forEach((note: any) => {
            if (!query || 
                note.title?.toLowerCase().includes(query.toLowerCase()) ||
                note.text?.toLowerCase().includes(query.toLowerCase())) {
              allResults.push({
                id: note.id || note.uniqueId,
                title: note.title || 'Untitled Note',
                description: note.text,
                type: 'note',
                date: note.createdAt,
                data: note
              });
            }
          });
          break;

        case 'files':
          const files = response.files || [];
          files.forEach((file: any) => {
            if (!query || 
                file.filename?.toLowerCase().includes(query.toLowerCase())) {
              allResults.push({
                id: file.id || file.uniqueId,
                title: file.filename || 'Untitled File',
                description: `File size: ${file.fileSize || 'Unknown'}`,
                type: 'file',
                date: file.createdAt,
                data: file
              });
            }
          });
          break;
      }
    });

    // Sort results by relevance (exact matches first, then by date)
    allResults.sort((a, b) => {
      if (query) {
        const aExactMatch = a.title.toLowerCase() === query.toLowerCase();
        const bExactMatch = b.title.toLowerCase() === query.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
      }
      
      // Sort by date (newest first)
      const aDate = new Date(a.date || 0);
      const bDate = new Date(b.date || 0);
      return bDate.getTime() - aDate.getTime();
    });

    const searchResponse: SearchResponse = {
      results: allResults,
      count: allResults.length,
      query: query || undefined,
      types: searchTypes
    };

    console.log(`✅ Search completed - Found ${allResults.length} results`);
    return NextResponse.json(searchResponse);

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
