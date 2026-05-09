import { supabase } from './supabase';

/**
 * Supabase Database Helpers
 * 
 * Utility functions for common Supabase operations
 */

export async function getRecord<T = any>(
  table: string,
  id: string
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error('Error getting record:', error);
    throw error;
  }
}

export async function getRecords<T = any>(
  table: string,
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<T[]> {
  try {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data as T[]) || [];
  } catch (error) {
    console.error('Error getting records:', error);
    throw error;
  }
}

export async function createRecord<T = any>(
  table: string,
  record: Partial<T>
): Promise<T> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
}

export async function updateRecord<T = any>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<T> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
}

export async function deleteRecord(
  table: string,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

// Auth helpers
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
