/**
 * Test file with complex issues that need Claude assistance
 */

/**
 * Processes user data with proper validation and error handling
 */
async function processUserData(users: User[], options: ProcessingOptions): Promise<ProcessedUser[]> {
  logger.info('Processing users:', users.length);
  
  // Check if processing should proceed
  if (shouldProcessUsers(users, options)) {
    logger.info('Processing started');
    
    const results: ProcessedUser[] = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      if (isEligibleForProcessing(user)) {
        try {
          const processed = await processUser(user);
          results.push(processed);
        } catch (error) {
          logger.error(`Failed to process user ${user.id}:`, error);
        }
      }
    }
    
    return results;
  }
}

/**
 * Validates user data structure and required fields
 */
function validateUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  const typedUser = user as Partial<User>;
  return isValidUserStructure(typedUser);
}

async function processUser(user: User): Promise<ProcessedUser> {
  try {
    const result = await fetchUserData(user.id);
    return result;
  } catch (error) {
    logger.error(`Failed to fetch user data for ${user.id}:`, error);
    throw error;
  }
}

async function fetchUserData(id: string): Promise<ProcessedUser> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error(`Failed to fetch user data for ${id}:`, error);
    throw error;
  }
}